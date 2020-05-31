import { Router } from './types';
import { createRouter, mapRouter, restrictUnauthorisedRouter } from './utils';
import { pipe } from 'fp-ts/lib/pipeable';

export const router: Router = pipe(
  createRouter(),
  restrictUnauthorisedRouter(),
  mapRouter((router) =>
    router.get('/', (req, res, next) => {
      res.json([]);
    })
  )
);
