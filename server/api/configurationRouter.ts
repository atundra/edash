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

const getHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.sendStatus(400);
  }

  try {
    res.send(await getConfiguration(id));
  } catch (e) {
    if (e.code === 'ENOENT') {
      return res.sendStatus(404);
    }

    res.sendStatus(500);
  }
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
  const getRequiredParam = <Name extends string>(
    name: Name
  ): RE.ReaderEither<RequestContext, HandlerError, RequestContext['req']['params'][Name]> => (context) =>
    E.fromNullable(new HandlerError(400, `Query param ${name} is required`))(context.req.params[name]);

  const validationErrorsToHandlerError = (errors: Errors) =>
    new HandlerError(400, `WidgetConfig validate errors:\n${PathReporter.report(E.left(errors)).join('\n')}`);

  const validateConfig = (): RE.ReaderEither<RequestContext, HandlerError, WidgetConfig> => (context) =>
    pipe(validateWidgetConfig(context.req.body), E.mapLeft(validationErrorsToHandlerError));

  const updateConfig = (wc: WidgetConfig): RTE.ReaderTaskEither<RequestContext, HandlerError, void> => (context) =>
    TE.tryCatch(
      () => updateConfiguration(context.req.params.id, JSON.stringify(wc)),
      (reason) => new HandlerError(500, String(reason))
    );

  const foldLeft = (err: HandlerError): RT.ReaderTask<RequestContext, Response<any>> => (context) =>
    T.of(context.res.status(err.code).send(err.message));

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

const router = Router().get('/:id', getHandler).put('/:id', putHandler);

export default router;
