import './App.css';
import React from 'react'
import { FormControl, Form } from 'react-bootstrap';

import assess from './conditions';
import handlers from './handlers';

import process from './pattern-processor'

const templates = require('./templates.json');

const VariablesInput = ({ variables, values, onChange }) => {
  return variables
    .filter(v => assess(v.definition.condition, values))
    .map(({ definition, handler }) => handler.input(definition, values[definition.placeholder], x => onChange(definition.placeholder, x), definition.placeholder))
}

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.processTemplate(props.template)
  }

  processTemplate(template) {
    // hydrate variables with handlers
    const variables = template.variables.map(v => ({ definition: v, handler: handlers[v.type] }));
    // set pattern
    const pattern = template.pattern;
    // seed values
    const values = variables
      .filter(v => v.definition.placeholder)
      .reduce((p, v) => Object.assign(p, { [v.definition.placeholder]: v.handler.seed }), {});

    return { variables, pattern, values };
  }

  render() {
    return (
      <>
        <div className="row">
          <Form className="col-12 pt-3">
            <Form.Row>
              <Form.Label className="col-2">Template:</Form.Label>
              <FormControl as="select" className="col-10"></FormControl>
            </Form.Row>
          </Form>
        </div>
        <div className="row py-3">
          <div className="col-3">
            <div className="sticky-top">
              <VariablesInput variables={this.state.variables} values={this.state.values} onChange={(key, value) => this.setState({ values: Object.assign(this.state.values, { [key]: value }) })} />
            </div>
          </div>
          <div className="col">
            <TextResult pattern={this.state.pattern} variables={this.state.variables} values={this.state.values} />
            <hr />
            <FormControl as="textarea" value={this.state.pattern} onChange={e => this.setState({ pattern: e.target.value })} />
          </div>
        </div>
      </>
    )
  }
}

function TextResult(props) {
  function getText(pattern, variables, values) {
    return process(
      pattern,
      variables.filter(({ definition }) => assess(definition.condition, values)),
      values
    );
  }

  return (
    <FormControl as="textarea" readOnly={true} style={{ width: "100%", height: "100%" }} value={getText(props.pattern, props.variables, props.values)} />
  )
}

function App() {
  return (
    <div className="container">
      <Container template={templates[0]} />
    </div>
  );
}

export default App;
