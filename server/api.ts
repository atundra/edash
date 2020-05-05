import { Router, RequestHandler, Request } from 'express';
import { generate as generateMapUrl } from './mapUrl';
import path from 'path';
import {
  convertToBMP as convertImageToBMP,
  convertSimple as convertImageSimple,
  convertBuffer,
} from './image';
import { exists as isFileExists, load as loadFile } from './file';
import { PathLike, createReadStream } from 'fs';
import {
  IMAGE_MAX_AGE,
  TRACKS,
  LAYOUT_COLUMNS_COUNT,
  LAYOUT_ROWS_COUNT,
  CACHE_GENERATION,
} from './config';
import { pngStreamToBitmap } from './createBitmap';
import Renderer, { WidgetOptions } from './renderer';
import { getContentScreenshot } from './puppeteer';
import cacheManager from 'cache-manager';
import fsStore from 'cache-manager-fs-hash';

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
      column: 12,
      row: 1,
      colspan: 5,
      rowspan: 3,
    },
  },
  {
    id: 'googleCalendarEvents',
    position: {
      column: 12,
      row: 4,
      colspan: 5,
      rowspan: 9,
    },
  },
  {
    id: 'parcelMap',
    position: {
      column: 1,
      row: 1,
      colspan: 11,
      rowspan: 9,
    },
    options: {
      tracks: TRACKS,
    },
  },
  {
    id: 'weather',
    position: {
      column: 1,
      row: 10,
      colspan: 11,
      rowspan: 3,
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

const widgetDataCache = cacheManager.caching({
  store: fsStore,
  ttl: 0,
  options: {
    path: 'widgetdatacache',
    subdirs: true,
  },
});
const widgetRenderer = new Renderer(widgetDataCache, CACHE_GENERATION);

const layoutHtmlHandler: RequestHandler = async (req, res, next) => {
  const renderOptions = createRenderOptions(req);

  const pageContent = await widgetRenderer.render(renderOptions);
  res.type('html').send(pageContent);
};

const layoutPngHandler: RequestHandler = async (req, res, next) => {
  const renderOptions = createRenderOptions(req);

  const pageContent = await widgetRenderer.render(renderOptions);

  const screenshot = await getContentScreenshot(pageContent, {
    width: renderOptions.layout.width,
    height: renderOptions.layout.height,
  });

  res.type('png').send(screenshot);
};

const layoutBinHandler: RequestHandler = async (req, res, next) => {
  const renderOptions = createRenderOptions(req);

  const pageContent = await widgetRenderer.render(renderOptions);

  const screenshot = await getContentScreenshot(pageContent, {
    width: renderOptions.layout.width,
    height: renderOptions.layout.height,
  });

  const binScreenshot = await convertBuffer(screenshot, [
    'PNG:-',
    '-dither',
    'Floyd-Steinberg',
    'MONO:-',
  ]);

  res.send(binScreenshot);
};

export const router = Router()
  .get('/image.bin', binHandler)
  .get('/image.png', pngHanlder)
  .get('/image.bmp', bmpHandler)
  .get('/random.bin', randomBinHandler)
  .get('/random', randomHandler)
  .get('/layout.png', layoutPngHandler)
  .get('/layout.html', layoutHtmlHandler)
  .get('/layout.bin', layoutBinHandler);
