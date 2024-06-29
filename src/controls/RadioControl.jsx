import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { FormCheck, FormLabel, Row, Col, FormGroup, FormControl, Button } from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import

function RadioControl(props) {
  const { definition, values = [], onChange, editMode, editControl, placeholders, index, moveVariable, deleteVariable, variables, selectedVariable, setSelectedVariable } = props;
  const { options, display, placeholder, inline = false, fixed, default: defaultValue } = definition;
  const inputRefs = useRef([]);

  const [cursorPositions, setCursorPositions] = useState(options.map(() => 0));
  const [localOptions, setLocalOptions] = useState(options);
  const [localDefaultValue, setLocalDefaultValue] = useState(defaultValue);

  const option = o => (
    <FormCheck
      type="radio"
      name={placeholder}
      onChange={() => onChange([{ value: o.key }])}
      inline={inline}
      value={o.key}
      label={o.key} // Display key here
      checked={values.map(({ value }) => value).includes(o.key)}
      key={o.key}
    />
  );

  const handleOptionChange = (index, field, value) => {
    const oldKey = options[index].key;
    const updatedOptions = options.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt));
    const updatedFields = { options: updatedOptions };

    if (field === 'key') {
      updatedFields.oldKey = oldKey;
      updatedFields.newKey = value;
    }

    editControl(placeholder, display, inline, localDefaultValue, placeholder, definition.condition, updatedFields);
    setLocalOptions(updatedOptions);
  };

  const handleAddOption = () => {
    const updatedOptions = [...options, { key: 'new_option', value: 'New Option' }];
    editControl(placeholder, display, inline, localDefaultValue, placeholder, definition.condition, { options: updatedOptions });
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
      const newDefaultValue = oldKey === defaultValue ? '' : defaultValue;
      editControl(placeholder, display, inline, newDefaultValue, placeholder, definition.condition, { options: updatedOptions, oldKey, newKey: '' }, action);
      setLocalOptions(updatedOptions);
      setLocalDefaultValue(newDefaultValue);
    } else {
      const updatedOptions = options.filter((_, i) => i !== index);
      const newDefaultValue = oldKey === defaultValue ? '' : defaultValue;
      editControl(placeholder, display, inline, newDefaultValue, placeholder, definition.condition, { options: updatedOptions });
      setLocalOptions(updatedOptions);
      setLocalDefaultValue(newDefaultValue);
    }
  };

  const handleDefaultChange = key => {
    const newDefaultValue = key === defaultValue ? '' : key;
    editControl(placeholder, display, inline, newDefaultValue, placeholder, definition.condition, {});
    setLocalDefaultValue(newDefaultValue);
  };

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

  // Ensure default value is set when switching to non-edit mode
  const prevEditMode = useRef(editMode);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current || (!editMode && prevEditMode.current)) {
      onChange([{ value: defaultValue }]);
      isFirstRender.current = false;
    }
    prevEditMode.current = editMode;
  }, [editMode, defaultValue, onChange, options]); // Added missing dependencies

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
        showModels={['display', 'inline', 'condition', 'placeholder']} // Specify which models to show
        variables={variables} // Pass variables to DraggableVariable
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        controlType="Radio" // Pass control type
      >
        <FormGroup>
          {localOptions.map((o, i) => (
            <Row key={i} onClick={() => handleDefaultChange(o.key)} style={{ cursor: 'pointer', backgroundColor: o.key === localDefaultValue ? 'lightblue' : 'inherit' }}>
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
                <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleRemoveOption(i); }}>Remove</Button>
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
      {inline ? (
        <Row>
          <Col>
            <FormLabel>{display || placeholder}</FormLabel>
          </Col>
          {options.map(o => (
            <Col key={o.key}>{option(o)}</Col>
          ))}
          {fixed
            ? [...Array(fixed - options.length).keys()].map(i => (
                <Col key={`fixed-${i}`}></Col>
              ))
            : null}
        </Row>
      ) : (
        <>
          <FormLabel>{display || placeholder}</FormLabel>
          {options.map(o => option(o))}
        </>
      )}
    </FormGroup>
  );
}

export const handler = {
  type: 'radio',
  render: function (definition, current, onChange, editMode, editControl, placeholders, index, moveVariable, variables, selectedVariable, setSelectedVariable, deleteVariable) {
    return (
      <RadioControl
        definition={definition}
        values={current}
        onChange={onChange}
        editMode={editMode}
        editControl={editControl}
        placeholders={placeholders}
        index={index}
        moveVariable={moveVariable}
        variables={variables} // Pass variables to RadioControl
        deleteVariable={deleteVariable} // Pass deleteVariable function
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        key={definition.placeholder}
      />
    );
  },
  getValues: function (variable, values = [], mod) {
    if (!Array.isArray(values)) {
      values = [];
    }
    return variable.options
      .filter(o => values.map(({ value }) => value).includes(o.key) && (!mod || o.key === mod))
      .map(o => o.value || o.key);
  }
};
