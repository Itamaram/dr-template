import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';

function DropdownControl(props) {
    const { options, display, placeholder } = props.definition;
    return (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            <FormControl as="select" defaultValue={props.value} onChange={e => props.onChange(e.target.value)}>
                {[{ key: '' }, ...options].map(o =>
                    <option value={o.key} key={o.key}>{o.key}</option>
                )}
            </FormControl>
        </FormGroup>
    )
}

export const handler = {
    type: 'dropdown',
    seed: '',
    render: function (definition, current, onChange) {
        return <DropdownControl definition={definition} value={current} onChange={onChange} key={definition.placeholder} />;
    },
    getValues: function (variable, value, mod) {
        const e = variable.options.filter(o => o.key === value)[0];
        // todo mod check here for conditional display
        const result = e?.value || e?.key;
        return result ? [result] : [];
    }
}