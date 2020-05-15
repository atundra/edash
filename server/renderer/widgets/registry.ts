import hello from './hello';
import googleCalendarEvents from './googleCalendarEvents';
import parcelMap from './parcelMap';
import weather from './weather';

const widgetRegistry = {
  hello,
  googleCalendarEvents,
  parcelMap,
  weather,
};

export type WidgetRegistry = typeof widgetRegistry;

export default widgetRegistry;
