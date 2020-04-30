import fs from "fs";
import { PNG } from "pngjs";

const png = new PNG({
  filterType: -1,
});

const src = fs.createReadStream(process.argv[2]);
const dst = fs.createWriteStream(process.argv[3] || "out.png");

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

const formatByte = (byte: number) => byte.toString(16).padStart(2, "0");

png.on("parsed", function () {
  const { data, height, width } = png;
  const bytePerPixel = 4;
  const inBytePerOutByte = 8;
  for (
    let index = 0;
    index < data.length;
    index += bytePerPixel * inBytePerOutByte
  ) {
    let outByte = 0;
    for (let inByteIndex = 0; inByteIndex < inBytePerOutByte; inByteIndex++) {
      const rgba = getRGBA(data, index + inByteIndex);
      const bitVal = isBlackish(rgba) ? 1 : 0;
      outByte |= bitVal << inByteIndex;
    }
    dst.write("0x" + formatByte(outByte) + ",\n");
  }

  // for (let y = 0; y < height; y++) {
  //   for (let x = 0; x < width; x++) {
  //     // console.log()
  //     const idx = (width * y + x) << 2;

  //     console.log(idx);
  //     const rgba = getRGBA(data, idx);
  //     const [red, green, blue] = rgba;

  //     // console.log("red", red, "green", green, "blue", blue);
  //     // setRGBA(data, idx, toMonochrome(rgba));
  //   }
  // }

  // png.pack().pipe(dst);
});

src.pipe(png);
