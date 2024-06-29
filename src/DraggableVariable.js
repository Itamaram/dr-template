import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Card, FormControl, FormCheck, FormGroup, FormLabel, Button } from 'react-bootstrap';
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
  const [canDrag, setCanDrag] = useState(true);
  const [title, setTitle] = useState(variable.definition.placeholder);
  const [isValid, setIsValid] = useState(true);
  const [originalPlaceholder, setOriginalPlaceholder] = useState(variable.definition.placeholder);
  const [inline, setInline] = useState(variable.definition.inline || false);
  const [isEditingPlaceholder, setIsEditingPlaceholder] = useState(false);

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

  useEffect(() => {
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
        // copyToClipboard(`${variable.definition.placeholder}`);
      }
    }
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
                value={variable.definition.display}
                onChange={(e) => handleChange('display', e.target.value)}
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
                value={variable.definition.default}
                onChange={(e) => handleChange('default', e.target.value)}
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
