import * as t from 'io-ts';

import widgetRegistry, { WidgetRegistry } from './widgets/registry';
import Widget from './widget';

export const WidgetId = t.keyof(widgetRegistry);

export type WidgetId = t.TypeOf<typeof WidgetId>;

export type WidgetOptionsById<Id extends WidgetId> = WidgetRegistry[Id] extends Widget<infer Options, any, any>
  ? Options
  : never;
export type WidgetPropsById<Id extends WidgetId> = WidgetRegistry[Id] extends Widget<any, infer Props, any>
  ? Props
  : never;
export type WidgetSchemaById<Id extends WidgetId> = WidgetRegistry[Id] extends Widget<any, any, infer Schema>
  ? Schema
  : never;

export const WidgetPosition = t.type({
  x: t.number,
  y: t.number,
  width: t.number,
  height: t.number,
});

export type WidgetPosition = t.TypeOf<typeof WidgetPosition>;

type WidgetConfigById<Id extends WidgetId> = {
  id: Id;
  position: WidgetPosition;
} & ({} extends WidgetOptionsById<Id> ? { options?: never } : { options: WidgetOptionsById<Id> });

type MapWidgetOptions<T> = T extends WidgetId ? WidgetConfigById<T> : never;

export type WidgetConfig = MapWidgetOptions<WidgetId>;
