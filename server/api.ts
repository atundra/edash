import { Router, RequestHandler } from "express";
import { generate as generateMapUrl } from "./mapUrl";
import path from "path";
import { convertToBMP as convertImageToBMP } from "./image";
import { exists as isFileExists, load as loadFile } from "./file";
import { PathLike } from "fs";
import { IMAGE_MAX_AGE, TRACKS } from "./config";

let imageLoadedTs = 0;

const shouldLoadNewImage = async (oldImage: PathLike): Promise<boolean> => {
  const bmpExists = await isFileExists(oldImage);
  if (!bmpExists) {
    return true;
  }

  if (imageLoadedTs < Date.now() - IMAGE_MAX_AGE) {
    return true;
  }

  return false;
};

const imageHanlder: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, "image_cache/lastimage.png");
  const imageNameBMP = path.resolve(__dirname, "image_cache/lastimage.bmp");

  if (await shouldLoadNewImage(imageNamePNG)) {
    const url = await generateMapUrl(TRACKS);
    await loadFile({ url, output: imageNamePNG });
    console.log("Image loaded");

    await convertImageToBMP(imageNamePNG, imageNameBMP);
    console.log("Image converted");

    imageLoadedTs = Date.now();
  }

  res.sendFile(imageNameBMP, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log("File sent");
    }
  });
};

const randomHandler: RequestHandler = async (req, res, next) => {
  const imageNameJPG = path.resolve(__dirname, "image_cache/rand.jpg");
  const imageNameBMP = path.resolve(__dirname, "image_cache/rand.bmp");

  const url = "https://picsum.photos/640/384.jpg";
  await loadFile({ url, output: imageNameJPG });
  console.log("Image loaded");

  await convertImageToBMP(imageNameJPG, imageNameBMP);
  console.log("Image converted");

  res.sendFile(imageNameBMP, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log("File sent");
    }
  });
};

export const router = Router()
  .get("/image", imageHanlder)
  .get("/random", randomHandler);
