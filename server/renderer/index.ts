import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { getStyles } from 'typestyle';
import hashIt from 'hash-it';

import WIDGETS_REGISTRY from './widgets/registry';
import Layout from './layout';
import Widget from './widget';

export type WidgetPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WidgetOptions = {
  id: string;
  position: WidgetPosition;
  // TODO: Improve typings
  options?: any;
};

export type LayoutProperties = {
  width: number;
  height: number;
  rows: number;
  columns: number;
};

type RenderOptions = {
  widgets: WidgetOptions[];
  layout: LayoutProperties;
};

export type DefaultResolverOptions = {
  layout: LayoutProperties;
  widget: {
    id: string;
    position: WidgetPosition;
  };
};

const renderPage = ({ body, css }: { body: string; css: string }) => `
<!DOCTYPE html>
<html>
<head>
    <style>
      html, body { height: 100%; margin: 0; font-smooth: never; -webkit-font-smoothing : none; }
      ${css}
    </style>
</head>
<body>
  ${body}
</body>
</html>
`;

const ensureWidgetExists = <T extends string>(
  widgetId: T | keyof typeof WIDGETS_REGISTRY
): widgetId is keyof typeof WIDGETS_REGISTRY => {
  return Object.prototype.hasOwnProperty.call(WIDGETS_REGISTRY, widgetId);
};

const createDefaultResolverOptions = (
  renderOptions: RenderOptions,
  widgetOptions: WidgetOptions
): DefaultResolverOptions => ({
  layout: renderOptions.layout,
  widget: {
    id: widgetOptions.id,
    position: widgetOptions.position,
  },
});

type Key = string | number;

interface Cache {
  get<T>(key: Key): T | Promise<T> | void;
  set<T>(
    key: Key,
    value: T,
    cacheOptions: { ttl: number }
  ): unknown | Promise<unknown>;
}

export default class Renderer {
  constructor(
    private cacheImplementation: Cache,
    private cacheGeneration: number | string
  ) {}

  renderWidgets(options: RenderOptions): Promise<React.ReactNodeArray> {
    return Promise.all(
      options.widgets.map(async (widgetConfig) => {
        if (!ensureWidgetExists(widgetConfig.id)) {
          console.error(`Widget with id ${widgetConfig.id} is not supported\n`);

          return null;
        }

        const widget = WIDGETS_REGISTRY[widgetConfig.id];

        try {
          // TODO: Improve typings
          const resolverOptions = {
            ...createDefaultResolverOptions(options, widgetConfig),
            ...widgetConfig.options,
          };

          const widgetData = await this.resolveWidgetData(
            widget,
            resolverOptions
          );

          // TODO: Improve typings
          return widget.render(widgetData as any);
        } catch (error) {
          console.error(
            `Error while rendering widget ${widgetConfig.id}\n`,
            error
          );

          return widget.renderFallback(error);
        }
      })
    );
  }

  async resolveWidgetData<O>(
    widget: Widget<O, any>,
    resolverOptions: DefaultResolverOptions & O
  ) {
    const cacheConfiguration = widget.getCacheConfiguration();

    if (!cacheConfiguration) {
      return widget.resolveData(resolverOptions);
    }

    const baseCacheKey = cacheConfiguration.getCacheKey
      ? cacheConfiguration.getCacheKey(resolverOptions)
      : hashIt(resolverOptions);
    const cacheKey = baseCacheKey + this.cacheGeneration.toString();

    const cachedWidgetData = await this.cacheImplementation.get(cacheKey);

    if (cachedWidgetData) {
      return cachedWidgetData;
    }

    const widgetData = await widget.resolveData(resolverOptions);

    await this.cacheImplementation.set(cacheKey, widgetData, {
      ttl: cacheConfiguration.ttl,
    });

    return widgetData;
  }

  async render(options: RenderOptions) {
    const widgets = await this.renderWidgets(options);

    const layout = React.createElement(Layout, {
      widgetOptions: options.widgets,
      layoutProperties: options.layout,
      widgets,
    });
    const body = ReactDOMServer.renderToStaticMarkup(layout);
    const css = getStyles();

    return renderPage({ body, css });
  }

  async renderDevPage(options: RenderOptions) {
    const widgets = await this.renderWidgets(options);

    const layout = React.createElement(Layout, {
      widgetOptions: options.widgets,
      layoutProperties: options.layout,
      widgets,
    });

    const devCss =
      `body { display: grid; justify-content: center; align-items: center; background: #ccc; }` +
      `.sizeWrapper { height: ${options.layout.height}px; width: ${options.layout.width}px; background: white; }`;

    const body = `<div class="sizeWrapper">${ReactDOMServer.renderToStaticMarkup(
      layout
    )}</div>`;
    const css = getStyles() + '\n' + devCss;

    return renderPage({ body, css });
  }
}
