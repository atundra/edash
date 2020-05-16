import { Page } from 'puppeteer';

import * as browsermanager from '../browsermanager';
import { tryCatchK, map as teMap, chain, chainFirst } from 'fp-ts/lib/TaskEither';
import { toError, Either, left, right } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { map } from 'fp-ts/lib/Array';
import { Option, some, none, isSome } from 'fp-ts/lib/Option';
import { error } from 'fp-ts/lib/Console';

// Some string if error and None if success
type ImageLoadFail = Option<string>;

const isImageLoadFailed = (img: HTMLImageElement): Promise<ImageLoadFail> => {
  if (img.complete) {
    if (img.naturalHeight === 0 && img.naturalWidth === 0) {
      return Promise.resolve(some(img.src));
    }

    return Promise.resolve(none);
  }

  return new Promise((resolve) => {
    img.addEventListener('load', () => resolve(none));
    img.addEventListener('error', () => resolve(some(img.src)));
  });
};

const waitForImagesLoad = () =>
  pipe(
    document.querySelectorAll('img'),
    (list) => Array.from(list),
    map(isImageLoadFailed),
    (promises) => Promise.all(promises)
  );

const defaultTryCatchK = <A extends ReadonlyArray<unknown>, B>(f: (...a: A) => Promise<B>) =>
  tryCatchK<Error, A, B>(f, toError);

const chainFirstDefaultTryCatchK = <A extends unknown, B>(f: (a: A) => Promise<B>) =>
  chainFirst<Error, A, B>(tryCatchK(f, toError));

export const getContentScreenshot = (pageContent: string, { width, height }: { width: number; height: number }) =>
  pipe(
    browsermanager.runBrowser,
    chain(defaultTryCatchK((browser) => browser.newPage())),
    chainFirstDefaultTryCatchK((page) => page.setViewport({ width, height })),
    chainFirstDefaultTryCatchK((page) => page.setContent(pageContent, { waitUntil: ['load'] })),
    chainFirstDefaultTryCatchK((page) =>
      page.evaluate(waitForImagesLoad).then((imageLoadErrors) =>
        imageLoadErrors
          .filter(isSome)
          .map((err) => error(`Image failed to load: ${err}`))
          .forEach((io) => io())
      )
    ),
    chain(
      defaultTryCatchK((page) =>
        page.screenshot({ encoding: 'binary' }).then((screenshot) => [page, screenshot] as const)
      )
    ),
    chainFirstDefaultTryCatchK(([page]) => page.close()),
    teMap(([, buffer]) => buffer)
  );
