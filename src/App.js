import './App.css';
import React from 'react'
import { FormControl, Form } from 'react-bootstrap';

import assess from './conditions';
import handlers from './handlers';

const templates = require('./templates.json');

const VariablesInput = ({ variables, values, onChange }) => {
  return variables
    .filter(v => assess(v.condition, values))
    .map(v => handlers[v.type].input(v, values[v.placeholder], x => onChange(v.placeholder, x), v.placeholder))
}

const InputCollection = (props) => {
  return Object.entries(props.template.variables)
    .filter(([_, variable]) => assess(variable.condition, props.values))
    .map(([key, value]) => {
      const current = props.values[key];
      const handler = (v) => props.onChange(key, v);
      const config = { name: key, ...value };
      return handlers[value.type].input(config, current, handler, key);
    });
}

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.template.variables
      .reduce((p, v) => Object.assign(p, { [v.placeholder]: handlers[v.type].seed }), { pattern: props.template.pattern });
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
              <VariablesInput variables={this.props.template.variables} values={this.state} onChange={(key, value) => this.setState({ [key]: value })} />
            </div>
          </div>
          <div className="col">
            <TextResult pattern={this.state.pattern} variables={this.props.template.variables} values={this.state} />
            <hr />
            <FormControl as="textarea" value={this.state.pattern} onChange={e => this.setState({ pattern: e.target.value })} />
          </div>
        </div>
      </>
    )
  }
}

function TextResult(props) {
  function interpolate(pattern, variables) {
    return pattern.replace(/{(.*?)}/g, (_, p1) => variables[p1] || "").replace(/  +/g, ' ').trim();
  }

  function compute(variables, values) {
    return variables
      .filter(variable => assess(variable.condition, values))
      .map(variable => [variable.placeholder, handlers[variable.type].format(variable, values[variable.placeholder])])
      .reduce((accum, [key, value]) => Object.assign(accum, { [key]: value }), {});
  }

  return (
    <FormControl as="textarea" readOnly={true} style={{ width: "100%", height: "100%" }} value={interpolate(props.pattern, compute(props.variables, props.values))} />
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
