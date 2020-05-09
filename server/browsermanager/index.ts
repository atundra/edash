import puppeteer from 'puppeteer';
import { PUPPETEER_ARGS } from '../config';
import { tryCatch } from 'fp-ts/lib/TaskEither';
import { toError } from 'fp-ts/lib/Either';

let browser: puppeteer.Browser | null = null;

export const getBrowser = async () => {
  if (browser === null) {
    browser = await puppeteer.launch({
      args: PUPPETEER_ARGS,
    });
  }

  return browser;
};

export const runBrowser = tryCatch(getBrowser, toError);
