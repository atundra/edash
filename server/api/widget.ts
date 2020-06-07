import { Router as ExpressRouter } from 'express';
import { Router, Context } from './types';
import { createRouter, restrictUnauthorisedRouter, chainRouter } from './utils';
import { pipe } from 'fp-ts/lib/pipeable';
import * as io from 'io-ts';
import widgetRegistry from '../renderer/widgets/registry';

export const Device = io.type({
  id: io.string,
  name: io.string,
});

export type Device = io.TypeOf<typeof Device>;

export type SupportedWidgetParam = {
  id: string;
  name: string;
  description?: string;
};

export type SupportedWidget = {
  id: string;
  name: string;
  description?: string;
  params: SupportedWidgetParam[];
};

const getSupported = (r: ExpressRouter): Router => () =>
  r.get('/supported', (req, res, next) => {
    const registry = widgetRegistry;
    const result: SupportedWidget[] = Object.entries(registry).map(([id, widget]) => {
      return {
        id,
        name: widget.name ?? id,
        params: [],
      };
    });
    return res.json(result);
  });

export const router: Router = pipe(createRouter(), restrictUnauthorisedRouter(), chainRouter(getSupported));
