import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { getStyles } from 'typestyle';

import WIDGETS_REGISTRY from './widgets/registry';
import Layout from './layout';

export type WidgetPosition = {
  column: number;
  row: number;
  colspan: number;
  rowspan: number;
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
    position: WidgetPosition;
  };
};

const renderPage = ({ body, css }: { body: string; css: string }) => `
<!DOCTYPE html>
<html>
<head>
    <style>
      html, body { height: 100%; margin: 0 }
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
    position: widgetOptions.position,
  },
});

export default class Renderer {
  static renderWidgets(options: RenderOptions) {
    const widgetDataPromises = options.widgets.map(async (widgetConfig) => {
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

        const widgetData = await widget.resolveData(resolverOptions);

        // TODO: Improve typings
        return widget.render(widgetData as any);
      } catch (error) {
        console.error(
          `Error while rendering widget ${widgetConfig.id}\n`,
          error
        );

        return widget.renderFallback(error);
      }
    });

    return Promise.all(widgetDataPromises);
  }

  static async render(options: RenderOptions) {
    const renderedWidgets = await Renderer.renderWidgets(options);

    const layout = React.createElement(Layout, {
      widgetOptions: options.widgets,
      layoutProperties: options.layout,
      renderedWidgets,
    });
    const body = ReactDOMServer.renderToStaticMarkup(layout);
    const css = getStyles();

    return renderPage({ body, css });
  }

  static async renderDevPage(options: RenderOptions) {
    const renderedWidgets = await Renderer.renderWidgets(options);

    const layout = React.createElement(Layout, {
      widgetOptions: options.widgets,
      layoutProperties: options.layout,
      renderedWidgets,
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
