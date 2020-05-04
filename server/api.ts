import { Router, RequestHandler, Request } from 'express';
import { generate as generateMapUrl } from './mapUrl';
import path from 'path';
import {
  convertToBMP as convertImageToBMP,
  convertSimple as convertImageSimple,
} from './image';
import { exists as isFileExists, load as loadFile } from './file';
import { PathLike, createReadStream } from 'fs';
import {
  IMAGE_MAX_AGE,
  TRACKS,
  LAYOUT_COLUMNS_COUNT,
  LAYOUT_ROWS_COUNT,
} from './config';
import { pngStreamToBitmap } from './createBitmap';
import Renderer, { WidgetOptions } from './renderer';
import { getContentScreenshot } from './puppeteer';

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

  const url = await generateMapUrl(TRACKS, { width: 640, height: 384 });
  await loadFile({ url, output: filename });
  console.log('Image loaded');

  imageLoadedTs = Date.now();
  return true;
};

const pngHanlder: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, 'image_cache/lastimage.png');
  await updateMapImageIfNeeded(imageNamePNG);

  res.sendFile(imageNamePNG, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log('File sent');
    }
  });
};

const bmpHandler: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, 'image_cache/lastimage.png');
  const imageNameBMP = path.resolve(__dirname, 'image_cache/lastimage.bmp');

  const updated = await updateMapImageIfNeeded(imageNamePNG);
  if (updated) {
    await convertImageToBMP(imageNamePNG, imageNameBMP);
    console.log('Image converted');
  }

  res.sendFile(imageNameBMP, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log('File sent');
    }
  });
};

const binHandler: RequestHandler = async (req, res, next) => {
  const imageNamePNG = path.resolve(__dirname, 'image_cache/lastimage.png');
  await updateMapImageIfNeeded(imageNamePNG);
  const bitmapBuffer = await pngStreamToBitmap(createReadStream(imageNamePNG));
  res.send(bitmapBuffer);
};

const randomHandler: RequestHandler = async (req, res, next) => {
  const imageNameJPG = path.resolve(__dirname, 'image_cache/rand.jpg');
  const imageNameBMP = path.resolve(__dirname, 'image_cache/rand.bmp');

  const url = 'https://picsum.photos/640/384.jpg';
  await loadFile({ url, output: imageNameJPG });
  console.log('Image loaded');

  await convertImageToBMP(imageNameJPG, imageNameBMP);
  console.log('Image converted');

  res.sendFile(imageNameBMP, null, (err) => {
    if (err) {
      next(err);
    } else {
      console.log('File sent');
    }
  });
};

const randomBinHandler: RequestHandler = async (req, res, next) => {
  const imageNameJPG = path.resolve(__dirname, 'image_cache/rand.jpg');
  const imageNamePNG = path.resolve(__dirname, 'image_cache/rand.png');

  const url = 'https://picsum.photos/640/384.jpg';

  await loadFile({ url, output: imageNameJPG });
  await convertImageSimple(imageNameJPG, imageNamePNG);
  const bitmap = await pngStreamToBitmap(createReadStream(imageNamePNG));
  res.send(bitmap);
};

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 480;

const EXAMPLE_CONFIG: WidgetOptions[] = [
  {
    id: 'hello',
    position: {
      column: 1,
      row: 1,
      colspan: 5,
      rowspan: 6,
    },
  },
  {
    id: 'googleCalendarEvents',
    position: {
      column: 1,
      row: 9,
      colspan: 16,
      rowspan: 1,
    },
  },
  {
    id: 'parcelMap',
    position: {
      column: 6,
      row: 1,
      colspan: 11,
      rowspan: 8,
    },
    options: {
      tracks: TRACKS,
    },
  },
];

const createRenderOptions = (req: Request) => {
  const width = Number(req.query.width) || DEFAULT_WIDTH;
  const height = Number(req.query.height) || DEFAULT_HEIGHT;

  return {
    widgets: EXAMPLE_CONFIG,
    layout: {
      width,
      height,
      columns: LAYOUT_COLUMNS_COUNT,
      rows: LAYOUT_ROWS_COUNT,
    },
  };
};

const layoutHtmlHandler: RequestHandler = async (req, res, next) => {
  const renderOptions = createRenderOptions(req);

  const pageContent = await Renderer.render(renderOptions);
  res.type('html').send(pageContent);
};

const layoutPngHandler: RequestHandler = async (req, res, next) => {
  const renderOptions = createRenderOptions(req);

  const pageContent = await Renderer.render(renderOptions);

  const screenshot = await getContentScreenshot(pageContent, {
    width: renderOptions.layout.width,
    height: renderOptions.layout.height,
  });

  res.type('png').send(screenshot);
};

export const router = Router()
  .get('/image.bin', binHandler)
  .get('/image.png', pngHanlder)
  .get('/image.bmp', bmpHandler)
  .get('/random.bin', randomBinHandler)
  .get('/random', randomHandler)
  .get('/layout.png', layoutPngHandler)
  .get('/layout.html', layoutHtmlHandler);
