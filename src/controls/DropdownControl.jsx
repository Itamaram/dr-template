import React, {useRef, useEffect } from 'react';
import { FormControl, FormGroup, FormLabel} from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import

function DropdownControl(props) {
  const { definition, values, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { options = [], display, placeholder, default: defaultValue = '' } = definition;

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
        showModels={['display', 'condition', 'placeholder', 'options']} // Specify which models to show
        variables={variables} // Pass variables to DraggableVariable
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        controlType="Dropdown" // Pass control type
      >
      </DraggableVariable>
    );
  }

  return (
    <FormGroup>
      <FormLabel>{display || placeholder}</FormLabel>
      <FormControl as="select" value={values[0]?.value || ''} onChange={e => onChange([{ value: e.target.value }])}>
        {[{ key: '' }, ...options].map(o =>
          <option value={o.key} key={o.key}>{o.key}</option>
        )}
      </FormControl>
    </FormGroup>
  );
}

export const handler = {
  type: 'dropdown',
  render: function (definition, current, onChange, editMode, editControl, placeholders, index, moveVariable, variables, selectedVariable, setSelectedVariable, deleteVariable) {
    return (
      <DropdownControl
        definition={definition}
        values={current}
        onChange={onChange}
        editMode={editMode}
        editControl={editControl}
        placeholders={placeholders}
        index={index}
        moveVariable={moveVariable}
        variables={variables} // Pass variables to DropdownControl
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
        ?.filter(o => values.map(({ value }) => value).includes(o.key))
        .filter(o => !mod || mod.split(';').map((s) => s.trim()).every((m) => m !== o.key))
        .map(o => o.value || o.key);
    } else {
      return variable.options
        ?.filter(o => values.map(({ value }) => value).includes(o.key))
        .filter(o => !mod || mod.split(';').map(s => s.trim()).includes(o.key))
        .map(o => o.value || o.key);
    }
  }
};
