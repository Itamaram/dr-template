import React, { useState, useEffect} from 'react';
import { useDrop } from 'react-dnd';
import assess from './conditions';
import ControlColumn from './ControlColumn'; // Ensure correct import
import handlers from './handlers'; // Ensure correct import of handlers

const ItemTypes = {
  CONTROL: 'control',
};

export default function ControlsPane({
  variables: initialVariables,
  values: initialValues,
  onChange,
  editMode,
  editControl,
  placeholders,
  moveVariable,
  selectedVariable,
  setSelectedVariable,
  deleteVariable,
  updateTemplateData,
  pattern // Accept the pattern as a prop
}) {
  const [minimizeIndices, setMinimizeIndices] = useState([]);
  const [isColumnMinimized, setIsColumnMinimized] = useState(true); // Start minimized
  const [templateData, setTemplateData] = useState({
    variables: initialVariables,
    values: initialValues,
    pattern: pattern // Initialize with the passed pattern
  });

  useEffect(() => {
    setTemplateData({
      variables: initialVariables,
      values: initialValues,
      pattern: pattern // Update with the passed pattern
    });
  }, [initialVariables, initialValues, pattern]);

  const handleDropControl = (item, hoverIndex) => {
    const newVariable = {
      definition: {
        placeholder: `new_${item.type}_${Date.now()}`, // Unique placeholder
        type: item.type,
        display: item.type.charAt(0).toUpperCase() + item.type.slice(1), // Capitalize first letter
        // Add any other default properties needed for the specific control type
        options:[],
      },
      handler: handlers[item.type],
    };

    setTemplateData((prevState) => {
      const newVariables = [...prevState.variables];
      if (hoverIndex !== undefined) {
        newVariables.splice(hoverIndex, 0, newVariable);
      } else {
        newVariables.push(newVariable);
      }

      const newValues = { ...prevState.values };
      newValues[newVariable.definition.placeholder] = [{ value: '' }]; // Initialize value

      const newTemplateData = {
        ...prevState,
        variables: newVariables,
        values: newValues,
        pattern: prevState.pattern, // Retain the current pattern
      };

      updateTemplateData(newTemplateData); // Update parent state

      return newTemplateData;
    });
  };

  const [, drop] = useDrop({
    accept: ItemTypes.CONTROL,
    hover: (item, monitor) => {
      const hoverBoundingRect = monitor.getClientOffset();
      const hoverClientY = hoverBoundingRect.y;

      let hoverIndex = templateData.variables.length;

      for (let i = 0; i < templateData.variables.length; i++) {
        const variableElement = document.querySelector(`#variable-${i}`);
        if (variableElement) {
          const rect = variableElement.getBoundingClientRect();
          const hoverMiddleY = rect.top + (rect.bottom - rect.top) / 2;

          if (hoverClientY < hoverMiddleY) {
            hoverIndex = i;
            break;
          }
        }
      }

      item.hoverIndex = hoverIndex;
    },
    drop: (item, monitor) => {
      const hoverIndex = item.hoverIndex !== undefined ? item.hoverIndex : templateData.variables.length;
      handleDropControl(item, hoverIndex);
    },
    canDrop: () => templateData.variables.length > 0, // Only allow drop if there are existing variables
  });

  const [, dropEmpty] = useDrop({
    accept: ItemTypes.CONTROL,
    drop: (item, monitor) => {
      handleDropControl(item, 0); // Add to the start if the template is empty
    },
    canDrop: () => templateData.variables.length === 0, // Only allow drop if the template is empty
  });

  const handleTitleClick = (index) => {
    const nextMediumStyleIndex = findNextMediumStyleIndex(index);
    if (minimizeIndices.includes(index)) {
      setMinimizeIndices(minimizeIndices.filter((i) => i < index || i >= nextMediumStyleIndex));
    } else {
      const indicesToMinimize = [...Array(nextMediumStyleIndex - index - 1)].map((_, i) => index + i + 1);
      setMinimizeIndices([...minimizeIndices, index, ...indicesToMinimize]);
    }
  };

  const hasRedLine = (index) => {
    const nextMediumStyleIndex = findNextMediumStyleIndex(index);
    for (let i = index + 1; i < nextMediumStyleIndex; i++) {
      if (minimizeIndices.includes(i)) {
        const { definition } = templateData.variables[i];
        if (
          assess(definition.condition || {}, templateData.values) &&
          ((definition.type !== 'checkbox' && definition.type !== 'title' &&
            ((templateData.values[definition.placeholder] && (templateData.values[definition.placeholder]?.length === 0 || templateData.values[definition.placeholder]?.[0]?.value?.length === 0) && definition.style !== 'not required') ||
              ((templateData.values[definition.placeholder]?.length === 0 || templateData.values[definition.placeholder]?.[0]?.value?.length === 0) && definition.style !== 'not required'))) ||
            (definition.type === 'checkbox' && definition.style === 'required' && (templateData.values[definition.placeholder]?.length === 0 || templateData.values[definition.placeholder]?.[0]?.value?.length === 0)))
        ) {
          return true;
        }
      }
    }
    return false;
  };

  function findNextMediumStyleIndex(startIndex) {
    const filteredVariables = templateData.variables;

    for (let i = startIndex + 1; i < filteredVariables?.length; i++) {
      const { definition } = filteredVariables[i];
      if (definition && definition.style === 'medium') {
        return i;
      }
    }

    return filteredVariables.length;
  }

  const minimizeButtonHandler = () => {
    const indicesToMinimize = templateData.variables.reduce((indices, { definition }, index) => {
      if (definition) {
        indices.push(index);
      }
      return indices;
    }, []);
    setMinimizeIndices(indicesToMinimize);
  };

const renderNormalMode = () => (
    <div>
      <div className="button-container">
        <button className="btn btn-primary mb-3" onClick={minimizeButtonHandler}>
          Minimise
        </button>
        <button className="btn btn-primary mb-3" style={{ marginLeft: '5rem' }} onClick={() => setMinimizeIndices([])}>
          Expand
        </button>
      </div>
      {templateData.variables
        .filter(({ definition }) => assess(definition.condition || {}, templateData.values)) // Ensure condition is checked properly
        .map(({ definition, handler }, originalIndex) => {
          let filteredVariables;
          if (!filteredVariables) {
            filteredVariables = templateData.variables.reduce((acc, variable, originalIndex) => {
              if (assess(variable.definition.condition || {}, templateData.values)) {
                variable.originalIndex = originalIndex;
                acc.push(variable);
              }
              return acc;
            }, []);
          }

          originalIndex = filteredVariables[originalIndex].originalIndex;

          if (definition && definition.style === 'medium') {
            const isMinimized = minimizeIndices.includes(originalIndex);
            const titleStyle = isMinimized
              ? hasRedLine(originalIndex)
                ? { borderLeft: '4px double red', marginLeft: '6px', paddingLeft: '4px' }
                : { borderLeft: '4px double #61dafb', paddingLeft: '4px' }
              : {};

            return (
              <div key={definition.placeholder} onClick={() => handleTitleClick(originalIndex)}>
                <div style={titleStyle}>
                  {handler.render(definition, templateData.values[definition.placeholder] || [], (x) =>
                    onChange(definition.placeholder, x), editMode, editControl, placeholders, originalIndex, moveVariable, templateData.variables, selectedVariable, setSelectedVariable, deleteVariable // Pass deleteVariable here
                  )}
                </div>
              </div>
            );
          } else if (minimizeIndices.includes(originalIndex)) {
            return null; // Return null to hide the control component
          } else {
            if (
              (definition.type !== 'checkbox' && definition.type !== 'title' &&
                ((templateData.values[definition.placeholder] && (templateData.values[definition.placeholder]?.length === 0 || templateData.values[definition.placeholder]?.[0]?.value?.length === 0) && definition.style !== 'not required') ||
                  ((templateData.values[definition.placeholder]?.length === 0 || templateData.values[definition.placeholder]?.[0]?.value?.length === 0) && definition.style !== 'not required'))) ||
              (definition.type === 'checkbox' && definition.style === 'required' && (templateData.values[definition.placeholder]?.length === 0 || templateData.values[definition.placeholder]?.[0]?.value?.length === 0))
            ) {
              return (
                <div key={definition.placeholder} style={{ borderLeft: '3px double red', marginLeft: '10px', paddingLeft: '4px' }}>
                  {handler.render(definition, templateData.values[definition.placeholder] || [], (x) =>
                    onChange(definition.placeholder, x), editMode, editControl, placeholders, originalIndex, moveVariable, templateData.variables, selectedVariable, setSelectedVariable, deleteVariable // Pass deleteVariable here
                  )}
                </div>
              );
            } else {
              return (
                <div key={definition.placeholder} className="variable-container">
                  {handler.render(definition, templateData.values[definition.placeholder] || [], (x) =>
                    onChange(definition.placeholder, x), editMode, editControl, placeholders, originalIndex, moveVariable, templateData.variables, selectedVariable, setSelectedVariable, deleteVariable // Pass deleteVariable here
                  )}
                </div>
              );
            }
          }
        })}
    </div>
  );

  const renderEditMode = () => (
    <div className="d-flex">
      <div className={`slender-column ${isColumnMinimized ? 'minimized' : 'expanded'}`}>
        <div className="toggle-area sticky-top" onClick={() => setIsColumnMinimized(!isColumnMinimized)}>
          <div className="toggle-icon">
            {isColumnMinimized ? '▶' : 'Drag & Drop ◀'}
          </div>
        </div>
        {!isColumnMinimized && (
          <div className="options-list">
            <ControlColumn /> {/* Integrate the ControlColumn component */}
          </div>
        )}
      </div>
      <div className="main-content" ref={drop} style={{ marginLeft: isColumnMinimized ? '30px' : '200px' }}>
        {templateData.variables.length === 0 && (
          <div ref={dropEmpty} className="empty-drop-box">
            Drag and drop a control here
          </div>
        )}
        {templateData.variables.map((variable, index) => (
          <div key={variable.definition.placeholder} id={`variable-${index}`} className="variable-item">
            {variable.handler.render(variable.definition, templateData.values[variable.definition.placeholder] || [], (x) =>
              onChange(variable.definition.placeholder, x), editMode, editControl, placeholders, index, moveVariable, templateData.variables, selectedVariable, setSelectedVariable, deleteVariable // Pass variables here
            )}
          </div>
        ))}
      </div>
    </div>
  );


  return (
    <div>
      {editMode ? renderEditMode() : renderNormalMode()}
    </div>
  );
}

// CSS for the slender column
const css = `
  .slender-column {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    transition: all 0.3s ease;
    z-index: 1000; /* Ensure it stays on top */
  }
  .slender-column.minimized {
    width: 30px;
    background-color: #f0f0f0;
    cursor: pointer;
  }
  .slender-column.expanded {
    width: 200px;
    background-color: #f8f9fa;
  }
  .toggle-area {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 30px; /* Adjust the height as needed */
    background-color: #007bff;
    color: white;
    cursor: pointer;
    padding: 5px;
    border-radius: 0 5px 5px 0;
  }
  .sticky-top {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .toggle-icon {
    font-size: 1.2rem;
  }
  .options-list {
    padding: 10px;
    overflow-y: auto; /* Allow scrolling within the options list */
    height: calc(100vh - 40px); /* Adjust height based on toggle area height */
  }
  .main-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    margin-left: 200px; /* Adjust based on the width of the slender column */
    transition: margin-left 0.3s ease;
  }
  .main-content.minimized {
    margin-left: 30px;
  }
  .variable-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .variable-item {
    flex-grow: 1;
  }
  .button-container {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 1rem;
  }
`;

const style = document.createElement('style');
style.textContent = css;
document.head.append(style);