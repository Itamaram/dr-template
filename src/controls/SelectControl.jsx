import React from 'react';
import Select from 'react-select';
import { FormGroup, FormLabel } from 'react-bootstrap';

function SelectControl(props) {
  const { options: rawOptions, display, placeholder } = props.definition;
  const { values, onChange } = props;

  const options = rawOptions.map((o) => ({ value: o.key, label: o.key }));

  const selectedOptions = options.filter((option) => values.includes(option.value));

  const handleSelectChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    onChange(selectedValues);
  };

  return (
    <FormGroup>
      <FormLabel>{display || placeholder}</FormLabel>
      <Select
        onChange={handleSelectChange}
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
    return <SelectControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
  },
  getValues: function (variable, values, mod) {
    return variable.options
      .filter((option) => values.includes(option.key))
      .map((option) => option.value || option.key);
  },
};
