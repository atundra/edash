import React, { CSSProperties } from 'react';
import { style } from 'typestyle';

import { WidgetOptions, WidgetPosition } from '.';

type Props = {
  widgetOptions: WidgetOptions[];
  renderedWidgets: React.ReactNode[];
};

const styles = {
  gridContainer: style({
    display: 'grid',
    gridTemplateColumns: 'repeat(16, 1fr)',
    gridTemplateRows: 'repeat(12, 1fr)',
    gap: '1px 1px',
    height: '100%',
  }),
};

const getWidgetStyle = (position: WidgetPosition): CSSProperties => ({
  gridColumnStart: position.column,
  gridColumnEnd: position.column + position.colspan,
  gridRowStart: position.row,
  gridRowEnd: position.row + position.rowspan,
  overflow: 'overlay',
});

const Layout = ({ widgetOptions, renderedWidgets }: Props) => (
  <div className={styles.gridContainer}>
    {widgetOptions.map(({ position }, i) => (
      <div key={i} style={getWidgetStyle(position)}>
        {renderedWidgets[i]}
      </div>
    ))}
  </div>
);

export default Layout;
