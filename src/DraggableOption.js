import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Row, Col, FormControl, Button } from 'react-bootstrap';

const ItemTypes = {
  OPTION: 'option',
};

const DraggableOption = ({ option, index, moveOption, handleOptionInputChange, handleRemoveOption, localDefaultValue, handleOptionClick }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.OPTION,
    hover(item) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveOption(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.OPTION,
    item: { type: ItemTypes.OPTION, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Row
      ref={ref}
      className={`draggable-option ${isDragging ? 'dragging' : ''}`}
      style={{
        backgroundColor: (Array.isArray(localDefaultValue) ? localDefaultValue.includes(option.key) : localDefaultValue === option.key) ? 'lightblue' : 'inherit',
      }}
      onClick={() => handleOptionClick(option.key)}
    >
      <Col>
        <FormControl
          type="text"
          value={option.key}
          onChange={(e) => handleOptionInputChange(index, 'key', e)}
          placeholder="Key"
        />
      </Col>
      <Col>
        <FormControl
          type="text"
          value={option.value}
          onChange={(e) => handleOptionInputChange(index, 'value', e)}
          placeholder="Value"
        />
      </Col>
      <Col>
        <Button variant="danger" onClick={() => handleRemoveOption(index)}>Remove</Button>
      </Col>
    </Row>
  );
};

export default DraggableOption;
