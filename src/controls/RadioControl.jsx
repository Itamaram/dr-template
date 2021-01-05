import React from 'react'
import { FormCheck, FormGroup, FormLabel, Row, Col } from 'react-bootstrap';

function RadioControl(props) {
    const { options, display, placeholder, inline, fixed } = props.definition;

    const option = o => (
        <FormCheck type="radio"
            name={placeholder}
            onChange={() => { props.onChange(o.key) }}
            inline={inline}
            value={o.key}
            label={o.key}
            checked={props.values.includes(o.key)}
            key={o.key}
        />
    )

    if (fixed) {
        return (
            <Row>
                <FormLabel>{display || placeholder}</FormLabel>
                {
                    options.map(o => (
                        <Col sm={2}>
                            {option(o)}
                        </Col>
                    ))
                }
            </Row>
        )
    }

    return (
        <FormGroup>
            <FormLabel>{display || placeholder}</FormLabel>
            {
                options.map(option)
            }
        </FormGroup>
    )
}

export const handler = {
    type: 'radio',
    render: function (definition, current, onChange) {
        return <RadioControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
    },
    getValues: function (variable, values, mod) {
        return variable.options
            .filter(o => values.includes(o.key) && (!mod || o.key === mod))
            .map(o => o.value || o.key);
    }
}