#define ENABLE_GxEPD2_GFX 0
#include "device.h"
#include "connectivity.h"
#include <HTTPClient.h>

// #include <GxEPD2_BW.h>
#include <GxEPD2_3C.h>

GxEPD2_3C<GxEPD2_750c, GxEPD2_750c::HEIGHT> display(GxEPD2_750c(/*CS=5*/ SS, /*DC=*/17, /*RST=*/16, /*BUSY=*/4));

Dashboard_NS::Dashboard<GxEPD2_3C<GxEPD2_750c, GxEPD2_750c::HEIGHT>> dashboard(display);

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
  payload = httpGet("http://bots.pashutk.ru:8000/api/layout.bin?width=640&height=384");
  dashboard.GetColors();
  dashboard.DrawPayload(payload);
}
