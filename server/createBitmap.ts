import fs from 'fs';
import { convertBuffer } from './image';

export const pngStreamToBitmap = (input: fs.ReadStream): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];

    input.on('data', (data: Buffer) => buffers.push(data));
    input.on('end', () => {
      convertBuffer(Buffer.concat(buffers), [
        'PNG:-',
        '-dither',
        'Floyd-Steinberg',
        'MONO:-',
      ]).then(resolve, (err) => {
        console.log(err.toString());
      });
    });
  });
