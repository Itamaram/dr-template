import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';

function DropdownInput(props) {
    const { options, display, name } = props.config;
    return (
        <FormGroup>
            <FormLabel>{display || name}</FormLabel>
            <FormControl as="select" defaultValue={props.value} onChange={(e) => props.onChange(e.target.value)}>
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
    format: function (definition, value) {
        const e = definition.options.filter(o => o.key === value)[0];
        return e?.value || e?.key;
    },
    input: function (config, current, handler, key) {
        return <DropdownInput config={config} value={current} onChange={handler} key={key} />;
    }
}