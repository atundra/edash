import React, { useCallback } from 'react';

import styles from './index.module.css';
import { SupportedWidget } from '../../../../api/widget';

const WidgetBox = ({ data }: { data: SupportedWidget }) => {
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => e.dataTransfer?.setData('text/plain', data.id),
    [data]
  );

  return (
    <div className={styles.widgetBox} unselectable="on" onDragStart={handleDragStart} draggable>
      <div>{data.name}</div>
    </div>
  );
};

type Props = {
  data?: SupportedWidget[];
  error?: Error;
};

const WidgetsList = ({ data, error }: Props) => {
  if (error) {
    return <div className={styles.root}>Error loading supported widgets</div>;
  }

  if (!data) {
    return <div className={styles.root}>Loading...</div>;
  }

  if (data.length === 0) {
    return <div className={styles.root}>Supported widget list is empty</div>;
  }

  return (
    <div className={styles.root}>
      {data.map((widget) => (
        <WidgetBox key={widget.id} data={widget} />
      ))}
    </div>
  );
};

export default WidgetsList;
