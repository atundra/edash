import { Router, RequestHandler, Request, Response, NextFunction, Handler } from 'express';
import { readFile, mkdirSync, accessSync, writeFile } from 'fs';
import { promisify } from 'util';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as E from 'fp-ts/lib/Either';
import * as RE from 'fp-ts/lib/ReaderEither';
import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import * as RT from 'fp-ts/lib/ReaderTask';
import * as H from 'hyper-ts/lib/index';
import * as HE from 'hyper-ts/lib/express';
import { NonEmptyString } from 'io-ts-types/lib/NonEmptyString';

import { validateWidgetConfig } from '../validation';
import { pipe } from 'fp-ts/lib/pipeable';
import { Errors } from 'io-ts';
import { WidgetConfig } from '../renderer/types';

const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);

const CONFIGURATION_PATH = './configuration';

try {
  accessSync(CONFIGURATION_PATH);
} catch (e) {
  mkdirSync(CONFIGURATION_PATH);
}

const getConfiguration = (id: string) => readFileP(`${CONFIGURATION_PATH}/${id}.json`);
const updateConfiguration = (id: string, data: string) => writeFileP(`${CONFIGURATION_PATH}/${id}.json`, data);

const getRequiredParamError = <T>(name: T) => new HandlerError(400, `Query param ${name} is required`);

const getRequiredParam = <Name extends string>(
  name: Name
): RE.ReaderEither<RequestContext, HandlerError, RequestContext['req']['params'][Name]> => (context) =>
  E.fromNullable(getRequiredParamError(name))(context.req.params[name]);

const getConfig = (id: string): TE.TaskEither<HandlerError, Buffer> =>
  TE.tryCatch(
    () => getConfiguration(id),
    // Shitty node js typings for Promise meh
    (reason) =>
      (reason as NodeJS.ErrnoException).code === 'ENOENT'
        ? new HandlerError(404, `Config with id ${id} not found`)
        : new HandlerError(500, `Can't get config with id ${id}`)
  );

const foldLeft = (err: HandlerError): RT.ReaderTask<RequestContext, Response<any>> => (context) =>
  T.of(context.res.status(err.code).send(err.message));

const getHandler: RequestHandler = async (req, res, next) => {
  const task = pipe(
    RE.ask<RequestContext>(),
    RE.chain(() => getRequiredParam('id')),
    RTE.fromReaderEither,
    RTE.chain((id) => RTE.fromTaskEither(getConfig(id))),
    RTE.fold(foldLeft, (buffer) => (ctx) => T.of(ctx.res.send(buffer)))
  );

  return RT.run(task, { req, res, next });
};

interface RequestContext {
  req: Request;
  res: Response;
  next: NextFunction;
}

class HandlerError {
  constructor(public code: number, public message: string) {}
}

const putHandler: RequestHandler = async (req, res, next) => {
  const validationErrorsToHandlerError = (errors: Errors) =>
    new HandlerError(400, `WidgetConfig validate errors:\n${PathReporter.report(E.left(errors)).join('\n')}`);

  const validateConfig = (): RE.ReaderEither<RequestContext, HandlerError, WidgetConfig> => (context) =>
    pipe(validateWidgetConfig(context.req.body), E.mapLeft(validationErrorsToHandlerError));

  const updateConfig = (wc: WidgetConfig): RTE.ReaderTaskEither<RequestContext, HandlerError, void> => (context) =>
    TE.tryCatch(
      () => updateConfiguration(context.req.params.id, JSON.stringify(wc)),
      (reason) => new HandlerError(500, String(reason))
    );

  const foldRight = (): RT.ReaderTask<RequestContext, Response<any>> => (context) => T.of(context.res.sendStatus(200));

  const task = pipe(
    RE.ask<RequestContext>(),
    RE.chain(() => getRequiredParam('id')),
    RE.chain(validateConfig),
    RTE.fromReaderEither,
    RTE.chain(updateConfig),
    RTE.fold(foldLeft, foldRight)
  );

  return RT.run(task, { req, res, next });
};

const sendConfig = (buffer: Buffer): H.Middleware<H.StatusOpen, H.ResponseEnded, HandlerError, void> =>
  pipe(
    H.status(H.Status.OK),
    H.ichain(H.closeHeaders),
    H.ichain(() => H.modifyConnection((c) => c.setBody(buffer)))
  );

const get: H.Middleware<H.StatusOpen, H.ResponseEnded, HandlerError, void> = pipe(
  H.decodeParam('id', NonEmptyString.decode),
  H.mapLeft(() => getRequiredParamError('id')),
  H.ichain((id) => H.fromTaskEither(getConfig(id))),
  H.ichain(sendConfig)
);

const router = Router().get('/boom/:id', HE.toRequestHandler(get)).get('/:id', getHandler).put('/:id', putHandler);

export default router;
