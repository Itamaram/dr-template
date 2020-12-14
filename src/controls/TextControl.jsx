import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';

function TextControl(props) {
    const { display, placeholder } = props.definition;
    return (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            <FormControl value={props.value} type="text" onChange={e => props.onChange(e.target.value)} />
        </FormGroup>
    );
}

export const handler = {
    type: 'text',
    seed: '',
    render: function (definition, current, onChange) {
        return <TextControl definition={definition} value={current} onChange={onChange} key={definition.placeholder} />;
    },
    getValues: function (variable, value, mod) {
        return value ? [value] : [];
    }
}