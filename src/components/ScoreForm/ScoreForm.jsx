import React, { useState, useEffect } from 'react';
import './ScoreForm.css';
import { validateScores } from '../../utils/scoreValidation';

const ScoreForm = ({ roleId, roleName, initialScores, onSave }) => {
  const [scores, setScores] = useState(initialScores || []);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setScores(initialScores || []);
  }, [initialScores]);

  const handleInputChange = (index, field, value) => {
    const updatedScores = [...scores];
    updatedScores[index] = {
      ...updatedScores[index],
      [field]: value
    };
    setScores(updatedScores);

    // Clear error for this field when user starts typing
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const handleCheckboxChange = (index) => {
    const updatedScores = [...scores];
    updatedScores[index] = {
      ...updatedScores[index],
      status: !updatedScores[index].status
    };
    setScores(updatedScores);
  };

  const handleAddRow = () => {
    const newScore = {
      id: Date.now(),
      score: '',
      baseScore: '',
      status: false,
      definition: ''
    };
    setScores([...scores, newScore]);
  };

  const handleDeleteRow = (index) => {
    if (scores.length <= 1) {
      alert('Phải có ít nhất một bản ghi!');
      return;
    }

    const scoreToDelete = scores[index];
    if (scoreToDelete.score === 'N/A') {
      alert('Không thể xóa bản ghi N/A bắt buộc!');
      return;
    }

    const updatedScores = scores.filter((_, i) => i !== index);
    setScores(updatedScores);

    // Clear errors for deleted row
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`${index}-`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const handleSave = () => {
    const validationResult = validateScores(scores);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      alert('Vui lòng kiểm tra lại các trường có lỗi!');
      return;
    }

    setErrors({});
    onSave(scores);
    alert('Lưu thành công!');
  };

  const getInputClassName = (index, field) => {
    const hasError = errors[`${index}-${field}`];
    return `score-input ${hasError ? 'error' : ''}`;
  };

  return (
    <div className="score-form">
      <div className="score-form-header">
        <button className="btn-add-row" onClick={handleAddRow}>
          + Thêm dòng
        </button>
        <button className="btn-save" onClick={handleSave}>
          Save
        </button>
      </div>

      <div className="score-table-wrapper">
        <table className="score-table">
          <thead>
            <tr>
              <th>Score</th>
              <th>Base Score</th>
              <th>Status</th>
              <th>Định nghĩa</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => (
              <tr key={score.id || index}>
                <td>
                  <input
                    type="text"
                    className={getInputClassName(index, 'score')}
                    value={score.score}
                    onChange={(e) => handleInputChange(index, 'score', e.target.value)}
                    placeholder="Score"
                  />
                  {errors[`${index}-score`] && (
                    <div className="error-message">{errors[`${index}-score`]}</div>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    className={getInputClassName(index, 'baseScore')}
                    value={score.baseScore}
                    onChange={(e) => handleInputChange(index, 'baseScore', e.target.value)}
                    placeholder="0"
                  />
                  {errors[`${index}-baseScore`] && (
                    <div className="error-message">{errors[`${index}-baseScore`]}</div>
                  )}
                </td>
                <td className="td-center">
                  <input
                    type="checkbox"
                    className="score-checkbox"
                    checked={score.status || false}
                    onChange={() => handleCheckboxChange(index)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className={getInputClassName(index, 'definition')}
                    value={score.definition}
                    onChange={(e) => handleInputChange(index, 'definition', e.target.value)}
                    placeholder="Điểm 0 đáng nghĩa với việc ........."
                  />
                  {errors[`${index}-definition`] && (
                    <div className="error-message">{errors[`${index}-definition`]}</div>
                  )}
                </td>
                <td className="td-center">
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteRow(index)}
                    disabled={score.score === 'N/A'}
                    title={score.score === 'N/A' ? 'Không thể xóa N/A' : 'Xóa'}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {errors.general && (
        <div className="general-error-message">{errors.general}</div>
      )}
    </div>
  );
};

export default ScoreForm;
