import React from 'react';
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import

function TextControl(props) {
  const { definition, values, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { display, placeholder } = definition;

  if (!editMode && definition.hide) {
    return null;
  }

  const handleInputChange = (e) => {
    onChange([{ value: e.target.value }]);
  };

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
                  onChange={(e) => onChange([{ value: e.target.value }])}
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
          deleteVariable={deleteVariable} // Pass deleteVariable function
          showModels={['display', 'hide', 'default', 'condition', 'placeholder']} // Specify which models to show
          variables={variables}  // Pass variables to DraggableVariable
          selectedVariable={selectedVariable} // Pass selectedVariable
          setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
          controlType="Text" // Pass control type
        />
      ) : (
        <>
          <FormLabel>{display || placeholder}</FormLabel>
          <FormControl
            type="text"
            value={values[0]?.value || ''}
            onChange={handleInputChange}
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
      variables={variables}  // Pass variables to TextControl
      deleteVariable={deleteVariable} // Pass deleteVariable function
      selectedVariable={selectedVariable} // Pass selectedVariable
      setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
      key={definition.placeholder}
    />
  ),
  getValues: (variable, values = []) => values.map(({ value }) => value),
};
