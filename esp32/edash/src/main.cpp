#define ENABLE_GxEPD2_GFX 0
#include "device.h"
#include "connectivity.h"
#include <HTTPClient.h>

#include <NTPClient.h>
#include <WiFiUdp.h>

// #include <GxEPD2_BW.h>
#include <GxEPD2_3C.h>

/*
 * https://github.com/khoih-prog/ESP_WiFiManager
 * 
 * Should be included only once: https://github.com/khoih-prog/ESP_WiFiManager#HOWTO-Fix-Multiple-Definitions-Linker-Error
 */
#include <ESP_WiFiManager.h>

GxEPD2_3C<GxEPD2_750c_Z90, GxEPD2_750c_Z90::HEIGHT / 5> display(GxEPD2_750c_Z90(/*CS=*/ 15, /*DC=*/ 27, /*RST=*/ 26, /*BUSY=*/ 25)); // GDEH075Z90 880x528, SSD1677

Dashboard_NS::Dashboard<GxEPD2_3C<GxEPD2_750c_Z90, GxEPD2_750c_Z90::HEIGHT / 5>> dashboard(display);

constexpr size_t BITMAP_SIZE = GxEPD2_750c_Z90::WIDTH * GxEPD2_750c_Z90::HEIGHT / 8;

static uint8_t bitmap[BITMAP_SIZE];

// TODO move to some class or whatever and add sending parameters
void httpGet(const String &url, const char* CAcert = 0)
{
  HTTPClient httpClient;

  Serial.print("[HTTP] begin...\n");
  if (CAcert == 0) {
    httpClient.begin(url);
  } else {
    httpClient.begin(url, CAcert);
  }

  Serial.print("[HTTP] GET...\n");

  int httpCode = httpClient.GET();

  // httpCode will be negative on error
  if (httpCode > 0)
  {
    Serial.printf("[HTTP] GET... code: %d\n", httpCode);

    int contentLength = httpClient.getSize();

    Serial.printf("Content-Length: %d\n", contentLength);

    if (httpCode == HTTP_CODE_OK)
    {
      if (contentLength != BITMAP_SIZE) {
          Serial.printf(
              "Unexpected bitmap size: %d, expected %u\n",
              contentLength,
              (unsigned)BITMAP_SIZE
          );
      }

        WiFiClient *stream = httpClient.getStreamPtr();

        size_t received = 0;

        while (received < BITMAP_SIZE) {
          size_t available = stream->available();

          if (available > 0) {
            size_t remaining = BITMAP_SIZE - received;
            size_t toRead = min(available, remaining);

            size_t n = stream->readBytes(
                bitmap + received,
                toRead
            );

            if (n == 0) {
                Serial.println("Read failed");
            }

            received += n;
          } else {
              if (!httpClient.connected()) {
                  Serial.println("Connection closed prematurely");
                  break;
              }

              delay(1);
          }
      }

    }
  }
  else
  {
    Serial.printf("[HTTP] GET... failed, error: %s\n", httpClient.errorToString(httpCode).c_str());
  }

  httpClient.end();
}

namespace SetupRoutine
{
  typedef uint8_t err_t;

  class Device
  {
  private:
    bool _initialized = false;
    String _id;

    bool isIdGenerated()
    {
      return !_id.isEmpty();
    }

    // Check if WifiManager stores wifi credentials
    bool isWiFiCredentialsExists()
    {
      // Add actual logic
      return true;
    }

    // Check if we can connect to something like 8.8.8.8
    bool isConnectedToInternet()
    {
      // Add actual logic
      return true;
    }

    // Load device id from nvs
    void initialize()
    {
      // Add actual logic
      _initialized = true;
    }

    err_t checkWiFi()
    {
      if (!isWiFiCredentialsExists())
        return 1;
      if (!isConnectedToInternet())
        return 2;

      return 0;
    }

    err_t syncNTP()
    {
      // Mark
      return 0;
    }

    uint32_t getCurrentTime()
    {
      WiFiUDP ntpUDP;
      NTPClient timeClient(ntpUDP);

      // Time offset is hardcoded currently, we need do detect timezone using geoip
      const int timeOffset = 60 * 60 * 3; // GMT+3

      Serial.println("Setup routine:: Starting to sync NTP");
      // And we need to move timeclient out from here because it can be used for rendering offline widgets
      timeClient.begin();
      Serial.printf("Setup routine:: Setting time offset to %d seconds\n", timeOffset);
      timeClient.setTimeOffset(timeOffset);

      Serial.println("Setup routine:: Trying to update time client");
      uint8_t retryCount = 3;
      while (!timeClient.update() && retryCount)
      {
        Serial.println("Setup routine:: Time client force update");
        timeClient.forceUpdate();
        retryCount--;
      }

      if (retryCount == 0)
      {
        Serial.println("Setup routine:: Failed to get current time");
        return 0;
      }

      return timeClient.getEpochTime();
    }

    // Send
    err_t checkServerConnection()
    {
      return 0;
    }

  public:
    Device(){};

    err_t loop()
    {
      Connectivity::loop();

      // Invalidate config using TTL

      return 0;
    }

    err_t setup()
    {
      Serial.println("Setup routine:: Device setup");
      Connectivity::setup();

      Serial.println("Setup routine:: Initialize");
      initialize();

      Serial.println("Setup routine:: Display setup");
      dashboard.Setup();

      Serial.println("Setup routine:: Check WiFi");
      auto wifiErr = checkWiFi();
      if (wifiErr)
      {
        Serial.println("Setup routine:: WiFi check failed – no wifi connection");
        // Draw Pwease connect to wifi sempai Screen
        return 1;
      }

      Serial.println("Setup routine:: Check if id is generated");
      if (!isIdGenerated())
      {
        Serial.println("Setup routine:: Id isn't generated");
        // Generate and store device id

        // First we need to sync local time so we can generate unique device id
        auto time = getCurrentTime();
        if (time == 0)
        {
          Serial.println("Setup routine:: Time == 0");
          // Draw Sync NTP error screen
          return 1;
        };

        // Now we generate device id using current time and device internal uid
        auto id = Device::generateId(ESP_getChipId(), time);
        // Store id to nvs and save in the instance
        _id = id;
      }

      auto serverConnErr = checkServerConnection();
      if (serverConnErr)
      {
        Serial.println("Setup routine:: Server connection error");
        return 1;
      }

      return 0;
    }

    String getId()
    {
      return _id;
    }

    static String generateId(uint32_t deviceMac, uint32_t time)
    {
      const auto macString = String(deviceMac, HEX);

      const auto timeString = String(time, HEX);
      return macString + timeString;
    }
  };
} // namespace SetupRoutine

SetupRoutine::Device *deviceInstance;

void setup()
{
  Serial.begin(115200);

  deviceInstance = new SetupRoutine::Device();
  auto deviceSetupErr = deviceInstance->setup();
  if (deviceSetupErr)
    return;
}

String payload;

void loop()
{
  auto deviceLoopError = deviceInstance->loop();
  if (deviceLoopError)
  {
    Serial.println("device loop error");
    return;
  }

  auto id = deviceInstance->getId();
  Serial.print("Device Id: ");
  Serial.println(id);

  delay(20000);
  // auto payloadUrl = "http://bots.pashutk.ru:8000/api/screen/" + id;
  String payloadUrl = "http://192.168.1.191:8000/api/layout.bin?width=880&height=528";
  Serial.println("Loading payload, url: " + payloadUrl);
  httpGet(payloadUrl);
  dashboard.GetColors();
  dashboard.DrawPayload(bitmap);
}
