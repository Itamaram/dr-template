import React from 'react'
import { FormCheck, FormGroup, FormLabel } from 'react-bootstrap';

function RadioInput(props) {
    const { options, display, placeholder } = props.definition;
    return (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            {
                options.map(o => {
                    return (
                        <FormCheck type="radio"
                            name={placeholder}
                            onChange={() => { props.onChange(o.key) }}
                            value={o.key}
                            label={o.key}
                            checked={props.value === o.key}
                            key={o.key}
                        />
                    )
                })}
        </FormGroup>
    )
}

export const handler = {
    type: 'radio',
    seed: '',
    input: function (definition, current, handler, key) {
        return <RadioInput definition={definition} value={current} onChange={handler} key={key} />;
    },
    getValues: function (variable, value, mod) {
        const e = variable.options.filter(o => o.key === value)[0];
        if (mod && e?.key !== mod)
            return [];

        const result = e?.value || e?.key;
        return result ? [result] : [];
    }
}