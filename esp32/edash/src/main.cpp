// mostly https://github.com/ZinggJM/GxEPD2/blob/master/examples/GxEPD2_Example/GxEPD2_Example.ino

#define ENABLE_GxEPD2_GFX 0

#include <GxEPD2_BW.h>
#include <GxEPD2_3C.h>

GxEPD2_3C<GxEPD2_750c, GxEPD2_750c::HEIGHT> display(GxEPD2_750c(/*CS=5*/ SS, /*DC=*/17, /*RST=*/16, /*BUSY=*/4));

#include "bitmaps/Bitmaps640x384.h" // 7.5"  b/w

const unsigned char *bitmaps[] = {Bitmap640x384_1, Bitmap640x384_2};
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
  display.firstPage();
  do
  {
    display.fillScreen(GxEPD_WHITE);
    display.drawInvertedBitmap(0, 0, bitmaps[currentBitmapIndex], display.epd2.WIDTH, display.epd2.HEIGHT, GxEPD_BLACK);
  } while (display.nextPage());
  display.powerOff();
  delay(2000);

  currentBitmapIndex++;
  if (currentBitmapIndex >= bitmapsSize)
  {
    currentBitmapIndex = 0;
  }
}