import React, { CSSProperties } from 'react';
import Widget from '../../widget';
import { loadCalendarEvents } from './gapi';
import { calendar_v3 } from 'googleapis';
import { lightFormat, parseISO } from 'date-fns';

type Options = {};

type Props = { events: calendar_v3.Schema$Event[] };

const fallbackStyle: CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  backgroundColor: '#ccc',
};

const itemStyle: CSSProperties = {
  display: 'inline-block',
  margin: '.1rem .25rem',
  border: '1px solid black',
  borderRadius: '.5rem',
  padding: '.25rem .5rem',
};

const titleStyle: CSSProperties = {
  fontWeight: 'bold',
  fontSize: '1.25rem',
  marginBottom: '.5rem',
};

const Fallback = () => <div style={fallbackStyle}>Data loading error</div>;

export default new Widget<Options, Props>({
  dataResolver: async () => {
    const events = await loadCalendarEvents();
    return { events };
  },
  template: ({ events }) => (
    <div style={{ fontFamily: 'Arial' }}>
      {events.map((event) => (
        <div style={itemStyle} key={event.id}>
          <div style={titleStyle}>{event.summary}</div>
          {event.start && event.start.dateTime && (
            <div>{lightFormat(parseISO(event.start.dateTime), 'HH:mm')}</div>
          )}
        </div>
      ))}
    </div>
  ),
  fallback: Fallback,
});
