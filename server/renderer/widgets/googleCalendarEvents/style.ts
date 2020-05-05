import { style } from 'typestyle';

export const fallbackStyle = style({
  fontFamily: 'Arial, Helvetica, sans-serif',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  backgroundColor: '#ccc',
});

export const itemStyle = style({
  display: 'inline-block',
  margin: '.1rem 1rem 0 0',
  borderRadius: '.5rem',
  height: '100%',
  flexShrink: 0,
  overflow: 'hidden',
});

export const itemTitleStyle = style({
  fontWeight: 'bold',
  fontSize: '1.25rem',
  marginBottom: '.5rem',
  background: '#ccc',
  padding: '0.4rem 1rem',
  textAlign: 'center',
});

export const headerStyle = style({
  float: 'left',
  writingMode: 'vertical-rl',
  transform: 'rotate(180deg)',
  textAlign: 'right',
  padding: '0 .2rem',
  fontSize: '0.9rem',
});

export const itemsStyle = style({
  display: 'flex',
  height: '100%',
});

export const containerStyle = style({
  fontFamily: 'Arial, sans-serif;',
  height: '100%',
});

export const summaryStyle = style({
  fontSize: '1rem',
  padding: '0 .5rem',
});
