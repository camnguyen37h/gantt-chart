import React, { useState } from 'react';
import './BusinessPlanComponents.css';
import { 
  calculateTotalRevenue, 
  calculateExchangeAmount,
  formatCurrency 
} from '../../utils/businessPlanCalculations';

const SoftwareProductionRevenue = ({ data, viewMode, workType, permissions, onSave }) => {
  const [positions, setPositions] = useState(data || []);
  const [filter, setFilter] = useState('all');

  const handleInputChange = (index, field, value) => {
    if (!permissions.canEdit) return;

    const updated = [...positions];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setPositions(updated);
  };

  const handleAddPosition = () => {
    if (!permissions.canEdit) return;

    const newPosition = {
      id: Date.now(),
      position: '',
      unitPrice: 0,
      department: workType === 'onsite' ? 'DU3' : 'DU1',
      exchangeRate: 1,
      pipelineRatio: 100,
      total: 0,
      months: {}
    };
    setPositions([...positions, newPosition]);
  };

  const handleDeletePosition = (index) => {
    if (!permissions.canEdit) return;
    
    if (window.confirm('Bạn có chắc muốn xóa vị trí này?')) {
      setPositions(positions.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = (position) => {
    return calculateTotalRevenue(
      position.unitPrice,
      position.exchangeRate,
      position.pipelineRatio
    );
  };

  const renderDepartmentColumns = () => {
    if (viewMode === 'total') {
      return (
        <>
          <th>Total</th>
          <th>BJI</th>
          <th>Internal</th>
          <th>DU1</th>
          <th>DU3</th>
        </>
      );
    } else {
      // OB view
      return <th>Total</th>;
    }
  };

  const renderPositionRow = (position, index) => {
    const total = calculateTotal(position);
    
    return (
      <tr key={position.id || index}>
        <td>
          <input
            type="text"
            className="table-input"
            value={position.position}
            onChange={(e) => handleInputChange(index, 'position', e.target.value)}
            disabled={!permissions.canEdit}
            placeholder="Position"
          />
        </td>
        <td>
          <input
            type="number"
            className="table-input text-right"
            value={position.unitPrice}
            onChange={(e) => handleInputChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
            disabled={!permissions.canEdit}
          />
        </td>
        <td>
          <select
            className="table-select"
            value={position.department}
            onChange={(e) => handleInputChange(index, 'department', e.target.value)}
            disabled={!permissions.canEdit}
          >
            <option value="DU1">DU1</option>
            <option value="DU3">DU3</option>
            <option value="BJI">BJI</option>
            <option value="Internal">Internal</option>
          </select>
        </td>
        <td>
          <input
            type="number"
            className="table-input text-right"
            value={position.exchangeRate}
            onChange={(e) => handleInputChange(index, 'exchangeRate', parseFloat(e.target.value) || 1)}
            disabled={!permissions.canEdit}
            step="0.01"
          />
        </td>
        <td>
          <input
            type="number"
            className="table-input text-right"
            value={position.pipelineRatio}
            onChange={(e) => handleInputChange(index, 'pipelineRatio', parseFloat(e.target.value) || 100)}
            disabled={!permissions.canEdit}
            min="0"
            max="100"
          />
          <span className="percent-sign">%</span>
        </td>
        <td className="text-right font-bold">
          {permissions.canViewFinancial ? formatCurrency(total) : '***'}
        </td>
        <td className="text-center">
          {permissions.canEdit && (
            <button
              className="btn-delete-row"
              onClick={() => handleDeletePosition(index)}
              title="Xóa"
            >
              🗑️
            </button>
          )}
        </td>
      </tr>
    );
  };

  const getTotalRevenue = () => {
    return positions.reduce((sum, position) => sum + calculateTotal(position), 0);
  };

  return (
    <div className="bp-section">
      <div className="bp-section-header">
        <div>
          <h3>Software Production Revenue Info</h3>
          <p className="section-subtitle">
            {workType === 'onsite' ? 'Onsite Work' : 'Offshore Work'}
          </p>
        </div>
        
        <div className="section-actions">
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Filter</option>
            <option value="du1">DU1</option>
            <option value="du3">DU3</option>
            <option value="bji">BJI</option>
          </select>
          
          <button className="btn-link">Go to billing plan</button>
          
          {permissions.canEdit && (
            <button className="btn-primary" onClick={handleAddPosition}>
              + Add Position
            </button>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="bp-table">
          <thead>
            <tr>
              <th rowSpan="2">Position</th>
              <th rowSpan="2">Unit Price</th>
              <th rowSpan="2">Department</th>
              <th rowSpan="2">Exchange Rate</th>
              <th rowSpan="2">Pipeline Ratio</th>
              <th rowSpan="2">Total</th>
              <th rowSpan="2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center empty-state">
                  Chưa có dữ liệu. Click "Add Position" để thêm.
                </td>
              </tr>
            ) : (
              positions.map((position, index) => renderPositionRow(position, index))
            )}
            
            {positions.length > 0 && (
              <tr className="total-row">
                <td colSpan="5" className="text-right"><strong>Total Revenue:</strong></td>
                <td className="text-right font-bold highlight-positive">
                  {permissions.canViewFinancial ? formatCurrency(getTotalRevenue()) : '***'}
                </td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {permissions.canEdit && (
        <div className="section-footer">
          <button className="btn-save" onClick={() => onSave({ positions })}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default SoftwareProductionRevenue;
