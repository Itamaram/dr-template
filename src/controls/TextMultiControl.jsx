import React, { useState, useRef, useEffect } from 'react';
import { FormGroup, FormLabel, FormControl } from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import

function TextMultiControl(props) {
  const { definition, values, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { display, placeholder, hide, default: defaultValue } = definition;
  const inputRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [localValue, setLocalValue] = useState(values[0]?.value.replace(/<br>/g, '\n') || '');

  const handleInputChange = (e) => {
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    setLocalValue(e.target.value);
    onChange([{ value: e.target.value.replace(/\r?\n/g, '<br>') }]);
  };

  const handleDefaultChange = (e) => {
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    editControl(placeholder, display, hide, e.target.value.replace(/\r?\n/g, '<br>'), placeholder, definition.condition, {});
  };

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== localValue) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [cursorPosition, localValue]);

  useEffect(() => {
    setLocalValue(values[0]?.value.replace(/<br>/g, '\n') || '');
  }, [values]);

  if (!editMode && hide) {
    return null;
  }

  return (
    <FormGroup>
      {editMode ? (
        <DraggableVariable
          variable={{ definition, handler: props.handler }}
          index={index}
          moveVariable={moveVariable}
          editMode={editMode}
          onChange={onChange}
          editControl={editControl}
          placeholders={placeholders}
          deleteVariable={deleteVariable} // Pass deleteVariable function
          showModels={['display', 'hide', 'condition', 'placeholder']} // Specify which models to show
          variables={variables} // Pass variables to DraggableVariable
          selectedVariable={selectedVariable} // Pass selectedVariable
          setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
          controlType="Text Multi" // Pass control type
        >
          <FormGroup>
            <FormLabel>Default Value</FormLabel>
            <FormControl
              as="textarea"
              rows={5}
              value={(defaultValue ? defaultValue.replace(/<br>/g, '\n') : '') || ''}
              onChange={handleDefaultChange}
              placeholder="Enter default text"
              className="my-textarea"
              ref={inputRef} // Attach ref to the input
            />
          </FormGroup>
        </DraggableVariable>
      ) : (
        <>
          <FormLabel>{display || placeholder}</FormLabel>
          <FormControl
            as="textarea"
            rows={5}
            value={localValue}
            onChange={handleInputChange}
            className="my-textarea"
            ref={inputRef} // Attach ref to the input
          />
        </>
      )}
    </FormGroup>
  );
}

export const handler = {
  type: 'textmulti',
  render: function (definition, current, onChange, editMode, editControl, placeholders, index, moveVariable, variables, selectedVariable, setSelectedVariable, deleteVariable) {
    return (
      <TextMultiControl
        definition={definition}
        values={current}
        onChange={onChange}
        editMode={editMode}
        editControl={editControl}
        placeholders={placeholders}
        index={index}
        moveVariable={moveVariable}
        variables={variables} // Pass variables to TextMultiControl
        deleteVariable={deleteVariable} // Pass deleteVariable function
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        key={definition.placeholder}
      />
    );
  },
  getValues: function (variable, values, mod) {
    return values.map(({ value }) => value);
  }
};
