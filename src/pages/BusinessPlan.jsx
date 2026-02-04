import React, { useState, useEffect } from 'react';
import './BusinessPlan.css';
import BusinessPlanSummary from '../components/BusinessPlan/BusinessPlanSummary';
import SoftwareProductionRevenue from '../components/BusinessPlan/SoftwareProductionRevenue';
import OtherRevenue from '../components/BusinessPlan/OtherRevenue';
import SellingExpenses from '../components/BusinessPlan/SellingExpenses';
import { fetchBusinessPlanData } from '../utils/businessPlanApi';
import { checkPermission } from '../utils/permissionUtils';

const BusinessPlan = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('businessPlan'); // businessPlan, revenuePlan, deliveryPlan
  const [viewMode, setViewMode] = useState('total'); // total, ob
  const [workType, setWorkType] = useState('onsite'); // onsite, offshore
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    loadData();
    loadPermissions();
  }, [workType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchBusinessPlanData(workType);
      setData(result);
    } catch (error) {
      console.error('Error loading business plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = () => {
    // Check user permissions
    const userPermissions = {
      canViewTotal: checkPermission(currentUser, 'VIEW_TOTAL'),
      canViewOB: checkPermission(currentUser, 'VIEW_OB'),
      canViewOnsite: checkPermission(currentUser, 'VIEW_ONSITE'),
      canViewOffshore: checkPermission(currentUser, 'VIEW_OFFSHORE'),
      canEdit: checkPermission(currentUser, 'EDIT_BUSINESS_PLAN'),
      canViewFinancial: checkPermission(currentUser, 'VIEW_FINANCIAL_DATA')
    };
    setPermissions(userPermissions);
  };

  const handleSave = async (sectionData) => {
    if (!permissions.canEdit) {
      alert('Bạn không có quyền chỉnh sửa!');
      return;
    }

    try {
      // Save data logic here
      console.log('Saving data:', sectionData);
      alert('Lưu thành công!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Lưu thất bại!');
    }
  };

  const renderTabContent = () => {
    if (!data) return null;

    switch (activeTab) {
      case 'businessPlan':
        return (
          <div className="business-plan-content">
            <BusinessPlanSummary 
              data={data}
              viewMode={viewMode}
              workType={workType}
              permissions={permissions}
              onSave={handleSave}
            />
            
            <SoftwareProductionRevenue
              data={data.softwareProduction}
              viewMode={viewMode}
              workType={workType}
              permissions={permissions}
              onSave={handleSave}
            />

            <OtherRevenue
              data={data.otherRevenue}
              viewMode={viewMode}
              workType={workType}
              permissions={permissions}
              onSave={handleSave}
            />

            <SellingExpenses
              data={data.sellingExpenses}
              viewMode={viewMode}
              workType={workType}
              permissions={permissions}
              onSave={handleSave}
            />
          </div>
        );

      case 'revenuePlan':
        return (
          <div className="revenue-plan-content">
            <h3>Revenue Plan</h3>
            <p>Chi tiết kế hoạch doanh thu theo tháng</p>
            {/* Revenue Plan details */}
          </div>
        );

      case 'deliveryPlan':
        return (
          <div className="delivery-plan-content">
            <h3>Delivery Plan</h3>
            <p>Chi tiết kế hoạch giao hàng</p>
            {/* Delivery Plan details */}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="business-plan-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="business-plan-container">
      <div className="business-plan-header">
        <h1 className="business-plan-title">Business Plan</h1>
        
        <div className="business-plan-controls">
          {/* Work Type Selection */}
          <div className="control-group">
            <label>Mã vụ việc:</label>
            <div className="button-group">
              {permissions.canViewOnsite && (
                <button
                  className={`btn-control ${workType === 'onsite' ? 'active' : ''}`}
                  onClick={() => setWorkType('onsite')}
                >
                  Onsite
                </button>
              )}
              {permissions.canViewOffshore && (
                <button
                  className={`btn-control ${workType === 'offshore' ? 'active' : ''}`}
                  onClick={() => setWorkType('offshore')}
                >
                  Offshore
                </button>
              )}
            </div>
          </div>

          {/* View Mode Selection */}
          <div className="control-group">
            <label>Chế độ xem:</label>
            <div className="button-group">
              {permissions.canViewTotal && (
                <button
                  className={`btn-control ${viewMode === 'total' ? 'active' : ''}`}
                  onClick={() => setViewMode('total')}
                >
                  Total
                </button>
              )}
              {permissions.canViewOB && (
                <button
                  className={`btn-control ${viewMode === 'ob' ? 'active' : ''}`}
                  onClick={() => setViewMode('ob')}
                >
                  OB
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="business-plan-tabs">
        <button
          className={`tab-btn ${activeTab === 'businessPlan' ? 'active' : ''}`}
          onClick={() => setActiveTab('businessPlan')}
        >
          Business plan
        </button>
        <button
          className={`tab-btn ${activeTab === 'revenuePlan' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenuePlan')}
        >
          Revenue Plan
        </button>
        <button
          className={`tab-btn ${activeTab === 'deliveryPlan' ? 'active' : ''}`}
          onClick={() => setActiveTab('deliveryPlan')}
        >
          Delivery Plan
        </button>

        <div className="tab-actions">
          <button className="btn-action">Total</button>
          <button className="btn-action">OB</button>
          <button className="btn-action">Onsite</button>
          <button className="btn-action">Offshore</button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="business-plan-body">
        {!permissions.canViewFinancial ? (
          <div className="permission-denied">
            <p>⚠️ Bạn không có quyền xem dữ liệu tài chính này</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

// Default props for testing without authentication
BusinessPlan.defaultProps = {
  currentUser: {
    id: 1,
    name: 'Admin User',
    role: 'ADMIN',
    permissions: ['VIEW_TOTAL', 'VIEW_OB', 'VIEW_ONSITE', 'VIEW_OFFSHORE', 'EDIT_BUSINESS_PLAN', 'VIEW_FINANCIAL_DATA']
  }
};

export default BusinessPlan;
