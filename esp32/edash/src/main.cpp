// mostly https://github.com/ZinggJM/GxEPD2/blob/master/examples/GxEPD2_Example/GxEPD2_Example.ino

#define ENABLE_GxEPD2_GFX 0

// #include <GxEPD2_BW.h>
#include <GxEPD2_3C.h>

GxEPD2_3C<GxEPD2_750c, GxEPD2_750c::HEIGHT> display(GxEPD2_750c(/*CS=5*/ SS, /*DC=*/17, /*RST=*/16, /*BUSY=*/4));

// #include "bitmaps/Bitmaps640x384.h" // 7.5"  b/w
#include "bitmaps.h"

// const unsigned char *bitmaps[] = {Bitmap640x384_1, Bitmap640x384_2};
const unsigned char *bitmaps[] = {Bitmap640x384_1, Bitmap640x384_2, Bitmap640x384_3};
const uint16_t bitmapsSize = sizeof(bitmaps) / sizeof(char *);
uint16_t currentBitmapIndex = 0;

// Copy of display.drawInvertedBitmap
void drawBitmap(int16_t x, int16_t y, const uint8_t bitmap[], int16_t w, int16_t h, uint16_t color)
{
  int16_t byteWidth = (w + 7) / 8; // Bitmap scanline pad = whole byte
  uint8_t byte = 0;
  for (int16_t j = 0; j < h; j++)
  {
    for (int16_t i = 0; i < w; i++)
    {
      if (i & 7)
      {
        byte <<= 1;
      }
      else
      {
        byte = pgm_read_byte(&bitmap[j * byteWidth + i / 8]);
      }

      if (byte & 0x80)
      {
        display.drawPixel(x + i, y + j, color);
      }
    }
  }
}

void setup()
{
  Serial.begin(115200);
  Serial.println();
  Serial.println("setup");
  delay(100);
  display.init(115200);
  display.setFullWindow();

  display.firstPage();
  do
  {
    display.fillScreen(GxEPD_WHITE);
    drawBitmap(0, 0, bitmaps[2], display.epd2.WIDTH, display.epd2.HEIGHT, GxEPD_BLACK);
  } while (display.nextPage());

  Serial.println("Power off");
  display.powerOff();
}

void loop()
{
  return;

  Serial.println("Loop start");
  Serial.print("Draw bitmap ");
  Serial.println(currentBitmapIndex);

  Serial.println("First page start");
  display.firstPage();
  Serial.println("First page end");

  do
  {
    Serial.println("Fill screen");
    display.fillScreen(GxEPD_BLACK);
    Serial.println("Draw inverted bitmap");
    display.drawInvertedBitmap(0, 0, bitmaps[currentBitmapIndex], display.epd2.WIDTH, display.epd2.HEIGHT, GxEPD_WHITE);
  } while (display.nextPage());

  Serial.println("Power off");
  display.powerOff();
  delay(2000);

  currentBitmapIndex++;
  if (currentBitmapIndex >= bitmapsSize)
  {
    currentBitmapIndex = 0;
  }
}