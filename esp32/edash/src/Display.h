#pragma once

#include "Types.h"

#include <Esp.h>
#include <Adafruit_GFX.h>

namespace Dashboard_NS
{

template <typename DisplayDeviceClass>
class Display
{
private:
    DisplayDeviceClass& displayDevice;
    void DrawBitmap(int16_t x, int16_t y, const uint8_t bitmap[], int16_t w, int16_t h, uint16_t color) const;
    void BetterDrawBitmap(const uint8_t bitmap[]) const;

public:
    Display(DisplayDeviceClass& new_displayDevice) : displayDevice(new_displayDevice) {}
    Display();
public:
    Resolution GetResolution() const
    {
        return {displayDevice.epd2.WIDTH, displayDevice.epd2.HEIGHT};
    }

public:
    ColorModes GetColors() const
    {
        // TODO write this
        return ColorModes::Monochrome;
    }

public:
    void DrawPayload(const String &payload) const;
};

}; // namespace Dashboard_NS