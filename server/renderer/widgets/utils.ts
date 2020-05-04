import { WidgetPosition, LayoutProperties } from '..';

export const getWidgetDimensions = (
  layout: LayoutProperties,
  widgetPosition: WidgetPosition
) => {
  const cellWidth = layout.width / layout.columns;
  const cellHeight = layout.height / layout.rows;

  return {
    width: widgetPosition.colspan * cellWidth,
    height: widgetPosition.rowspan * cellHeight,
  };
};
