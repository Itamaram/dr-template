import { handler as checkbox } from './controls/CheckboxControl'
import { handler as dropdown } from './controls/DropdownControl'
import { handler as radio } from './controls/RadioControl'
import { handler as text } from './controls/TextControl'
import { handler as title } from './controls/TitleControl'
import {handler as select} from './controls/SelectControl'

const handlers = [checkbox, dropdown, radio, text, title, select]
    .reduce((p, h) => Object.assign(p, { [h.type]: h }), {});

export default handlers;