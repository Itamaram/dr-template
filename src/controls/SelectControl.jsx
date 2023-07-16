import React, { useState } from 'react';
import Select from 'react-select/creatable';
import { FormGroup, FormLabel } from 'react-bootstrap';

function SelectControl(props) {
    const { options: rawOptions, display, placeholder } = props.definition;
    const { values, onChange } = props;

    const [options, setOptions] = useState(rawOptions.map((o) => ({ value: o.key, label: o.key })));

    const selectedOptions = options.filter((option) => values.map(({value}) => value).includes(option.value));

    const handleSelectChange = (selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map(({value, label}) => ({value, label})) : [];
        onChange(selectedValues);
    };

    const handleCreateOption = (inputValue) => {
        const otherOption = {
          value: `Other^${options.filter((option) => option.value.startsWith('Other^')).length}`,
          label: inputValue
        };
          setOptions([...options, otherOption]);
          onChange([...values, otherOption]);
        
      };
    

    return (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            <Select
                onChange={handleSelectChange}
                onCreateOption={handleCreateOption}
                options={options}
                isSearchable={true}
                isClearable={true}
                isMulti
                value={selectedOptions}
            />
        </FormGroup>
    );
}

export const handler = {
    type: 'select',
    render: function (definition, current, onChange) {
        return (
            <SelectControl
                definition={definition}
                values={current.map(({value, label}) => ({value, label}))}
                onChange={onChange}
                key={definition.placeholder}
            />
        );
    },
    getValues: function (variable, values, mod) {
        if (mod && mod.includes("!!")) {
          mod = mod.replace(/!!/g, "");
          return values
          .map(({label, value}) => variable.options.find((o) => o.key === value) || ({ key: label }))
          .filter((option) => !mod || mod.split(';').map((s) => s.trim()).every((m) => m !== option.key))
          .map((option) => option.value || option.key);
        } else {
          return values
            .map(({value, label}) => variable.options.find((o) => o.key === label) || ({ key: value, value: label }))
            .filter((option) => !mod || mod.split(';').map((s) => s.trim()).includes(option.key))
            .map((option) => option.value || option.key);
        }
      }
      
};
