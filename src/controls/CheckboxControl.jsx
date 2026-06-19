import React, {useRef, useEffect } from 'react';
import { Col, FormCheck, FormGroup, FormLabel, Row} from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import

function CheckboxControl(props) {
  const { definition, values, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { display, options = [], placeholder, fixed, default: defaultValues = [] } = definition;

  const update = ({ checked, value }) => {
    if (checked) return values.concat({ value });
    return values.filter(v => v.value !== value);
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
        showModels={['display', 'condition', 'placeholder', 'options']} // Specify which models to show
        variables={variables} // Pass variables to DraggableVariable
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        controlType="Checkbox" // Pass control type
      >
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
