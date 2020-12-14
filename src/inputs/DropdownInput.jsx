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
    format: function (variable, value) {
        const e = variable.options.filter(o => o.key === value)[0];
        return e?.value || e?.key;
    },
    input: function (definition, current, handler, key) {
        return <DropdownInput definition={definition} value={current} onChange={handler} key={key} />;
    }
}