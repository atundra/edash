import type { Application } from 'express';
import next from 'next';
import * as CONFIG from './config';
import type { Config } from './config';
import { isDev } from './config/env';
import { createMongoClient, getDb } from './db';
import * as TE from 'fp-ts/lib/TaskEither';
import * as RT from 'fp-ts/lib/ReaderTask';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as IOE from 'fp-ts/lib/IOEither';
import { pipe } from 'fp-ts/lib/pipeable';
import { log, error } from 'fp-ts/lib/Console';
import NextServer from 'next/dist/next-server/server/next-server';
import { createServer as createExpressServer, listen as expressListen } from './express';

const runNextServer = RTE.rightReaderTask<Config, never, NextServer>(({ ENV }) => async () => {
  const server = next({ dev: isDev(ENV) });
  await server.prepare().then(log('Next server started'));
  return server;
});

const expressServerListen = (
  expressServer: Application
): RTE.ReaderTaskEither<Config, NodeJS.ErrnoException, Application> => ({ PORT }) =>
  pipe(
    expressListen(expressServer, PORT),
    TE.chainFirst(() => TE.fromIOEither(IOE.rightIO(log(`Http server started on ${PORT} port`))))
  );

RT.run(
  pipe(
    RTE.ask<Config>(),

    RTE.chain(({ MONGO_CONNECTION_URI }) => RTE.fromTaskEither(createMongoClient(MONGO_CONNECTION_URI))),
    RTE.map(getDb),
    RTE.mapLeft((mongoErr) => new Error(mongoErr.message)),

    RTE.chain((db) => pipe(runNextServer, RTE.chain(createExpressServer(db)))),
    RTE.chain(expressServerListen),
    RTE.fold(
      (err) => RT.fromIO(error(err)),
      (server) => RT.fromIO(log('Server started'))
    )
  ),
  CONFIG
);
