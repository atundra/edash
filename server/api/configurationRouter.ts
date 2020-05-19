import { Router } from 'express';
import { readFile, mkdirSync, accessSync, writeFile } from 'fs';
import { promisify } from 'util';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import * as H from 'hyper-ts/lib/index';
import * as HE from 'hyper-ts/lib/express';
import { NonEmptyString } from 'io-ts-types/lib/NonEmptyString';

import { validateWidgetConfig } from '../validation';
import { pipe } from 'fp-ts/lib/pipeable';
import { Errors } from 'io-ts';
import { WidgetConfig } from '../renderer/types';

class HandlerError {
  constructor(public code: H.Status, public message: string) {}
}

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

const getConfig = (id: string): TE.TaskEither<HandlerError, Buffer> =>
  TE.tryCatch(
    () => getConfiguration(id),
    // Shitty node js typings for Promise meh
    (reason) =>
      (reason as NodeJS.ErrnoException).code === 'ENOENT'
        ? new HandlerError(404, `Config with id ${id} not found`)
        : new HandlerError(500, `Can't get config with id ${id}`)
  );

const setConfig = (id: string, config: WidgetConfig): TE.TaskEither<HandlerError, void> =>
  TE.tryCatch(
    () => updateConfiguration(id, JSON.stringify(config)),
    (reason) => new HandlerError(500, String(reason))
  );

const validationErrorsToHandlerError = (errors: Errors) =>
  new HandlerError(400, `WidgetConfig validate errors:\n${PathReporter.report(E.left(errors)).join('\n')}`);

const sendConfig = (buffer: Buffer): H.Middleware<H.StatusOpen, H.ResponseEnded, HandlerError, void> =>
  pipe(
    H.status(H.Status.OK),
    H.ichain(H.closeHeaders),
    H.ichain(() => H.modifyConnection((c) => c.setBody(buffer)))
  );

const sendOk = (): H.Middleware<H.StatusOpen, H.ResponseEnded, HandlerError, void> =>
  pipe(H.status(200), H.ichain(H.closeHeaders), H.ichain(H.end));

const sendError = (err: HandlerError): H.Middleware<H.StatusOpen, H.ResponseEnded, never, void> =>
  pipe(
    H.status(err.code),
    H.ichain(H.closeHeaders),
    H.ichain(() => H.send(err.message))
  );

const put: H.Middleware<H.StatusOpen, H.ResponseEnded, HandlerError, void> = pipe(
  H.decodeBody(validateWidgetConfig),
  H.mapLeft(validationErrorsToHandlerError),
  H.ichain((config) =>
    pipe(
      H.decodeParam('id', NonEmptyString.decode),
      H.mapLeft(() => getRequiredParamError('id')),
      H.ichain((id) => H.fromTaskEither(setConfig(id, config)))
    )
  ),
  H.ichain(sendOk),
  H.orElse(sendError)
);

const get: H.Middleware<H.StatusOpen, H.ResponseEnded, HandlerError, void> = pipe(
  H.decodeParam('id', NonEmptyString.decode),
  H.mapLeft(() => getRequiredParamError('id')),
  H.ichain((id) => H.fromTaskEither(getConfig(id))),
  H.ichain(sendConfig),
  H.orElse(sendError)
);

const router = Router().get('/:id', HE.toRequestHandler(get)).put('/:id', HE.toRequestHandler(put));

export default router;
