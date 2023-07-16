import React from 'react';
import { FormControl, FormGroup, FormLabel, Row, Col } from 'react-bootstrap';

function NumberControl(props) {
  const { display, placeholder, hide, text } = props.definition;
  const value = props.values[0]?.value || '';

  // Remove the text part from the value
  const numericValue = value.split(' ')[0];

  return hide || (
    <FormGroup>
      <FormLabel>{display || placeholder}</FormLabel>
      <Row>
        <Col xs={9}>
          <FormControl
            value={numericValue} // Only include the numeric value in the text box
            type="text"
            onChange={e => {
              const inputValue = e.target.value;
              const numericValue = inputValue.replace(/[^0-9.]/g, '');

              // Check if numericValue is empty before concatenating with text
              const valueWithText = numericValue ? `${numericValue} ${text}` : '';

              props.onChange([{value: valueWithText}]); // Include the concatenated value in the onChange callback
            }}
            pattern="[0-9.]*"
            inputMode="decimal"
          />
        </Col>
        <Col xs={3} className="d-flex align-items-center">
          <span>{text}</span>
        </Col>
      </Row>
    </FormGroup>
  );
}



export const handler = {
  type: 'number',
  render: function (definition, current, onChange) {
    return <NumberControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
  },
  getValues: function (variable, values, mod) {
    if (values && values.length > 0) {
      return values.map(({value}) => value);
    }
    return '';
  }
};
