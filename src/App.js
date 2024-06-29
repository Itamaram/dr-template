import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormControl, Form, Row, Col, Button } from 'react-bootstrap';
import parse from 'html-react-parser';

import assess from './conditions';
import handlers from './handlers';
import process from './pattern-processor';
import ControlsPane from './controls-pane';
import OptionsModal from './OptionsModal';
import EditPlaceholderModal from './EditPlaceholderModal'; // Import the EditPlaceholderModal component

const templates = require('./templates.json');

function Container() {
  const [tindex, setTindex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [templateData, setTemplateData] = useState(processTemplate(templates[0]));
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalOptions, setModalOptions] = useState([]);
  const [modalPlaceholder, setModalPlaceholder] = useState('');
  const textareaRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showEditPlaceholderModal, setShowEditPlaceholderModal] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState([]);

  useEffect(() => {
    setTemplateData(processTemplate(templates[tindex]));
  }, [tindex]);

  useEffect(() => {
    if (editMode) {
      setTemplateData((prevState) => {
        const updatedValues = { ...prevState.values };
        prevState.variables.forEach(({ definition }) => {
          if (definition.default && definition.default !== '') {
            updatedValues[definition.placeholder] = [{ value: definition.default }];
          }
        });
        return {
          ...prevState,
          values: updatedValues,
        };
      });
    }
  }, [editMode]);

  // Function to update template data
  const updateTemplateData = (newTemplateData) => {
    setTemplateData(newTemplateData);
  };

  function processTemplate(template) {
    const variables = template.variables.map((v) => ({ definition: v, handler: handlers[v.type] }));
    const pattern = template.pattern;
    const values = variables
      .filter((v) => v.definition.placeholder)
      .reduce((p, v) => ({
        ...p,
        [v.definition.placeholder]: [v.definition.default || []].flat().map((value) => ({ value })),
      }), {});
    return { variables, pattern, values };
  }

  function arrayEquals(arr1, arr2) {
    if (arr1?.length !== arr2?.length) return false;
    for (let i = 0; i < arr1.length; i++) if (arr1[i] !== arr2[i]) return false;
    return true;
  }

  function onChange(key, value) {
    setTemplateData((prevState) => ({
      ...prevState,
      values: { ...prevState.values, [key]: value },
    }), filterFields);
  }

  function filterFields() {
    const { variables, values } = templateData;
    variables.forEach(({ definition }) => {
      if (assess(definition.condition, values)) return;
      const target = [definition.default || []].flat().map((value) => ({ value }));
      if (!arrayEquals(values[definition.placeholder]?.map(({ value }) => value), target.map(({ value }) => value))) {
        onChange(definition.placeholder, target);
      }
    });
  }

  function updatePatternPlaceholders(pattern, oldPlaceholder, newPlaceholder) {
    const regex = new RegExp(`({[^{}]*\\b${oldPlaceholder}\\b[^{}]*})`, 'g');
    return pattern.replace(regex, match => match.split(oldPlaceholder).join(newPlaceholder));
  }

  function editControl(key, newValue, hide = false, defaultValue = '', newPlaceholder = '', condition = {}, updatedFields = {}, action = null) {
    setTemplateData((prevState) => {
      const updatedVariables = prevState.variables.map((variable) => {
        if (variable.definition.placeholder === key) {
          const updatedDefinition = {
            ...variable.definition,
            display: newValue,
            hide: hide,
            default: defaultValue,
            placeholder: newPlaceholder,
            ...updatedFields,
          };

          if (!isConditionEmpty(condition)) {
            updatedDefinition.condition = condition;
          } else {
            delete updatedDefinition.condition;
          }

          return {
            ...variable,
            definition: updatedDefinition,
          };
        }

        let updatedCondition = variable.definition.condition;
        if (variable.definition.condition && typeof variable.definition.condition === 'object') {
          updatedCondition = updateConditionPlaceholders(variable.definition.condition, key, newPlaceholder, updatedFields.oldKey, updatedFields.newKey, action);
        }

        return {
          ...variable,
          definition: {
            ...variable.definition,
            condition: updatedCondition,
          },
        };
      });

      const updatedValues = { ...prevState.values };
      if (updatedValues[key]) {
        updatedValues[newPlaceholder] = updatedValues[key];
        delete updatedValues[key];
      }

      const updatedPattern = updatePatternPlaceholders(prevState.pattern, key, newPlaceholder);

      return {
        ...prevState,
        variables: updatedVariables,
        values: updatedValues,
        pattern: updatedPattern,
      };
    });
  }

  function updateConditionPlaceholders(condition, oldPlaceholder, newPlaceholder, oldKey, newKey, action) {
    if (!condition) {
      return condition;
    }

    if (Array.isArray(condition)) {
      return condition.map(cond => updateConditionPlaceholders(cond, oldPlaceholder, newPlaceholder, oldKey, newKey, action)).filter(cond => cond !== null);
    }

    let updatedCondition = { ...condition };

    if (condition.field === oldPlaceholder) {
      updatedCondition = { ...updatedCondition, field: newPlaceholder };
    }

    const operatorKey = Object.keys(updatedCondition).find(key => key !== 'field');
    if (operatorKey && Array.isArray(updatedCondition[operatorKey])) {
      updatedCondition = {
        ...updatedCondition,
        [operatorKey]: updateConditionPlaceholders(updatedCondition[operatorKey], oldPlaceholder, newPlaceholder, oldKey, newKey, action).filter(cond => cond !== null)
      };
    } else if (condition.field === oldPlaceholder && condition[operatorKey] === oldKey) {
      if (action === 'remove') {
        return null;
      }
    }

    return updatedCondition;
  }

  function moveVariable(dragIndex, hoverIndex) {
    const draggedVariable = templateData.variables[dragIndex];
    const updatedVariables = [...templateData.variables];
    updatedVariables.splice(dragIndex, 1);
    updatedVariables.splice(hoverIndex, 0, draggedVariable);

    setTemplateData(prevState => ({
      ...prevState,
      variables: updatedVariables,
    }));
  }

  function isConditionEmpty(condition) {
    if (!condition) return true;
    if (typeof condition === 'object') {
      if (Array.isArray(condition)) return condition.length === 0;
      if (condition.and || condition.or) return (condition.and || condition.or).length === 0;
      return Object.keys(condition).length === 0;
    }
    return false;
  }

  function HasRedLine(variables, values) {
    for (const { definition } of variables) {
      if (
        assess(definition.condition, values) &&
        ((definition.type !== 'checkbox' &&
          definition.type !== 'title' &&
          ((values[definition.placeholder] &&
            (values[definition.placeholder].length === 0 || values[definition.placeholder]?.[0]?.value?.length === 0) &&
            definition.style !== 'not required') ||
            ((values[definition.placeholder].length === 0 || values[definition.placeholder]?.[0]?.value?.length === 0) && definition.style !== 'not required'))) ||
          (definition.type === 'checkbox' &&
            definition.style === 'required' &&
            (values[definition.placeholder].length === 0 || values[definition.placeholder]?.[0]?.value?.length === 0))
        )
      ) {
        return true;
      }
    }
    return false;
  }

  function copyToClipboard(str) {
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

  function toggleEditMode() {
    setEditMode((prevMode) => {
      if (prevMode) {
        setTemplateData((prevState) => {
          const updatedValues = { ...prevState.values };
          prevState.variables.forEach(({ definition }) => {
            if (definition.default && definition.default !== '') {
              updatedValues[definition.placeholder] = [{ value: definition.default }];
            }
          });
          return {
            ...prevState,
            values: updatedValues,
          };
        });
      }
      return !prevMode;
    });
  }

  function handlePatternChange(event) {
    const updatedPattern = textToHtml(event.target.value);
    setTemplateData((prevState) => ({
      ...prevState,
      pattern: updatedPattern,
    }));
  }

  function handleRightClick(event) {
    event.preventDefault();
    const placeholders = templateData.variables.map(v => v.definition.placeholder);
  
    // Get the cursor position
    const cursorPos = event.target.selectionStart || textareaRef.current.selectionStart;
    setCursorPosition(cursorPos);
  
    if (!selectedVariable || !placeholders.includes(selectedVariable)) {
      return;
    }
  
    const text = textareaRef.current.value;
    const beforeCursor = text.substring(0, cursorPos);
    const afterCursor = text.substring(cursorPos);
  
    const beforePlaceholder = beforeCursor.lastIndexOf('{');
    const beforePlaceholderclose = beforeCursor.lastIndexOf('}');
    const afterPlaceholder = afterCursor.indexOf('}');
    const afterPlaceholderopen = afterCursor.indexOf('{');
  
    // Check if the cursor is between }{
    if ((beforeCursor.endsWith('}') && afterCursor.startsWith('{')) || (beforePlaceholderclose>=beforePlaceholder && afterPlaceholder >= afterPlaceholderopen)) {
      const variable = templateData.variables.find(v => v.definition.placeholder === selectedVariable);
      if (variable && variable.definition.options && variable.definition.options.length > 0) {
        setModalOptions(variable.definition.options);
        setModalPlaceholder(selectedVariable);
        setShowModal(true);
        return;
      }
  
      const newText = `${beforeCursor}{${selectedVariable}}${afterCursor}`;
      textareaRef.current.value = newText;
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorPos + selectedVariable.length + 2;
  
      setTemplateData(prevState => ({
        ...prevState,
        pattern: textToHtml(textareaRef.current.value),
      }));
  
      return;
    }
  
    if (beforePlaceholder !== -1 && (afterPlaceholder !== -1 || afterCursor.startsWith('}'))) {
      const placeholderContent = text.substring(beforePlaceholder + 1, cursorPos + afterPlaceholder);
  
      const variable = templateData.variables.find(v => v.definition.placeholder === selectedVariable);
      if (variable && variable.definition.options && variable.definition.options.length > 0) {
        setModalOptions(variable.definition.options);
        setModalPlaceholder(selectedVariable);
        setShowModal(true);
        return;
      }
  
      const newPlaceholderContent = `${placeholderContent},${selectedVariable}`;
      const newText = `${text.substring(0, beforePlaceholder + 1)}${reorderPlaceholders(newPlaceholderContent)}${text.substring(cursorPos + afterPlaceholder)}`;
      textareaRef.current.value = newText;
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorPos + newPlaceholderContent.length - placeholderContent.length;
    } else {
      const variable = templateData.variables.find(v => v.definition.placeholder === selectedVariable);
      if (variable && variable.definition.options && variable.definition.options.length > 0) {
        setModalOptions(variable.definition.options);
        setModalPlaceholder(selectedVariable);
        setShowModal(true);
        return;
      }
  
      const newText = `${beforeCursor}{${reorderPlaceholders(selectedVariable)}}${afterCursor}`;
      textareaRef.current.value = newText;
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorPos + selectedVariable.length + 2;
    }
  
    setTemplateData(prevState => ({
      ...prevState,
      pattern: textToHtml(textareaRef.current.value),
    }));
  }
  
  
const handleLeftClick = (event) => {
  if (!editMode) return;

  const cursorPos = textareaRef.current.selectionStart;
  const text = textareaRef.current.value;
  const beforeCursor = text.substring(0, cursorPos);
  const afterCursor = text.substring(cursorPos);

  const beforePlaceholder = beforeCursor.lastIndexOf('{');
  const beforePlaceholderclose = beforeCursor.lastIndexOf('}');
  const afterPlaceholder = afterCursor.indexOf('}');
  const afterPlaceholderopen = afterCursor.indexOf('{');

  // Check if the cursor is between }{
  if ((beforeCursor.endsWith('}') && afterCursor.startsWith('{')) || (beforePlaceholderclose>beforePlaceholder && afterPlaceholder > afterPlaceholderopen)) {
    // Do nothing as the cursor is between two placeholders
    setShowEditPlaceholderModal(false);
    return;
  }

  if (beforePlaceholder !== -1 && (afterPlaceholder !== -1 || afterCursor.startsWith('}'))) {
    const placeholderContent = text.substring(beforePlaceholder + 1, cursorPos + afterPlaceholder);
    const placeholdersArray = placeholderContent.split(',');
    setPlaceholderValues(placeholdersArray);
    setShowEditPlaceholderModal(true);
  }
};

  function handleModalSave(selectedOptions) {
    const optionsStr = selectedOptions.length > 0 ? `|${selectedOptions.join(';')}` : '';
    const newValue = `{${modalPlaceholder}${optionsStr}}`;

    const textarea = textareaRef.current;
    const text = textarea.value;
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition, text.length);

    const beforePlaceholder = beforeCursor.lastIndexOf('{');
    const beforePlaceholderclose = beforeCursor.lastIndexOf('}');
    const afterPlaceholder = afterCursor.indexOf('}');
    const afterPlaceholderopen = afterCursor.indexOf('{');

    let newText;
    if ((beforeCursor.endsWith('}') && afterCursor.startsWith('{')) || (beforePlaceholderclose>=beforePlaceholder && afterPlaceholder >= afterPlaceholderopen)) {
      newText = `${beforeCursor}${newValue}${afterCursor}`;
      textarea.value = newText;
      textarea.selectionStart = textarea.selectionEnd = cursorPosition + newValue.length;
    } else {
      const placeholderContent = text.substring(beforePlaceholder + 1, cursorPosition + afterPlaceholder);
      const newPlaceholderContent = `${placeholderContent},${modalPlaceholder}${optionsStr}`;
      newText = `${text.substring(0, beforePlaceholder + 1)}${reorderPlaceholders(newPlaceholderContent)}${text.substring(cursorPosition + afterPlaceholder)}`;
      textarea.value = newText;
      textarea.selectionStart = textarea.selectionEnd = cursorPosition + newPlaceholderContent.length - placeholderContent.length;
    }

    setTemplateData(prevState => ({
      ...prevState,
      pattern: textToHtml(newText),
    }));

    textarea.focus();
    setShowModal(false);
  }

  function handlePlaceholderModalSave(updatedPlaceholders) {
    const specialPlaceholders = ['down_list', 'colon', 'fullstop'];
    const remainingPlaceholders = updatedPlaceholders.filter(ph => !specialPlaceholders.includes(ph));
    
    const text = textareaRef.current.value;
    const cursorPos = textareaRef.current.selectionStart;
    const beforeCursor = text.substring(0, cursorPos);
    const afterCursor = text.substring(cursorPos);
    const beforePlaceholder = beforeCursor.lastIndexOf('{');
    const afterPlaceholder = afterCursor.indexOf('}');
  
    // If there are no remaining normal placeholders, remove the entire placeholder element
    if (remainingPlaceholders.length === 0) {
      const newText = `${text.substring(0, beforePlaceholder)}${text.substring(cursorPos + afterPlaceholder + 1)}`;
      textareaRef.current.value = newText;
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = beforePlaceholder;
  
      setTemplateData((prevState) => ({
        ...prevState,
        pattern: textToHtml(newText),
      }));
    } else {
      const updatedPlaceholderContent = updatedPlaceholders.join(',');
      const newText = `${text.substring(0, beforePlaceholder + 1)}${reorderPlaceholders(updatedPlaceholderContent)}${text.substring(cursorPos + afterPlaceholder)}`;
      textareaRef.current.value = newText;
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = beforePlaceholder + 1 + updatedPlaceholderContent.length;
  
      setTemplateData((prevState) => ({
        ...prevState,
        pattern: textToHtml(newText),
      }));
    }
  
    setShowEditPlaceholderModal(false);
  }
  
  

  function handleModalClose() {
    setShowModal(false);
  }

  function reorderPlaceholders(placeholderContent) {
    const specialPlaceholders = ['down_list', 'colon', 'fullstop'];
    const placeholdersArray = placeholderContent.split(',');
    const normalPlaceholders = placeholdersArray.filter(ph => !specialPlaceholders.includes(ph));
    const specialPlaceholdersPresent = placeholdersArray.filter(ph => specialPlaceholders.includes(ph));
    return [...normalPlaceholders, ...specialPlaceholdersPresent].join(',');
  }

  const handleExport = () => {
    const jsonString = JSON.stringify(jsonObject, null, 2);
    const blob = new Blob([jsonString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'templateData.txt';
    link.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          const processedData = processTemplate(importedData); // Process the imported data
          setTemplateData(processedData);
        } catch (error) {
          alert('Invalid file format. Please upload a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const deleteVariable = (placeholder) => {
    setTemplateData((prevState) => {
      const updatedVariables = prevState.variables.filter(variable => variable.definition.placeholder !== placeholder);
      const updatedValues = { ...prevState.values };
      delete updatedValues[placeholder];
      const updatedPattern = prevState.pattern.replace(new RegExp(`{${placeholder}.*?}`, 'g'), '');

      return {
        ...prevState,
        variables: updatedVariables,
        values: updatedValues,
        pattern: updatedPattern,
      };
    });
  };

  const handlePlaceholderClick = (placeholder) => {

  // Split the placeholder by '|' and take the left value
  placeholder = placeholder.includes('|') ? placeholder.split('|')[0] : placeholder;

    const variable = templateData.variables.find(v => v.definition.placeholder === placeholder);
    if (variable && variable.definition.options && variable.definition.options.length > 0) {
      setModalOptions(variable.definition.options);
      setModalPlaceholder(placeholder);
      setShowModal(true);
    }
  };

  const { variables, values, pattern } = templateData;
  const placeholders = templateData.variables.map(v => v.definition.placeholder);

  const jsonObject = {
    name: templates[tindex].name,
    pattern: pattern,
    variables: templateData.variables.map(v => v.definition)
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 py-4">
          <Form>
            <Form.Group as={Row}>
              <Form.Label column sm={2}>
                Template:
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  as="select"
                  value={tindex}
                  onChange={(e) => setTindex(e.target.value)}
                >
                  {templates.map((template, index) => (
                    <option key={index} value={index}>
                      {template.name}
                    </option>
                  ))}
                </Form.Control>
              </Col>
              <Col sm={2}>
                <Button onClick={toggleEditMode} className="float-right">
                  {editMode ? 'Save Changes' : 'Edit Template'}
                </Button>
              </Col>
            </Form.Group>
          </Form>
        </div>
      </div>
      <div className="row">
        <div className="col py-4">
          <div className="sticky-top">
            <ControlsPane
              variables={templateData.variables}
              values={templateData.values}
              onChange={onChange}
              editMode={editMode}
              editControl={editControl}
              placeholders={placeholders}
              moveVariable={moveVariable}
              selectedVariable={selectedVariable}
              setSelectedVariable={setSelectedVariable}
              deleteVariable={deleteVariable}
              updateTemplateData={updateTemplateData}
              pattern={templateData.pattern} // Pass the pattern
            />
          </div>
        </div>
        <div className="col py-4">
          <div className="sticky-top">
            <div className="card border-0 p-3">
              <div className="sticky-top">
                {!editMode && (
                  <button
                    className="btn btn-primary mb-3 w-100"
                    onClick={() => {
                      if (HasRedLine(variables, values)) {
                        const shouldContinue = window.confirm(
                          'Some REQUIRED fields are not complete (in RED), are you sure you want to continue?'
                        );
                        if (shouldContinue) {
                          copyToClipboard(document.getElementById('template').innerHTML);
                          alert('Text copied to clipboard!');
                        } else {
                          copyToClipboard('');
                        }
                      } else {
                        copyToClipboard(document.getElementById('template').innerHTML);
                        alert('Text copied to clipboard!');
                      }
                    }}
                  >
                    Copy to Clipboard
                  </button>
                )}
              </div>
              {!editMode && (
                <TextResult pattern={pattern} variables={variables} values={values} />
              )}
              {editMode && (
                <>
                  <Button onClick={handleExport} className="mb-3 w-100">
                    Export
                  </Button>
                  <hr />
                  <FormControl
                    as="textarea"
                    rows={25}
                    ref={textareaRef}
                    value={htmlToText(pattern)}
                    onChange={handlePatternChange}
                    onContextMenu={handleRightClick}
                    onClick={handleLeftClick}
                    className="sticky-top"
                  />
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleImport}
                    className="mb-3 w-100"
                  />
                </>
              )}
              <FormControl
              //    as="textarea"
              //    rows={10}
              //    value={JSON.stringify(jsonObject, null, 2)}
              />
            </div>
          </div>
        </div>
      </div>
      <OptionsModal
        show={showModal}
        onHide={handleModalClose}
        options={modalOptions}
        placeholder={modalPlaceholder}
        onSave={handleModalSave}
      />
      <EditPlaceholderModal
        show={showEditPlaceholderModal}
        onHide={() => setShowEditPlaceholderModal(false)}
        placeholders={placeholderValues}
        onSave={handlePlaceholderModalSave}
        handlePlaceholderClick={handlePlaceholderClick} // Pass the click handler
      />
    </div>
  );
}

function TextResult({ pattern, variables, values }) {
  function getText() {
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
      {parse(getText())}
    </div>
  );
}

function stripHtmlTags(html) {
  const processedHtml = html.replace(/<br\s*\/?>/gi, '\n');
  const doc = new DOMParser().parseFromString(processedHtml, 'text/html');
  const text = doc.body.textContent || '';
  return text;
}

function htmlToText(html) {
  let text = html.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<p>/gi, '');
  text = text.replace(/<\/p>/gi, '');
  text = text.replace(/<b>/gi, '**');
  text = text.replace(/<\/b>/gi, '**');
  return text;
}

function textToHtml(text) {
  let html = text.replace(/\n/g, '<br>');
  html = html.replace(/\*\*/g, '<b>').replace(/\*\*(?=[^<]*$)/, '</b>');
  html = `<p>${html}</p>`;
  return html;
}

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container" style={{ maxWidth: '90%' }}>
        <Container />
      </div>
    </DndProvider>
  );
}

export default App;
