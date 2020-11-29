import './App.css';
//import * as template from './template.json';
import React, { useState } from 'react'
import { FormCheck, FormControl, FormGroup, FormLabel } from 'react-bootstrap';

const template = require('./template.json')

const TextInput = (props) => {
  return (
    <FormGroup>
      <FormLabel>{props.config.display || props.name}</FormLabel>
      <FormControl type="text" onChange={e => props.onChange(props.name, e.target.value)}></FormControl>
    </FormGroup>
  );
}

const RadioInput = (props) => {
  const [value, setValue] = useState();
  const { options, display } = props.config;
  return (
    <FormGroup>
      <FormLabel>{display || props.name}</FormLabel>
      {
        options.map((o, i) => {
          const id = `input-radio-${props.name}-${i}`;
          return (
            <FormCheck type="radio"
              id={id}
              checked={value === o.value}
              name={props.name}
              onChange={() => { setValue(o.value); props.onChange(props.name, o.value) }}
              value={o.value}
              label={o.key}
            />
          )
        })}
    </FormGroup>
  )
}

const DropdownInput = (props) => {
  const { options, display } = props.config;
  return (
    <FormGroup>
      <FormLabel>{display || props.name}</FormLabel>
      <FormControl as="select" onChange={(e) => props.onChange(props.name, e.target.value)}>
        <option></option>
        {
          options.map(o => (<option value={o.value || o.key}>{o.key}</option>))
        }
      </FormControl>
    </FormGroup>
  )
}

class CheckboxInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {};
  }

  format(options, state) {
    let values = options.map(o => state[o.key]).filter(v => v);
    switch (values.length) {
      case 0: return '';
      case 1: return values[0];
      default:
        const last = values.pop();
        return values.join(', ') + ' and ' + last;
    }
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.checked ? e.target.value : '' },
      () => this.props.onChange(this.props.name, this.format(this.props.config.options, this.state))
    );
  }

  render() {
    const { display, options } = this.props.config;
    return (
      <FormGroup>
        <FormLabel>{display || this.props.name}</FormLabel>
        {
          options.map(o => (
            <FormCheck
              type="checkbox"
              name={o.key}
              value={o.value || o.key}
              onChange={this.handleChange}
              label={o.key}
            />
          ))
        }
      </FormGroup>
    )
  }
}

const InputCollection = (props) => {
  return Object.entries(template.placeholders).map(([key, value]) => {
    switch (value.type) {
      case "checkbox":
        return (<CheckboxInput name={key} config={value} onChange={props.onChange} />)
      case "radio":
        return (<RadioInput name={key} config={value} onChange={props.onChange} />)
      case "dropdown":
        return (<DropdownInput name={key} config={value} onChange={props.onChange} />)
      case "text":
      default:
        return (<TextInput name={key} config={value} onChange={props.onChange} />)
    }
  });
}

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.keys(props.template).reduce((p, key) => Object.assign(p, { [key]: '' }), { template: props.template.text });
  }

  render() {
    return (
      <div className="row py-3">
        <div className="col-3">
          <div className="sticky-top">
            <InputCollection onChange={(key, value) => this.setState({ [key]: value })} />
          </div>
        </div>
        <div className="col">
          <TextResult placeholders={this.state} template={this.state.template} />
          <hr />
          <FormControl as="textarea" value={this.state.template} onChange={e => this.setState({ template: e.target.value })} />
        </div>
      </div>
    )
  }
}

function TextResult(props) {
  function interpolate(text, placeholders) {
    return text.replace(/{(.*?)}/g, (_, p1) => placeholders[p1] || "");
  }

  return (
    <FormControl as="textarea" readOnly={true} style={{ width: "100%", height: "100%" }} value={interpolate(props.template, props.placeholders)} />
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
