import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';

function DropdownControl(props) {
    const { options, display, placeholder } = props.definition;
    return (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            <FormControl as="select" defaultValue={props.values[0]?.value} onChange={e => props.onChange([{ value: e.target.value }])}>
                {[{ key: '' }, ...options].map(o =>
                    <option value={o.key} key={o.key}>{o.key}</option>
                )}
            </FormControl>
        </FormGroup>
    )
}

export const handler = {
    type: 'dropdown',
    render: function (definition, current, onChange) {
      return <DropdownControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
    },
    getValues: function (variable, values, mod) {
      if (mod && mod.trim() !== '') {
        const modValues = mod.split(';').map((s) => s.trim());
        return variable.options
          .filter((option) => values.map(({value}) => value).includes(option.key) && modValues.includes(option.key))
          .map((option) => option.value || option.key);
      } else {
        return variable.options
          .filter((option) => values.map(({value}) => value).includes(option.key))
          .map((option) => option.value || option.key);
      }
    },
  };
  