import { handler as checkbox } from './controls/CheckboxControl'
import { handler as dropdown } from './controls/DropdownControl'
import { handler as radio } from './controls/RadioControl'
import { handler as text } from './controls/TextControl'

const handlers = [checkbox, dropdown, radio, text]
    .reduce((p, h) => Object.assign(p, { [h.type]: h }), {});

export default handlers;