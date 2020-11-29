import logo from './logo.svg';
import './App.css';
import * as template from './template.json';
import React from 'react'
import { FormCheck, FormControl, FormGroup, FormLabel } from 'react-bootstrap';

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onChange(this.props.name, e.target.value);
  }
  render() {
    return (
      <FormGroup>
        <FormLabel>{this.props.config.display || this.props.name}</FormLabel>
        <FormControl type="text" onChange={this.handleChange}></FormControl>
      </FormGroup>
    );
  }
}

class RadioInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onChange(this.props.name, e.target.value);
  }
  render() {
    const { options, display } = this.props.config;
    return (
      <FormGroup>
        <FormLabel>{display || this.props.name}</FormLabel>
        {
          options.map((o, i) => {
            const id = `input-radio-${this.props.name}-${i}`;
            return (
              <FormCheck type="radio"
                id={id}
                name={this.props.name}
                onChange={this.handleChange}
                value={o.value}
                label={o.key}
              />
            )
          })}
      </FormGroup>
    )
  }
}

class DropdownInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {};
  }

  handleChange(e) {
    this.props.onChange(this.props.name, e.target.value);
  }

  render() {
    const { options, display } = this.props.config;
    return (
      <FormGroup>
        <FormLabel>{display || this.props.name}</FormLabel>
        <FormControl as="select" onChange={this.handleChange}>
          <option></option>
          {
            options.map(o => (<option value={o.value || o.key}>{o.key}</option>))
          }
        </FormControl>
      </FormGroup>
    )
  }
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

class InputCollection extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(key, value) {
    this.props.onChange(key, value)
  }

  render() {
    return Object.entries(template.placeholders).map(([key, value]) => {
      switch (value.type) {
        case "checkbox":
          return (<CheckboxInput name={key} config={value} onChange={this.handleChange} />)
        case "radio":
          return (<RadioInput name={key} config={value} onChange={this.handleChange} />)
        case "dropdown":
          return (<DropdownInput name={key} config={value} onChange={this.handleChange} />)
        case "text":
        default:
          return (<TextInput name={key} config={value} onChange={this.handleChange} />)
      }
    });
  }
}

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.keys(template).reduce((p, key) => Object.assign(p, { [key]: '' }), {});
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    return (
      <div className="row py-3">
        <div className="col-3">
          <div className="sticky-top">
            <InputCollection onChange={this.handleChange} />
          </div>
        </div>
        <div className="col">
          <TextResult placeholders={this.state} />
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
    <textarea readOnly={true} style={{ width: "100%", height: "100%" }} value={interpolate(template.text, props.placeholders)} />
  )
}

function App() {
  return (
    <div className="container">
      <Container />
    </div>
  );
}

export default App;
