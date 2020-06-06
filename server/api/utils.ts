import { Router as ExpressRouter } from 'express';
import { pipe } from 'fp-ts/lib/pipeable';
import * as R from 'fp-ts/lib/Reader';
import * as E from 'fp-ts/lib/Either';
import * as H from 'hyper-ts/lib/index';
import type { PathParams } from 'express-serve-static-core';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { Errors } from 'io-ts';
import type {
  Router,
  Context,
  MethodRouteHandlers,
  RouterUseRequestHandler,
  ReqHandlerMiddlewareIStatus,
  Method,
} from './types';
import { toRequestHandler } from '../lib';

export class HandlerError {
  constructor(public code: H.Status, public message: string) {}
}

export const validationErrorsToHandlerError = (errors: Errors) =>
  new HandlerError(400, `Body validation errors:\n${PathReporter.report(E.left(errors)).join('\n')}`);

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

export const handleMethodMRouter = <I extends ReqHandlerMiddlewareIStatus>(
  method: Method,
  path: PathParams,
  m: H.Middleware<I, H.ResponseEnded, unknown, void>
) => R.map<ExpressRouter, ExpressRouter>((r) => r[method](path, toRequestHandler(m)));

export const handleGetMRouter = <I extends ReqHandlerMiddlewareIStatus>(
  path: PathParams,
  m: H.Middleware<I, H.ResponseEnded, unknown, void>
) => handleMethodMRouter('get', path, m);

export const handlePostMRouter = <I extends ReqHandlerMiddlewareIStatus>(
  path: PathParams,
  m: H.Middleware<I, H.ResponseEnded, unknown, void>
) => handleMethodMRouter('post', path, m);
