import { Page } from 'puppeteer';

import * as browsermanager from '../browsermanager';
import {
  tryCatchK,
  map as teMap,
  chain,
  chainFirst,
} from 'fp-ts/lib/TaskEither';
import { toError } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

type ImageLoadError = { type: 'error'; src: string };

const waitForImagesLoad = (page: Page) =>
  page.evaluate(() => {
    const selectors = Array.from(document.querySelectorAll('img'));

    return Promise.all(
      selectors.map((img) => {
        if (img.complete) {
          if (img.naturalHeight === 0 && img.naturalWidth === 0) {
            return { type: 'error', src: img.src } as ImageLoadError;
          }

          return null;
        }

        return new Promise((resolve) => {
          img.addEventListener('load', resolve);
          // We don't want to fail the whole layout because of one image
          img.addEventListener('error', () =>
            resolve({ type: 'error', src: img.src })
          );
        }) as Promise<Event | ImageLoadError>;
      })
    );
  });

const defaultTryCatchK = <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => Promise<B>
) => tryCatchK<Error, A, B>(f, toError);

const chainFirstDefaultTryCatchK = <A extends unknown, B>(
  f: (a: A) => Promise<B>
) => chainFirst<Error, A, B>(tryCatchK(f, toError));

export const getContentScreenshot = (
  pageContent: string,
  { width, height }: { width: number; height: number }
) =>
  pipe(
    browsermanager.runBrowser,
    chain(defaultTryCatchK((browser) => browser.newPage())),
    chainFirstDefaultTryCatchK((page) => page.setViewport({ width, height })),
    chainFirstDefaultTryCatchK((page) =>
      page.setContent(pageContent, { waitUntil: ['load'] })
    ),
    chainFirstDefaultTryCatchK((page) =>
      waitForImagesLoad(page).then((imageEvents) =>
        imageEvents.forEach((event) => {
          if (event && event.type === 'error') {
            console.error(
              `Image failed to load: ${(event as ImageLoadError).src}`
            );
          }
        })
      )
    ),
    chain(
      defaultTryCatchK((page) =>
        page
          .screenshot({ encoding: 'binary' })
          .then((screenshot) => [page, screenshot] as const)
      )
    ),
    chainFirstDefaultTryCatchK(([page]) => page.close()),
    teMap(([, buffer]) => buffer)
  );
