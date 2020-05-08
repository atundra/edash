import React, { useCallback, useState } from 'react';
import { Layout } from 'react-grid-layout';

import WidgetsList from '../WidgetsList';
import DashboardGrid from '../DashboardGrid';
import WidgetsOptionsEditor from '../WidgetsOptionsEditor';

import styles from './index.module.css';

type WidgetPosition = {
  column: number;
  row: number;
  colspan: number;
  rowspan: number;
};

type WidgetOptions = {
  id: string;
  position: WidgetPosition;
};

const layoutTowidgetOptions = (
  layout: Layout[],
  widgets: Record<string, string>
): WidgetOptions[] =>
  layout.map((item) => ({
    id: widgets[item.i],
    position: {
      column: item.x + 1,
      row: item.y + 1,
      colspan: item.w,
      rowspan: item.h,
    },
  }));

const widgetOptionsToLayout = (widgetOptions: WidgetOptions[]) => {
  let idCounter = 0;
  const widgets: Record<string, string> = {};

  const layout = widgetOptions.map(({ position, id }) => {
    const i = id + idCounter++;
    widgets[i] = id;

    return {
      x: position.column - 1,
      y: position.row - 1,
      w: position.colspan,
      h: position.rowspan,
      i,
    };
  });

  return { layout, widgets };
};

const App = () => {
  const [state, setState] = useState<{
    layout: Layout[];
    widgets: Record<string, string>;
  }>({ layout: [], widgets: {} });
  const [parsingError, setParsingError] = useState(false);
  const [widgetsOptions, setWidgetsOptions] = useState('[]');

  const handleLayoutChange = useCallback(
    (layout: Layout[], widgets: Record<string, string>) => {
      setState({ layout, widgets });
      setWidgetsOptions(
        JSON.stringify(layoutTowidgetOptions(layout, widgets), null, 2)
      );
    },
    []
  );

  const handleWidgetsOptionsChange = useCallback(
    (widgetsOptions: string) => {
      try {
        setWidgetsOptions(widgetsOptions);

        const parsedOptions: WidgetOptions[] = JSON.parse(widgetsOptions);
        const layoutWithWidgets = widgetOptionsToLayout(parsedOptions);
        setState(layoutWithWidgets);

        if (parsingError) {
          setParsingError(false);
        }
      } catch (_) {
        if (!parsingError) {
          setParsingError(true);
        }
      }
    },
    [parsingError]
  );

  return (
    <div className={styles.root}>
      <div className={styles.widgetList}>
        <WidgetsList />
      </div>
      <div className={styles.dashboardWrapper}>
        <div className={styles.dashboard}>
          <DashboardGrid
            layout={state.layout}
            widgets={state.widgets}
            onLayoutChange={handleLayoutChange}
          />
        </div>
        <div className={styles.widgetsOptionsEditor}>
          <WidgetsOptionsEditor
            value={widgetsOptions}
            onOptionsChange={handleWidgetsOptionsChange}
            parsingError={parsingError}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
