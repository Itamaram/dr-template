import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, ListGroup, FormCheck } from 'react-bootstrap';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = {
  PLACEHOLDER: 'placeholder',
};

const DraggablePlaceholder = ({ placeholder, index, movePlaceholder, removePlaceholder, onClick }) => {
  
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemType.PLACEHOLDER,
    hover(item) {
      if (item.index !== index) {
        movePlaceholder(item.index, index);
        item.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType.PLACEHOLDER,
    item: { type: ItemType.PLACEHOLDER, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  // Split the placeholder by '|' and take the left value
  const displayText = placeholder.includes('|') ? placeholder.split('|')[0] : placeholder;

  return (
    <ListGroup.Item
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onClick={() => onClick(placeholder)}
    >
      {displayText}
      <Button
        variant="danger"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          removePlaceholder(index);
        }}
      >
        Remove
      </Button>
    </ListGroup.Item>
  );
};

function EditPlaceholderModal({ show, onHide, placeholders, onSave, handlePlaceholderClick }) {
  const [placeholderList, setPlaceholderList] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    const initialPlaceholders = placeholders.filter(
      (placeholder) => !['down_list', 'colon', 'fullstop'].includes(placeholder)
    );
    setPlaceholderList(initialPlaceholders);

    const initialOption = placeholders.find((placeholder) =>
      ['down_list', 'colon', 'fullstop'].includes(placeholder)
    );
    setSelectedOption(initialOption || '');
  }, [placeholders, show]);

  const movePlaceholder = (dragIndex, hoverIndex) => {
    if (hoverIndex === null) {
      const updatedList = placeholderList.filter((_, i) => i !== dragIndex);
      setPlaceholderList(updatedList);
    } else {
      const draggedPlaceholder = placeholderList[dragIndex];
      const updatedList = [...placeholderList];
      updatedList.splice(dragIndex, 1);
      updatedList.splice(hoverIndex, 0, draggedPlaceholder);
      setPlaceholderList(updatedList);
    }
  };

  const removePlaceholder = (index) => {
    const updatedList = placeholderList.filter((_, i) => i !== index);
    setPlaceholderList(updatedList);
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option === selectedOption ? '' : option);
  };

  const handleSave = () => {
    const updatedPlaceholders = [...placeholderList];
    if (selectedOption) {
      updatedPlaceholders.push(selectedOption);
    }
    onSave(updatedPlaceholders);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Placeholders</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {placeholderList.map((placeholder, index) => (
              <DraggablePlaceholder
                key={index}
                index={index}
                placeholder={placeholder}
                movePlaceholder={movePlaceholder}
                removePlaceholder={removePlaceholder}
                onClick={handlePlaceholderClick} // Handle clicks
              />
            ))}
          </ListGroup>
          <div style={{ marginTop: '20px' }}>
            <FormCheck
              type="checkbox"
              label="Down List"
              checked={selectedOption === 'down_list'}
              onChange={() => handleOptionChange('down_list')}
            />
            <FormCheck
              type="checkbox"
              label="Colon"
              checked={selectedOption === 'colon'}
              onChange={() => handleOptionChange('colon')}
            />
            <FormCheck
              type="checkbox"
              label="Fullstop"
              checked={selectedOption === 'fullstop'}
              onChange={() => handleOptionChange('fullstop')}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </DndProvider>
  );
}

export default EditPlaceholderModal;
