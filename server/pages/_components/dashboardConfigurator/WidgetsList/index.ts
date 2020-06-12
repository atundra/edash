import { DragEvent, createElement as ce, useCallback, ReactNode } from 'react';

import styles from './index.module.css';
import { SupportedWidget } from '../../../../api/widget';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import { pipe } from 'fp-ts/lib/pipeable';
import { flow } from 'fp-ts/lib/function';
import { wrap } from '../utils';

const getOnDragStart = (data: SupportedWidget) =>
  useCallback((e: DragEvent<HTMLDivElement>) => e.dataTransfer?.setData('text/plain', data.id), [data]);

const WidgetBox = ({ data }: { data: SupportedWidget }) =>
  pipe(
    data.name,
    wrap('div', {}),
    wrap('div', { className: styles.widgetBox, unselectable: 'on', draggable: true, onDragStart: getOnDragStart(data) })
  );

const renderSupportedWidgets: (w: SupportedWidget[]) => ReactNode = flow(
  NEA.fromArray,
  O.fold<NEA.NonEmptyArray<SupportedWidget>, React.ReactNode>(
    () => 'Supported widget list is empty',
    NEA.map((widget) => ce(WidgetBox, { data: widget, key: widget.id }))
  )
);

export const WidgetList = ({ data }: { data: E.Either<Error, O.Option<SupportedWidget[]>> }) =>
  pipe(
    data,
    E.fold(
      (err) => 'Error loading supported widgets',
      O.fold(() => 'Loading...', renderSupportedWidgets)
    ),
    wrap('div', { className: styles.root })
  );
