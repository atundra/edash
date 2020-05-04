#pragma once

#include <Esp.h>
#include <Adafruit_GFX.h>

namespace Dashboard_NS
{

typedef enum
{
    Monochrome,
    ThreeColor,
    Grayscale
} ColorModes;

struct Resolution
{
    int width;
    int height;
};

template <typename DisplayDeviceClass>
class Dashboard
{
private:
    DisplayDeviceClass& displayDevice;
    void DrawBitmap(int16_t x, int16_t y, const uint8_t bitmap[], int16_t w, int16_t h, uint16_t color) const;
    void BetterDrawBitmap(const uint8_t bitmap[]) const;

public:
    Dashboard(DisplayDeviceClass& new_displayDevice) : displayDevice(new_displayDevice) {}

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

public:
    class Wigdet {
        public:
        using Coordinates = Resolution;
        typedef enum {
            LOCAL,
            ONLINE
        } WidgetType;
        private:
        Coordinates corner;
        Coordinates size;
        WidgetType type;

        public:
        Widget(const Coordinates& new_corner, const Coordinates& new_size, const WidgetType& new_type) : corner (new_corner), size(new_size), type(new_type) {}
        
    };
};

}; // namespace Dashboard_NS