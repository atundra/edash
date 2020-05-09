import React, { CSSProperties } from 'react';
import { style } from 'typestyle';

import { WidgetOptions, WidgetPosition, LayoutProperties } from '.';

type Props = {
  widgetOptions: WidgetOptions[];
  widgets: React.ReactNode[];
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
  gridColumnStart: position.x,
  gridColumnEnd: position.x + position.width,
  gridRowStart: position.y,
  gridRowEnd: position.y + position.height,
  overflow: 'hidden',
});

const Layout = ({ widgetOptions, widgets, layoutProperties }: Props) => (
  <div className={getGridContainerStyles(layoutProperties)}>
    {widgetOptions.map(({ position }, i) => (
      <div key={i} style={getWidgetStyle(position)}>
        {widgets[i]}
      </div>
    ))}
  </div>
);

export default Layout;
