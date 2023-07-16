import React, { useEffect } from 'react';
import DatePicker from "react-datepicker";
import { FormGroup, FormLabel } from 'react-bootstrap';
import { format, addDays, parse } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css"; // Import the custom CSS file

function DateTimeControl(props) {
  const { definition, values, onChange } = props;
  const { display, placeholder, hide } = definition;

  useEffect(() => {
    const selectedValue = values[0]?.value;
    if (selectedValue && !isNaN(selectedValue)) {
      const daysToAdd = parseInt(selectedValue, 10);
      const newDate = addDays(new Date(), daysToAdd);
      const formattedDate = format(newDate, 'dd/MM/yyyy h:mm aa');
      if (selectedValue !== formattedDate) {
        onChange([formattedDate]);
      }
    }
  }, [values, onChange]);

  const handleDateChange = (date) => {
    if (date) {
      const formattedDate = format(date, 'dd/MM/yyyy h:mm aa');
      if (values[0]?.value !== formattedDate) {
        onChange([{value: formattedDate}]);
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
  render: function (definition, current, onChange) {
    return <DateTimeControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
  },
  getValues: function (variable, values, mod) {
    if (values && values.length > 0) {
      return values[0].value;
    }
    return '';
  }
};
