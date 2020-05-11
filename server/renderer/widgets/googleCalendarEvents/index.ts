import Widget from '../../widget';
import { loadCalendarEvents } from './gapi';
import { Template, Props as TemplateProps } from './template';
import { Fallback } from './fallback';

type Options = {};

export default new Widget<Options, TemplateProps>({
  dataResolver: async () => {
    const events = await loadCalendarEvents();
    return { events };
  },
  template: Template,
  fallback: Fallback,
});
