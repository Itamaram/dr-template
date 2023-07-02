import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import { FormGroup, FormLabel } from 'react-bootstrap';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css"; // Import the custom CSS file

function TimeControl(props) {
  const { definition, values, onChange } = props;
  const { display, placeholder, hide } = definition;
  // eslint-disable-next-line
  const [selectedTime, setSelectedTime] = useState(null);
  const [startDate, setStartDate] = useState(null);

  useEffect(() => {
    const selectedValue = values[0];
    if (selectedValue) {
      setSelectedTime(new Date(selectedValue));
    }
  }, [values]);

  const handleTimeChange = (date) => {
    setStartDate(date);
    onChange([format(date, 'h:mm aa')]);
};

  return hide || (
    <FormGroup>
      <FormLabel>{display || placeholder}</FormLabel>
      <DatePicker
      selected={startDate}
      onChange={(date) => handleTimeChange(date)}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      timeCaption="Time"
      dateFormat="h:mm aa"
    />
    </FormGroup>
  );
}

export const handler = {
  type: 'time',
  render: function (definition, current, onChange) {
    return <TimeControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
  },
  getValues: function (variable, values, mod) {
    if (values && values.length > 0) {
      return values[0];
    }
    return '';
  }
};
