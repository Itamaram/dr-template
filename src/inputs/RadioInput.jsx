import React from 'react'
import { FormCheck, FormGroup, FormLabel } from 'react-bootstrap';

export default function RadioInput(props) {
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
                            onChange={() => {props.onChange(o.value) }}
                            value={o.value}
                            label={o.key}
                        />
                    )
                })}
        </FormGroup>
    )
}