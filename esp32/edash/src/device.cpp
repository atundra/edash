#include "device.h"

#include "GxEPD2_EPD.h"
#include <Fonts/FreeSansBold18pt7b.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

template <typename T>
void Dashboard_NS::Dashboard<T>::DrawBitmap(int16_t x, int16_t y, const uint8_t bitmap[], int16_t w, int16_t h, uint16_t color) const
{
    displayDevice.drawBitmap(x, y, bitmap, w, h, color);
}

template <typename T>
void Dashboard_NS::Dashboard<T>::BetterDrawBitmap(const uint8_t bitmap[]) const
{
    displayDevice.drawBitmap(0, 0, bitmap, displayDevice.epd2.WIDTH, displayDevice.epd2.HEIGHT, GxEPD_BLACK);
}

template <typename T>
void Dashboard_NS::Dashboard<T>::DrawPayload(const String &payload) const
{
    WiFiUDP ntpUDP;
    NTPClient timeClient(ntpUDP);

    String formattedDate;
    String dayStamp;
    String timeStamp;

    Serial.println("Setup time client");
    timeClient.begin();
    const int timeOffset = 60 * 60 * 3; // GMT+3
    Serial.printf("Setting time offset to %d seconds\n", timeOffset);
    timeClient.setTimeOffset(60 * 60 * 3);

    Serial.println("Trying to update time client");
    while (!timeClient.update())
    {
        Serial.println("Time client force update");
        timeClient.forceUpdate();
    }
    Serial.printf("Time client updated, day: %d, hours: %d, minutes: %d, seconds: %d\n",
                  timeClient.getDay(), timeClient.getHours(), timeClient.getMinutes(), timeClient.getSeconds());

    Serial.println("Draw HTTP payload");
    Serial.print("Payload length: ");
    Serial.println(payload.length());

    displayDevice.init(115200);
    displayDevice.setFullWindow();

    displayDevice.firstPage();
    do
    {
        displayDevice.fillScreen(GxEPD_WHITE);
        DrawBitmap(0, 0, (unsigned char *)payload.c_str(), displayDevice.epd2.WIDTH, displayDevice.epd2.HEIGHT, GxEPD_BLACK);

        char time[5];
        sprintf(time, "%02d:%02d", timeClient.getHours(), timeClient.getMinutes());

        const int16_t widgetX = 440;
        const int16_t widgetY = 0;
        const uint16_t widgetW = 200;
        const uint16_t widgetH = 95;
        displayDevice.setFont(&FreeSansBold18pt7b);
        displayDevice.setTextColor(GxEPD_BLACK);
        int16_t tbx, tby;
        uint16_t tbw, tbh;
        displayDevice.getTextBounds(time, 0, 0, &tbx, &tby, &tbw, &tbh);
        uint16_t x = ((widgetW - tbw) / 2) - tbx + widgetX;
        uint16_t y = ((widgetH - tbh) / 2) - tby + widgetY;
        Serial.println();
        Serial.println(tbx);
        Serial.println(tby);
        Serial.println(tbw);
        Serial.println(tbh);
        Serial.println(x);
        Serial.println(y);
        displayDevice.setCursor(x, y);
        displayDevice.print(time);

    } while (displayDevice.nextPage());

    Serial.println("Power off");
    displayDevice.powerOff();
}