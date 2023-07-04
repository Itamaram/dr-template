import React, { useEffect } from 'react';
import DatePicker from "react-datepicker";
import { FormGroup, FormLabel } from 'react-bootstrap';
import { format, addDays, parse } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css"; // Import the custom CSS file

function DateControl(props) {
  const { definition, values, onChange } = props;
  const { display, placeholder, hide } = definition;

  useEffect(() => {
    const selectedValue = values[0];
    if (selectedValue && !isNaN(selectedValue)) {
      const daysToAdd = parseInt(selectedValue, 10);
      const newDate = addDays(new Date(), daysToAdd);
      const formattedDate = format(newDate, 'dd/MM/yyyy');
      if (selectedValue !== formattedDate) {
        onChange([formattedDate]);
      }
    }
  }, [values, onChange]);

  const handleDateChange = (date) => {
    if (date) {
      const formattedDate = format(date, 'dd/MM/yyyy');
      if (values[0] !== formattedDate) {
        onChange([formattedDate]);
      }
    } else {
      onChange([]);
    }
  };

  return hide || (
    <FormGroup>
      <FormLabel>{display || placeholder}</FormLabel>
      <DatePicker
        todayButton="TODAY"
        closeOnScroll={true}
        selected={values[0] ? parse(values[0], 'dd/MM/yyyy', new Date()) : null}
        dateFormat="dd/MM/yyyy"
        onChange={handleDateChange}
        className="custom-datepicker" // Apply the custom CSS class
      />
    </FormGroup>
  );
}

export const handler = {
  type: 'date',
  render: function (definition, current, onChange) {
    return <DateControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
  },
  getValues: function (variable, values, mod) {
    if (values && values.length > 0) {
      return values[0];
    }
    return '';
  }
};
