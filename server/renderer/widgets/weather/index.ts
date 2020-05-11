import Widget from '../../widget';
import { Template } from './template';
import { Fallback } from './fallback';
import { dataResolver, TemplateProps } from './data';

export default new Widget<{}, TemplateProps>({
  dataResolver,
  template: Template,
  fallback: Fallback,
});
