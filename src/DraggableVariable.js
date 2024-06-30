import React, { useState, useRef, useLayoutEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Card, FormControl, FormCheck, FormGroup, FormLabel, Button, Row, Col } from 'react-bootstrap';
import ConditionEditor from './controls/ConditionEditor';

const ItemTypes = {
  VARIABLE: 'variable',
};

const DraggableVariable = ({
  variable,
  index,
  moveVariable,
  editMode,
  onChange,
  editControl,
  placeholders,
  showModels,
  deleteVariable,
  children,
  variables,
  selectedVariable,
  setSelectedVariable,
  controlType,
}) => {
  const ref = useRef(null);
  const inputRef = useRef(null);
  const defaultInputRef = useRef(null);
  const [canDrag, setCanDrag] = useState(true);
  const [title, setTitle] = useState(variable.definition.placeholder);
  const [isValid, setIsValid] = useState(true);
  const [originalPlaceholder, setOriginalPlaceholder] = useState(variable.definition.placeholder);
  const [inline, setInline] = useState(variable.definition.inline || false);
  const [isEditingPlaceholder, setIsEditingPlaceholder] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [defaultCursorPosition, setDefaultCursorPosition] = useState(0);
  const [localValue, setLocalValue] = useState(variable.definition.display || '');
  const [localDefaultValue, setLocalDefaultValue] = useState(variable.definition.default || '');
  const [localOptions, setLocalOptions] = useState(variable.definition.options || []);

  const inputRefs = useRef([]);
  const [cursorPositions, setCursorPositions] = useState(localOptions.map(() => 0));

  const [, drop] = useDrop({
    accept: ItemTypes.VARIABLE,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveVariable(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.VARIABLE,
    item: { type: ItemTypes.VARIABLE, index },
    canDrag: () => canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const opacity = isDragging ? 0 : 1;

  useLayoutEffect(() => {
    const inputElements = ref.current.querySelectorAll('input, textarea, select');
    const handleFocus = () => setCanDrag(false);
    const handleBlur = () => setCanDrag(true);

    inputElements.forEach((element) => {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);
    });

    return () => {
      inputElements.forEach((element) => {
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
      });
    };
  }, []);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [localValue, cursorPosition]);

  useLayoutEffect(() => {
    if (defaultInputRef.current) {
      defaultInputRef.current.setSelectionRange(defaultCursorPosition, defaultCursorPosition);
    }
  }, [localDefaultValue, defaultCursorPosition]);

  useLayoutEffect(() => {
    localOptions.forEach((_, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].setSelectionRange(cursorPositions[index], cursorPositions[index]);
      }
    });
  }, [localOptions, cursorPositions]);

  const validateTitle = (value) =>
    /^[a-zA-Z0-9_]*$/.test(value) && value !== '' && (!placeholders.includes(value) || value === originalPlaceholder);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsValid(validateTitle(newTitle));
  };

  const handleTitleBlur = () => {
    if (isValid) {
      editControl(
        variable.definition.placeholder,
        variable.definition.display,
        variable.definition.hide,
        variable.definition.default,
        title,
        variable.definition.condition,
        { inline }
      );
      setOriginalPlaceholder(title); // Update the original placeholder if the new title is valid
    } else {
      setTitle(originalPlaceholder); // Revert to the previous valid placeholder without showing an alert
      setIsValid(true); // Reset isValid state
    }
    setIsEditingPlaceholder(false); // Exit edit mode on blur
  };

  const handleChange = (field, value) => {
    editControl(
      variable.definition.placeholder,
      field === 'display' ? value : variable.definition.display,
      field === 'hide' ? value : variable.definition.hide,
      field === 'default' ? value : variable.definition.default,
      title,
      variable.definition.condition,
      { inline }
    );
  };

  const handleConditionChange = (newCondition) => {
    editControl(
      variable.definition.placeholder,
      variable.definition.display,
      variable.definition.hide,
      variable.definition.default,
      title,
      newCondition,
      { inline }
    );
  };

  const handleDelete = () => {
    deleteVariable(variable.definition.placeholder);
  };

  const handleInlineChange = (e) => {
    setInline(e.target.checked);
    editControl(
      variable.definition.placeholder,
      variable.definition.display,
      variable.definition.hide,
      variable.definition.default,
      title,
      variable.definition.condition,
      { inline: e.target.checked }
    );
  };

  const handleVariableClick = () => {
    if (editMode) {
      if (selectedVariable === variable.definition.placeholder) {
        setSelectedVariable(null);
      } else {
        setSelectedVariable(variable.definition.placeholder);
      }
    }
  };

  const handleDisplayChange = (e) => {
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    const newValue = e.target.value;
    setLocalValue(newValue);
    handleChange('display', newValue);
  };

  const handleDefaultChange = (e) => {
    const cursorPos = e.target.selectionStart;
    setDefaultCursorPosition(cursorPos);
    const newValue = e.target.value;
    setLocalDefaultValue(newValue);
    handleChange('default', newValue);
  };

  const handleOptionInputChange = (index, field, e) => {
    const cursorPos = e.target.selectionStart;
    const newCursorPositions = [...cursorPositions];
    newCursorPositions[index] = cursorPos;
    setCursorPositions(newCursorPositions);
    handleOptionChange(index, field, e.target.value);
  };

  const handleOptionChange = (index, field, value) => {
    const oldKey = localOptions[index].key;
    const updatedOptions = localOptions.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt));
    const updatedFields = { options: updatedOptions };

    if (field === 'key') {
      updatedFields.oldKey = oldKey;
      updatedFields.newKey = value;
    }

    editControl(
      variable.definition.placeholder,
      variable.definition.display,
      variable.definition.hide,
      variable.definition.default,
      title,
      variable.definition.condition,
      updatedFields, 'update'
    );
    setLocalOptions(updatedOptions);
  };

  const handleAddOption = () => {
    const updatedOptions = [...localOptions, { key: 'new_option', value: 'New Option' }];
    editControl(
      variable.definition.placeholder,
      variable.definition.display,
      variable.definition.hide,
      variable.definition.default,
      title,
      variable.definition.condition,
      { options: updatedOptions }
    );
    setLocalOptions(updatedOptions);
  };

  const handleRemoveOption = index => {
    const optionToRemove = localOptions[index];
    const oldKey = optionToRemove.key;

    const isKeyUsedInConditions = variables.some(variable => {
      const condition = variable.definition.condition;
      return condition && JSON.stringify(condition).includes(`"field":"${title}"`) && JSON.stringify(condition).includes(`"equals":"${oldKey}"`);
    });

    if (isKeyUsedInConditions) {
      const shouldDeleteConditions = window.confirm(`The key "${oldKey}" is used in conditions. Do you want to proceed? This will delete all conditions related to this key`);

      let action;
      if (shouldDeleteConditions) {
        action = 'remove';
      } else {
        return;
      }

      const updatedOptions = localOptions.filter((_, i) => i !== index);
      const newDefaultValue = oldKey === localDefaultValue ? '' : localDefaultValue;
      editControl(
        variable.definition.placeholder,
        variable.definition.display,
        variable.definition.hide,
        newDefaultValue,
        title,
        variable.definition.condition,
        { options: updatedOptions, oldKey, newKey: '' },
        action
      );
      setLocalOptions(updatedOptions);
      setLocalDefaultValue(newDefaultValue);
    } else {
      const updatedOptions = localOptions.filter((_, i) => i !== index);
      const newDefaultValue = oldKey === localDefaultValue ? '' : localDefaultValue;
      editControl(
        variable.definition.placeholder,
        variable.definition.display,
        variable.definition.hide,
        newDefaultValue,
        title,
        variable.definition.condition,
        { options: updatedOptions }
      );
      setLocalOptions(updatedOptions);
      setLocalDefaultValue(newDefaultValue);
    }
  };

  const handleOptionClick = (key) => {
    let newDefaultValue;
    if (controlType === 'Checkbox' || controlType === 'Select') {
      if (Array.isArray(localDefaultValue)) {
        if (localDefaultValue.includes(key)) {
          newDefaultValue = localDefaultValue.filter((value) => value !== key);
        } else {
          newDefaultValue = [...localDefaultValue, key];
        }
      } else {
        newDefaultValue = [key];
      }
    } else {
      newDefaultValue = key === localDefaultValue ? '' : key;
    }

    setLocalDefaultValue(newDefaultValue);
    editControl(
      variable.definition.placeholder,
      variable.definition.display,
      variable.definition.hide,
      newDefaultValue,
      title,
      variable.definition.condition,
      { inline }
    );
  };

  const availablePlaceholders = placeholders.filter((ph) => ph !== variable.definition.placeholder);

  return (
    <Card
      ref={ref}
      style={{
        opacity,
        marginBottom: '10px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        position: 'relative',
        backgroundColor: selectedVariable === variable.definition.placeholder ? '#f0f0f0' : '#fff', // Highlight selected variable
      }}
      onClick={handleVariableClick} // Add onClick handler
    >
      {editMode && (
        <>
          <div style={{ position: 'absolute', top: '5px', left: '5px', fontWeight: 'bold' }}>{controlType}</div>
          <Button variant="danger" style={{ position: 'absolute', top: '5px', right: '5px' }} onClick={handleDelete}>
            X
          </Button>
        </>
      )}
      {editMode ? (
        <div>
          {showModels.includes('placeholder') && (
            <div
              onDoubleClick={() => setIsEditingPlaceholder(true)}
              style={{
                marginBottom: '10px',
                marginTop: '20px',
                color: isEditingPlaceholder ? 'inherit' : 'grey',
                cursor: isEditingPlaceholder ? 'text' : 'pointer',
                display: 'inline-block',
              }}
            >
              {isEditingPlaceholder ? (
                <>
                  <FormControl
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    autoFocus
                    isInvalid={!isValid}
                  />
                  {(!isValid && isEditingPlaceholder) && (
                    <FormControl.Feedback type="invalid">
                      Placeholder must be unique, not empty, and can only contain letters, numbers, and underscores.
                    </FormControl.Feedback>
                  )}
                </>
              ) : (
                <span>{title}</span>
              )}
            </div>
          )}
          {showModels.includes('display') && (
            <FormGroup>
              <FormLabel>Display</FormLabel>
              <FormControl
                type="text"
                value={localValue}
                onChange={handleDisplayChange}
                ref={inputRef} // Attach ref to the input
              />
            </FormGroup>
          )}
          {showModels.includes('hide') && (
            <FormGroup>
              <FormCheck
                type="checkbox"
                label="Hide"
                checked={variable.definition.hide}
                onChange={(e) => handleChange('hide', e.target.checked)}
              />
            </FormGroup>
          )}
          {showModels.includes('default') && (
            <FormGroup>
              <FormLabel>Default Value</FormLabel>
              <FormControl
                type="text"
                value={localDefaultValue}
                onChange={handleDefaultChange}
                ref={defaultInputRef} // Attach ref to the default input
              />
            </FormGroup>
          )}
          {showModels.includes('inline') && (
            <FormGroup>
              <FormCheck
                type="checkbox"
                label="Inline"
                checked={inline}
                onChange={handleInlineChange}
              />
            </FormGroup>
          )}
          {showModels.includes('options') && (
            <FormGroup>
              <FormLabel>Options</FormLabel>
              {localOptions.map((o, i) => (
                <Row
                  key={i}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: (Array.isArray(localDefaultValue) ? localDefaultValue.includes(o.key) : localDefaultValue === o.key) ? 'lightblue' : 'inherit',
                  }}
                  onClick={() => handleOptionClick(o.key)} // Add click handler for options
                >
                  <Col>
                    <FormControl
                      type="text"
                      value={o.key}
                      onChange={(e) => handleOptionInputChange(i, 'key', e)}
                      placeholder="Key"
                      ref={(el) => inputRefs.current[i] = el} // Attach ref to the input
                    />
                  </Col>
                  <Col>
                    <FormControl
                      type="text"
                      value={o.value}
                      onChange={(e) => handleOptionInputChange(i, 'value', e)}
                      placeholder="Value"
                      ref={(el) => inputRefs.current[i] = el} // Attach ref to the input
                    />
                  </Col>
                  <Col>
                    <Button variant="danger" onClick={() => handleRemoveOption(i)}>Remove</Button>
                  </Col>
                </Row>
              ))}
              <Button variant="primary" onClick={handleAddOption}>Add Option</Button>
            </FormGroup>
          )}
          {children}
          {showModels.includes('condition') && (
            <ConditionEditor
              condition={variable.definition.condition}
              setCondition={handleConditionChange}
              placeholders={availablePlaceholders} // Pass available placeholders
              variables={variables} // Pass variables to ConditionEditor
            />
          )}
        </div>
      ) : (
        <div>{variable.definition.display || variable.definition.placeholder}</div>
      )}
    </Card>
  );
};

export default DraggableVariable;
