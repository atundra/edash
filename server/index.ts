import type { Application } from 'express';
import next from 'next';
import * as CONFIG from './config';
import { isDev } from './env';
import { createMongoClient } from './db';
import * as TE from 'fp-ts/lib/TaskEither';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { log } from 'fp-ts/lib/Console';
import NextServer from 'next/dist/next-server/server/next-server';
import { Server } from 'http';
import { createServer as createExpressServer } from './express';

type Config = typeof CONFIG;

const runNextServer = RTE.rightReaderTask<Config, never, NextServer>(({ ENV }) => async () => {
  const server = next({ dev: isDev(ENV) });
  await server.prepare().then(log('Next server started'));
  return server;
});

const expressServerListen = (
  expressServer: Application
): RTE.ReaderTaskEither<Config, NodeJS.ErrnoException, Server> => ({ PORT }) =>
  TE.fromEither(
    E.tryCatch(
      () => expressServer.listen(PORT, log(`Http server started on ${PORT} port`)),
      (e) => e as NodeJS.ErrnoException
    )
  );

RTE.run(
  pipe(
    RTE.ask<Config>(),
    RTE.chain(({ MONGO_CONNECTION_URI }) => RTE.fromTaskEither(createMongoClient(MONGO_CONNECTION_URI))),
    RTE.mapLeft((mongoErr) => new Error(mongoErr.message)),
    RTE.chain((mongoClient) => pipe(runNextServer, RTE.chain(createExpressServer(mongoClient)))),
    RTE.chain(expressServerListen)
  ),
  CONFIG
);
