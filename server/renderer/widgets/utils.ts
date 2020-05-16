import { LayoutProperties } from '..';
import { WidgetPosition } from '../types';

export const getWidgetDimensions = (layout: LayoutProperties, widgetPosition: WidgetPosition) => {
  const cellWidth = layout.width / layout.columns;
  const cellHeight = layout.height / layout.rows;

  return {
    width: widgetPosition.width * cellWidth,
    height: widgetPosition.height * cellHeight,
  };
};
