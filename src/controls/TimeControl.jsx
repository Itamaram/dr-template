import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import { FormGroup, FormLabel } from 'react-bootstrap';
import { format, parse } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css"; // Import the custom CSS file

function TimeControl(props) {
  const { definition, values, onChange } = props;
  const { display, placeholder, hide } = definition;
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    const selectedValue = values[0]?.value;
    if (selectedValue) {
      setSelectedTime(parse(selectedValue, 'h:mm aa', new Date()));
    }
  }, [values]);

  const handleTimeChange = (date) => {
    if (date) {
      setSelectedTime(date);
      onChange([{value: format(date, 'h:mm aa')}]);
    } else {
      setSelectedTime(null);
      onChange([]);
    }
  };

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
      return values[0].value;
    }
    return '';
  }
};
