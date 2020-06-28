import { DragEvent, createElement as ce, useCallback, ReactNode, createElement } from 'react';

import styles from './index.module.css';
import { SupportedWidget } from '../../../../api/widget';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import { pipe } from 'fp-ts/lib/pipeable';
import { flow } from 'fp-ts/lib/function';
import { Box, List, Text } from 'grommet';
import { Drag } from 'grommet-icons';

const getOnDragStart = (data: SupportedWidget) =>
  useCallback((e: DragEvent<HTMLDivElement>) => e.dataTransfer?.setData('text/plain', data.id), [data]);

const WidgetBox = ({ data }: { data: SupportedWidget }) =>
  ce(
    Box,
    {
      align: 'center',
      direction: 'row-responsive',
      draggable: true,
      justify: 'between',
      onDragStart: getOnDragStart(data),
      pad: 'small',
      style: { cursor: 'grab' },
      unselectable: 'on',
    },
    data.name,
    ce(Drag)
  );

const listItem = (data: SupportedWidget, index: number) => ce(WidgetBox, { key: data.id, data });

const renderSupportedWidgets: (w: SupportedWidget[]) => ReactNode = flow(
  NEA.fromArray,
  O.fold<NEA.NonEmptyArray<SupportedWidget>, React.ReactNode>(
    () => 'Supported widget list is empty',
    (widgets) =>
      ce(List, {
        children: listItem,
        data: widgets,
        pad: 'none',
      })
  )
);

export const WidgetList = ({ data }: { data: E.Either<Error, O.Option<SupportedWidget[]>> }) =>
  pipe(
    data,
    E.fold(
      (err) => 'Error loading supported widgets',
      O.fold(() => 'Loading...', renderSupportedWidgets)
    ),
    (node) => ce(Box, { pad: 'small' }, node)
  );
