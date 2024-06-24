import React, { useEffect } from 'react';
import DatePicker from "react-datepicker";
import { FormGroup, FormLabel } from 'react-bootstrap';
import { format, addDays, parse } from 'date-fns';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css"; // Import the custom CSS file

function DateTimeControl(props) {
  const { definition, values, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { display, placeholder, hide, default: defaultValue } = definition;

  useEffect(() => {
    const selectedValue = values[0]?.value;
    if (!editMode && selectedValue && !isNaN(selectedValue)) {
      const daysToAdd = parseInt(selectedValue, 10);
      const newDate = addDays(new Date(), daysToAdd);
      const formattedDate = format(newDate, 'dd/MM/yyyy h:mm aa');
      if (selectedValue !== formattedDate) {
        onChange([{ value: formattedDate }]);
      }
    }
  }, [values, onChange, editMode]);

  useEffect(() => {
    if (!editMode && defaultValue && values.length === 0) {
      onChange([{ value: defaultValue }]);
    }
  }, [editMode, defaultValue, onChange, values]);

  const handleDateChange = (date) => {
    if (date) {
      const formattedDate = format(date, 'dd/MM/yyyy h:mm aa');
      if (values[0]?.value !== formattedDate) {
        onChange([{ value: formattedDate }]);
      }
    } else {
      onChange([]);
    }
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
        showModels={['display', 'condition', 'placeholder']} // Specify which models to show
        variables={variables} // Pass variables to DraggableVariable
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        controlType="DateTime" // Pass control type
      >
        {/* Any additional edit controls can be added here */}
      </DraggableVariable>
    );
  }

  return hide || (
    <FormGroup>
      <FormLabel>{display || placeholder}</FormLabel>
      <DatePicker
        todayButton="TODAY"
        showTimeSelect
        selected={values[0]?.value ? parse(values[0]?.value, 'dd/MM/yyyy h:mm aa', new Date()) : null}
        dateFormat="dd/MM/yyyy h:mm aa"
        onChange={handleDateChange}
        className="custom-datepicker" // Apply the custom CSS class
      />
    </FormGroup>
  );
}

export const handler = {
  type: 'datetime',
  render: function (definition, current, onChange, editMode, editControl, placeholders, index, moveVariable, variables, selectedVariable, setSelectedVariable, deleteVariable) {
    return (
      <DateTimeControl
        definition={definition}
        values={current}
        onChange={onChange}
        editMode={editMode}
        editControl={editControl}
        placeholders={placeholders}
        index={index}
        moveVariable={moveVariable}
        variables={variables} // Pass variables to DateTimeControl
        deleteVariable={deleteVariable} // Pass deleteVariable function
        selectedVariable={selectedVariable} // Pass selectedVariable
        setSelectedVariable={setSelectedVariable} // Pass setSelectedVariable
        key={definition.placeholder}
      />
    );
  },
  getValues: function (variable, values, mod) {
    if (values && values.length > 0) {
      return values[0].value;
    }
    return '';
  }
};
