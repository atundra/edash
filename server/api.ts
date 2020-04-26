import { Router, RequestHandler } from "express";
import { generate as generateMapUrl } from "./mapUrl";
import axios from "axios";
import fs from "fs";
import path from "path";
import { Stream } from "stream";
import { spawn } from "child_process";

const isImageExists = async (imageName: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    fs.access(imageName, fs.constants.F_OK, (err) => resolve(err === null));
  });

const loadImage = (url: string, fileName: string) =>
  new Promise((resolve, reject) => {
    axios({
      method: "get",
      url,
      responseType: "stream",
    })
      .then(function (response) {
        const output = fs.createWriteStream(fileName);
        const stream: Stream = response.data;

        stream.on("data", (chunk) => output.write(chunk));
        stream.on("end", () => {
          output.end(() => resolve());
        });
      })
      .catch(reject);
  });

const convertImageToBMP = (input: string, output: string) =>
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

    proc.stdout.on("data", (data) => {
      console.log("stdout");
      console.log(`stdout: ${data}`);
    });

    proc.stderr.on("data", (data) => (error += data));

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(error);
      }
    });
  });

const imageHanlder: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, "image_cache/lastimage.png");
  const imageNameBMP = path.resolve(__dirname, "image_cache/lastimage.bmp");

  const bmpExists = await isImageExists(imageNameBMP);
  if (!bmpExists) {
    const url = await generateMapUrl([]);
    await loadImage(url, imageNamePNG);
    console.log("Image loaded");

    await convertImageToBMP(imageNamePNG, imageNameBMP);
    console.log("Image converted");
  }

  res.sendFile(imageNameBMP, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log("File sent");
    }
  });
};

export const router = Router().get("/image", imageHanlder);
