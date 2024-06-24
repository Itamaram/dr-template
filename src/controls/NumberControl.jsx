import React, { useEffect } from 'react';
import { FormControl, FormGroup, FormLabel, Row, Col } from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import

function NumberControl(props) {
  const { definition, values, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { display, placeholder, hide, text, default: defaultValue = '' } = definition;

  const value = values[0]?.value || '';

  // Remove the text part from the value
  const numericValue = value.split(' ')[0];

  useEffect(() => {
    if (!editMode && defaultValue && values.length === 0) {
      const numericDefaultValue = defaultValue.replace(/[^0-9.]/g, '');
      const valueWithText = numericDefaultValue ? text ? `${numericDefaultValue} ${text}` : `${numericDefaultValue}` : '';
      onChange([{ value: valueWithText }]);
    }
  }, [editMode, defaultValue, onChange, text, values]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9.]/g, '');
    const valueWithText = numericValue ? text ? `${numericValue} ${text}` : `${numericValue}` : '';
    onChange([{ value: valueWithText }]);
  };

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
        showModels={['display', 'default', 'hide', 'condition', 'placeholder']} // Specify which models to show
        variables={variables} // Pass variables to DraggableVariable
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        controlType="Number" // Pass control type
      >

      </DraggableVariable>
    );
  }

  return hide || (
    <FormGroup>
      <FormLabel>{display || placeholder}</FormLabel>
      <Row>
        <Col xs={9}>
          <FormControl
            value={numericValue} // Only include the numeric value in the text box
            type="text"
            onChange={handleInputChange}
            pattern="[0-9.]*"
            inputMode="decimal"
          />
        </Col>
        <Col xs={3} className="d-flex align-items-center">
          <span>{text}</span>
        </Col>
      </Row>
    </FormGroup>
  );
}

export const handler = {
  type: 'number',
  render: function (definition, current, onChange, editMode, editControl, placeholders, index, moveVariable, variables, selectedVariable, setSelectedVariable, deleteVariable) {
    return (
      <NumberControl
        definition={definition}
        values={current}
        onChange={onChange}
        editMode={editMode}
        editControl={editControl}
        placeholders={placeholders}
        index={index}
        moveVariable={moveVariable}
        variables={variables} // Pass variables to NumberControl
        deleteVariable={deleteVariable} // Pass deleteVariable function
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        key={definition.placeholder}
      />
    );
  },
  getValues: function (variable, values, mod) {
    if (values && values.length > 0) {
      return values.map(({ value }) => value);
    }
    return '';
  }
};
