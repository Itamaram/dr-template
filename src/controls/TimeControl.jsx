import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import { FormGroup, FormLabel } from 'react-bootstrap';
import { format, parse } from 'date-fns';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css"; // Import the custom CSS file

function TimeControl(props) {
  const { definition, values, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { display, placeholder, hide, default: defaultValue } = definition;
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    const selectedValue = values[0]?.value;
    if (selectedValue) {
      setSelectedTime(parse(selectedValue, 'h:mm aa', new Date()));
    }
  }, [values]);

  useEffect(() => {
    if (!editMode && defaultValue && values.length === 0) {
      onChange([{ value: defaultValue }]);
    }
  }, [editMode, defaultValue, onChange, values]);

  const handleTimeChange = (date) => {
    if (date) {
      setSelectedTime(date);
      onChange([{ value: format(date, 'h:mm aa') }]);
    } else {
      setSelectedTime(null);
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
        controlType="Time" // Pass control type
      >
        {/* Any additional edit controls can be added here */}
      </DraggableVariable>
    );
  }

  return hide || (
    <FormGroup>
      <FormLabel>{display || placeholder}</FormLabel>
      <DatePicker
        selected={selectedTime}
        onChange={handleTimeChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="h:mm aa"
        className="custom-datepicker" // Apply the custom CSS class
      />
    </FormGroup>
  );
}

export const handler = {
  type: 'time',
  render: function (definition, current, onChange, editMode, editControl, placeholders, index, moveVariable, variables, selectedVariable, setSelectedVariable, deleteVariable) {
    return (
      <TimeControl
        definition={definition}
        values={current}
        onChange={onChange}
        editMode={editMode}
        editControl={editControl}
        placeholders={placeholders}
        index={index}
        moveVariable={moveVariable}
        variables={variables} // Pass variables to TimeControl
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
