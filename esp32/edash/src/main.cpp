#define ENABLE_GxEPD2_GFX 0
#include <WiFi.h>
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

char ssid[] = "ESP32NET";
char pass[] = "PhFy9KKreeFbR4jMCzHmDDNx";

bool connectWifi()
{
  Serial.println("Connect Wifi");
  Serial.print("WiFi.getAutoConnect()=");
  Serial.println(WiFi.getAutoConnect());
  Serial.print("WiFi.SSID()=");
  Serial.println(WiFi.SSID());
  Serial.print("ESP Board MAC Address:  ");
  Serial.println(WiFi.macAddress());

  if (WiFi.getMode() != WIFI_STA)
  {
    WiFi.mode(WIFI_STA);
  }

  if (WiFi.SSID() != ssid)
  {
    Serial.print("Connecting to ");
    Serial.println(ssid);
    WiFi.begin(ssid, pass);
  }

  int ConnectTimeout = 30; // 15 seconds
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
    Serial.print(WiFi.status());

    if (--ConnectTimeout <= 0)
    {
      Serial.println();
      Serial.println("WiFi connect timeout");
      return false;
    }
  }
  Serial.println();
  Serial.println("WiFi connected");
  return true;
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

void connectAndDrawImage(String url)
{
  bool connected = connectWifi();
  if (!connected)
  {
    Serial.println("Failed to connect to wifi");
    return;
  }

  httpGet(url, drawHttpPayload);
}

void setup()
{
  Serial.begin(115200);
}

void loop()
{
  connectAndDrawImage("http://bots.pashutk.ru:8000/api/random.bin");
  delay(20000);
}
