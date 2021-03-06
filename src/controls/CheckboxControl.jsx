import React from 'react'
import { Col, FormCheck, FormGroup, FormLabel, Row } from 'react-bootstrap';

function CheckboxControl(props) {
    const update = (box) => {
        if (box.checked)
            return props.values.concat(box.value);

        return props.values.filter(v => v !== box.value);
    }
    const { display, options, placeholder } = props.definition;

    const option = o => (
        <FormCheck
            type="checkbox"
            checked={props.values.includes(o.key)}
            name={placeholder}
            value={o.key}
            onChange={e => props.onChange(update(e.target))}
            label={o.key}
            key={o.key}
        />
    )

    if (props.fixed) {
        return (
            <Row>
                <FormLabel column>{display || placeholder}</FormLabel>
                {
                    options.map(o => (
                        <Col>
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
    type: 'checkbox',
    render: function (definition, current, onChange) {
        return <CheckboxControl definition={definition} values={current} onChange={onChange} key={definition.placeholder} />;
    },
    getValues: function (variable, values, mod) {
        return variable.options
            .filter(o => values.includes(o.key))
            .map(o => o.value || o.key);
    }
}