import './App.css';
import React from 'react'
import { FormControl } from 'react-bootstrap';

import TextInput from './inputs/TextInput'
import RadioInput from './inputs/RadioInput'
import DropdownInput from './inputs/DropdownInput'
import CheckboxInput from './inputs/CheckboxInput'

const template = require('./template.json')

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
