import { createElement as ce, useCallback } from 'react';

import styles from './index.module.css';

type Props = {
  id: string;
  name: string;
  onDeleteClick?: (name: string) => unknown;
};

export default ({ id, name, onDeleteClick }: Props) =>
  ce(
    'div',
    { className: styles.root },
    ce(
      'span',
      {
        className: styles.cross,
        onClick: useCallback(() => onDeleteClick && onDeleteClick(id), [onDeleteClick, id]),
      },
      'X'
    ),
    name
  );
