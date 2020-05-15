import express, { Router, Request } from 'express';
import cacheManager from 'cache-manager';
import fsStore from 'cache-manager-fs-hash';

import Renderer from './renderer';
import { WidgetConfig } from './renderer/types';
import {
  LAYOUT_COLUMNS_COUNT,
  LAYOUT_ROWS_COUNT,
  CACHE_GENERATION,
} from './config';

const PORT = 8080;

const RENDER_CONFIG: WidgetConfig[] = [
  {
    id: 'hello',
    position: {
      x: 12,
      y: 1,
      width: 5,
      height: 3,
    },
  },
  {
    id: 'googleCalendarEvents',
    position: {
      x: 12,
      y: 4,
      width: 5,
      height: 9,
    },
  },
  {
    id: 'parcelMap',
    position: {
      x: 1,
      y: 1,
      width: 11,
      height: 9,
    },
    options: {
      // tracks: TRACKS,
      tracks: [],
    },
  },
  {
    id: 'weather',
    position: {
      x: 1,
      y: 10,
      width: 11,
      height: 3,
    },
  },
];

const createRenderOptions = (req: Request) => {
  const DEFAULT_WIDTH = 800;
  const DEFAULT_HEIGHT = 480;

  const width = Number(req.query.width) || DEFAULT_WIDTH;
  const height = Number(req.query.height) || DEFAULT_HEIGHT;

  return {
    widgets: RENDER_CONFIG,
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

export const router = Router().get('/', async (req, res, next) => {
  const renderOptions = createRenderOptions(req);

  const pageContent = await widgetRenderer.renderDevPage(renderOptions);
  res.type('html').send(pageContent);
});

const app = express();
app.use('/', router);
app.listen(PORT, () => console.log(`Dev server started on ${PORT} port`));
