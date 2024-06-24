import { handler as checkbox } from './controls/CheckboxControl';
import { handler as dropdown } from './controls/DropdownControl';
import { handler as radio } from './controls/RadioControl';
import { handler as text } from './controls/TextControl';
import { handler as title } from './controls/TitleControl';
import { handler as select } from './controls/SelectControl';
import { handler as date } from './controls/DateControl';
import { handler as time } from './controls/TimeControl';
import { handler as datetime } from './controls/DateTimeControl';
import { handler as textmulti } from './controls/TextMultiControl';
import { handler as number } from './controls/NumberControl';

const handlers = [checkbox, dropdown, radio, text, title, select, date, time, datetime, textmulti, number]
  .reduce((p, h) => Object.assign(p, { [h.type]: h }), {});

export default handlers;
