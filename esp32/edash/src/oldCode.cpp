// #include <Arduino.h>
// #include <WiFiClient.h>
// #include <WiFiClientSecure.h>
// #include "bitmaps.h"

// //#include <GxEPD2_BW.h>
// #include <GxEPD2_3C.h>
// #include <GxEPD2.h>

// #define EPD_CS SS

// #if defined(ESP32)
// //GxEPD2_BW<GxEPD2_750, GxEPD2_750::HEIGHT> display(GxEPD2_750(/*CS=5*/ EPD_CS, /*DC=*/ 17, /*RST=*/ 16, /*BUSY=*/ 4));
// //GxEPD2_BW<GxEPD2_750_T7, GxEPD2_750_T7::HEIGHT> display(GxEPD2_750_T7(/*CS=5*/ EPD_CS, /*DC=*/ 17, /*RST=*/ 16, /*BUSY=*/ 4)); // GDEW075T7 800x480
// // 3-color e-papers
// GxEPD2_3C<GxEPD2_750c, GxEPD2_750c::HEIGHT> display(GxEPD2_750c(/*CS=5*/ EPD_CS, /*DC=*/17, /*RST=*/16, /*BUSY=*/4));
// //GxEPD2_3C<GxEPD2_750c_Z08, GxEPD2_750c_Z08::HEIGHT> display(GxEPD2_750c_Z08(/*CS=5*/ EPD_CS, /*DC=*/ 17, /*RST=*/ 16, /*BUSY=*/ 4)); // GDEW075Z08 800x480
// #endif

// #if defined(ESP8266)
// #include <ESP8266WiFi.h>
// #define USE_BearSSL true
// #endif

// #include <WiFiClient.h>
// #include <WiFiClientSecure.h>

// #if USE_BearSSL
// const char fp_rawcontent[20] = {0xcc, 0xaa, 0x48, 0x48, 0x66, 0x46, 0x0e, 0x91, 0x53, 0x2c, 0x9c, 0x7c, 0x23, 0x2a, 0xb1, 0x74, 0x4d, 0x29, 0x9d, 0x33};
// #else
// const char *fp_rawcontent = "cc aa 48 48 66 46 0e 91 53 2c 9c 7c 23 2a b1 74 4d 29 9d 33";
// #endif
// const char *host_rawcontent = "raw.githubusercontent.com";
// const char *path_rawcontent = "/ZinggJM/GxEPD2/master/extras/bitmaps/";
// const char *path_prenticedavid = "/prenticedavid/MCUFRIEND_kbv/master/extras/bitmaps/";

// void showBitmapFrom_HTTP(const char *host, const int port, const char *path, int16_t x, int16_t y, bool with_color = true);

// const char *ssid = "Mind Control Facility";
// const char *password = ".......";

// void setup()
// {
//   Serial.begin(115200);
//   Serial.println("Serial started");

//   if (!WiFi.getAutoConnect() || (WiFi.getMode() != WIFI_STA) || ((WiFi.SSID() != ssid)))
//   {
//     Serial.println();
//     Serial.print("WiFi.getAutoConnect()=");
//     Serial.println(WiFi.getAutoConnect());
//     Serial.print("WiFi.SSID()=");
//     Serial.println(WiFi.SSID());
//     WiFi.mode(WIFI_STA);
//     Serial.print("Connecting to ");
//     Serial.println(ssid);
//     WiFi.begin(ssid, password);
//   }

//   int ConnectTimeout = 30; // 15 seconds
//   while (WiFi.status() != WL_CONNECTED)
//   {
//     delay(500);
//     Serial.print(".");
//     Serial.print(WiFi.status());
//     if (--ConnectTimeout <= 0)
//     {
//       Serial.println();
//       Serial.println("WiFi connect timeout");
//       return;
//     }
//   }
//   Serial.println();
//   Serial.println("WiFi connected");

//   // Print the IP address
//   Serial.println(WiFi.localIP());

//   pinMode(LED_BUILTIN, OUTPUT);
// }

// static const uint16_t input_buffer_pixels = 640; // may affect performance

// static const uint16_t max_row_width = 640;      // for up to 7.5" display
// static const uint16_t max_palette_pixels = 256; // for depth <= 8

// uint8_t input_buffer[3 * input_buffer_pixels];        // up to depth 24
// uint8_t output_row_mono_buffer[max_row_width / 8];    // buffer for at least one row of b/w bits
// uint8_t output_row_color_buffer[max_row_width / 8];   // buffer for at least one row of color bits
// uint8_t mono_palette_buffer[max_palette_pixels / 8];  // palette buffer for depth <= 8 b/w
// uint8_t color_palette_buffer[max_palette_pixels / 8]; // palette buffer for depth <= 8 c/w

// uint16_t read16(WiFiClient &client)
// {
//   // BMP data is stored little-endian, same as Arduino.
//   uint16_t result;
//   ((uint8_t *)&result)[0] = client.read(); // LSB
//   ((uint8_t *)&result)[1] = client.read(); // MSB
//   return result;
// }

// uint32_t read32(WiFiClient &client)
// {
//   // BMP data is stored little-endian, same as Arduino.
//   uint32_t result;
//   ((uint8_t *)&result)[0] = client.read(); // LSB
//   ((uint8_t *)&result)[1] = client.read();
//   ((uint8_t *)&result)[2] = client.read();
//   ((uint8_t *)&result)[3] = client.read(); // MSB
//   return result;
// }

// void tryToWaitForAvailable(WiFiClient &client, int32_t amount)
// {
//   // this doesn't work as expected, but it helps for long downloads
//   int32_t start = millis();
//   for (int16_t t = 0, dly = 50; t < 20; t++, dly += 50)
//   {
//     if (client.available())
//       break; // read would not recover after having returned 0
//     delay(dly);
//   }
//   for (int16_t t = 0, dly = 50; t < 3; t++, dly += 25)
//   {
//     if (amount <= client.available())
//       break;
//     delay(dly);
//     //Serial.print("available "); Serial.println(client.available()); // stays constant
//   }
//   int32_t elapsed = millis() - start;
//   if (elapsed > 250)
//   {
//     Serial.print("waited for available ");
//     Serial.print(millis() - start);
//     Serial.println(" ms");
//   }
// }

// uint32_t skip(WiFiClient &client, int32_t bytes)
// {
//   int32_t remain = bytes;
//   int16_t retries = 3;
//   uint32_t chunk = 1024;
//   if (chunk > sizeof(input_buffer))
//     chunk = sizeof(input_buffer);
//   while (client.connected() && (remain > chunk))
//   {
//     // there seems an issue with long downloads on ESP8266
//     tryToWaitForAvailable(client, chunk);
//     uint32_t got = client.read(input_buffer, chunk);
//     //Serial.print("skipped "); Serial.println(got);
//     remain -= got;
//     if ((0 == got) && (0 == --retries))
//     {
//       Serial.print("Error on skip, got 0, skipped ");
//       Serial.print(bytes - remain);
//       Serial.print(" of ");
//       Serial.println(bytes);
//       break; // don't hang forever (retries don't help)
//     }
//   }
//   if (client.connected() && (remain > 0) && (remain <= chunk))
//   {
//     remain -= client.read(input_buffer, remain);
//   }
//   return bytes - remain; // bytes read and skipped
// }

// void showBitmapFrom_HTTP(const char *host, const int port, const char *path, int16_t x, int16_t y, bool with_color)
// {
//   WiFiClient client;
//   bool connection_ok = false;
//   bool valid = false; // valid format to be handled
//   bool flip = true;   // bitmap is stored bottom-to-top
//   uint32_t startTime = millis();
//   if ((x >= display.width()) || (y >= display.height()))
//     return;
//   Serial.println();
//   Serial.print("downloading file \"");
//   Serial.print(path);
//   Serial.println("\"");
//   Serial.print("connecting to ");
//   Serial.println(host);
//   if (!client.connect(host, port))
//   {
//     Serial.println("connection failed");
//     return;
//   }
//   Serial.print("requesting URL: ");
//   Serial.println(String("http://") + host + path);
//   client.print(String("GET ") + path + " HTTP/1.1\r\n" +
//                "Host: " + host + "\r\n" +
//                "User-Agent: GxEPD2_Spiffs_Loader\r\n" +
//                "Connection: close\r\n\r\n");
//   Serial.println("request sent");
//   while (client.connected())
//   {
//     String line = client.readStringUntil('\n');
//     if (!connection_ok)
//     {
//       connection_ok = line.startsWith("HTTP/1.1 200 OK");
//       if (connection_ok)
//         Serial.println(line);
//       //if (!connection_ok) Serial.println(line);
//     }
//     if (!connection_ok)
//       Serial.println(line);
//     //Serial.println(line);
//     if (line == "\r")
//     {
//       Serial.println("headers received");
//       break;
//     }
//   }
//   if (!connection_ok)
//     return;
//   // Parse BMP header
//   if (read16(client) == 0x4D42) // BMP signature
//   {
//     uint32_t fileSize = read32(client);
//     uint32_t creatorBytes = read32(client);
//     uint32_t imageOffset = read32(client); // Start of image data
//     uint32_t headerSize = read32(client);
//     uint32_t width = read32(client);
//     uint32_t height = read32(client);
//     uint16_t planes = read16(client);
//     uint16_t depth = read16(client); // bits per pixel
//     uint32_t format = read32(client);
//     uint32_t bytes_read = 7 * 4 + 3 * 2;                   // read so far
//     if ((planes == 1) && ((format == 0) || (format == 3))) // uncompressed is handled, 565 also
//     {
//       Serial.print("File size: ");
//       Serial.println(fileSize);
//       Serial.print("Image Offset: ");
//       Serial.println(imageOffset);
//       Serial.print("Header size: ");
//       Serial.println(headerSize);
//       Serial.print("Bit Depth: ");
//       Serial.println(depth);
//       Serial.print("Image size: ");
//       Serial.print(width);
//       Serial.print('x');
//       Serial.println(height);
//       // BMP rows are padded (if needed) to 4-byte boundary
//       uint32_t rowSize = (width * depth / 8 + 3) & ~3;

//       if (depth < 8)
//       {
//         rowSize = ((width * depth + 8 - depth) / 8 + 3) & ~3;
//       }

//       if (height < 0)
//       {
//         height = -height;
//         flip = false;
//       }

//       uint16_t w = width;
//       uint16_t h = height;
//       if ((x + w - 1) >= display.width())
//         w = display.width() - x;
//       if ((y + h - 1) >= display.height())
//         h = display.height() - y;
//       if (w <= max_row_width) // handle with direct drawing
//       {
//         valid = true;
//         uint8_t bitmask = 0xFF;
//         uint8_t bitshift = 8 - depth;
//         uint16_t red, green, blue;
//         bool whitish, colored;
//         if (depth == 1)
//           with_color = false;
//         if (depth <= 8)
//         {
//           if (depth < 8)
//             bitmask >>= depth;
//           bytes_read += skip(client, 54 - bytes_read); //palette is always @ 54
//           for (uint16_t pn = 0; pn < (1 << depth); pn++)
//           {
//             blue = client.read();
//             green = client.read();
//             red = client.read();
//             client.read();
//             bytes_read += 4;
//             whitish = with_color ? ((red > 0x80) && (green > 0x80) && (blue > 0x80)) : ((red + green + blue) > 3 * 0x80); // whitish
//             colored = (red > 0xF0) || ((green > 0xF0) && (blue > 0xF0));                                                  // reddish or yellowish?
//             if (0 == pn % 8)
//               mono_palette_buffer[pn / 8] = 0;
//             mono_palette_buffer[pn / 8] |= whitish << pn % 8;
//             if (0 == pn % 8)
//               color_palette_buffer[pn / 8] = 0;
//             color_palette_buffer[pn / 8] |= colored << pn % 8;
//             //Serial.print("0x00"); Serial.print(red, HEX); Serial.print(green, HEX); Serial.print(blue, HEX);
//             //Serial.print(" : "); Serial.print(whitish); Serial.print(", "); Serial.println(colored);
//           }
//         }
//         display.clearScreen();
//         uint32_t rowPosition = flip ? imageOffset + (height - h) * rowSize : imageOffset;
//         //Serial.print("skip "); Serial.println(rowPosition - bytes_read);
//         bytes_read += skip(client, rowPosition - bytes_read);
//         for (uint16_t row = 0; row < h; row++, rowPosition += rowSize) // for each line
//         {
//           if (!connection_ok || !client.connected())
//           {
//             Serial.println("Connection break");
//             break;
//           }
//           delay(1); // yield() to avoid WDT
//           uint32_t in_remain = rowSize;
//           uint32_t in_idx = 0;
//           uint32_t in_bytes = 0;
//           uint8_t in_byte = 0;           // for depth <= 8
//           uint8_t in_bits = 0;           // for depth <= 8
//           uint8_t out_byte = 0xFF;       // white (for w%8!=0 boarder)
//           uint8_t out_color_byte = 0xFF; // white (for w%8!=0 boarder)
//           uint32_t out_idx = 0;
//           for (uint16_t col = 0; col < w; col++) // for each pixel
//           {
//             yield();
//             if (!connection_ok || !client.connected())
//             {
//               Serial.println("Connection break 2");
//               break;
//             }
//             // Time to read more pixel data?
//             if (in_idx >= in_bytes) // ok, exact match for 24bit also (size IS multiple of 3)
//             {
//               uint32_t get = in_remain > sizeof(input_buffer) ? sizeof(input_buffer) : in_remain;
//               //if (get > client.available()) delay(200); // does improve? yes, if >= 200
//               // there seems an issue with long downloads on ESP8266
//               tryToWaitForAvailable(client, get);
//               uint32_t got = client.read(input_buffer, get);
//               while ((got < get) && connection_ok)
//               {
//                 //Serial.print("got "); Serial.print(got); Serial.print(" < "); Serial.print(get); Serial.print(" @ "); Serial.println(bytes_read);
//                 //if ((get - got) > client.available()) delay(200); // does improve? yes, if >= 200
//                 // there seems an issue with long downloads on ESP8266
//                 tryToWaitForAvailable(client, get - got);
//                 uint32_t gotmore = client.read(input_buffer + got, get - got);
//                 got += gotmore;
//                 connection_ok = gotmore > 0;
//               }
//               in_bytes = got;
//               in_remain -= got;
//               bytes_read += got;
//             }
//             if (!connection_ok)
//             {
//               Serial.print("Error: got no more after ");
//               Serial.print(bytes_read);
//               Serial.println(" bytes read!");
//               break;
//             }
//             switch (depth)
//             {
//             case 24:
//               blue = input_buffer[in_idx++];
//               green = input_buffer[in_idx++];
//               red = input_buffer[in_idx++];
//               whitish = with_color ? ((red > 0x80) && (green > 0x80) && (blue > 0x80)) : ((red + green + blue) > 3 * 0x80); // whitish
//               colored = (red > 0xF0) || ((green > 0xF0) && (blue > 0xF0));                                                  // reddish or yellowish?
//               break;
//             case 16:
//             {
//               uint8_t lsb = input_buffer[in_idx++];
//               uint8_t msb = input_buffer[in_idx++];
//               if (format == 0) // 555
//               {
//                 blue = (lsb & 0x1F) << 3;
//                 green = ((msb & 0x03) << 6) | ((lsb & 0xE0) >> 2);
//                 red = (msb & 0x7C) << 1;
//               }
//               else // 565
//               {
//                 blue = (lsb & 0x1F) << 3;
//                 green = ((msb & 0x07) << 5) | ((lsb & 0xE0) >> 3);
//                 red = (msb & 0xF8);
//               }
//               whitish = with_color ? ((red > 0x80) && (green > 0x80) && (blue > 0x80)) : ((red + green + blue) > 3 * 0x80); // whitish
//               colored = (red > 0xF0) || ((green > 0xF0) && (blue > 0xF0));                                                  // reddish or yellowish?
//             }
//             break;
//             case 1:
//             case 4:
//             case 8:
//             {
//               if (0 == in_bits)
//               {
//                 in_byte = input_buffer[in_idx++];
//                 in_bits = 8;
//               }
//               uint16_t pn = (in_byte >> bitshift) & bitmask;
//               whitish = mono_palette_buffer[pn / 8] & (0x1 << pn % 8);
//               colored = color_palette_buffer[pn / 8] & (0x1 << pn % 8);
//               in_byte <<= depth;
//               in_bits -= depth;
//             }
//             break;
//             }
//             if (whitish)
//             {
//               // keep white
//             }
//             else if (colored && with_color)
//             {
//               out_color_byte &= ~(0x80 >> col % 8); // colored
//             }
//             else
//             {
//               out_byte &= ~(0x80 >> col % 8); // black
//             }
//             if ((7 == col % 8) || (col == w - 1)) // write that last byte! (for w%8!=0 boarder)
//             {
//               output_row_color_buffer[out_idx] = out_color_byte;
//               output_row_mono_buffer[out_idx++] = out_byte;
//               out_byte = 0xFF;       // white (for w%8!=0 boarder)
//               out_color_byte = 0xFF; // white (for w%8!=0 boarder)
//             }
//           } // end pixel
//           int16_t yrow = y + (flip ? h - row - 1 : row);
//           display.writeImage(output_row_mono_buffer, output_row_color_buffer, x, yrow, w, 1);
//         } // end line
//         Serial.print("downloaded in ");
//         Serial.print(millis() - startTime);
//         Serial.println(" ms");
//         display.refresh();
//       }
//       Serial.print("bytes read ");
//       Serial.println(bytes_read);
//     }
//   }
//   if (!valid)
//   {
//     Serial.println("bitmap format not handled.");
//   }
// }

// void drawBitmaps640x384()
// {
//   const unsigned char *bitmaps[] =
//       {
//           Bitmap640x384_1, Bitmap640x384_2};

//   // if ((display.epd2.panel == GxEPD2::GDEW075T8) || (display.epd2.panel == GxEPD2::GDEW075Z09))
//   // {
//   for (uint16_t i = 0; i < sizeof(bitmaps) / sizeof(char *); i++)
//   {
//     Serial.println
//         display.firstPage();
//     do
//     {
//       display.fillScreen(GxEPD_WHITE);
//       display.drawInvertedBitmap(0, 0, bitmaps[i], display.epd2.WIDTH, display.epd2.HEIGHT, GxEPD_BLACK);
//     } while (display.nextPage());
//     delay(2000);
//   }
//   // }
// }

// void loop()
// {
//   // showBitmapFrom_HTTP("bots.pashutk.ru", 8000, "/api/random", 0, 0);
//   // delay(10000);
//   // display.refresh();
//   // delay(10000);

//   drawBitmaps640x384();
//   delay(10000);
// }
