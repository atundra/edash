import { Page } from "puppeteer";
import { Router, RequestHandler } from "express";
import { generate as generateMapUrl } from "./mapUrl";
import path from "path";
import {
  convertToBMP as convertImageToBMP,
  convertSimple as convertImageSimple,
} from "./image";
import { exists as isFileExists, load as loadFile } from "./file";
import { PathLike, createReadStream } from "fs";
import { IMAGE_MAX_AGE, TRACKS } from "./config";
import { pngStreamToBitmap } from "./createBitmap";
import * as browsermanager from "./browsermanager";

let imageLoadedTs = 0;

const shouldLoadNewImage = async (oldImage: PathLike): Promise<boolean> => {
  const imageExists = await isFileExists(oldImage);
  if (!imageExists) {
    return true;
  }

  if (imageLoadedTs < Date.now() - IMAGE_MAX_AGE) {
    return true;
  }

  return false;
};

const updateMapImageIfNeeded = async (filename: string): Promise<boolean> => {
  const needToUpdate = await shouldLoadNewImage(filename);
  if (!needToUpdate) {
    return false;
  }

  const url = await generateMapUrl(TRACKS);
  await loadFile({ url, output: filename });
  console.log("Image loaded");

  imageLoadedTs = Date.now();
  return true;
};

const pngHanlder: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, "image_cache/lastimage.png");
  await updateMapImageIfNeeded(imageNamePNG);

  res.sendFile(imageNamePNG, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log("File sent");
    }
  });
};

const bmpHandler: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, "image_cache/lastimage.png");
  const imageNameBMP = path.resolve(__dirname, "image_cache/lastimage.bmp");

  const updated = await updateMapImageIfNeeded(imageNamePNG);
  if (updated) {
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

const binHandler: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, "image_cache/lastimage.png");
  await updateMapImageIfNeeded(imageNamePNG);
  const bitmapBuffer = await pngStreamToBitmap(createReadStream(imageNamePNG));
  res.send(bitmapBuffer);
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

const randomBinHandler: RequestHandler = async (req, res, next) => {
  const imageNameJPG = path.resolve(__dirname, "image_cache/rand.jpg");
  const imageNamePNG = path.resolve(__dirname, "image_cache/rand.png");

  const url = "https://picsum.photos/640/384.jpg";

  await loadFile({ url, output: imageNameJPG });
  await convertImageSimple(imageNameJPG, imageNamePNG);
  const bitmap = await pngStreamToBitmap(createReadStream(imageNamePNG));
  res.send(bitmap);
};

const waitForPageLoad = async (page: Page) => {
  const readyState = await page.evaluate(() => document.readyState);

  if (readyState !== "complete") {
    return new Promise((resolve) => page.once("load", resolve));
  }
};

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

const headlessHandler: RequestHandler = async (req, res, next) => {
  const width = Number(req.query.width) || DEFAULT_WIDTH;
  const height = Number(req.query.heigh) || DEFAULT_HEIGHT;

  const imagePath = path.resolve(
    __dirname,
    `image_cache/headless_${width}_${height}.png`
  );

  const browser = await browsermanager.getBrowser();
  const page = await browser.newPage();

  await page.setViewport({
    width,
    height,
  });

  page.setContent("<h1>Hello</h1>");

  await waitForPageLoad(page);

  await page.screenshot({ path: imagePath });
  page.close();

  res.sendFile(imagePath, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log("File sent");
    }
  });
};

export const router = Router()
  .get("/image.bin", binHandler)
  .get("/image.png", pngHanlder)
  .get("/image.bmp", bmpHandler)
  .get("/random.bin", randomBinHandler)
  .get("/random", randomHandler)
  .get("/headless", headlessHandler);
