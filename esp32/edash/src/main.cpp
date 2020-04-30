// mostly https://github.com/ZinggJM/GxEPD2/blob/master/examples/GxEPD2_Example/GxEPD2_Example.ino

#define ENABLE_GxEPD2_GFX 0

#include <GxEPD2_BW.h>
#include <GxEPD2_3C.h>

GxEPD2_3C<GxEPD2_750c, GxEPD2_750c::HEIGHT> display(GxEPD2_750c(/*CS=5*/ SS, /*DC=*/17, /*RST=*/16, /*BUSY=*/4));

// #include "bitmaps/Bitmaps640x384.h" // 7.5"  b/w
#include "bitmaps.h"

// const unsigned char *bitmaps[] = {Bitmap640x384_1, Bitmap640x384_2};
const unsigned char *bitmaps[] = {Bitmap640x384_1, Bitmap640x384_2, Bitmap640x384_3};
const uint16_t bitmapsSize = sizeof(bitmaps) / sizeof(char *);
uint16_t currentBitmapIndex = 0;

void setup()
{
  Serial.begin(115200);
  Serial.println();
  Serial.println("setup");
  delay(100);
  display.init(115200);
  display.setFullWindow();
}

void loop()
{
  Serial.println("Loop start");
  Serial.print("Draw bitmap ");
  Serial.println(currentBitmapIndex);

  Serial.println("First page start");
  display.firstPage();
  Serial.println("First page end");

  do
  {
    Serial.println("Fill screen");
    display.fillScreen(GxEPD_WHITE);
    Serial.println("Draw inverted bitmap");
    // display.drawInvertedBitmap(0, 0, bitmaps[currentBitmapIndex], display.epd2.WIDTH, display.epd2.HEIGHT, GxEPD_BLACK);
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