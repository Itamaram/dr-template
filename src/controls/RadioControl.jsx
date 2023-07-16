import React from 'react'
import { FormCheck, FormLabel, Row, Col, FormGroup } from 'react-bootstrap';

function RadioControl(props) {
    const { options, display, placeholder, inline, fixed } = props.definition;

    const option = o => (
        <FormCheck type="radio"
            name={placeholder}
            onChange={() => props.onChange([{value: o.key}])}
            inline={inline}
            value={o.key}
            label={o.key}
            checked={props.values.map(({value}) => value).includes(o.key)}
        />
    )

    return (
        <FormGroup>
            {
                inline
                    ? (
                        <Row>
                            <Col>
                                <FormLabel>{display || placeholder}</FormLabel>
                            </Col>
                            {
                                options.map(o => <Col key={o.key}>{option(o)}</Col>)
                            }
                            {fixed
                                ? [...Array(fixed - options.length).keys()].map(i => (<Col key={`fixed-${i}`}></Col>))
                                : <></>}
                        </Row>
                    )
                    : (
                        <>
                            <FormLabel>{display || placeholder}</FormLabel>
                            {
                                options.map(o => option(o))
                            }
                        </>
                    )
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
            .filter(o => values.map(({ value }) => value).includes(o.key) && (!mod || o.key === mod))
            .map(o => o.value || o.key);
    }
}