import express from 'express';
import next from 'next';
import { router as apiRouter } from './api';
import { PORT, ENV } from './config';
import { isDev } from './env';
import { parse } from 'url';

const runNextServer = () => {
  const dev = isDev(ENV);
  const nextServer = next({ dev });
  return nextServer.prepare().then(() => nextServer);
};

const runServer = () =>
  runNextServer()
    .then((nextServer) => {
      console.log(`Next server started`);
      return nextServer;
    })
    .then((nextServer) =>
      express()
        .use('/api', apiRouter)
        .all('*', (req, res, next) => {
          const parsed = parse(req.url, true);
          const handler = nextServer.getRequestHandler();
          return handler(req, res, parsed);
        })
        .listen(PORT, () => console.log(`Http server started on ${PORT} port`))
    );

runServer();
