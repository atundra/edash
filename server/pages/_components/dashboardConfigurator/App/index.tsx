import React, { useCallback, useState, useEffect } from 'react';
import { Layout } from 'react-grid-layout';

import WidgetsList from '../WidgetsList';
import DashboardGrid from '../DashboardGrid';

import styles from './index.module.css';
import { useSWRAndRouterWithAuthRedirect, getHandleAuthFetcher } from '../../../_hooks/swr';
import { SupportedWidget } from '../../../../api/widget';
import { DashboardConfig } from '../../../../api/device';
import { useRouter } from 'next/router';
import { Device as DbDevice } from '../../../../db';

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

const layoutTowidgetOptions = (layout: Layout[], widgets: Record<string, string>): WidgetOptions[] =>
  layout.map((item) => ({
    id: widgets[item.i],
    position: {
      column: item.x + 1,
      row: item.y + 1,
      colspan: item.w,
      rowspan: item.h,
    },
  }));

const App = () => {
  const [state, setState] = useState<{
    layout: Layout[];
    widgets: Record<string, string>;
  }>({ layout: [], widgets: {} });
  // const [parsingError, setParsingError] = useState(false);
  const [widgetsOptions, setWidgetsOptions] = useState<WidgetOptions[]>([]);
  const [currentConfig, setCurrentConfig] = useState<DbDevice['config'] | null>(null);

  const router = useRouter();

  useEffect(() => {
    const id = router.query.id;
    if (id) {
      getHandleAuthFetcher(`/api/device/${id}`)
        .then<DbDevice | null>((device) => device)
        .then((device) => setCurrentConfig(device?.config ?? null))
        .catch((err) => console.error(err));
    }
  }, [router.query.id, setCurrentConfig]);

  const { data: supportedWidgetData, error: supportedWidgetError } = useSWRAndRouterWithAuthRedirect<
    SupportedWidget[],
    Error
  >('/api/widget/supported');

  const handleLayoutChange = useCallback((layout: Layout[], widgets: Record<string, string>) => {
    setState({ layout, widgets });
    setWidgetsOptions(layoutTowidgetOptions(layout, widgets));
  }, []);

  const saveCurrentConfig = useCallback(() => {
    const id = router.query.id;
    if (!id) {
      return;
    }

    fetch(`/api/device/${id}/configuration`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...currentConfig, widgets: widgetsOptions }),
    });
  }, [router.query.id, currentConfig, widgetsOptions]);

  return (
    <div>
      <div className={styles.root}>
        <div className={styles.widgetList}>
          <WidgetsList data={supportedWidgetData} error={supportedWidgetError} />
        </div>
        <div className={styles.dashboardWrapper}>
          <div className={styles.dashboard}>
            <DashboardGrid layout={state.layout} widgets={state.widgets} onLayoutChange={handleLayoutChange} />
          </div>
          <pre className={styles.widgetsOptionsEditor}>{JSON.stringify(widgetsOptions, null, 2)}</pre>
        </div>
      </div>

      <footer>
        <button onClick={saveCurrentConfig}>Save</button>
      </footer>
    </div>
  );
};

export default App;
