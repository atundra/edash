import React from 'react';

export type WidgetOptions<O, P> = {
  /**
   * @throws Error
   */
  dataResolver: (options?: O) => P | Promise<P>;
  template: React.FunctionComponent<P> | React.ComponentClass<P>;
  // TODO: Improve fallback typings
  fallback?: React.FunctionComponent<any> | React.ComponentClass<any>;
};

export default class Widget<O, P> {
  constructor(private widgetOptions: WidgetOptions<O, P>) {}

  resolveData(options?: O) {
    return this.widgetOptions.dataResolver(options);
  }

  render(props: P) {
    const { template } = this.widgetOptions;

    return React.createElement(template, props);
  }

  renderFallback(error: any) {
    const { fallback } = this.widgetOptions;

    if (!fallback) {
      return null;
    }

    return React.createElement(fallback, error);
  }
}
