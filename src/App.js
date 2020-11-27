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

class InputCollection extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(key, value) {
    this.props.onChange(key, value)
  }

  render() {
    return Object.entries(template.placeholders).map(([key, value]) =>
      <TextInput name={key} onChange={this.handleChange} />
    );
  }
}

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.keys(template).reduce((p, key) => Object.assign(p, { [key]: '' }), {});
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(key, value) {
    this.setState({[key]: value});
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
