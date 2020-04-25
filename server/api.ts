import { Router, RequestHandler } from "express";
import { generate as generateMapUrl } from "./mapUrl";
import axios from "axios";
import fs from "fs";
import path from "path";
import { Stream } from "stream";

const isImageExists = async (imageName: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    fs.access(imageName, fs.constants.F_OK, (err) => resolve(err === null));
  });

const saveImage = (url: string, fileName: string) =>
  new Promise((resolve, reject) => {
    axios({
      method: "get",
      url,
      responseType: "stream",
    }).then(function (response) {
      const output = fs.createWriteStream(fileName);
      const stream: Stream = response.data;

      stream.on("data", (chunk) => output.write(chunk));
      stream.on("end", () => {
        output.end(() => resolve());
      });
    });
  });

const imageHanlder: RequestHandler = async (req, res, next) => {
  const imageName = path.resolve(__dirname, "image_cache/lastimage.png");

  const imageExists = await isImageExists(imageName);
  if (!imageExists) {
    const url = await generateMapUrl([]);
    await saveImage(url, imageName);

    console.log("File saved");
  }

  res.sendFile(imageName, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log("File sent");
    }
  });
};

export const router = Router().get("/image", imageHanlder);
