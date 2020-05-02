import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { getStyles } from 'typestyle';

import WIDGETS_REGISTRY from './widgets/registry';
import Layout from './layout';

type WidgetPosition = {
  column: number;
  row: number;
  colspan: number;
  rowspan: number;
};

export type WidgetOptions = {
  id: keyof typeof WIDGETS_REGISTRY;
  position: WidgetPosition;
  // TODO: Add an ability to pass widget options from endpoint
  options?: {};
};

type RenderOptions = {
  widgets: WidgetOptions[];
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

export default class Renderer {
  static renderWidgets(options: RenderOptions) {
    const widgetDataPromises = options.widgets.map(async (widgetConfig) => {
      const widget = WIDGETS_REGISTRY[widgetConfig.id];

      try {
        const widgetData = await widget.resolveData(widgetConfig.options);

        return widget.render(widgetData);
      } catch (error) {
        console.error(
          `Error while rendering widget ${widgetConfig.id}\n`,
          error
        );

        if (widget.renderFallback) {
          return widget.renderFallback(error);
        }

        return null;
      }
    });

    return Promise.all(widgetDataPromises);
  }

  static async render(options: RenderOptions) {
    const renderedWidgets = await Renderer.renderWidgets(options);

    const layout = React.createElement(Layout, {
      widgetOptions: options.widgets,
      renderedWidgets,
    });
    const body = ReactDOMServer.renderToStaticMarkup(layout);
    const css = getStyles();

    return renderPage({ body, css });
  }
}
