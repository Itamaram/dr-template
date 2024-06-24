import React from 'react';
import { FormGroup, FormLabel, FormControl } from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import

function TextMultiControl(props) {
  const { definition, values, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { display, placeholder, hide, default: defaultValue } = definition;

  const handleInputChange = (e) => {
    onChange([{ value: e.target.value.replace(/\r?\n/g, '<br>') }]);
  };

  const handleDefaultChange = (e) => {
    editControl(placeholder, display, hide, e.target.value.replace(/\r?\n/g, '<br>'), placeholder, definition.condition, {});
  };

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
          </FormGroup>
          {editMode && (
            <FormGroup>
              <FormLabel>Default Value</FormLabel>
              <FormControl
                as="textarea"
                rows={5}
                value={(defaultValue ? defaultValue.replace(/<br>/g, '\n') : '') || ''}
                onChange={handleDefaultChange}
                placeholder="Enter default text"
                className="my-textarea"
              />
            </FormGroup>
          )}
        </DraggableVariable>
      ) : (
        <>
          <FormLabel>{display || placeholder}</FormLabel>
          <FormControl
            as="textarea"
            rows={5}
            value={(values[0]?.value ? values[0]?.value.replace(/<br>/g, '\n') : '') || ''}
            onChange={handleInputChange}
            className="my-textarea"
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
