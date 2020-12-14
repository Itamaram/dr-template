import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';

function DropdownInput(props) {
    const { options, display, name } = props.definition;
    return (
        <FormGroup>
            <FormLabel>{display || name}</FormLabel>
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
    input: function (definition, current, handler, key) {
        return <DropdownInput definition={definition} value={current} onChange={handler} key={key} />;
    },
    getValues: function (variable, value, mod) {
        const e = variable.options.filter(o => o.key === value)[0];
        // todo mod check here for conditional display
        const result = e?.value || e?.key;
        return result ? [result] : [];
    }
}