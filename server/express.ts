import { parse } from 'url';
import express, { Application } from 'express';
import { ApplicationRequestHandler } from 'express-serve-static-core';
import session from 'express-session';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import NextServer from 'next/dist/next-server/server/next-server';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
import { getPassportMiddleware } from './passport';
import { router as apiRouter } from './api';
import type { Config } from './config';

const use: ApplicationRequestHandler<(app: Application) => Application> = <A extends any[]>(...args: A) => (
  app: Application
) => app.use(...args);

export const createServer = (mongoClient: MongoClient) => (
  nextServer: NextServer
): RTE.ReaderTaskEither<Config, NodeJS.ErrnoException, Application> => ({ EXPRESS_SESSION_SECRET }) =>
  pipe(
    getPassportMiddleware(),
    (passportInstance) =>
      E.tryCatch(
        () =>
          pipe(
            express(),
            use(session({ secret: EXPRESS_SESSION_SECRET, resave: false, saveUninitialized: false })),
            use(bodyParser.urlencoded({ extended: false })),
            use(passportInstance.initialize()),
            use(passportInstance.session()),
            use('/api', apiRouter),
            (app) =>
              app.all('*', (req, res, next) => {
                const parsed = parse(req.url, true);
                const handler = nextServer.getRequestHandler();
                return handler(req, res, parsed);
              })
          ),
        (err) => err as NodeJS.ErrnoException
      ),
    TE.fromEither
  );

export const listen = (server: Application, port: string | number): TE.TaskEither<Error, Application> =>
  TE.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        server.listen(port, () => resolve(server));
      }),
    (reason) => reason as Error
  );
