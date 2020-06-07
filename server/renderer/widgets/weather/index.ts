import Widget from '../../widget';
import { Template } from './template';
import { Fallback } from './fallback';
import { dataResolver } from './data';

export default new Widget({
  dataResolver,
  template: Template,
  fallback: Fallback,
  name: 'Weather Forcast',
});
