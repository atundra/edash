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

const putHandler: RequestHandler = async (req, res, next) => {
  const getRequiredParam = <Name extends string>(
    name: Name
  ): RE.ReaderEither<RequestContext, Error, RequestContext['req']['params'][Name]> => (context) =>
    E.fromNullable(new Error(`Query param ${name} is required`))(context.req.params[name]);

  const validateConfig = (): RE.ReaderEither<RequestContext, Error, WidgetConfig> => (context) => {
    return E.mapLeft(
      (err: Errors) => new Error(`WidgetConfig validate errors:\n${PathReporter.report(E.left(err)).join('\n')}`)
    )(validateWidgetConfig(context.req.body));
  };

  const updateConfig = (wc: WidgetConfig): RTE.ReaderTaskEither<RequestContext, Error, void> => (context) =>
    TE.tryCatch(
      () => updateConfiguration(context.req.params.id, JSON.stringify(wc)),
      (reason) => new Error(String(reason))
    );

  const foldLeft = (err: Error): RT.ReaderTask<RequestContext, Response<any>> => (context) =>
    T.of(context.res.status(400).send(err.toString()));

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
