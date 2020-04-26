import { Router, RequestHandler } from "express";
import { generate as generateMapUrl } from "./mapUrl";
import path from "path";
import { convertToBMP as convertImageToBMP } from "./image";
import { exists as isFileExists, load as loadFile } from "./file";

const imageHanlder: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, "image_cache/lastimage.png");
  const imageNameBMP = path.resolve(__dirname, "image_cache/lastimage.bmp");

  const bmpExists = await isFileExists(imageNameBMP);
  if (!bmpExists) {
    const url = await generateMapUrl([]);
    await loadFile({ url, output: imageNamePNG });
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
