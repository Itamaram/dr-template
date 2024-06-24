import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select/creatable';
import { FormGroup, FormLabel, Row, Col, FormControl, Button } from 'react-bootstrap';
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
      return defaultValues.map(key => options.find(option => option.value === key) || { value: key, label: key });
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
    onChange([...values, newOption]);
    setSelectedOptions((prevSelected) => [...prevSelected, newOption]);
  };

  const handleOptionChange = (index, field, value) => {
    const oldKey = options[index].value;
    const updatedOptions = options.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt));
    const updatedFields = { options: updatedOptions.map(({ value, label }) => ({ key: label, value })) };

    if (field === 'value') {
      updatedFields.oldKey = oldKey;
      updatedFields.newKey = value;
    }

    editControl(placeholder, display, definition.hide, defaultValues, placeholder, definition.condition, updatedFields);
    setOptions(updatedOptions);
    const getSelectedOptions = () => {
      return defaultValues.map(key => updatedOptions.find(option => option.value === key) || { value: key, label: key });
    };
    setSelectedOptions(getSelectedOptions());
  };

  const handleAddOption = () => {
    const updatedOptions = [...options, { value: 'new_option', label: 'New Option' }];
    editControl(placeholder, display, definition.hide, defaultValues, placeholder, definition.condition, { options: updatedOptions.map(({ value, label }) => ({ key: label, value })) });
    setOptions(updatedOptions);
    const getSelectedOptions = () => {
      return defaultValues.map(key => updatedOptions.find(option => option.value === key) || { value: key, label: key });
    };
    setSelectedOptions(getSelectedOptions());
  };

  const handleRemoveOption = (index) => {
    const optionToRemove = options[index];
    const oldKey = optionToRemove.value;

    // Check if the key is used in any conditions
    const isKeyUsedInConditions = variables.some(variable => {
      const condition = variable.definition.condition;
      return condition && JSON.stringify(condition).includes(`"field":"${placeholder}"`) && JSON.stringify(condition).includes(`"equals":"${oldKey}"`);
    });

    if (isKeyUsedInConditions) {
      const shouldDeleteConditions = window.confirm(`The key "${oldKey}" is used in conditions. Do you want to proceed? This will delete all conditions related to this key`);

      let action;
      if (shouldDeleteConditions) {
        action = 'remove';
      } else {
        return;
      }

      const updatedOptions = options.filter((_, i) => i !== index);
      const newDefaultValues = defaultValues.filter(value => value !== oldKey);
      editControl(placeholder, display, definition.hide, newDefaultValues, placeholder, definition.condition, { options: updatedOptions.map(({ value, label }) => ({ key: label, value })), oldKey, newKey: '' }, action);
      setOptions(updatedOptions);
      const getSelectedOptions = () => {
        return newDefaultValues.map(key => updatedOptions.find(option => option.value === key) || { value: key, label: key });
      };
      setSelectedOptions(getSelectedOptions());
    } else {
      const updatedOptions = options.filter((_, i) => i !== index);
      const newDefaultValues = defaultValues.filter(value => value !== oldKey);
      editControl(placeholder, display, definition.hide, newDefaultValues, placeholder, definition.condition, { options: updatedOptions.map(({ value, label }) => ({ key: label, value })) });
      setOptions(updatedOptions);
      const getSelectedOptions = () => {
        return newDefaultValues.map(key => updatedOptions.find(option => option.value === key) || { value: key, label: key });
      };
      setSelectedOptions(getSelectedOptions());
    }
  };

  const handleDefaultChange = key => {
    const newDefaultValues = defaultValues.includes(key)
      ? defaultValues.filter(value => value !== key)
      : [...defaultValues, key];
    editControl(placeholder, display, definition.hide, newDefaultValues, placeholder, definition.condition, {});
  };

  // Ensure default values are set when switching to non-edit mode
  const prevEditMode = useRef(editMode);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current || (!editMode && prevEditMode.current)) {
      const getSelectedOptions = () => {
        return defaultValues.map(key => options.find(option => option.value === key) || { value: key, label: key });
      };
      onChange(defaultValues.map(key => options.find(option => option.value === key) || { value: key, label: key }));
      isFirstRender.current = false;
      setSelectedOptions(getSelectedOptions());
    }
    prevEditMode.current = editMode;
  }, [editMode, defaultValues, onChange, options]);

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
        showModels={['display', 'condition', 'placeholder']} // Specify which models to show
        variables={variables} // Pass variables to DraggableVariable
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        controlType="Select" // Pass control type
      >
        <FormGroup>
          {options.map((o, i) => (
            <Row key={i} onClick={() => handleDefaultChange(o.value)} style={{ cursor: 'pointer', backgroundColor: defaultValues.includes(o.value) ? 'lightblue' : 'inherit' }}>
              <Col>
                <FormControl
                  type="text"
                  value={o.label}
                  onChange={(e) => handleOptionChange(i, 'label', e.target.value)}
                  placeholder="Key"
                />
              </Col>
              <Col>
                <FormControl
                  type="text"
                  value={o.value}
                  onChange={(e) => handleOptionChange(i, 'value', e.target.value)}
                  placeholder="Value"
                />
              </Col>
              <Col>
                <Button variant="danger" onClick={() => handleRemoveOption(i)}>Remove</Button>
              </Col>
            </Row>
          ))}
          <Button variant="primary" onClick={handleAddOption}>Add Option</Button>
        </FormGroup>
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
