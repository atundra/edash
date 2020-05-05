import React from 'react';
import { lightFormat, parseISO, startOfDay } from 'date-fns';
import {
  headerStyle,
  itemStyle,
  itemTitleStyle,
  itemsStyle,
  containerStyle,
  summaryStyle,
} from './style';
import { calendar_v3 } from 'googleapis';
import { style } from 'typestyle';

const groupAndSortByDay = (events: calendar_v3.Schema$Event[]) => {
  type OnlyWithStart = calendar_v3.Schema$Event & {
    start: calendar_v3.Schema$EventDateTime;
  };
  const onlyWithStart = events
    .map((event) => ({
      ...event,
      start: event.originalStartTime || event.start,
    }))
    .filter((event) => !!event.start) as OnlyWithStart[];

  const getKey = (event: OnlyWithStart) =>
    startOfDay(parseISO(event.start.dateTime || '')).toISOString();

  return onlyWithStart.reduce((acc, event) => {
    const eventKey = getKey(event);
    if (eventKey in acc) {
      acc[eventKey].push(event);
    } else {
      acc[eventKey] = [event];
    }
    return acc;
  }, {} as Record<string, OnlyWithStart[]>);
};

const trimTitle = (text: string) =>
  text.length > 32 ? text.slice(0, 32).concat('…') : text;

export type Props = { events: calendar_v3.Schema$Event[] };

export const Template = ({ events }: Props) => (
  <div className={containerStyle}>
    {Object.entries(groupAndSortByDay(events)).map(([isoString, events]) => {
      return (
        <div key={isoString} className={style({ display: 'flex' })}>
          <div
            className={style({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            })}
          >
            <div
              className={style({
                fontSize: '.8rem',
              })}
            >
              {lightFormat(parseISO(isoString), 'dd.MM')}
            </div>
            <div
              className={style({
                width: '1px',
                height: '100%',
                background: '#777',
              })}
            ></div>
          </div>
          <div
            className={style({
              marginLeft: '2px',
              flexGrow: 1,
              marginBottom: '2px',
            })}
          >
            {events.map((event) => (
              <div
                key={event.id}
                className={style({
                  border: '1px solid black',
                  marginBottom: '2px',
                  padding: '2px',
                  borderRadius: '3px',
                })}
              >
                <div
                  className={style({
                    fontSize: '.8rem',
                  })}
                >
                  {trimTitle(event.summary || 'No name')}
                </div>
                {event.start.dateTime && (
                  <div>
                    {lightFormat(parseISO(event.start.dateTime), 'HH:mm')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);
