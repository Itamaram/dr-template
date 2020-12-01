import React from 'react'
import { FormCheck, FormGroup, FormLabel } from 'react-bootstrap';

export default function CheckboxInput(props) {
    const update = (box) => {
        if (box.checked)
            return [...props.value, box.value];
        return props.value.filter(v => v !== box.value);
    }
    const { display, options, name } = props.config;

    return (
        <FormGroup>
            <FormLabel>{display || name}</FormLabel>
            {
                options.map(o => (
                    <FormCheck
                        type="checkbox"
                        checked={props.value.includes(o.key)}
                        name={name}
                        value={o.key}
                        onChange={e => props.onChange(update(e.target))}
                        label={o.key}
                        key={o.key}
                    />
                ))
            }
        </FormGroup>
    )
}

export const handler = {
    type: 'checkbox',
    seed: [],
    format: function(definition, value){
        let values = definition.options.filter(o => value.includes(o.key)).map(o => o.value || o.key);
        switch (values.length) {
          case 0: return '';
          case 1: return values[0];
          default:
            const last = values.pop();
            return values.join(', ') + ' and ' + last;
        }
    }
}