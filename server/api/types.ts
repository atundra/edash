import type { Config } from '../config';
import type { PassportStatic } from 'passport';
import type { Router as ExpressRouter } from 'express';
import type { Reader } from 'fp-ts/lib/Reader';
import type { RequestHandler, RequestHandlerParams } from 'express-serve-static-core';
import type { Db } from 'mongodb';

export type Context = {
  config: Config;
  passport: PassportStatic;
  db: Db;
};

export type Router = Reader<Context, ExpressRouter>;

export type Method = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

type ReqHandler = Reader<Context, RequestHandler>;

/**
 * @example
 * ['get', '/user', ({config}) => (req, res, next) => { res.json(config.PORT) }]
 */
type RouteHandler = [Method, string, ...ReqHandler[]];

export type MethodRouteHandlers = RouteHandler[];

export type RouterUseRequestHandler = RequestHandler | RequestHandlerParams;
