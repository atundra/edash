import React from 'react';

import Widget from '../../widget';
import resolver from './resolver';

export type Options = {
  tracks: string[];
};

export default new Widget({
  dataResolver: resolver,
  template: ({ googleMapsUrl }) => <img src={googleMapsUrl} />,
});
