import React, { CSSProperties } from 'react';
import { style } from 'typestyle';

import { WidgetOptions, WidgetPosition, LayoutProperties } from '.';

type Props = {
  widgetOptions: WidgetOptions[];
  renderedWidgets: React.ReactNode[];
  layoutProperties: LayoutProperties;
};

const getGridContainerStyles = (layoutProperties: LayoutProperties) =>
  style({
    display: 'grid',
    gridTemplateColumns: `repeat(${layoutProperties.columns}, 1fr)`,
    gridTemplateRows: `repeat(${layoutProperties.rows}, 1fr)`,
    gap: '1px 1px',
    height: '100%',
  });

const getWidgetStyle = (position: WidgetPosition): CSSProperties => ({
  gridColumnStart: position.column,
  gridColumnEnd: position.column + position.colspan,
  gridRowStart: position.row,
  gridRowEnd: position.row + position.rowspan,
  overflow: 'hidden',
});

const Layout = ({
  widgetOptions,
  renderedWidgets,
  layoutProperties,
}: Props) => (
  <div className={getGridContainerStyles(layoutProperties)}>
    {widgetOptions.map(({ position }, i) => (
      <div key={i} style={getWidgetStyle(position)}>
        {renderedWidgets[i]}
      </div>
    ))}
  </div>
);

export default Layout;
