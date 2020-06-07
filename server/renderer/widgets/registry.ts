import hello from './hello';
import googleCalendarEvents from './googleCalendarEvents';
import parcelMap from './parcelMap';
import weather from './weather';
import text from './text';

export const widgetRegistry = {
  hello,
  googleCalendarEvents,
  parcelMap,
  weather,
  text,
};

export type WidgetRegistry = typeof widgetRegistry;

export default widgetRegistry;
