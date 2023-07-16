import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';

function TextControl(props) {
    const { display, placeholder, hide } = props.definition;
    return hide || (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            <FormControl value={props.values[0]?.value || ''} type="text" onChange={e => props.onChange([{ value: e.target.value }])} />
        </FormGroup>
    );
}

export const handler = {
    type: 'text',
    render: function (definition, current, onChange) {
        return <TextControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
    },
    getValues: function (variable, values, mod) {
        return values.map(({value}) => value);
    }
}