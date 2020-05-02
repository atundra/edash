import fs from 'fs';
import { PNG } from 'pngjs';
import { Buffer } from 'buffer';

type RGBA = [number, number, number, number];

const getRGBA = (data: Buffer, index: number): RGBA => [
  data[index],
  data[index + 1],
  data[index + 2],
  data[index + 4],
];

const setRGBA = (data: Buffer, index: number, rgba: RGBA): void => {
  const [r, g, b, a] = rgba;
  data[index] = r;
  data[index + 1] = g;
  data[index + 2] = b;
  data[index + 3] = a;
};

const isBlackish = ([r, g, b]: RGBA): boolean => (r + g + b) * 0.6 < 255;

const toMonochrome = (rgba: RGBA): RGBA => {
  const threshhold = 0.6;
  const [r, g, b, a] = rgba;
  if ((r + g + b) * threshhold < 255) {
    return [0, 0, 0, 255];
  } else {
    return [255, 255, 255, 255];
  }
};

const formatByte = (byte: number) =>
  byte.toString(16).padStart(2, '0').toUpperCase();

export const pngStreamToBitmap = (input: fs.ReadStream): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const png = new PNG({
      filterType: -1,
    });

    png.on('error', (err) => reject(err));

    png.on('parsed', (data) => {
      const { height, width } = png;

      const bytePerPixel = 4;
      const pixelsPerByte = 8;
      const loopStep = bytePerPixel * pixelsPerByte;

      const out = Buffer.alloc((height * width) / pixelsPerByte);
      let outOffset = 0;

      // Iterating over blocks of 8 pixel (every pixel is 4 bytes)
      for (
        let blockIndex = 0;
        blockIndex < data.length;
        blockIndex += loopStep
      ) {
        let blockByte = 0;
        for (
          let blockPixelIndex = 0;
          blockPixelIndex < pixelsPerByte;
          blockPixelIndex++
        ) {
          const rgba = getRGBA(
            data,
            blockIndex + blockPixelIndex * bytePerPixel
          );
          const bitVal = isBlackish(rgba) ? 1 : 0;
          blockByte |= bitVal << (pixelsPerByte - 1 - blockPixelIndex);
        }
        outOffset = out.writeUInt8(blockByte, outOffset);
      }
      resolve(out);
    });

    input.pipe(png);
  });
