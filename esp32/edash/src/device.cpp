#include "device.h"

#include "GxEPD2_EPD.h"

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
    } while (displayDevice.nextPage());

    Serial.println("Power off");
    displayDevice.powerOff();
}