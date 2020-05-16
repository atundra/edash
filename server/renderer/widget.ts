import React from 'react';
import * as t from 'io-ts';

import { DefaultResolverOptions } from '.';

export type CacheConfiguration<O extends {}> = {
  /**
   * Time to cache data in seconds. 0 - unlimited
   */
  ttl: number;
  /**
   * Function calculating cache key
   */
  getCacheKey?: (resolverOptions: DefaultResolverOptions & O) => string;
};

export type WidgetDefinition<O extends {}, P, S extends t.Any> = {
  /**
   * @throws Error
   */
  dataResolver: (resolverOptions: DefaultResolverOptions & O) => P | Promise<P>;
  template: React.FunctionComponent<P> | React.ComponentClass<P>;
  // TODO: Improve fallback typings
  fallback?: React.FunctionComponent<any> | React.ComponentClass<any>;
  cache?: CacheConfiguration<O>;
} & ({} extends O ? { optionsSchema?: never } : { optionsSchema: S });

export default class Widget<O extends {}, P, S extends t.Any> {
  constructor(public definition: WidgetDefinition<O, P, S>) {}

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

  getCacheConfiguration() {
    return this.definition.cache;
  }
}
