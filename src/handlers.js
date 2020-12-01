import { handler as checkbox } from './inputs/CheckboxInput'
import { handler as dropdown } from './inputs/DropdownInput'
import { handler as radio } from './inputs/RadioInput'
import { handler as text } from './inputs/TextInput'

const handlers = [checkbox, dropdown, radio, text]
    .reduce((p, h) => Object.assign(p, { [h.type]: h }), {});

export default handlers;