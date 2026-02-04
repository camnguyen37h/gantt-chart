import React from 'react';
import './BusinessPlanComponents.css';
import { formatCurrency, formatNumber } from '../../utils/businessPlanCalculations';

const BusinessPlanSummary = ({ data, viewMode, workType, permissions, onSave }) => {
  if (!data || !data.summary) return null;

  const { summary } = data;

  const renderValue = (value, isCurrency = false) => {
    if (!permissions.canViewFinancial) return '***';
    if (isCurrency) return formatCurrency(value);
    return formatNumber(value);
  };

  const renderInfoIcon = (tooltipText) => (
    <span className="info-icon" title={tooltipText}>ⓘ</span>
  );

  return (
    <div className="bp-section">
      <div className="bp-section-header">
        <h3>Summary</h3>
        <span className="work-type-badge">{workType.toUpperCase()}</span>
      </div>

      <div className="summary-grid">
        <div className="summary-item">
          <label>
            MM bill
            {renderInfoIcon('Man-Month billing')}
          </label>
          <div className="summary-value">{renderValue(summary.mmBill, false)}</div>
        </div>

        <div className="summary-item">
          <label>
            Software production rev
            {renderInfoIcon('Software production revenue')}
          </label>
          <div className="summary-value highlight-positive">
            {renderValue(summary.softwareProductionRev, true)}
          </div>
        </div>

        <div className="summary-item">
          <label>
            Deduction
            {renderInfoIcon('Deduction amount')}
          </label>
          <div className="summary-value highlight-negative">
            {renderValue(summary.deduction, true)}
          </div>
        </div>

        <div className="summary-item">
          <label>
            Onsite Fee
            {renderInfoIcon('Onsite fee')}
          </label>
          <div className="summary-value">{renderValue(summary.onsiteFee, true)}</div>
        </div>

        <div className="summary-item">
          <label>
            Revenue from Equipment
            {renderInfoIcon('Revenue from equipment')}
          </label>
          <div className="summary-value">{renderValue(summary.revenueFromEquipment, true)}</div>
        </div>

        <div className="summary-item">
          <label>
            MM Bill
            {renderInfoIcon('Man-Month bill')}
          </label>
          <div className="summary-value">{renderValue(summary.mmBillValue, true)}</div>
        </div>

        <div className="summary-item">
          <label>
            Other Rev
            {renderInfoIcon('Other revenue')}
          </label>
          <div className="summary-value">{renderValue(summary.otherRev, true)}</div>
        </div>

        <div className="summary-item total-item">
          <label>
            <strong>Agency Expenses</strong>
            {renderInfoIcon('Total agency expenses')}
          </label>
          <div className="summary-value summary-total">
            {renderValue(summary.agencyExpenses, true)}
          </div>
        </div>
      </div>

      {viewMode === 'total' && (
        <div className="summary-comparison">
          <div className="comparison-column">
            <h4>Version mới phải bắt được cả 2 mã MVV</h4>
            <div className="comparison-note">
              Hiển thị tổng hợp cho cả Onsite và Offshore
            </div>
          </div>
        </div>
      )}

      {viewMode === 'ob' && (
        <div className="summary-comparison">
          <div className="comparison-column">
            <h4>Xem lại chỉ nào cần điền số</h4>
            <div className="comparison-note">
              Chế độ xem OB - Cân đối số
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessPlanSummary;
