import React, { useState } from 'react';
import './BusinessPlanComponents.css';
import { formatCurrency } from '../../utils/businessPlanCalculations';

const SellingExpenses = ({ data, viewMode, workType, permissions, onSave }) => {
  const [expenses, setExpenses] = useState(data || []);
  const [showMonthly, setShowMonthly] = useState(false);

  const handleInputChange = (index, field, value) => {
    if (!permissions.canEdit) return;

    const updated = [...expenses];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setExpenses(updated);
  };

  const handleMonthlyChange = (index, month, value) => {
    if (!permissions.canEdit) return;

    const updated = [...expenses];
    if (!updated[index].months) {
      updated[index].months = {};
    }
    updated[index].months[month] = parseFloat(value) || 0;
    
    // Recalculate total
    updated[index].totalExpense = Object.values(updated[index].months)
      .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    
    setExpenses(updated);
  };

  const handleAddExpense = () => {
    if (!permissions.canEdit) return;

    const newExpense = {
      id: Date.now(),
      category: '',
      totalExpense: 0,
      months: {
        'Jan-2026': 0,
        'Feb-2026': 0,
        'Mar-2026': 0,
        'Apr-2026': 0,
        'May-2026': 0,
        'Jun-2026': 0
      }
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleDeleteExpense = (index) => {
    if (!permissions.canEdit) return;
    
    if (window.confirm('Bạn có chắc muốn xóa dòng này?')) {
      setExpenses(expenses.filter((_, i) => i !== index));
    }
  };

  const getTotalExpense = () => {
    return expenses.reduce((sum, exp) => sum + (parseFloat(exp.totalExpense) || 0), 0);
  };

  const months = ['Jan-2026', 'Feb-2026', 'Mar-2026', 'Apr-2026', 'May-2026', 'Jun-2026'];

  return (
    <div className="bp-section">
      <div className="bp-section-header">
        <div>
          <h3>Selling Expenses</h3>
          <p className="section-subtitle">Chi phí bán hàng và marketing</p>
        </div>
        
        <div className="section-actions">
          <button 
            className={`btn-toggle ${showMonthly ? 'active' : ''}`}
            onClick={() => setShowMonthly(!showMonthly)}
          >
            {showMonthly ? 'Hide' : 'Show'} Monthly Details
          </button>
          
          {permissions.canEdit && (
            <button className="btn-primary" onClick={handleAddExpense}>
              + Add Expense
            </button>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="bp-table">
          <thead>
            <tr>
              <th rowSpan="2">Selling Expenses Categories</th>
              <th rowSpan="2">Total Expense Value</th>
              {showMonthly && months.map(month => (
                <th key={month}>{month}</th>
              ))}
              <th rowSpan="2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={showMonthly ? 9 : 3} className="text-center empty-state">
                  Chưa có dữ liệu. Click "Add Expense" để thêm.
                </td>
              </tr>
            ) : (
              expenses.map((expense, index) => (
                <tr key={expense.id || index}>
                  <td>
                    <input
                      type="text"
                      className="table-input"
                      value={expense.category}
                      onChange={(e) => handleInputChange(index, 'category', e.target.value)}
                      disabled={!permissions.canEdit}
                      placeholder="Expense category"
                    />
                  </td>
                  <td className="text-right font-bold">
                    {permissions.canViewFinancial ? formatCurrency(expense.totalExpense) : '***'}
                  </td>
                  
                  {showMonthly && months.map(month => (
                    <td key={month}>
                      <input
                        type="number"
                        className="table-input text-right monthly-input"
                        value={expense.months?.[month] || 0}
                        onChange={(e) => handleMonthlyChange(index, month, e.target.value)}
                        disabled={!permissions.canEdit}
                      />
                    </td>
                  ))}
                  
                  <td className="text-center">
                    {permissions.canEdit && (
                      <button
                        className="btn-delete-row"
                        onClick={() => handleDeleteExpense(index)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
            
            {expenses.length > 0 && (
              <tr className="total-row">
                <td className="text-right"><strong>Total Selling Expenses:</strong></td>
                <td className="text-right font-bold highlight-negative">
                  {permissions.canViewFinancial ? formatCurrency(getTotalExpense()) : '***'}
                </td>
                {showMonthly && <td colSpan={months.length}></td>}
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {permissions.canEdit && expenses.length > 0 && (
        <div className="section-footer">
          <button className="btn-save" onClick={() => onSave({ expenses })}>
            Save Changes
          </button>
        </div>
      )}

      <div className="bp-note">
        <p><strong>Lưu ý:</strong> Agency Expense = Selling Expenses</p>
      </div>
    </div>
  );
};

export default SellingExpenses;
