import * as H from 'hyper-ts/lib/index';
import * as HE from 'hyper-ts/lib/express';
import { RequestHandler, Request } from 'express';

export const toMiddleware = HE.toRequestHandler;

type ToRequestHandler = <I, E>(middleware: H.Middleware<I, H.ResponseEnded, E, void>) => RequestHandler;

export const toRequestHandler: ToRequestHandler = HE.toRequestHandler;
