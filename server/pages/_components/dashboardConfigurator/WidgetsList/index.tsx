import React, { useCallback } from 'react';

import styles from './index.module.css';

const availableWidgets = ['hello', 'googleCalendarEvents', 'parcelMap', 'weather'];

const WidgetBox = ({ name }: { name: string }) => {
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => e.dataTransfer?.setData('text/plain', name),
    [name]
  );

  return (
    <div className={styles.widgetBox} unselectable="on" onDragStart={handleDragStart} draggable>
      {name}
    </div>
  );
};

const WidgetsList = () => (
  <div className={styles.root}>
    {availableWidgets.map((widgetName) => (
      <WidgetBox key={widgetName} name={widgetName} />
    ))}
  </div>
);

export default WidgetsList;
