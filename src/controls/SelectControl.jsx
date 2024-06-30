import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select/creatable';
import { FormGroup, FormLabel } from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import

function SelectControl(props) {
  const { definition, values, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { options: rawOptions = [], display, placeholder, default: defaultValues = [] } = definition;

  const [options, setOptions] = useState(rawOptions.map((o) => ({ value: o.key, label: o.key })));
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    setOptions(rawOptions.map((o) => ({ value: o.key, label: o.key })));
  }, [rawOptions]);

  useEffect(() => {
    const getSelectedOptions = () => {
      return defaultValues ? defaultValues.map(key => options.find(option => option.value === key) || { value: key, label: key }) : [];
    };
    setSelectedOptions(getSelectedOptions());
  }, [options, defaultValues]);

  const handleSelectChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(({ value, label }) => ({ value, label })) : [];
    onChange(selectedValues);
    setSelectedOptions(selectedOptions);
  };

  const handleCreateOption = (inputValue) => {
    const newOption = {
      value: inputValue,
      label: inputValue,
    };
    setOptions((prevOptions) => [...prevOptions, newOption]);
    setSelectedOptions((prevSelected) => (prevSelected ? [...prevSelected, newOption] : [newOption]));
    onChange([...values, newOption]);
  };

  // Ensure default values are set when switching to non-edit mode
  const prevEditMode = useRef(editMode);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current || (!editMode && prevEditMode.current)) {
      const getSelectedOptions = () => {
        return defaultValues ? defaultValues.map(key => options.find(option => option.value === key) || { value: key, label: key }) : [];
      };
      onChange(defaultValues ? defaultValues.map(key => options.find(option => option.value === key) || { value: key, label: key }) : []);
      isFirstRender.current = false;
      setSelectedOptions(getSelectedOptions());
    }
    prevEditMode.current = editMode;
  }, [editMode, defaultValues, onChange, options]);

  useEffect(() => {
    const getSelectedOptions = () => {
      return values ? values.map(({ value }) => options.find(option => option.value === value) || { value, label: value }) : [];
    };
    setSelectedOptions(getSelectedOptions());
  }, [options, values]);

  if (editMode) {
    return (
      <DraggableVariable
        variable={{ definition, handler: props.handler }}
        index={index}
        moveVariable={moveVariable}
        editMode={editMode}
        onChange={onChange}
        editControl={editControl}
        placeholders={placeholders}
        deleteVariable={deleteVariable} // Pass deleteVariable function
        showModels={['display', 'condition', 'placeholder', 'options']} // Specify which models to show
        variables={variables} // Pass variables to DraggableVariable
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        controlType="Select" // Pass control type
      >
      </DraggableVariable>
    );
  }

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
  render: function (definition, current, onChange, editMode, editControl, placeholders, index, moveVariable, variables, selectedVariable, setSelectedVariable, deleteVariable) {
    return (
      <SelectControl
        definition={definition}
        values={current.map(({ value, label }) => ({ value, label }))}
        onChange={onChange}
        editMode={editMode}
        editControl={editControl}
        placeholders={placeholders}
        index={index}
        moveVariable={moveVariable}
        variables={variables} // Pass variables to SelectControl
        deleteVariable={deleteVariable} // Pass deleteVariable function
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        key={definition.placeholder}
      />
    );
  },
  getValues: function (variable, values, mod) {
    if (mod && mod.includes("!!")) {
      mod = mod.replace(/!!/g, "");
      return values
        .map(({ label, value }) => variable.options.find((o) => o.key === value) || ({ key: label }))
        .filter((option) => !mod || mod.split(';').map((s) => s.trim()).every((m) => m !== option.key))
        .map((option) => option.value || option.key);
    } else {
      return values
        .map(({ value, label }) => variable.options.find((o) => o.key === label) || ({ key: value, value: label }))
        .filter((option) => !mod || mod.split(';').map((s) => s.trim()).includes(option.key))
        .map((option) => option.value || option.key);
    }
  }
};
