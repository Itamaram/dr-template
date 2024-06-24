import React, { useState, useEffect } from 'react';
import { Modal, Button, FormCheck } from 'react-bootstrap';

function OptionsModal({ show, onHide, options, placeholder, onSave }) {
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    setSelectedOptions([]);
  }, [show]);

  const handleOptionChange = (option) => {
    setSelectedOptions((prev) => {
      if (prev.includes(option)) {
        return prev.filter((opt) => opt !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedOptions);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Select Options for {placeholder}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {options.map((option, index) => (
          <FormCheck
            key={index}
            type="checkbox"
            label={option.key}
            checked={selectedOptions.includes(option.key)}
            onChange={() => handleOptionChange(option.key)}
          />
        ))}
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
  );
}

export default OptionsModal;
