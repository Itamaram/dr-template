import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';

export default function DropdownInput(props) {
    const { options, display } = props.config;
    return (
        <FormGroup>
            <FormLabel>{display || props.name}</FormLabel>
            <FormControl as="select" onChange={(e) => props.onChange(props.name, e.target.value)}>
                <option></option>
                {
                    options.map(o => (<option value={o.value || o.key}>{o.key}</option>))
                }
            </FormControl>
        </FormGroup>
    )
}