#include "device.h"

#include "GxEPD2_EPD.h"
#include <Fonts/FreeMonoBold9pt7b.h>

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

        const char time[] = "04:20";
        const int16_t widgetX = 440;
        const int16_t widgetY = 0;
        const uint16_t widgetW = 200;
        const uint16_t widgetH = 95;
        displayDevice.setFont(&FreeMonoBold9pt7b);
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