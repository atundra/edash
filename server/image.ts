import { spawn } from "child_process";

export const convertToBMP = (input: string, output: string): Promise<void> =>
  new Promise((resolve, reject) => {
    // magick convert -alpha off -compress none $1 BMP3:$2.bmp
    const proc = spawn("magick", [
      "convert",
      "-alpha",
      "off",
      "-compress",
      "none",
      input,
      `BMP3:${output}`,
    ]);
    let error = "";

    proc.stderr.on("data", (data) => (error += data));

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
