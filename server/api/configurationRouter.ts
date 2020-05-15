import { Router, RequestHandler } from 'express';
import { readFile, mkdirSync, accessSync, writeFile } from 'fs';
import { promisify } from 'util';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { validateWidgetConfig } from '../validation';

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

const putHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.sendStatus(400);
  }

  const validationResult = validateWidgetConfig(req.body);

  if (isLeft(validationResult)) {
    return res.status(400).send(PathReporter.report(validationResult));
  }

  try {
    await updateConfiguration(id, JSON.stringify(validationResult.right));
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
};

const router = Router().get('/:id', getHandler).put('/:id', putHandler);

export default router;
