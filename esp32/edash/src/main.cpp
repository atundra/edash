#define ENABLE_GxEPD2_GFX 0
#include "device.h"
#include "connectivity.h"
#include <HTTPClient.h>

// #include <GxEPD2_BW.h>
#include <GxEPD2_3C.h>

GxEPD2_3C<GxEPD2_750c, GxEPD2_750c::HEIGHT> display(GxEPD2_750c(/*CS=5*/ SS, /*DC=*/17, /*RST=*/16, /*BUSY=*/4));

Dashboard_NS::Dashboard<GxEPD2_3C<GxEPD2_750c, GxEPD2_750c::HEIGHT>> dashboard(display);

// Copy of display.drawInvertedBitmap
// void drawBitmap(int16_t x, int16_t y, const uint8_t bitmap[], int16_t w, int16_t h, uint16_t color)
// {
//   Serial.println(typeid(display).name());
//   int16_t byteWidth = (w + 7) / 8; // Bitmap scanline pad = whole byte
//   uint8_t byte = 0;
//   for (int16_t j = 0; j < h; j++)
//   {
//     for (int16_t i = 0; i < w; i++)
//     {
//       if (i & 7)
//       {
//         byte <<= 1;
//       }
//       else
//       {
//         byte = pgm_read_byte(&bitmap[j * byteWidth + i / 8]);
//       }

//       if (byte & 0x80)
//       {
//         display.drawPixel(x + i, y + j, color);
//       }
//     }
//   }
// }

// TODO move to some class or whatever and add sending parameters
String httpGet(const String &url)
{
  HTTPClient httpClient;
  String retval;

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
      retval = httpClient.getString();
    }
  }
  else
  {
    Serial.printf("[HTTP] GET... failed, error: %s\n", httpClient.errorToString(httpCode).c_str());
  }

  httpClient.end();
  return retval;
}

// void drawHttpPayload(String payload)
// {
//   Serial.println("Draw HTTP payload");
//   Serial.print("Payload length: ");
//   Serial.println(payload.length());

//   display.init(115200);
//   display.setFullWindow();

//   display.firstPage();
//   do
//   {
//     display.fillScreen(GxEPD_WHITE);
//     drawBitmap(0, 0, (unsigned char *)payload.c_str(), display.epd2.WIDTH, display.epd2.HEIGHT, GxEPD_BLACK);
//   } while (display.nextPage());

//   Serial.println("Power off");
//   display.powerOff();
// }

void setup()
{
  Serial.begin(115200);
  Connectivity::setup();
}

String payload;

void loop()
{
  Connectivity::loop();
  delay(20000);
  payload = httpGet("http://bots.pashutk.ru:8000/api/random.bin");
  dashboard.GetColors();
  dashboard.DrawPayload(payload);
}
