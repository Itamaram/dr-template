import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';

function DropdownControl(props) {
    const { options, display, placeholder } = props.definition;
    return (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            <FormControl as="select" defaultValue={props.values[0]} onChange={e => props.onChange([e.target.value])}>
                {[{ key: '' }, ...options].map(o =>
                    <option value={o.key} key={o.key}>{o.key}</option>
                )}
            </FormControl>
        </FormGroup>
    )
}

export const handler = {
    type: 'dropdown',
    render: function (definition, current, onChange) {
        return <DropdownControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
    },
    getValues: function (variable, values, mod) {
        return variable.options
        .filter(o => values.includes(o.key))
        .map(o => o.value || o.key);
    }
}