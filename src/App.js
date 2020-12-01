import './App.css';
import React from 'react'
import { FormControl, Form } from 'react-bootstrap';

import assess from './conditions';
import handlers from './handlers';

const template = require('./template.json');

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
    this.state = Object.entries(props.template.variables)
      .reduce((p, [key, value]) => Object.assign(p, { [key]: handlers[value.type].seed }), { pattern: props.template.pattern });
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
              <InputCollection template={this.props.template} values={this.state} onChange={(key, value) => this.setState({ [key]: value })} />
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
    return Object.entries(variables)
      .filter(([_, variable]) => assess(variable.condition, values))
      .map(([name, variable]) => [name, handlers[variable.type].format(variable, values[name])])
      .reduce((accum, [key, value]) => Object.assign(accum, { [key]: value }), {});
  }

  return (
    <FormControl as="textarea" readOnly={true} style={{ width: "100%", height: "100%" }} value={interpolate(props.pattern, compute(props.variables, props.values))} />
  )
}

function App() {
  return (
    <div className="container">
      <Container template={template} />
    </div>
  );
}

export default App;
