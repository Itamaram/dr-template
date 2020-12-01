import './App.css';
import React from 'react'
import { FormControl } from 'react-bootstrap';

import assess from './conditions';
import handlers from './handlers';

const template = require('./template.json');

const InputCollection = (props) => {
  return Object.entries(props.template.placeholders)
    .filter(([_, definition]) => assess(definition.condition, props.values))
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
    this.state = Object.entries(props.template.placeholders)
      .reduce((p, [key, value]) => Object.assign(p, { [key]: handlers[value.type].seed }), { pattern: props.template.text });
  }

  render() {
    return (
      <div className="row py-3">
        <div className="col-3">
          <div className="sticky-top">
            <InputCollection template={this.props.template} values={this.state} onChange={(key, value) => this.setState({ [key]: value })} />
          </div>
        </div>
        <div className="col">
          <TextResult pattern={this.state.pattern} definitions={this.props.template.placeholders} variables={this.state} />
          <hr />
          <FormControl as="textarea" value={this.state.pattern} onChange={e => this.setState({ pattern: e.target.value })} />
        </div>
      </div>
    )
  }
}

function TextResult(props) {
  function interpolate(text, placeholders) {
    return text.replace(/{(.*?)}/g, (_, p1) => placeholders[p1] || "").replace(/  +/g, ' ').trim();
  }

  function compute(definitions, variables) {
    return Object.entries(definitions)
      .filter(([_, definition]) => assess(definition.condition, variables))
      .map(([name, definition]) => [name, handlers[definition.type].format(definition, variables[name])])
      .reduce((accum, [key, value]) => Object.assign(accum, { [key]: value }), {});
  }

  return (
    <FormControl as="textarea" readOnly={true} style={{ width: "100%", height: "100%" }} value={interpolate(props.pattern, compute(props.definitions, props.variables))} />
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
