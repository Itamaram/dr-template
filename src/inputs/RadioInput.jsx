import React from 'react'
import { FormCheck, FormGroup, FormLabel } from 'react-bootstrap';

function RadioInput(props) {
    const { options, display, name } = props.config;
    return (
        <FormGroup>
            <FormLabel>{display || name}</FormLabel>
            {
                options.map((o, i) => {
                    return (
                        <FormCheck type="radio"
                            id={`input-radio-${name}-${i}`}
                            name={name}
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
    format: function (definition, value) {
        const e = definition.options.filter(o => o.key === value)[0];
        return e?.value || e?.key;
    },
    input: function (config, current, handler, key) {
        return <RadioInput config={config} value={current} onChange={handler} key={key} />;
    }
}