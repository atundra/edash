import { parse } from 'url';
import express, { Application, RequestHandler } from 'express';
import { ApplicationRequestHandler } from 'express-serve-static-core';
import session from 'express-session';
import bodyParser from 'body-parser';
import { Db, MongoError } from 'mongodb';
import NextServer from 'next/dist/next-server/server/next-server';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import * as R from 'fp-ts/lib/Reader';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
import { getPassportMiddleware } from './passport';
import { router as apiRouter } from './api';
import type { Config } from './config';

const use: ApplicationRequestHandler<(app: Application) => Application> = <A extends any[]>(...args: A) => (
  app: Application
) => app.use(...args);

const pingHandler: RequestHandler = (req, res, next) => res.sendStatus(200);

export const createServer = (db: Db) => (
  nextServer: NextServer
): RTE.ReaderTaskEither<Config, NodeJS.ErrnoException | MongoError, Application> =>
  pipe(
    R.ask<Config>(),
    R.chain(() => getPassportMiddleware(db)),
    RTE.rightReader,
    RTE.chain((passport) => (config) =>
      TE.fromEither(
        E.tryCatch(
          () =>
            pipe(
              express(),
              // TODO: Configure session storage to use mongodb
              use(session({ secret: config.EXPRESS_SESSION_SECRET, resave: false, saveUninitialized: false })),
              use(bodyParser.urlencoded({ extended: false })),
              use(passport.initialize()),
              use(passport.session()),
              (router) => (config.ONE_USER_MODE ? router.use(passport.authenticate('dummy-strategy')) : router),
              use('/api', apiRouter({ config, passport, db })),
              (app) => app.get('/ping', pingHandler),
              (app) =>
                app.all('*', (req, res, next) => {
                  const parsed = parse(req.url, true);
                  const handler = nextServer.getRequestHandler();
                  return handler(req, res, parsed);
                })
            ),
          (err) => err as NodeJS.ErrnoException
        )
      )
    )
  );

export const listen = (server: Application, port: string | number): TE.TaskEither<Error, Application> =>
  TE.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        server.listen(port, () => resolve(server));
      }),
    (reason) => reason as Error
  );
