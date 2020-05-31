import { Router as ExpressRouter } from 'express';
import { pipe } from 'fp-ts/lib/pipeable';
import * as R from 'fp-ts/lib/Reader';
import type { PathParams } from 'express-serve-static-core';
import type { Router, Context, MethodRouteHandlers, RouterUseRequestHandler } from './types';

export const createRouter = (): Router =>
  pipe(
    R.ask<Context>(),
    R.map(() => ExpressRouter())
  );

export const nestRouter = (
  path: PathParams,
  nestedRouter: Router,
  ...preRequestHandlers: RouterUseRequestHandler[]
): ((fa: Router) => Router) =>
  R.chain<Context, ExpressRouter, ExpressRouter>((router) => (context) =>
    router.use(path, ...preRequestHandlers, nestedRouter(context))
  );

export const mapRouter = (f: (a: ExpressRouter) => ExpressRouter) => R.map(f);

export const chainRouter = (f: (a: ExpressRouter) => Router) => R.chain(f);

export const applyRouterMethodMap = (map: MethodRouteHandlers) =>
  chainRouter((router) => (context) =>
    map.reduce((r, [method, route, ...handlers]) => r[method](route, ...handlers.map((f) => f(context))), router)
  );

export const restrictUnauthorisedRouter = () =>
  mapRouter((router) => router.use((req, res, next) => (req.user ? next() : res.sendStatus(403))));
