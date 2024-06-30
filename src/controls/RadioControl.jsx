import React, {useRef, useEffect } from 'react';
import { FormCheck, FormLabel, Row, Col, FormGroup} from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import

function RadioControl(props) {
  const { definition, values = [], onChange, editMode, editControl, placeholders, index, moveVariable, deleteVariable, variables, selectedVariable, setSelectedVariable } = props;
  const { options, display, placeholder, inline = false, fixed, default: defaultValue } = definition;

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
        showModels={['display', 'inline', 'condition', 'placeholder', 'options']} // Specify which models to show
        variables={variables} // Pass variables to DraggableVariable
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        controlType="Radio" // Pass control type
      >
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
