#pragma once

#include <Esp.h>

typedef uint8_t err_t;

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
