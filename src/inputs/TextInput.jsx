import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';

export default function TextInput(props) {
    return (
        <FormGroup>
            <FormLabel>{props.config.display || props.name}</FormLabel>
            <FormControl type="text" onChange={e => props.onChange(props.name, e.target.value)}></FormControl>
        </FormGroup>
    );
}