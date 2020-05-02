#include "connectivity.h"

// SSID and PW for Config Portal
String ssid = "ESP_" + String(ESP_getChipId(), HEX);
const char *password = "";

// SSID and PW for your Router
String Router_SSID;
String Router_Pass;

//DoubleResetDetector drd(DRD_TIMEOUT, DRD_ADDRESS);
DoubleResetDetector *drd;

// Indicates whether ESP has WiFi credentials saved from previous session, or double reset detected
bool initialConfig = false;

namespace Connectivity
{
void heartBeatPrint(void)
{
  static int num = 1;

  if (WiFi.status() == WL_CONNECTED)
    Serial.println("Connected"); // H means connected to WiFi
  else
    Serial.println("Disconnected"); // F means not connected to WiFi

  if (num == 80)
  {
    Serial.println();
    num = 1;
  }
  else if (num++ % 10 == 0)
  {
    Serial.print(" ");
  }
}

void check_status()
{
  static ulong checkstatus_timeout = 0;

  // Print hearbeat every HEARTBEAT_INTERVAL (10) seconds.
  if ((millis() > checkstatus_timeout) || (checkstatus_timeout == 0))
  {
    heartBeatPrint();
    checkstatus_timeout = millis() + HEARTBEAT_INTERVAL;
  }
}

void setup()
{
  // put your setup code here, to run once:
  // initialize the LED digital pin as an output.
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("\nStarting");

  drd = new DoubleResetDetector(DRD_TIMEOUT, DRD_ADDRESS);

  //Local intialization. Once its business is done, there is no need to keep it around
  // Use this to default DHCP hostname to ESP8266-XXXXXX or ESP32-XXXXXX
  //ESP_WiFiManager ESP_wifiManager;
  // Use this to personalize DHCP hostname (RFC952 conformed)
  ESP_WiFiManager ESP_wifiManager("ConfigOnDoubleReset");

  ESP_wifiManager.setMinimumSignalQuality(-1);

  // We can't use WiFi.SSID() in ESP32 as it's only valid after connected.
  // SSID and Password stored in ESP32 wifi_ap_record_t and wifi_config_t are also cleared in reboot
  // Have to create a new function to store in EEPROM/SPIFFS for this purpose
  Router_SSID = ESP_wifiManager.WiFi_SSID();
  Router_Pass = ESP_wifiManager.WiFi_Pass();

  //Remove this line if you do not want to see WiFi password printed
  Serial.println("Stored: SSID = " + Router_SSID + ", Pass = " + Router_Pass);

  // SSID to uppercase
  ssid.toUpperCase();

  if (Router_SSID != "")
  {
    ESP_wifiManager.setConfigPortalTimeout(60); //If no access point name has been previously entered disable timeout.
    Serial.println("Got stored Credentials. Timeout 60s");
  }
  else
  {
    Serial.println("No stored Credentials. No timeout");
    initialConfig = true;
  }

  if (drd->detectDoubleReset())
  {
    Serial.println("Double Reset Detected");
    initialConfig = true;
  }

  if (initialConfig)
  {
    Serial.println("Starting configuration portal.");
    digitalWrite(LED_BUILTIN, LED_ON); // turn the LED on by making the voltage LOW to tell us we are in configuration mode.

    //sets timeout in seconds until configuration portal gets turned off.
    //If not specified device will remain in configuration mode until
    //switched off via webserver or device is restarted.
    //ESP_wifiManager.setConfigPortalTimeout(600);

    //it starts an access point
    //and goes into a blocking loop awaiting configuration
    if (!ESP_wifiManager.startConfigPortal((const char *)ssid.c_str(), password))
      Serial.println("Not connected to WiFi but continuing anyway.");
    else
      Serial.println("WiFi connected...yeey :)");
  }

  digitalWrite(LED_BUILTIN, LED_OFF); // Turn led off as we are not in configuration mode.

  unsigned long startedAt = millis();

  while ((WiFi.status() != WL_CONNECTED) && (millis() - startedAt < WIFI_CONNECT_TIMEOUT))
  {
    WiFi.mode(WIFI_STA);
    WiFi.persistent(true);
    // We start by connecting to a WiFi network

    Serial.print("Connecting to ");
    Serial.println(Router_SSID);

    WiFi.begin(Router_SSID.c_str(), Router_Pass.c_str());

    int i = 0;
    while ((!WiFi.status() || WiFi.status() >= WL_DISCONNECTED) && i++ < WHILE_LOOP_STEPS)
    {
      delay(WHILE_LOOP_DELAY);
    }
  }

  Serial.print("After waiting ");
  Serial.print((millis() - startedAt) / 1000);
  Serial.print(" secs more in setup(), connection result is ");

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.print("connected. Local IP: ");
    Serial.println(WiFi.localIP());
  }
  else
    Serial.println(ESP_wifiManager.getStatus(WiFi.status()));
}

void loop()
{
  // Call the double reset detector loop method every so often,
  // so that it can recognise when the timeout expires.
  // You can also call drd.stop() when you wish to no longer
  // consider the next reset as a double reset.
  drd->loop();

  // put your main code here, to run repeatedly
  check_status();
}

} // namespace Connectivity
