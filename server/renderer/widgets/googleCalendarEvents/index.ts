import Widget from '../../widget';
import { loadCalendarEvents } from '../../../external/google/gapi';
import { Template, Props as TemplateProps } from './template';
import { Fallback } from './fallback';

export default new Widget({
  dataResolver: async () => {
    const events = await loadCalendarEvents();
    return { events };
  },
  template: Template,
  fallback: Fallback,
});
