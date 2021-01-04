import React from 'react'
import { FormCheck, FormGroup, FormLabel } from 'react-bootstrap';

function RadioControl(props) {
    const { options, display, placeholder, inline } = props.definition;
    return (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            {
                options.map(o => {
                    return (
                        <FormCheck type="radio"
                            name={placeholder}
                            onChange={() => { props.onChange(o.key) }}
                            inline={inline}
                            value={o.key}
                            label={o.key}
                            checked={props.value === o.key}
                            key={o.key}
                        />
                    )
                })
            }
        </FormGroup>
    )
}

export const handler = {
    type: 'radio',
    seed: '',
    render: function (definition, current, onChange) {
        return <RadioControl definition={definition} value={current} onChange={onChange} key={definition.placeholder} />;
    },
    getValues: function (variable, value, mod) {
        const e = variable.options.filter(o => o.key === value)[0];
        if (mod && e?.key !== mod)
            return [];

        const result = e?.value || e?.key;
        return result ? [result] : [];
    }
}