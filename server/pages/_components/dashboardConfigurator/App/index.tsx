import React, { useCallback, useState, useEffect } from 'react';
import { Layout } from 'react-grid-layout';

import { WidgetList } from '../WidgetsList';
import DashboardGrid from '../DashboardGrid';

import styles from './index.module.css';
import {
  useSWRAndRouterWithAuthRedirect,
  getHandleAuthFetcher,
  UseSWRAndRouterWithAuthRedirectReturn,
} from '../../../_hooks/swr';
import { SupportedWidget } from '../../../../api/widget';
import { DashboardConfig } from '../../../../api/device';
import { useRouter } from 'next/router';
import { Device as DbDevice } from '../../../../db';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import * as C from 'fp-ts/lib/Console';
import * as F from 'fp-ts/lib/function';
import * as IO from 'fp-ts/lib/IO';
import * as IOE from 'fp-ts/lib/IOEither';
import { pipe } from 'fp-ts/lib/pipeable';
import { useQueryParam, RouterQueryParam } from '../../../_hooks/useQueryParam';
import { toast } from 'react-toastify';
import { Box, Header, Grid, Footer, Button, Text, Heading } from 'grommet';
import Link from 'next/link';
import { LinkPrevious } from 'grommet-icons';

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

const sendConfig = (deviceId: string, widgets: WidgetOptions[]) =>
  TE.tryCatch(
    () =>
      fetch(`/api/device/${deviceId}/configuration`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ widgets }),
      }),
    E.toError
  );

const isString: F.Refinement<unknown, string> = (a): a is string => typeof a === 'string';

const getSaveConfig = (deviceIdParam: RouterQueryParam, widgets: WidgetOptions[]): T.Task<void> =>
  pipe(
    deviceIdParam,
    E.fromOption(() => new Error('No device id provided')),
    E.filterOrElse(isString, () => new Error('More than one device id provided')),
    TE.fromEither,
    TE.chain((id) => sendConfig(id, widgets)),
    TE.fold(
      (e) =>
        T.fromIO(() => {
          toast.error(e.toString());
        }),
      () =>
        T.fromIO(() => {
          toast.success('Config saved');
        })
    )
  );

const loadCurrentWidgetOptions = (deviceId: string): TE.TaskEither<Error, WidgetOptions[]> =>
  pipe(
    deviceId,
    TE.right,
    TE.chain((id) =>
      TE.tryCatch(
        () =>
          getHandleAuthFetcher(`/api/device/${id}`)
            .then<DbDevice | null>((device) => device)
            .then((device) => device?.config.widgets ?? []),
        E.toError
      )
    )
  );

const getLoadCurrentWidgetOptionsEffect = (
  deviceParam: RouterQueryParam,
  setLayoutState: (state: LayoutState) => void
): IO.IO<void> =>
  pipe(
    deviceParam,
    O.filter(isString),
    O.fold(
      () => F.constVoid,
      (id) => () => {
        const task = pipe(
          id,
          loadCurrentWidgetOptions,
          TE.fold(
            (err) =>
              T.fromIO(() => {
                toast.error(`Error loading current config: ${err}`);
              }),
            (widgetOptions) =>
              T.fromIO(() => {
                pipe(widgetOptions, widgetOptionsToLayout, setLayoutState);
              })
          )
        );
        task();
        return;
      }
    )
  );

type LayoutState = {
  layout: Layout[];
  widgets: Record<string, string>;
};

const swrAndRouterDataToEither = <D, E>(d: UseSWRAndRouterWithAuthRedirectReturn<D, E>) =>
  d.error ? E.left(d.error) : pipe(d.data, O.fromNullable, E.right);

const App = () => {
  const [state, setState] = useState<LayoutState>({ layout: [], widgets: {} });
  const router = useRouter();
  const id = useQueryParam('id');
  const supportedWidgets = pipe(
    useSWRAndRouterWithAuthRedirect<SupportedWidget[], Error>('/api/widget/supported'),
    swrAndRouterDataToEither
  );

  const handleLayoutChange = useCallback((layout: Layout[], widgets: Record<string, string>) => {
    setState({ layout, widgets });
  }, []);
  const onSaveCurrentConfig = getSaveConfig(id, layoutTowidgetOptions(state.layout, state.widgets));

  useEffect(getLoadCurrentWidgetOptionsEffect(id, setState), [router.query.id, setState]);

  return (
    <Grid
      rows={['xsmall', 'auto']}
      columns={['small', 'auto', 'medium']}
      fill="vertical"
      areas={[
        { name: 'header', start: [0, 0], end: [2, 0] },
        { name: 'widgets', start: [0, 1], end: [0, 1] },
        { name: 'canvas', start: [1, 1], end: [1, 1] },
        { name: 'settings', start: [2, 1], end: [2, 1] },
      ]}
    >
      <Header pad="small" gridArea="header" background="brand">
        <Link href="/device/[id]" as={`/device/${router.query.id}`}>
          <Button icon={<LinkPrevious />} label="Exit" />
        </Link>
        <Heading size="small">Configure dat dashboard mm</Heading>
        <Button primary onClick={onSaveCurrentConfig} label="Save" />
      </Header>
      <Box gridArea="widgets" background="light-3">
        <WidgetList data={supportedWidgets} />
      </Box>
      <Box gridArea="canvas" background="light-1" justify="center" align="center">
        <DashboardGrid layout={state.layout} widgets={state.widgets} onLayoutChange={handleLayoutChange} />
        {/* {JSON.stringify(layoutTowidgetOptions(state.layout, state.widgets), null, 2)} */}
      </Box>
      <Box gridArea="settings" background="light-3">
        Settings
      </Box>
    </Grid>
  );
};

export default App;
