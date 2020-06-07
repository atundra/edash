import React from 'react';

import Widget from '../../widget';

type Props = { text: string };

export default new Widget({
  dataResolver: () => Promise.resolve({ text: 'Hello' }),
  template: ({ text }: Props) => <span>{text}</span>,
  name: 'Simple Text',
  description: 'Static widget displaying text string',
});
