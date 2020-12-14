import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';

function TextInput(props) {
    const { display, name } = props.definition;
    return (
        <FormGroup>
            <FormLabel>{display || name}</FormLabel>
            <FormControl value={props.value} type="text" onChange={e => props.onChange(e.target.value)} />
        </FormGroup>
    );
}

export const handler = {
    type: 'text',
    seed: '',
    format: (_, value) => value,
    input: function (definition, current, handler, key) {
        return <TextInput definition={definition} value={current} onChange={handler} key={key} />;
    }
}