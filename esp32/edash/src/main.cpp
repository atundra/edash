#include <Arduino.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>

const char *ssid = "Mind Control Facility";
const char *password = ".......";

void setup()
{
  Serial.begin(115200);
  Serial.println("Serial started");

  if (!WiFi.getAutoConnect() || (WiFi.getMode() != WIFI_STA) || ((WiFi.SSID() != ssid)))
  {
    Serial.println();
    Serial.print("WiFi.getAutoConnect()=");
    Serial.println(WiFi.getAutoConnect());
    Serial.print("WiFi.SSID()=");
    Serial.println(WiFi.SSID());
    WiFi.mode(WIFI_STA);
    Serial.print("Connecting to ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);
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
      return;
    }
  }
  Serial.println();
  Serial.println("WiFi connected");

  // Print the IP address
  Serial.println(WiFi.localIP());

  pinMode(LED_BUILTIN, OUTPUT);
}

void loop()
{
  Serial.println("ping");
  digitalWrite(LED_BUILTIN, HIGH);

  delay(1000);

  Serial.println("pong");
  digitalWrite(LED_BUILTIN, LOW);

  delay(1000);
}