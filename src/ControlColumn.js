import React from 'react';
import { useDrag } from 'react-dnd';
import { Card } from 'react-bootstrap';

const ItemTypes = {
  CONTROL: 'control',
};

const ControlItem = ({ type, name }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CONTROL,
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Card ref={drag} style={{ opacity: isDragging ? 0.5 : 1, marginBottom: '10px', padding: '10px', cursor: 'move' }}>
      {name}
    </Card>
  );
};

const ControlColumn = () => {
  const availableControls = [
    { type: 'checkbox', name: 'Checkbox' },
    { type: 'dropdown', name: 'Dropdown' },
    { type: 'radio', name: 'Radio' },
    { type: 'text', name: 'Text' },
    { type: 'textmulti', name: 'Text Multi' },
    { type: 'date', name: 'Date' },
    { type: 'datetime', name: 'DateTime' },
    { type: 'time', name: 'Time' },
    { type: 'number', name: 'Number' },
    { type: 'title', name: 'Title' },
    { type: 'select', name: 'Select' },
  ];

  return (
    <div style={{ width: '200px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
      {availableControls.map((control) => (
        <ControlItem key={control.type} {...control} />
      ))}
    </div>
  );
};

export default ControlColumn;
