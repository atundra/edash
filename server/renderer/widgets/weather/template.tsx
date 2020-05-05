import React from 'react';
import { TemplateProps } from './data';
import { style } from 'typestyle';
import { format, fromUnixTime } from 'date-fns';

const getWeatherIcon = (id: string) =>
  `http://openweathermap.org/img/wn/${id}@2x.png`;

const upperCaseFirstLetter = (str: string) =>
  str.length ? str[0].toUpperCase() + str.slice(1) : str;

const formatTemp = (temp: number) => Math.round(temp) + '°';

const formatUnixTime = (ts: number, formatStr: string) =>
  format(fromUnixTime(ts), formatStr);

const containerStyle = style({
  height: '100%',
  fontFamily: 'Arial, sans-serif',
  padding: '.5rem',
  boxSizing: 'border-box',
  display: 'flex',
});

const currentContainerStyle = style({
  display: 'flex',
  height: '100%',
  flexShrink: 0,
  marginRight: '1rem',
});

const currentImgStyle = style({
  width: '3.5rem',
});

const currentImgConatinerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: '1rem',
  maxWidth: '4.7rem',
});

const currentImgDescriptionStyle = style({
  textAlign: 'center',
});

const currentDataStyle = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const currentDataTempStyle = style({
  fontSize: '2rem',
});

const currentDataFeelsLikeStyle = style({
  fontSize: '.8rem',
});

const dailyContainerStyle = style({
  display: 'flex',
  height: '100%',
});

const dailyDayStyle = style({
  display: 'flex',
  flexDirection: 'column',
  flexBasis: '100%',
  alignItems: 'center',
});

const dailyDayTitleStyle = style({
  fontSize: '1rem',
  marginBottom: '.2rem',
});

const dailyDayTempStyle = style({
  fontSize: '1.2rem',
  marginBottom: '.2rem',
});

const dailyDayWeatherStyle = style({
  fontSize: '.8rem',
  textAlign: 'center',
});

export const Template = ({ weather: { current, daily } }: TemplateProps) => (
  <div className={containerStyle}>
    <div className={currentContainerStyle}>
      {current.weather.length && (
        <div className={currentImgConatinerStyle}>
          <img
            className={currentImgStyle}
            src={getWeatherIcon(current.weather[0].icon)}
          />
          <div className={currentImgDescriptionStyle}>
            {upperCaseFirstLetter(current.weather[0].description)}
          </div>
        </div>
      )}
      <div className={currentDataStyle}>
        <div className={currentDataTempStyle}>{formatTemp(current.temp)}</div>
        <div className={currentDataFeelsLikeStyle}>
          <div>
            Feels like <b>{formatTemp(current.feels_like)}</b>
          </div>
          <div>
            Sunrise at <b>{formatUnixTime(current.sunrise, 'HH:mm')}</b>
          </div>
          <div>
            Sunset at <b>{formatUnixTime(current.sunset, 'HH:mm')}</b>
          </div>
        </div>
      </div>
    </div>
    <div className={dailyContainerStyle}>
      {daily.slice(0, 3).map((day, index) => (
        <div
          key={day.dt}
          className={dailyDayStyle}
          style={{ marginLeft: index !== 0 ? '.5rem' : '0' }}
        >
          <div className={dailyDayTitleStyle}>
            {formatUnixTime(day.dt, 'EEE')}
          </div>
          <div className={dailyDayTempStyle}>
            {formatTemp(day.temp.min)}–{formatTemp(day.temp.max)}
          </div>
          {day.weather.length && (
            <div className={dailyDayWeatherStyle}>
              {day.weather[0].description}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);
