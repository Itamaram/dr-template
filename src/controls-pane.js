import React, { useState } from 'react';
import assess from './conditions';

export default function ControlsPane({ variables, values, onChange }) {
  const [minimizeIndices, setMinimizeIndices] = useState([]);

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
        const { definition } = variables[i];
        if (
          assess(definition.condition, values) && (
          (definition.type !== 'checkbox' && definition.type !== 'title' &&
          ((values[definition.placeholder] && (values[definition.placeholder].length === 0 || values[definition.placeholder]?.[0]?.value?.length === 0)  && definition.style !== 'not required') ||
            ((values[definition.placeholder].length === 0 || values[definition.placeholder]?.[0]?.value?.length === 0)  && definition.style !== 'not required'))) ||
        (definition.type === 'checkbox' && definition.style === 'required' && (values[definition.placeholder].length === 0 || values[definition.placeholder]?.[0]?.value?.length === 0) )
        )) {
          return true;
        }
      }
    }
    return false;
  };

  function findNextMediumStyleIndex(startIndex) {
    const filteredVariables = variables;

    for (let i = startIndex + 1; i < filteredVariables.length; i++) {
      const { definition } = filteredVariables[i];
      if (definition && definition.style === 'medium') {
        return i;
      }
    }

    return filteredVariables.length;
  }

  const minimizeButtonHandler = () => {
    const indicesToMinimize = variables.reduce((indices, { definition }, index) => {
      if (definition) {
        indices.push(index);
      }
      return indices;
    }, []);
    setMinimizeIndices(indicesToMinimize);
  };

  return (
    <div>
      <div className="button-container">
        <button className="btn btn-primary mb-3" onClick={minimizeButtonHandler}>
          Minimise
        </button>
        <button className="btn btn-primary mb-3" style={{ marginLeft: '5rem' }} onClick={() => setMinimizeIndices([])}>
          Expand
        </button>
      </div>
      {variables
        .filter(({ definition }) => assess(definition.condition, values))
        .map(({ definition, handler }, originalIndex) => {
          let filteredVariables;
          if (!filteredVariables) {
            filteredVariables = variables.reduce((acc, variable, originalIndex) => {
              if (assess(variable.definition.condition, values)) {
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
                ? { borderLeft: '4px double red' , marginLeft: '6px', paddingLeft: '4px' }
                : { borderLeft: '4px double #61dafb', paddingLeft: '4px' }
              : {};

            return (
              <div key={definition.placeholder} onClick={() => handleTitleClick(originalIndex)}>
                <div style={titleStyle}>
                  {handler.render(definition, values[definition.placeholder], (x) =>
                    onChange(definition.placeholder, x),values
                  )}
                </div>
              </div>
            );
          } else if (minimizeIndices.includes(originalIndex)) {
            return null; // Return null to hide the control component
          } else {
            if (
              (definition.type !== 'checkbox' && definition.type !== 'title' &&
              ((values[definition.placeholder] && (values[definition.placeholder].length === 0 || values[definition.placeholder]?.[0]?.value?.length === 0)  && definition.style !== 'not required') ||
                ((values[definition.placeholder].length === 0 || values[definition.placeholder]?.[0]?.value?.length === 0)  && definition.style !== 'not required'))) ||
            (definition.type === 'checkbox' && definition.style === 'required' && (values[definition.placeholder].length === 0 || values[definition.placeholder]?.[0]?.value?.length === 0) )
            ) {
              return (
                <div key={definition.placeholder} style={{ borderLeft: '3px double red', marginLeft: '10px', paddingLeft: '4px' }}>
                  {handler.render(definition, values[definition.placeholder], (x) =>
                    onChange(definition.placeholder, x),values
                  )}
                </div>
              );
            } else {
              return (
                <div key={definition.placeholder}>
                  {handler.render(definition, values[definition.placeholder], (x) =>
                    onChange(definition.placeholder, x),values
                  )}
                </div>
              );
            }
          }
        })}
    </div>
  );
}
