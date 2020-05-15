import { WidgetRegistry } from './widgets/registry';
import Widget from './widget';

export type WidgetId = keyof WidgetRegistry;

export type WidgetOptionsById<
  Id extends WidgetId
> = WidgetRegistry[Id] extends Widget<infer Options, any> ? Options : never;
export type WidgetPropsById<
  Id extends WidgetId
> = WidgetRegistry[Id] extends Widget<any, infer Props> ? Props : never;

export type WidgetPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WidgetConfigById<Id extends WidgetId> = {
  id: Id;
  position: WidgetPosition;
} & ({} extends WidgetOptionsById<Id>
  ? { options?: never }
  : { options: WidgetOptionsById<Id> });

type MapWidgetOptions<T> = T extends WidgetId ? WidgetConfigById<T> : never;

export type WidgetConfig = MapWidgetOptions<WidgetId>;
