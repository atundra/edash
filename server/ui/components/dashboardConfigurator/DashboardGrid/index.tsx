import React, { useCallback, useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';

import DashboardItem from '../DashboardItem';

import styles from './index.module.css';

type Props = {
  layout: Layout[];
  widgets: Record<string, string>;
  onLayoutChange: (layout: Layout[], widgets: Record<string, string>) => unknown;
};

const width = 800;
const height = 480;
const cols = 16;
const rows = 12;

const noMargin: [number, number] = [0, 0];

const DROPPING_ITEM = {
  i: '__dropping-item__',
  w: 4,
  h: 1,
};

const GRID_DIMENSIONS = { width, height };

const DashboardGrid = ({ onLayoutChange, layout, widgets }: Props) => {
  const [idCounter, setIdCounter] = useState(0);

  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      const newLayout = layout.filter((item) => item.i !== DROPPING_ITEM.i);

      onLayoutChange(newLayout, widgets);
    },
    [onLayoutChange, widgets]
  );
  const handleDeleteClick = useCallback(
    (id: string) => {
      const newLayout = layout.filter((item) => item.i !== id);

      onLayoutChange(newLayout, widgets);
    },
    [layout, widgets, onLayoutChange]
  );
  const handleDrop = useCallback(
    ({ x, y, e }: { x: number; y: number; e: DragEvent }) => {
      e.preventDefault();
      const widgetName = e.dataTransfer?.getData('text/plain')!;

      const i = widgetName + idCounter;
      const newLayout = layout.concat({
        x,
        y,
        w: DROPPING_ITEM.w,
        h: DROPPING_ITEM.h,
        i,
      });
      const newWidgets = { ...widgets, [i]: widgetName };

      setIdCounter(idCounter + 1);
      onLayoutChange(newLayout, newWidgets);
    },
    [idCounter, layout, widgets, onLayoutChange]
  );

  return (
    <GridLayout
      isDroppable
      preventCollision
      className={styles.layout}
      style={GRID_DIMENSIONS}
      layout={layout}
      cols={cols}
      rowHeight={height / rows}
      maxRows={rows}
      width={width}
      margin={noMargin}
      compactType={null}
      onLayoutChange={handleLayoutChange}
      droppingItem={DROPPING_ITEM}
      onDrop={handleDrop}
    >
      {layout.map((item) => (
        <div key={item.i}>
          <DashboardItem id={item.i} name={widgets[item.i]} onDeleteClick={handleDeleteClick} />
        </div>
      ))}
    </GridLayout>
  );
};

export default DashboardGrid;
