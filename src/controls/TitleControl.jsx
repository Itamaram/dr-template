import React from 'react';
import { FormGroup, FormControl, FormLabel } from 'react-bootstrap';
import DraggableVariable from '../DraggableVariable'; // Ensure correct import

function TitleControl(props) {
  const { definition, onChange, editMode, editControl, placeholders, index, moveVariable, variables, deleteVariable, selectedVariable, setSelectedVariable } = props;
  const { text, style, placeholder } = definition;

  if (!editMode && definition.hide) {
    return null;
  }

  const handleTextChange = (e) => {
    editControl(placeholder, e.target.value, definition.hide, definition.default, placeholder, definition.condition, { style, text: e.target.value });
  };

  const handleStyleChange = (e) => {
    editControl(placeholder, text, definition.hide, definition.default, placeholder, definition.condition, { style: e.target.value });
  };

  return (
    <FormGroup>
      {editMode ? (
        <DraggableVariable
          variable={{ definition, handler: props.handler }}
          index={index}
          moveVariable={moveVariable}
          editMode={editMode}
          onChange={onChange}
          editControl={editControl}
          placeholders={placeholders}
          deleteVariable={deleteVariable}
          showModels={['text', 'style', 'condition']}
          variables={variables}
          selectedVariable={selectedVariable}
          setSelectedVariable={setSelectedVariable}
          controlType="Title" // Pass control type
        >
          <FormGroup>
            <FormControl
              type="text"
              value={text}
              onChange={handleTextChange}
              placeholder="Enter title text"
              style={{marginTop: '20px'}}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Style</FormLabel>
            <FormControl
              as="select"
              value={style}
              onChange={handleStyleChange}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="underline">Underline</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </FormControl>
          </FormGroup>
        </DraggableVariable>
      ) : (
        <>
          {(() => {
            switch (style) {
              case "normal": return (<span>{text}</span>);
              case "bold": return (<b>{text}</b>);
              case "underline": return (<u>{text}</u>);
              case "small": return (<h4>{text}</h4>);
              case "medium": return (<h3>{text}</h3>);
              case "large": return (<h2>{text}</h2>);
              default: return (<h2>{text}</h2>);
            }
          })()}
        </>
      )}
    </FormGroup>
  );
}

export const handler = {
  type: 'title',
  render: (definition, current, onChange, editMode, editControl, placeholders, index, moveVariable, variables, selectedVariable, setSelectedVariable, deleteVariable) => (
    <TitleControl
      definition={definition}
      values={current}
      onChange={onChange}
      editMode={editMode}
      editControl={editControl}
      placeholders={placeholders}
      index={index}
      moveVariable={moveVariable}
      variables={variables}
      deleteVariable={deleteVariable}
      selectedVariable={selectedVariable}
      setSelectedVariable={setSelectedVariable}
      key={definition.placeholder}
    />
  ),
  getValues: (variable, values = []) => values.map(({ value }) => value),
};
