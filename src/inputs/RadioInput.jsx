import React, { useState } from 'react'
import { FormCheck, FormGroup, FormLabel } from 'react-bootstrap';

export default function RadioInput(props) {
    const [value, setValue] = useState();
    const { options, display } = props.config;
    return (
        <FormGroup>
            <FormLabel>{display || props.name}</FormLabel>
            {
                options.map((o, i) => {
                    const id = `input-radio-${props.name}-${i}`;
                    return (
                        <FormCheck type="radio"
                            id={id}
                            checked={value === o.value}
                            name={props.name}
                            onChange={() => { setValue(o.value); props.onChange(props.name, o.value) }}
                            value={o.value}
                            label={o.key}
                        />
                    )
                })}
        </FormGroup>
    )
}