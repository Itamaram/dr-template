import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';

export default function TextInput(props) {
    const {display, name} = props.config;
    return (
        <FormGroup>
            <FormLabel>{display || name}</FormLabel>
            <FormControl type="text" onChange={e => props.onChange(e.target.value)}></FormControl>
        </FormGroup>
    );
}