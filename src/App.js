import './App.css';
import React from 'react'
import { FormControl } from 'react-bootstrap';

import TextInput from './inputs/TextInput'
import RadioInput from './inputs/RadioInput'
import DropdownInput from './inputs/DropdownInput'
import CheckboxInput from './inputs/CheckboxInput'

const template = require('./template.json')

const InputCollection = (props) => {
  return Object.entries(props.template.placeholders)
    .map(([key, value]) => {
      const current = props.values[key];
      const handler = (v) => props.onChange(key, v);
      const config = { name: key, ...value };
      switch (value.type) {
        case "checkbox":
          return <CheckboxInput config={config} value={current} onChange={handler} />;
        case "radio":
          return <RadioInput config={config} value={current} onChange={handler} />;
        case "dropdown":
          return <DropdownInput config={config} value={current} onChange={handler} />;
        case "text":
        default:
          return <TextInput config={config} value={current} onChange={handler} />;
      }
    });
}

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.entries(props.template.placeholders)
      .reduce((p, [key, value]) => Object.assign(p, { [key]: value.type === 'checkbox' ? [] : '' }), { pattern: props.template.text });
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
    return text.replace(/{(.*?)}/g, (_, p1) => placeholders[p1] || "");
  }

  function compute(definitions, variables) {
    return Object.entries(definitions)
      .filter(([_, definition]) => !definition.condition || variables[definition.condition.field] === definition.condition.equals)
      .map(([name, definition]) => {
        const value = variables[name];
        switch (definition.type) {
          case "checkbox":
            const format = () => {
              let values = definition.options.filter(o => value.includes(o.key)).map(o => o.value || o.key);
              switch (values.length) {
                case 0: return '';
                case 1: return values[0];
                default:
                  const last = values.pop();
                  return values.join(', ') + ' and ' + last;
              }
            }
            return [name, format(value)];
          case "radio":
          case "dropdown":
            const e = definition.options.filter(o => o.key === value)[0];
            return [name, e?.value || e?.key];
          case "text":
          default:
            return [name, value];
        }
      }).reduce((accum, [key, value]) => Object.assign(accum, { [key]: value }), {});
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
