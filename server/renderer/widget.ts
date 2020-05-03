import React from 'react';

import { DefaultResolverOptions } from '.';

export type WidgetDefinition<O extends {}, P> = {
  /**
   * @throws Error
   */
  dataResolver: (resolverOptions: DefaultResolverOptions & O) => P | Promise<P>;
  template: React.FunctionComponent<P> | React.ComponentClass<P>;
  // TODO: Improve fallback typings
  fallback?: React.FunctionComponent<any> | React.ComponentClass<any>;
};

export default class Widget<O extends {}, P> {
  constructor(private definition: WidgetDefinition<O, P>) {}

  resolveData(resolverOptions: DefaultResolverOptions & O) {
    return this.definition.dataResolver(resolverOptions);
  }

  render(props: P) {
    const { template } = this.definition;

    return React.createElement(template, props);
  }

  renderFallback(error: any) {
    const { fallback } = this.definition;

    if (!fallback) {
      return null;
    }

    return React.createElement(fallback, error);
  }
}
