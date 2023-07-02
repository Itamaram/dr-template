import assess from './conditions';
import React, { useState } from 'react';

export default function ControlsPane({ variables, values, onChange }) {
  const [minimizeIndices, setMinimizeIndices] = useState([]);

  const handleTitleClick = (index) => {
    const nextMediumStyleIndex = findNextMediumStyleIndex(index);

    if (minimizeIndices.includes(index)) {
      setMinimizeIndices(minimizeIndices.filter(i => i < index || i >= nextMediumStyleIndex));
    } else {
      const indicesToMinimize = [...Array(nextMediumStyleIndex - index - 1)].map((_, i) => index + i + 1);
      setMinimizeIndices([...minimizeIndices, index, ...indicesToMinimize]);
    }
  };

  function findNextMediumStyleIndex(startIndex) {
    const filteredVariables = variables;

    for (let i = startIndex + 1; i < filteredVariables.length; i++) {
      const { definition} = filteredVariables[i];
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
        <button
            className="btn btn-primary mb-3"
            style={{ marginLeft: '5rem' }} // Add margin to create space
            onClick={() => {
            setMinimizeIndices([]);
            }}
        >
            Expand
        </button>
        </div>
      {variables
        .filter(({ definition }) => assess(definition.condition, values))
        .map(({ definition, handler }, originalIndex) => {
            const filteredVariables = variables
            .map((variable, originalIndex) => ({ ...variable, originalIndex })) // Add index property to each variable
            .filter(({ definition }) => assess(definition.condition, values));

            originalIndex = filteredVariables[originalIndex].originalIndex;
          if (definition && definition.style === 'medium') {
            const isMinimized = minimizeIndices.includes(originalIndex);
            const titleStyle = isMinimized ? { borderLeft: '4px double #61dafb' } : {};

            return (
              <div key={definition.placeholder} onClick={() => handleTitleClick(originalIndex)}>
                <div style={titleStyle}>
                  {handler.render(definition, values[definition.placeholder], x =>
                    onChange(definition.placeholder, x)
                  )}
                </div>
              </div>
            );
          } else if (minimizeIndices.includes(originalIndex)) {
            return null; // Return null to hide the control component
          } else {
            return handler.render(definition, values[definition.placeholder], x =>
              onChange(definition.placeholder, x)
            );
          }
        })}
    </div>
  );
}
