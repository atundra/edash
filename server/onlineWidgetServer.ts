import express, { Router, Request } from 'express';
import Renderer, { WidgetOptions } from './renderer';
import { LAYOUT_COLUMNS_COUNT, LAYOUT_ROWS_COUNT, TRACKS } from './config';

const PORT = 8080;

const RENDER_CONFIG: WidgetOptions[] = [
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

export const router = Router().get('/', async (req, res, next) => {
  const renderOptions = createRenderOptions(req);

  const pageContent = await Renderer.renderDevPage(renderOptions);
  res.type('html').send(pageContent);
});

const app = express();
app.use('/', router);
app.listen(PORT, () => console.log(`Dev server started on ${PORT} port`));
