#ifdef ESP32
#include <esp_wifi.h>
#include <WiFi.h>
#include <WiFiClient.h>

#define ESP_getChipId() ((uint32_t)ESP.getEfuseMac())

#define LED_ON HIGH
#define LED_OFF LOW
#else
#include <ESP8266WiFi.h> //https://github.com/esp8266/Arduino
//needed for library
#include <DNSServer.h>
#include <ESP8266WebServer.h>

#define ESP_getChipId() (ESP.getChipId())

#define LED_ON LOW
#define LED_OFF HIGH
#endif

// SSID and PW for Config Portal
extern String ssid;
extern const char *password;

// SSID and PW for your Router
extern String Router_SSID;
extern String Router_Pass;

// Use false if you don't like to display Available Pages in Information Page of Config Portal
// Comment out or use true to display Available Pages in Information Page of Config Portal
// Must be placed before #include <ESP_WiFiManager.h>
#define USE_AVAILABLE_PAGES false

#include <ESP_WiFiManager.h> //https://github.com/khoih-prog/ESP_WiFiManager

// These defines must be put before #include <ESP_DoubleResetDetector.h>
// to select where to store DoubleResetDetector's variable.
// For ESP32, You must select one to be true (EEPROM or SPIFFS)
// For ESP8266, You must select one to be true (RTC, EEPROM or SPIFFS)
// Otherwise, library will use default EEPROM storage
#define ESP_DRD_USE_EEPROM true
#define ESP_DRD_USE_SPIFFS false //false

#ifdef ESP8266
#define ESP8266_DRD_USE_RTC false //true
#endif

#define DOUBLERESETDETECTOR_DEBUG true //false

#include <ESP_DoubleResetDetector.h> //https://github.com/khoih-prog/ESP_DoubleResetDetector

// Number of seconds after reset during which a
// subseqent reset will be considered a double reset.
#define DRD_TIMEOUT 10

// RTC Memory Address for the DoubleResetDetector to use
#define DRD_ADDRESS 0

//DoubleResetDetector drd(DRD_TIMEOUT, DRD_ADDRESS);
extern DoubleResetDetector *drd;

// Indicates whether ESP has WiFi credentials saved from previous session, or double reset detected
extern bool initialConfig;

#define HEARTBEAT_INTERVAL 10000L
#define WIFI_CONNECT_TIMEOUT 30000L
#define WHILE_LOOP_DELAY 200L
#define WHILE_LOOP_STEPS (WIFI_CONNECT_TIMEOUT / (3 * WHILE_LOOP_DELAY))

namespace Connectivity
{
void setup();
void loop();
} // namespace Connectivity
