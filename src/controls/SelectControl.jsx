import React from 'react'
import Select from 'react-select'
import {  FormGroup, FormLabel } from 'react-bootstrap';

function SelectControl(props) {
    const { options: rawOptions, display, placeholder, default: defaultValue } = props.definition;

    const options = rawOptions.map((o) => ({value: o.key, label: o.key}));

    return (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>        
            <Select
                onChange={e => {
                    //console.log(e);
                    //props.onChange(e?.value || '');
                    props.onChange(e.map(x => x.value))
                }} 
                options={options}
                isSearchable={true} 
                isClearable={true}
                isMulti
                defaultValue={
                    Array.isArray(defaultValue) 
                    ? options.filter(o => defaultValue.includes(o.value))
                    : options.filter(o => defaultValue === o.value)
                }
            />
        </FormGroup>            
    )
}

export const handler = {
    type: 'select',
    render: function (definition, current, onChange) {
        return <SelectControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
    },
    getValues: function (variable, values, mod) {
        return variable.options
        .filter(o => values.includes(o.key))
        .map(o => o.value || o.key);
    }
}