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
    const filteredVariables = variables.filter(({ definition }) => assess(definition.condition, values));

    for (let i = startIndex + 1; i < filteredVariables.length; i++) {
      const { definition, handler } = filteredVariables[i];
      if (definition && handler.type === 'title' && definition.style === 'medium') {
        return i;
      }
    }

    return filteredVariables.length;
  }

  return variables
    .filter(({ definition }) => assess(definition.condition, values))
    .map(({ definition, handler }, index) => {
      if (definition && handler.type === 'title' && definition.style === 'medium') {
        const isMinimized = minimizeIndices.includes(index);
        const titleStyle = isMinimized ? { borderLeft: '4px double #61dafb' } : {};

        return (
          <div key={definition.placeholder} onClick={() => handleTitleClick(index)}>
            <div style={titleStyle}>
              {handler.render(definition, values[definition.placeholder], x => onChange(definition.placeholder, x))}
            </div>
          </div>
        );
      } else if (minimizeIndices.includes(index)) {
        return null; // Return null to hide the control component
      } else {
        return handler.render(definition, values[definition.placeholder], x => onChange(definition.placeholder, x));
      }
    });
}
