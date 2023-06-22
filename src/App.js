import './App.css';
import React from 'react';
import { FormControl, Form, Row, Col } from 'react-bootstrap';
import parse from 'html-react-parser';

import assess from './conditions';
import handlers from './handlers';

import process from './pattern-processor';
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
    if (arr1?.length !== arr2?.length)
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
        return;

      const target = [definition.default || []].flat();

      if (!this.arrayEquals(values[definition.placeholder], target))
        this.onChange(definition.placeholder, target);
    });
  }

  render() {
    const { tindex, variables, values, pattern } = this.state;

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 py-4">
            <Form>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>Template:</Form.Label>
                <Col sm={10}>
                  <Form.Control as="select" value={tindex} onChange={e => {
                    const newTindex = e.target.value;
                    this.setState({
                      tindex: newTindex,
                      ...this.processTemplate(templates[newTindex])
                    });
                  }}>
                    {templates.map((template, index) => (
                      <option key={index} value={index}>{template.name}</option>
                    ))}
                  </Form.Control>
                </Col>
              </Form.Group>
            </Form>
          </div>
        </div>
        <div className="row">
          <div className="col py-4">
            <div className="sticky-top">
              <ControlsPane variables={variables} values={values} onChange={this.onChange} />
            </div>
          </div>
          <div className="col py-4">
            <div className="sticky-sidebar">
              <div className="card border-0 p-3">
                <div className="sticky-top">
                  <button className="btn btn-primary mb-3 w-100" onClick={() => {
                    const copy = (str) => {
                      const listener = (e) => {
                        e.clipboardData.setData("text/html", str);
                        e.clipboardData.setData("text/plain", str);
                        e.preventDefault();
                      };
                      document.addEventListener("copy", listener);
                      document.execCommand("copy");
                      document.removeEventListener("copy", listener);
                    };
                    copy(document.getElementById('template').innerHTML);
                    alert("Text copied to clipboard!");
                  }}>Copy to Clipboard</button>
                </div>
                <TextResult pattern={pattern} variables={variables} values={values} />
                <hr />
                <FormControl as="textarea" rows={10} value={pattern} onChange={e => this.setState({ pattern: e.target.value })} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
    <div id="template" className="card p-3" style={{ width: "100%" }}>
      {parse(getText(props))}
    </div>
  )
}

function App() {
  return (
    <div className="container" style={{ maxWidth: "90%" }}>
      <Container />
    </div>
  );
}

export default App;
