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
    this.copyToClipboard = this.copyToClipboard.bind(this);
  }

  processTemplate(template) {
    // hydrate variables with handlers
    const variables = template.variables.map((v) => ({ definition: v, handler: handlers[v.type] }));
    // set pattern
    const pattern = template.pattern;
    // seed values
    const values = variables
      .filter((v) => v.definition.placeholder)
      .reduce((p, v) => Object.assign(p, { [v.definition.placeholder]: [v.definition.default || []].flat() }), {});

    return { variables, pattern, values };
  }

  arrayEquals(arr1, arr2) {
    if (arr1?.length !== arr2?.length) return false;

    for (let i = 0; i < arr1.length; i++) if (arr1[i] !== arr2[i]) return false;

    return true;
  }

  onChange(key, value) {
    this.setState({ values: Object.assign(this.state.values, { [key]: value }) }, () => this.filterFields());
  }

  filterFields() {
    const { variables, values } = this.state;

    variables.forEach(({ definition }) => {
      if (assess(definition.condition, values)) return;

      const target = [definition.default || []].flat();

      if (!this.arrayEquals(values[definition.placeholder], target)) this.onChange(definition.placeholder, target);
    });
  }

  HasRedLine(variables, values) {
    for (const { definition } of variables) {
      if (
        assess(definition.condition, values) &&
        ((definition.type !== 'checkbox' &&
          definition.type !== 'title' &&
          ((values[definition.placeholder] &&
            values[definition.placeholder].length === 0 &&
            definition.style !== 'not required') ||
            (values[definition.placeholder]?.[0]?.length === 0 && definition.style !== 'not required'))) ||
          (definition.type === 'checkbox' &&
          definition.style === 'required' &&
          values[definition.placeholder].length === 0)
        )
      ) {
        return true;
      }
    }
    return false;
  }

  copyToClipboard(str) {
    const styledString = `<div style="font-family: Open Sans, sans-serif; font-size: 16px;">${str}</div>`;
    const listener = (e) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/html', styledString);
        e.clipboardData.setData('text/plain', stripHtmlTags(styledString));
      } else if (window.clipboardData) {
        window.clipboardData.setData('Text', styledString);
      }
    };
    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
  }

  render() {
    const { tindex, variables, values, pattern } = this.state;

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 py-4">
            <Form>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>
                  Template:
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    as="select"
                    value={tindex}
                    onChange={(e) => {
                      const newTindex = e.target.value;
                      this.setState({ tindex: newTindex, ...this.processTemplate(templates[newTindex]) });
                    }}
                  >
                    {templates.map((template, index) => (
                      <option key={index} value={index}>
                        {template.name}
                      </option>
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
                  <button
                    className="btn btn-primary mb-3 w-100"
                    onClick={() => {
                      if (this.HasRedLine(variables, values)) {
                        const shouldContinue = window.confirm(
                          'Some REQUIRED fields are not complete (in RED), are you sure you want to continue?'
                        );
                        if (shouldContinue) {
                          this.copyToClipboard(document.getElementById('template').innerHTML);
                          alert('Text copied to clipboard!');
                        } else {
                          this.copyToClipboard('');
                        }
                      } else {
                        this.copyToClipboard(document.getElementById('template').innerHTML);
                        alert('Text copied to clipboard!');
                      }
                    }}
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <TextResult pattern={pattern} variables={variables} values={values} />
                <hr />
                <FormControl
                  as="textarea"
                  rows={10}
                  value={pattern}
                  onChange={(e) => this.setState({ pattern: e.target.value })}
                />
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
    <div
      id="template"
      className="card p-3 copied-text"
      style={{ width: '100%', wordBreak: 'break-all' }}
    >
      {parse(getText(props))}
    </div>
  );
}

function stripHtmlTags(html) {
  // Replace <br> tags with new line characters
  const processedHtml = html.replace(/<br\s*\/?>/gi, '\n');

  const doc = new DOMParser().parseFromString(processedHtml, 'text/html');
  const text = doc.body.textContent || '';

  return text;
}

function App() {
  return (
    <div className="container" style={{ maxWidth: '90%' }}>
      <Container />
    </div>
  );
}

export default App;
