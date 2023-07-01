import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import { format, addDays } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css"; // Import the custom CSS file

function DateControl(props) {
    const { definition, values, onChange } = props;
    const { display, placeholder, hide } = definition;
    const [startDate, setStartDate] = useState(null);

    useEffect(() => {
        const selectedValue = values[0];
        if (selectedValue && !isNaN(selectedValue)) {
            const daysToAdd = parseInt(selectedValue, 10);
            const newDate = addDays(new Date(), daysToAdd);
            setStartDate(newDate);
            onChange([format(newDate, 'dd/MM/yyyy')]);
        }
    }, [values, onChange]);

    const handleDateChange = (date) => {
        setStartDate(date);
        onChange([format(date, 'dd/MM/yyyy')]);
    };

    return hide || (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            <DatePicker
                todayButton="TODAY"
                closeOnScroll={true}
                selected={startDate}
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
