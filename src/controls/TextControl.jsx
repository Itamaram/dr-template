import React, { useState, useRef, useEffect } from 'react';
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable';

function TextControl(props) {
  const { definition, values, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { display, placeholder } = definition;
  const inputRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [localValue, setLocalValue] = useState(values[0]?.value || '');

  const handleInputChange = (e) => {
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    setLocalValue(e.target.value);
    onChange([{ value: e.target.value }]);
  };

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== localValue) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [cursorPosition, localValue]);

  useEffect(() => {
    setLocalValue(values[0]?.value || '');
  }, [values]);

  if (!editMode && definition.hide) {
    return null;
  }

  return (
    <FormGroup>
      {editMode ? (
        <DraggableVariable
          variable={{
            definition,
            handler: {
              render: (def, vals, onChange) => (
                <FormControl
                  type="text"
                  value={vals[0]?.value || ''}
                  onChange={handleInputChange}
                  ref={inputRef} // Attach ref to the input
                />
              ),
            },
          }}
          index={index}
          moveVariable={moveVariable}
          editMode={editMode}
          onChange={onChange}
          editControl={editControl}
          placeholders={placeholders}
          deleteVariable={deleteVariable} 
          showModels={['display', 'hide', 'default', 'condition', 'placeholder']} 
          variables={variables}  
          selectedVariable={selectedVariable} 
          setSelectedVariable={setSelectedVariable} 
          controlType="Text" 
        />
      ) : (
        <>
          <FormLabel>{display || placeholder}</FormLabel>
          <FormControl
            type="text"
            value={localValue}
            onChange={handleInputChange}
            ref={inputRef} // Attach ref to the input
          />
        </>
      )}
    </FormGroup>
  );
}

export const handler = {
  type: 'text',
  render: (definition, current, onChange, editMode, editControl, placeholders, index, moveVariable, variables, selectedVariable, setSelectedVariable, deleteVariable) => (
    <TextControl
      definition={definition}
      values={current}
      onChange={onChange}
      editMode={editMode}
      editControl={editControl}
      placeholders={placeholders}
      index={index}
      moveVariable={moveVariable}
      variables={variables}  
      deleteVariable={deleteVariable} 
      selectedVariable={selectedVariable} 
      setSelectedVariable={setSelectedVariable} 
      key={definition.placeholder}
    />
  ),
  getValues: (variable, values = []) => values.map(({ value }) => value),
};
