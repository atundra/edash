import { DefaultResolverOptions } from '../..';
import { Options } from '.';

import { generate } from '../../../mapUrl';
import { getWidgetDimensions } from '../utils';

export default async (options: DefaultResolverOptions & Options) => {
  const { layout, widget } = options;

  const googleMapsUrl = await generate(
    options.tracks,
    getWidgetDimensions(layout, widget.position)
  );

  return { googleMapsUrl };
};
