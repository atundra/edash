import { pipe } from 'fp-ts/lib/pipeable';
import { createRouter, chainRouter, HandlerError } from './utils';
import { getCollection, Device } from '../db';
import Renderer, { RenderOptions } from '../renderer';
import { getContentScreenshot } from '../puppeteer';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import * as F from 'fp-ts/lib/function';
import { convertBuffer } from '../image';
import { Db, MongoError } from 'mongodb';
import { flow } from 'fp-ts/lib/function';

const findDevice = (db: Db) => (uid: string): TE.TaskEither<MongoError, O.Option<Device>> => {
  return TE.tryCatch(
    () =>
      pipe(db, getCollection('devices'), (collection) =>
        collection.findOne({ uid }, { projection: { user: 0 } }).then(O.fromNullable)
      ),
    (err) => err as MongoError
  );
};

const renderPageContent = (renderer: Renderer) => (options: RenderOptions) =>
  TE.tryCatch(
    () => renderer.render(options),
    (err) => err as Error
  );

export const router = (renderer: Renderer) =>
  pipe(
    createRouter(),
    chainRouter((router) => ({ db, config: { LAYOUT_COLUMNS_COUNT, LAYOUT_ROWS_COUNT } }) =>
      router.get('/:uid', async (req, res, next) => {
        const task = pipe(
          req.params.uid,
          E.fromNullable(new HandlerError(400, 'Oof no id, bad requets')),
          TE.fromEither,
          TE.chain(
            flow(
              findDevice(db),
              TE.mapLeft((err) => new HandlerError(500, err.message))
            )
          ),
          TE.chain(TE.fromOption(() => new HandlerError(404, 'Oh no, no such config yet'))),
          TE.map((device) => ({
            ...device.config,
            layout: {
              width: 640,
              height: 384,
              columns: LAYOUT_COLUMNS_COUNT,
              rows: LAYOUT_ROWS_COUNT,
            },
          })),
          TE.chain(
            flow(
              renderPageContent(renderer),
              TE.mapLeft((err) => new HandlerError(500, err.toString())),
              TE.filterOrElse(
                (body) => body.length !== 0,
                (body) => new HandlerError(500, 'Wow empty string rendered somehow')
              )
            )
          ),
          TE.chain((body) =>
            pipe(
              getContentScreenshot(body, {
                width: 640,
                height: 384,
              }),
              TE.mapLeft((err) => new HandlerError(500, 'Error while capturing screen'))
            )
          ),
          TE.chain(
            TE.tryCatchK(
              (buffer) => convertBuffer(buffer, ['PNG:-', '-dither', 'Floyd-Steinberg', 'MONO:-']),
              (err) => new HandlerError(500, 'Error while converting image to buffer')
            )
          ),
          TE.fold(
            (err) => T.fromIO(() => res.status(err.code).send(err.message)),
            (buf) => T.fromIO(() => res.send(buf))
          )
        );

        return task();
      })
    )
  );
