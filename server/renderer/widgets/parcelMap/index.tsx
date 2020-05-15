import React from 'react';
import * as t from 'io-ts';

import Widget from '../../widget';
import resolver from './resolver';

export type Options = {
  tracks: string[];
};

const optionsSchema = t.type({
  tracks: t.array(t.string),
});

export default new Widget({
  dataResolver: resolver,
  template: ({ googleMapsUrl }) => <img src={googleMapsUrl} />,
  cache: {
    ttl: 60 * 60 * 6,
  },
  optionsSchema,
});
