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

// magick convert -alpha off -compress none $1 BMP3:$2.bmp
export const convertToBMP = (input: string, output: string) =>
  convertTo(['-alpha', 'off', '-compress', 'none', input, `BMP3:${output}`]);

// Just run convert command with input and output
export const convertSimple = (input: string, output: string) =>
  convertTo([input, output]);
