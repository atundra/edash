#define ENABLE_GxEPD2_GFX 0
#include "connectivity.h"
#include <HTTPClient.h>

// #include <GxEPD2_BW.h>
#include <GxEPD2_3C.h>

GxEPD2_3C<GxEPD2_750c, GxEPD2_750c::HEIGHT> display(GxEPD2_750c(/*CS=5*/ SS, /*DC=*/17, /*RST=*/16, /*BUSY=*/4));

// Copy of display.drawInvertedBitmap
void drawBitmap(int16_t x, int16_t y, const uint8_t bitmap[], int16_t w, int16_t h, uint16_t color)
{
  int16_t byteWidth = (w + 7) / 8; // Bitmap scanline pad = whole byte
  uint8_t byte = 0;
  for (int16_t j = 0; j < h; j++)
  {
    for (int16_t i = 0; i < w; i++)
    {
      if (i & 7)
      {
        byte <<= 1;
      }
      else
      {
        byte = pgm_read_byte(&bitmap[j * byteWidth + i / 8]);
      }

      if (byte & 0x80)
      {
        display.drawPixel(x + i, y + j, color);
      }
    }
  }
}

void httpGet(String url, void (*payloadHandler)(String))
{
  HTTPClient httpClient;

  Serial.print("[HTTP] begin...\n");
  httpClient.begin(url);

  Serial.print("[HTTP] GET...\n");

  int httpCode = httpClient.GET();

  // httpCode will be negative on error
  if (httpCode > 0)
  {
    Serial.printf("[HTTP] GET... code: %d\n", httpCode);

    if (httpCode == HTTP_CODE_OK)
    {
      String payload = httpClient.getString();
      payloadHandler(payload);
    }
  }
  else
  {
    Serial.printf("[HTTP] GET... failed, error: %s\n", httpClient.errorToString(httpCode).c_str());
  }

  httpClient.end();
}

void drawHttpPayload(String payload)
{
  Serial.println("Draw HTTP payload");
  Serial.print("Payload length: ");
  Serial.println(payload.length());

  display.init(115200);
  display.setFullWindow();

  display.firstPage();
  do
  {
    display.fillScreen(GxEPD_WHITE);
    drawBitmap(0, 0, (unsigned char *)payload.c_str(), display.epd2.WIDTH, display.epd2.HEIGHT, GxEPD_BLACK);
  } while (display.nextPage());

  Serial.println("Power off");
  display.powerOff();
}

void drawImage(String url)
{
  httpGet(url, drawHttpPayload);
}

void setup()
{
  Serial.begin(115200);
  Connectivity::setup();
}

void loop()
{
  Connectivity::loop();
  drawImage("http://192.168.1.70:8000/api/layout.bin?width=640&height=384");
  delay(20000);
}
