import React, { useCallback } from 'react';

import styles from './index.module.css';

type Props = {
  id: string;
  name: string;
  onDeleteClick?: (name: string) => unknown;
};

const DashboardItem = ({ id, name, onDeleteClick }: Props) => {
  const handleDeleteClick = useCallback(() => onDeleteClick && onDeleteClick(id), [onDeleteClick, id]);

  return (
    <div className={styles.root}>
      <span className={styles.cross} onClick={handleDeleteClick}>
        X
      </span>
      {name}
    </div>
  );
};

export default DashboardItem;
