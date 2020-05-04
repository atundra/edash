import { spawn } from 'child_process';

const convertTo = (convertArgs: string[] = []): Promise<void> =>
  new Promise((resolve, reject) => {
    const proc = spawn('convert', convertArgs);
    let error = '';

    proc.stderr.on('data', (data) => (error += data));

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(error);
      }
    });
  });

const reverse = (b: number) => {
  b = ((b & 0xf0) >> 4) | ((b & 0x0f) << 4);
  b = ((b & 0xcc) >> 2) | ((b & 0x33) << 2);
  b = ((b & 0xaa) >> 1) | ((b & 0x55) << 1);
  return b;
};

const toggleEndianness = function (buf: Buffer): Buffer {
  var output = Buffer.alloc(buf.length);

  for (const [i, b] of buf.entries()) {
    output.writeUInt8(reverse(b), i);
  }

  return output;
};

export const convertBuffer = (
  sourceBuffer: Buffer,
  convertArgs: string[] = []
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    var buffers: Buffer[] = [];

    const proc = spawn('convert', convertArgs);

    proc.stdout.on('data', (data) => {
      buffers.push(data);
    });

    proc.stderr.on('data', function (data) {
      reject(data);
    });

    proc.on('close', function (code, signal) {
      if (code == 0 || signal == null) {
        resolve(toggleEndianness(Buffer.concat(buffers)));
      }
    });

    proc.stdin.write(sourceBuffer);
    proc.stdin.end();
  });

// magick convert -alpha off -compress none $1 BMP3:$2.bmp
export const convertToBMP = (input: string, output: string) =>
  convertTo(['-alpha', 'off', '-compress', 'none', input, `BMP3:${output}`]);

// Just run convert command with input and output
export const convertSimple = (input: string, output: string) =>
  convertTo([input, output]);
