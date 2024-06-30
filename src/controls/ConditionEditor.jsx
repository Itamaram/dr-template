import React, { useState, useEffect } from 'react';
import { FormControl, FormGroup, FormLabel, Button, Card, Dropdown, Row, Col } from 'react-bootstrap';

function ConditionEditor({ condition, setCondition, placeholders, variables, depth = 0, parentType = null }) {
  const initializeCondition = (condition) => {
    if (!condition || (typeof condition === 'object' && Object.keys(condition).length === 0)) return [];
    if (Array.isArray(condition)) return condition;
    return [condition];
  };

  const [localCondition, setLocalCondition] = useState(initializeCondition(condition));
  const [isInitialLogicChosen, setIsInitialLogicChosen] = useState(initializeCondition(condition).length > 0);

  useEffect(() => {
    const initializedCondition = initializeCondition(condition);
    setLocalCondition(initializedCondition);
    setIsInitialLogicChosen(initializedCondition.length > 0);
  }, [condition]);

  const handleAddLogic = (type) => {
    let newCondition = [...localCondition];
    if (depth === 0 && !isInitialLogicChosen) {
      setIsInitialLogicChosen(true);
    }
    if (type === 'single') {
      newCondition.push({ field: '', equals: '' });
    } else {
      newCondition.push({ [type]: [] });
    }
    setLocalCondition(newCondition);
    setCondition(newCondition.length > 1 || depth > 0 ? newCondition : newCondition[0]);
  };

  const handleRemoveCondition = (index) => {
    const updatedConditions = [...localCondition];
    updatedConditions.splice(index, 1);
    const newCondition = updatedConditions.length > 0 ? updatedConditions : []; // Ensure it is an empty array, not null
    setLocalCondition(updatedConditions);
    setCondition(newCondition);

    if (depth === 0 && updatedConditions.length === 0) {
      setIsInitialLogicChosen(false);
    }
  };

  const handleConditionChange = (index, field, value) => {
    const updatedConditions = [...localCondition];
    const condition = updatedConditions[index];

    if (field === 'field') {
      updatedConditions[index] = { ...condition, field: value };
    } else if (field === 'operator') {
      const operatorKey = Object.keys(condition).find(key => key !== 'field');
      updatedConditions[index] = { field: condition.field, [value]: condition[operatorKey] };
      delete updatedConditions[index][operatorKey];
    } else {
      const operatorKey = Object.keys(condition).find(key => key !== 'field');
      updatedConditions[index] = { ...condition, [operatorKey]: value };
    }

    const newCondition = updatedConditions.length > 1 || depth > 0 ? updatedConditions : updatedConditions[0] || [];
    setLocalCondition(updatedConditions);
    setCondition(newCondition);
  };

  const renderConditions = () => {
    return localCondition.map((cond, index) => {
      const operatorKey = Object.keys(cond).find(key => key !== 'field');
      const selectedField = cond.field;
      const selectedFieldVariable = variables.find(v => v.definition.placeholder === selectedField);
      const options = selectedFieldVariable ? (selectedFieldVariable?.definition?.options?.length > 0 ? selectedFieldVariable.definition.options : null) : null;

      if (cond.and || cond.or) {
        const operatorKey = cond.and ? 'and' : 'or';
        return (
          <Card key={`${operatorKey}-${index}`} className="mt-2" style={{ marginLeft: `${depth * 20}px`, padding: '10px' }}>
            <FormGroup>
              <Row>
                <Col>
                  <FormLabel>{operatorKey.toUpperCase()} Logic Group</FormLabel>
                </Col>
                <Col>
                  <Button variant="danger" onClick={() => handleRemoveCondition(index)}>Remove Group</Button>
                </Col>
              </Row>
              <ConditionEditor
                condition={cond[operatorKey]}
                setCondition={(newCondition) => {
                  const updatedConditions = [...localCondition];
                  updatedConditions[index][operatorKey] = newCondition;
                  setLocalCondition(updatedConditions);
                  setCondition(updatedConditions.length > 1 || depth > 0 ? updatedConditions : updatedConditions[0]);
                }}
                placeholders={placeholders}
                variables={variables}
                depth={depth + 1}
                parentType={operatorKey}
              />
            </FormGroup>
          </Card>
        );
      } else {
        return (
          <Card key={`single-${index}`} className="mt-2" style={{ marginLeft: `${depth * 20}px`, padding: '10px' }}>
            <FormGroup>
              <Row>
                <Col>
                  <FormControl
                    as="select"
                    value={cond.field}
                    onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                  >
                    <option value="">Select Field</option>
                    {placeholders.map((ph, idx) => (
                      <option key={idx} value={ph}>{ph}</option>
                    ))}
                  </FormControl>
                </Col>
                <Col>
                  <FormControl
                    as="select"
                    value={operatorKey}
                    onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                  >
                    <option value="equals">Equals</option>
                    <option value="not-equals">Not Equals</option>
                  </FormControl>
                </Col>
                <Col>
                  {options ? (
                    <FormControl
                      as="select"
                      value={cond[operatorKey]}
  onChange={(e) => {
    const value = e.target.value === "" ? [] : e.target.value;
    handleConditionChange(index, operatorKey, value);
  }}
                    >
                      <option value="">Select Value</option>
                      <option value={[]}>Empty</option>
                      {options.map((opt, idx) => (
                        <option key={idx} value={opt.key}>{opt.key}</option>
                      ))}
                    </FormControl>
                  ) : (
                    <FormControl
                      value={cond[operatorKey]}
                      onChange={(e) => handleConditionChange(index, operatorKey, e.target.value)}
                    />
                  )}
                </Col>
                <Col>
                  <Button variant="danger" onClick={() => handleRemoveCondition(index)}>Remove</Button>
                </Col>
              </Row>
            </FormGroup>
          </Card>
        );
      }
    });
  };

  return (
    <div>
      {depth === 0 && !isInitialLogicChosen && (
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Add Logic
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleAddLogic('single')}>Single Logic</Dropdown.Item>
            <Dropdown.Item onClick={() => handleAddLogic('and')}>AND Logic Group</Dropdown.Item>
            <Dropdown.Item onClick={() => handleAddLogic('or')}>OR Logic Group</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
      {renderConditions()}
      {depth > 0 && (
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Add Logic
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleAddLogic('single')}>Single Logic</Dropdown.Item>
            <Dropdown.Item onClick={() => handleAddLogic('and')}>AND Logic Group</Dropdown.Item>
            <Dropdown.Item onClick={() => handleAddLogic('or')}>OR Logic Group</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
}

export default ConditionEditor;
