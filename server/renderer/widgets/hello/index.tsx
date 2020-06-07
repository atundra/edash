import React from 'react';

import Widget from '../../widget';

type Props = { text: string };

export default new Widget({
  dataResolver: () => {
    if (Math.random() < 0.5) {
      return Promise.reject({ text: 'Oh no' });
    }

    return Promise.resolve({ text: 'Hello' });
  },
  template: ({ text }: Props) => <span style={{ color: 'green' }}>{text}</span>,
  fallback: ({ text }: Props) => <span style={{ color: 'red' }}>{text}</span>,
  name: 'Randomly Failing Hello World',
  description:
    'Dummy widget which randomly simulates data resolver error: with 0.5 probability will show Oh no message with red text.',
});
