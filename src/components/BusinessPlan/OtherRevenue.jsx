import React, { useState } from 'react';
import './BusinessPlanComponents.css';
import { formatCurrency } from '../../utils/businessPlanCalculations';

const OtherRevenue = ({ data, viewMode, workType, permissions, onSave }) => {
  const [revenues, setRevenues] = useState(data || []);
  const [showMonthly, setShowMonthly] = useState(false);

  const handleInputChange = (index, field, value) => {
    if (!permissions.canEdit) return;

    const updated = [...revenues];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setRevenues(updated);
  };

  const handleMonthlyChange = (index, month, value) => {
    if (!permissions.canEdit) return;

    const updated = [...revenues];
    if (!updated[index].months) {
      updated[index].months = {};
    }
    updated[index].months[month] = parseFloat(value) || 0;
    
    // Recalculate total
    updated[index].totalRevenue = Object.values(updated[index].months)
      .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    
    setRevenues(updated);
  };

  const handleAddRevenue = () => {
    if (!permissions.canEdit) return;

    const newRevenue = {
      id: Date.now(),
      revenue: '',
      onsiteFee: 0,
      revenueFrom: '',
      otherRevenues: 0,
      totalRevenue: 0,
      months: {
        'Jan-2026': 0,
        'Feb-2026': 0,
        'Mar-2026': 0,
        'Apr-2026': 0,
        'May-2026': 0,
        'Jun-2026': 0
      }
    };
    setRevenues([...revenues, newRevenue]);
  };

  const handleDeleteRevenue = (index) => {
    if (!permissions.canEdit) return;
    
    if (window.confirm('Bạn có chắc muốn xóa dòng này?')) {
      setRevenues(revenues.filter((_, i) => i !== index));
    }
  };

  const getTotalRevenue = () => {
    return revenues.reduce((sum, rev) => sum + (parseFloat(rev.totalRevenue) || 0), 0);
  };

  const months = ['Jan-2026', 'Feb-2026', 'Mar-2026', 'Apr-2026', 'May-2026', 'Jun-2026'];

  return (
    <div className="bp-section">
      <div className="bp-section-header">
        <div>
          <h3>Other Revenue</h3>
          <p className="section-subtitle">Doanh thu khác ngoài Software Production</p>
        </div>
        
        <div className="section-actions">
          <button 
            className={`btn-toggle ${showMonthly ? 'active' : ''}`}
            onClick={() => setShowMonthly(!showMonthly)}
          >
            {showMonthly ? 'Hide' : 'Show'} Monthly Details
          </button>
          
          {permissions.canEdit && (
            <button className="btn-primary" onClick={handleAddRevenue}>
              + Add Revenue
            </button>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="bp-table">
          <thead>
            <tr>
              <th rowSpan="2">Revenue</th>
              <th rowSpan="2">Onsite Fee</th>
              <th rowSpan="2">Revenue from</th>
              <th rowSpan="2">Other revenues</th>
              <th rowSpan="2">Total revenue value</th>
              {showMonthly && months.map(month => (
                <th key={month}>{month}</th>
              ))}
              <th rowSpan="2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {revenues.length === 0 ? (
              <tr>
                <td colSpan={showMonthly ? 12 : 6} className="text-center empty-state">
                  Chưa có dữ liệu. Click "Add Revenue" để thêm.
                </td>
              </tr>
            ) : (
              revenues.map((revenue, index) => (
                <tr key={revenue.id || index}>
                  <td>
                    <input
                      type="text"
                      className="table-input"
                      value={revenue.revenue}
                      onChange={(e) => handleInputChange(index, 'revenue', e.target.value)}
                      disabled={!permissions.canEdit}
                      placeholder="Revenue name"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="table-input text-right"
                      value={revenue.onsiteFee}
                      onChange={(e) => handleInputChange(index, 'onsiteFee', parseFloat(e.target.value) || 0)}
                      disabled={!permissions.canEdit}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="table-input"
                      value={revenue.revenueFrom}
                      onChange={(e) => handleInputChange(index, 'revenueFrom', e.target.value)}
                      disabled={!permissions.canEdit}
                      placeholder="Source"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="table-input text-right"
                      value={revenue.otherRevenues}
                      onChange={(e) => handleInputChange(index, 'otherRevenues', parseFloat(e.target.value) || 0)}
                      disabled={!permissions.canEdit}
                    />
                  </td>
                  <td className="text-right font-bold">
                    {permissions.canViewFinancial ? formatCurrency(revenue.totalRevenue) : '***'}
                  </td>
                  
                  {showMonthly && months.map(month => (
                    <td key={month}>
                      <input
                        type="number"
                        className="table-input text-right monthly-input"
                        value={revenue.months?.[month] || 0}
                        onChange={(e) => handleMonthlyChange(index, month, e.target.value)}
                        disabled={!permissions.canEdit}
                      />
                    </td>
                  ))}
                  
                  <td className="text-center">
                    {permissions.canEdit && (
                      <button
                        className="btn-delete-row"
                        onClick={() => handleDeleteRevenue(index)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
            
            {revenues.length > 0 && (
              <tr className="total-row">
                <td colSpan="4" className="text-right"><strong>Total Other Revenue:</strong></td>
                <td className="text-right font-bold highlight-positive">
                  {permissions.canViewFinancial ? formatCurrency(getTotalRevenue()) : '***'}
                </td>
                {showMonthly && <td colSpan={months.length}></td>}
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {permissions.canEdit && revenues.length > 0 && (
        <div className="section-footer">
          <button className="btn-save" onClick={() => onSave({ revenues })}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default OtherRevenue;
