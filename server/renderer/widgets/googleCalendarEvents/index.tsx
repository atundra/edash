import React from 'react';
import Widget from '../../widget';
import { loadCalendarEvents } from './gapi';
import { calendar_v3 } from 'googleapis';
import { lightFormat, parseISO } from 'date-fns';
import {
  fallbackStyle,
  headerStyle,
  itemStyle,
  itemTitleStyle,
  itemsStyle,
  containerStyle,
  summaryStyle,
} from './style';

type Options = {};

type Props = { events: calendar_v3.Schema$Event[] };

const Fallback = () => <div className={fallbackStyle}>Data loading error</div>;

export default new Widget<Options, Props>({
  dataResolver: async () => {
    const events = await loadCalendarEvents();
    return { events };
  },
  template: ({ events }) => (
    <div className={containerStyle}>
      <div className={headerStyle}>Today Events</div>

      <div className={itemsStyle}>
        {events.map((event) => (
          <div className={itemStyle} key={event.id}>
            {event.start && event.start.dateTime && (
              <div className={itemTitleStyle}>
                {lightFormat(parseISO(event.start.dateTime), 'HH:mm')}
              </div>
            )}

            <div className={summaryStyle}>{event.summary}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  fallback: Fallback,
});
