import React from 'react'
import { FormCheck, FormGroup, FormLabel } from 'react-bootstrap';

export default class CheckboxInput extends React.Component {
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
        () => this.props.onChange(this.format(this.props.config.options, this.state))
      );
    }
  
    render() {
      const { display, options, name } = this.props.config;
      return (
        <FormGroup>
          <FormLabel>{display || name}</FormLabel>
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