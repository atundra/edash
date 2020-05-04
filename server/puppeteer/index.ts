import { Page } from 'puppeteer';

import * as browsermanager from '../browsermanager';

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

export const getContentScreenshot = async (
  pageContent: string,
  { width, height }: { width: number; height: number }
) => {
  const browser = await browsermanager.getBrowser();
  const page = await browser.newPage();

  await page.setViewport({
    width,
    height,
  });

  await page.setContent(pageContent, { waitUntil: ['load'] });

  await waitForImagesLoad(page).then((imageEvents) =>
    imageEvents.forEach((event) => {
      if (event && event.type === 'error') {
        console.error(`Image failed to load: ${(event as ImageLoadError).src}`);
      }
    })
  );

  const screenshot = await page.screenshot();

  await page.close();

  return screenshot;
};
