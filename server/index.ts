import express from 'express';
import next from 'next';
import { router as apiRouter } from './api';
import * as CONFIG from './config';
import { isDev } from './env';
import { parse } from 'url';
import session from 'express-session';
import bodyParser from 'body-parser';
import { passportInstance } from './passport';
import { createMongoClient } from './db';
import * as TE from 'fp-ts/lib/TaskEither';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import NextServer from 'next/dist/next-server/server/next-server';

type Config = typeof CONFIG;

RTE.run(
  pipe(
    RTE.ask<Config>(),
    RTE.chain(({ MONGO_CONNECTION_URI }) => RTE.fromTaskEither(createMongoClient(MONGO_CONNECTION_URI))),
    RTE.mapLeft((mongoErr) => new Error(mongoErr.message)),
    RTE.chain((mongoClient) =>
      pipe(
        RTE.rightReaderTask<Config, never, NextServer>(({ ENV }) => async () => {
          const server = next({ dev: isDev(ENV) });
          await server.prepare();
          return server;
        }),
        RTE.chain((nextServer) => ({ EXPRESS_SESSION_SECRET, PORT }) =>
          TE.fromEither(
            E.tryCatch(
              () =>
                express()
                  .use(session({ secret: EXPRESS_SESSION_SECRET }))
                  .use(bodyParser.urlencoded({ extended: false }))
                  .use(passportInstance.initialize())
                  .use(passportInstance.session())
                  .use('/api', apiRouter)
                  .all('*', (req, res, next) => {
                    const parsed = parse(req.url, true);
                    const handler = nextServer.getRequestHandler();
                    return handler(req, res, parsed);
                  })
                  .listen(PORT, () => console.log(`Http server started on ${PORT} port`)),
              (err) => err as NodeJS.ErrnoException
            )
          )
        )
      )
    )
  ),
  CONFIG
);
