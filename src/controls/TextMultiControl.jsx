import React from 'react'
import { FormGroup, FormLabel } from 'react-bootstrap';

function TextMultiControl(props) {
    const { display, placeholder, hide } = props.definition;
    return hide || (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            <textarea 
            value={(props.values[0] ? props.values[0].replace(/<br>/g, '\n') : '') || ''}
            type="textmulti" 
            onChange={e => props.onChange([e.target.value.replace(/\r?\n/g, '<br>')])} 
            className="my-textarea"
            />

        </FormGroup>
    );
}

export const handler = {
    type: 'textmulti',
    render: function (definition, current, onChange) {
        return <TextMultiControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
    },
    getValues: function (variable, values, mod) {
        return values;
        ;
    }
}