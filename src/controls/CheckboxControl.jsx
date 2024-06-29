import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Col, FormCheck, FormGroup, FormLabel, Row, FormControl, Button } from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import

function CheckboxControl(props) {
  const { definition, values, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { display, options = [], placeholder, fixed, default: defaultValues = [] } = definition;
  const inputRefs = useRef([]);

  const [cursorPositions, setCursorPositions] = useState(options.map(() => 0));
  const [localOptions, setLocalOptions] = useState(options);
  const [localDefaultValues, setLocalDefaultValues] = useState(defaultValues);

  const update = ({ checked, value }) => {
    if (checked) return values.concat({ value });
    return values.filter(v => v.value !== value);
  };

  const handleOptionChange = (index, field, value) => {
    const oldKey = options[index].key;
    const updatedOptions = options.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt));
    const updatedFields = { options: updatedOptions };

    if (field === 'key') {
      updatedFields.oldKey = oldKey;
      updatedFields.newKey = value;
    }

    editControl(placeholder, display, definition.hide, localDefaultValues, placeholder, definition.condition, updatedFields);
    setLocalOptions(updatedOptions);
  };

  const handleAddOption = () => {
    const updatedOptions = [...options, { key: 'new_option', value: 'New Option' }];
    editControl(placeholder, display, definition.hide, localDefaultValues, placeholder, definition.condition, { options: updatedOptions });
    setLocalOptions(updatedOptions);
  };

  const handleRemoveOption = index => {
    const optionToRemove = options[index];
    const oldKey = optionToRemove.key;

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
      editControl(placeholder, display, definition.hide, newDefaultValues, placeholder, definition.condition, { options: updatedOptions, oldKey, newKey: '' }, action);
      setLocalOptions(updatedOptions);
      setLocalDefaultValues(newDefaultValues);
    } else {
      const updatedOptions = options.filter((_, i) => i !== index);
      const newDefaultValues = defaultValues.filter(value => value !== oldKey);
      editControl(placeholder, display, definition.hide, newDefaultValues, placeholder, definition.condition, { options: updatedOptions });
      setLocalOptions(updatedOptions);
      setLocalDefaultValues(newDefaultValues);
    }
  };

  const handleDefaultChange = key => {
    const newDefaultValues = localDefaultValues.includes(key)
      ? localDefaultValues.filter(value => value !== key)
      : [...localDefaultValues, key];
    editControl(placeholder, display, definition.hide, newDefaultValues, placeholder, definition.condition, {});
    setLocalDefaultValues(newDefaultValues);
  };

  const option = o => (
    <FormCheck
      type="checkbox"
      checked={values.map(({ value }) => value).includes(o.key)}
      name={placeholder}
      value={o.key}
      onChange={e => onChange(update(e.target))}
      label={o.key}
      key={o.key}
    />
  );

  const handleOptionInputChange = (index, field, e) => {
    const cursorPos = e.target.selectionStart;
    const newCursorPositions = [...cursorPositions];
    newCursorPositions[index] = cursorPos;
    setCursorPositions(newCursorPositions);
    handleOptionChange(index, field, e.target.value);
  };

  useLayoutEffect(() => {
    options.forEach((_, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].setSelectionRange(cursorPositions[index], cursorPositions[index]);
      }
    });
  }, [localOptions, cursorPositions, options]);

  // Ensure default values are set when switching to non-edit mode
  const prevEditMode = useRef(editMode);
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    if (isFirstRender.current || (!editMode && prevEditMode.current)) {
      const defaultCheckedValues = options.filter(option => defaultValues.includes(option.key)).map(option => ({ value: option.key }));
      onChange(defaultCheckedValues);
      isFirstRender.current = false;
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
        controlType="Checkbox" // Pass control type
      >
        <FormGroup>
          {localOptions.map((o, i) => (
            <Row key={i} onClick={() => handleDefaultChange(o.key)} style={{ cursor: 'pointer', backgroundColor: localDefaultValues.includes(o.key) ? 'lightblue' : 'inherit' }}>
              <Col>
                <FormControl
                  type="text"
                  value={o.key}
                  onChange={(e) => handleOptionInputChange(i, 'key', e)}
                  placeholder="Key"
                  ref={(el) => inputRefs.current[i] = el} // Attach ref to the input
                />
              </Col>
              <Col>
                <FormControl
                  type="text"
                  value={o.value}
                  onChange={(e) => handleOptionInputChange(i, 'value', e)}
                  placeholder="Value"
                  ref={(el) => inputRefs.current[i] = el} // Attach ref to the input
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

  if (fixed) {
    return (
      <Row>
        <FormLabel column>{display || placeholder}</FormLabel>
        {options.map(o => (
          <Col key={o.key}>
            {option(o)}
          </Col>
        ))}
      </Row>
    );
  }

  if (display === " ") {
    return (
      <FormGroup>
        {options.map(option)}
      </FormGroup>
    );
  }

  return (
    <FormGroup>
      <FormLabel style={{ textDecoration: 'underline' }}>{display || placeholder}</FormLabel>
      {options.map(option)}
    </FormGroup>
  );
}

export const handler = {
  type: 'checkbox',
  render: function (definition, current, onChange, editMode, editControl, placeholders, index, moveVariable, variables, selectedVariable, setSelectedVariable, deleteVariable) {
    return (
      <CheckboxControl
        definition={definition}
        values={current}
        onChange={onChange}
        editMode={editMode}
        editControl={editControl}
        placeholders={placeholders}
        index={index}
        moveVariable={moveVariable}
        variables={variables} // Pass variables to CheckboxControl
        deleteVariable={deleteVariable} // Pass deleteVariable function
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        key={definition.placeholder}
      />
    );
  },
  getValues: function (variable, values = [], mod) {
    if (!variable.options) return [];
    if (mod && mod.includes("!!")) {
      mod = mod.replace(/!!/g, "");
      return variable.options
        .filter(o => values.map(({ value }) => value).includes(o.key))
        .filter(o => !mod || mod.split(';').map((s) => s.trim()).every((m) => m !== o.key))
        .map(o => o.value || o.key);
    } else {
      return variable.options
        .filter(o => values.map(({ value }) => value).includes(o.key))
        .filter(o => !mod || mod.split(';').map(s => s.trim()).includes(o.key))
        .map(o => o.value || o.key);
    }
  }
};
