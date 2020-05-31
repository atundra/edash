import type { Config } from '../config';
import type { PassportStatic } from 'passport';
import type { Router as ExpressRouter } from 'express';
import type { Reader } from 'fp-ts/lib/Reader';
import type { RequestHandler } from 'express';
import { Db } from 'mongodb';

export type Context = {
  config: Config;
  passport: PassportStatic;
  db: Db;
};

export type Router = Reader<Context, ExpressRouter>;

export type Method = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

type ReqHandler = Reader<Context, RequestHandler>;

type RouteHandler = [Method, string, ...ReqHandler[]];

export type MethodRouteHandlers = RouteHandler[];
