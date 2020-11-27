import logo from './logo.svg';
import './App.css';
import * as template from './template.json';
import React from 'react'

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
      <input type="text" onChange={this.handleChange}></input>
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
    return this.props.options.map((o, i) => (
      <div>
        <input type="radio" id={`${this.props.name}${i}`} name={this.props.name} value={o.value} onChange={this.handleChange} />
        <label htmlFor={`${this.props.name}${i}`}>{o.key}</label>
      </div>
    ));
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
    return (
      <select onChange={this.handleChange}>
        <option></option>
        {
          this.props.options.map(o => (<option value={o.value || o.key}>{o.key}</option>))
        }
      </select>
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
      () => this.props.onChange(this.props.name, this.format(this.props.options, this.state))
    );
  }

  render() {
    return this.props.options.map(o => (
      <div>
        <input type="checkbox" name={o.key} value={o.value || o.key} onChange={this.handleChange} />
        {o.key}
      </div>
    ))
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
          return (<CheckboxInput name={key} options={value.options} onChange={this.handleChange} />)
        case "radio":
          return (<RadioInput name={key} options={value.options} onChange={this.handleChange} />)
        case "dropdown":
          return (<DropdownInput name={key} options={value.options} onChange={this.handleChange} />)
        case "text":
        default:
          return (<TextInput name={key} onChange={this.handleChange} />)
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
      <div>
        <InputCollection onChange={this.handleChange} />
        <TextResult placeholders={this.state} />
      </div>
    )
  }
}

function TextResult(props) {
  function interpolate(text, placeholders) {
    return text.replace(/{(.*?)}/g, (_, p1) => placeholders[p1] || "");
  }

  return (
    <div>{interpolate(template.text, props.placeholders)}</div>
  )
}

function App() {
  return (
    <div className="App">
      <Container />
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
