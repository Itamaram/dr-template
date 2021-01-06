import './App.css';
import React from 'react'
import { FormControl, Form } from 'react-bootstrap';

import assess from './conditions';
import handlers from './handlers';

import process from './pattern-processor'
import ControlsPane from './controls-pane';

const templates = require('./templates.json');

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tindex: 0, ...this.processTemplate(templates[0]) };

    this.onChange = this.onChange.bind(this);
  }

  processTemplate(template) {
    // hydrate variables with handlers
    const variables = template.variables.map(v => ({ definition: v, handler: handlers[v.type] }));
    // set pattern
    const pattern = template.pattern;
    // seed values
    const values = variables
      .filter(v => v.definition.placeholder)
      .reduce((p, v) => Object.assign(p, { [v.definition.placeholder]: [v.definition.default || []].flat() }), {});

    return { variables, pattern, values };
  }

  arrayEquals(arr1, arr2) {
    if (arr1.length !== arr2.length)
      return false;

    for (let i = 0; i < arr1.length; i++)
      if (arr1[i] !== arr2[i])
        return false;

    return true;
  }

  onChange(key, value) {
    this.setState(
      { values: Object.assign(this.state.values, { [key]: value }) },
      () => this.filterFields()
    );
  }

  filterFields() {
    const { variables, values } = this.state;

    variables.forEach(({ definition }) => {
      if (assess(definition.condition, values))
        return

      const target = [definition.default || []].flat();

      if (!this.arrayEquals(values[definition.placeholder], target))
        this.onChange(definition.placeholder, target);
    });
  }

  render() {
    return (
      <>
        <div className="row">
          <Form className="col-12 pt-3">
            <Form.Row>
              <Form.Label className="col-2">Template:</Form.Label>
              <FormControl as="select" className="col-10" defaultValue={this.state.tindex}
                onChange={e => this.setState({
                  tindex: e.target.value,
                  ...this.processTemplate(templates[e.target.value])
                })}>
                {templates.map((t, i) => <option value={i} key={i}>{t.name}</option>)}
              </FormControl>
            </Form.Row>
          </Form>
        </div>
        <div className="row py-3">
          <div className="col">
            <div className="sticky-top">
              <ControlsPane variables={this.state.variables} values={this.state.values} onChange={this.onChange} />
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
  function getText({ pattern, variables, values }) {
    return process(
      pattern,
      variables.filter(({ definition }) => assess(definition.condition, values)),
      values
    );
  }

  return (
    <FormControl as="textarea" readOnly={true} style={{ width: "100%", height: "100%" }} value={getText(props)} />
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
