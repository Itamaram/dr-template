import React from 'react'
import { FormCheck, FormGroup, FormLabel } from 'react-bootstrap';

function CheckboxControl(props) {
    const update = (box) => {
        if (box.checked)
            return [...props.value, box.value];
        return props.value.filter(v => v !== box.value);
    }
    const { display, options, placeholder } = props.definition;

    return (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            {
                options.map(o => (
                    <FormCheck
                        type="checkbox"
                        checked={props.value.includes(o.key)}
                        name={placeholder}
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
    render: function (definition, current, onChange) {
        return <CheckboxControl definition={definition} value={current} onChange={onChange} key={definition.placeholder} />;
    },
    getValues: function (variable, value, mod) {
        return variable.options
            .filter(o => value.includes(o.key))
            .map(o => o.value || o.key);
    }
}