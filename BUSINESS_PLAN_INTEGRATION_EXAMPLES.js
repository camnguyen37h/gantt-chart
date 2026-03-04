/**
 * Business Plan Mock API - React Integration Examples
 * Real-world examples showing how to integrate the mock API into React components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, InputNumber, Select, Button, message, Spin } from 'antd';
import {
  getBusinessPlanDetail,
  saveBusinessPlan,
  getProductionRevenue,
  saveProductionRevenue,
  getRevenueSummary,
  exportBusinessPlan,
  getAllPositions,
  getDepartmentsByBPVersion,
} from '@/lib/business-plan/businessPlanApiConfig';

// ============================================================================
// EXAMPLE 1: Simple Business Plan Viewer Component
// ============================================================================
export const BusinessPlanViewer = ({ businessPlanId }) => {
  const [businessPlan, setBusinessPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusinessPlan = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getBusinessPlanDetail(businessPlanId);
        setBusinessPlan(data);
      } catch (err) {
        setError(err.message);
        message.error('Failed to load business plan');
      } finally {
        setLoading(false);
      }
    };

    if (businessPlanId) {
      fetchBusinessPlan();
    }
  }, [businessPlanId]);

  if (loading) return <Spin tip="Loading business plan..." />;
  if (error) return <div>Error: {error}</div>;
  if (!businessPlan) return <div>No business plan found</div>;

  return (
    <div>
      <h2>{businessPlan.generalInfo.businessPlanName}</h2>
      <p>Project Code: {businessPlan.projectCode}</p>
      <p>Status: {businessPlan.status}</p>
      <p>Customer: {businessPlan.generalInfo.customerName}</p>
      <p>Contract Price: {businessPlan.generalInfo.totalContractPrice?.toLocaleString()} VND</p>
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Revenue Summary Dashboard Component
// ============================================================================
export const RevenueSummaryDashboard = ({ businessPlanId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRevenueSummary(businessPlanId);
      setSummary(data);
    } catch (error) {
      message.error('Failed to load revenue summary');
    } finally {
      setLoading(false);
    }
  }, [businessPlanId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) return <Spin />;
  if (!summary) return null;

  return (
    <div className="revenue-summary">
      <div className="metric-card">
        <h3>Total Revenue</h3>
        <p className="value">{summary.totalRevenue?.toLocaleString()} VND</p>
      </div>
      
      <div className="metric-card">
        <h3>Production Revenue</h3>
        <p className="value">{summary.totalProductionRevenue?.toLocaleString()} VND</p>
      </div>
      
      <div className="metric-card">
        <h3>Other Revenue</h3>
        <p className="value">{summary.totalOtherRevenue?.toLocaleString()} VND</p>
      </div>
      
      <div className="metric-card">
        <h3>Selling Expense</h3>
        <p className="value">{summary.totalSellingExpense?.toLocaleString()} VND</p>
      </div>
      
      <div className="metric-card highlight">
        <h3>Net Revenue</h3>
        <p className="value">{summary.netRevenue?.toLocaleString()} VND</p>
      </div>
      
      <div className="metric-card highlight">
        <h3>Profit Margin</h3>
        <p className="value">{summary.profitMargin?.toFixed(2)}%</p>
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Production Revenue Editor Component
// ============================================================================
export const ProductionRevenueEditor = ({ businessPlanId }) => {
  const [revenue, setRevenue] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenueData, positionsData] = await Promise.all([
          getProductionRevenue(businessPlanId),
          getAllPositions(),
        ]);
        setRevenue(revenueData);
        setPositions(positionsData);
      } catch (error) {
        message.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessPlanId]);

  const handleAddRevenueItem = () => {
    const newItem = {
      saleWorkOrderId: `WO-${Date.now()}`,
      pipelineKey: `PL-${Date.now()}`,
      position: positions[0]?.name || '',
      unitPrice: positions[0]?.unitPrice || 0,
      department: 'BU1',
      exchangeRate: 1,
      pipeLineRatio: 100,
      totalManMonth: 0,
      totalRevenue: 0,
      revenue: {},
    };

    setRevenue(prev => ({
      ...prev,
      revenueInfos: [...(prev?.revenueInfos || []), newItem],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProductionRevenue(businessPlanId, revenue);
      message.success('Production revenue saved successfully');
    } catch (error) {
      message.error('Failed to save production revenue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin tip="Loading..." />;

  return (
    <div>
      <h3>Production Revenue</h3>
      
      <button onClick={handleAddRevenueItem}>
        Add Revenue Item
      </button>
      
      <div className="revenue-list">
        {revenue?.revenueInfos?.map((item, index) => (
          <div key={index} className="revenue-item">
            <p>Position: {item.position}</p>
            <p>Unit Price: {item.unitPrice?.toLocaleString()} VND</p>
            <p>Total MM: {item.totalManMonth}</p>
            <p>Total Revenue: {item.totalRevenue?.toLocaleString()} VND</p>
          </div>
        ))}
      </div>
      
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

// ============================================================================
// EXAMPLE 4: Export Business Plan Component
// ============================================================================
export const ExportBusinessPlanButton = ({ businessPlanId, format = 'excel' }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportBusinessPlan(businessPlanId, format);
      
      // In real app, you would download the file
      message.success(`Exported to ${result.data.fileName}`);
      console.log('Download URL:', result.data.fileUrl);
      
      // Simulate download
      // window.open(result.data.fileUrl, '_blank');
      
    } catch (error) {
      message.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button onClick={handleExport} disabled={exporting}>
      {exporting ? 'Exporting...' : `Export to ${format.toUpperCase()}`}
    </button>
  );
};

// ============================================================================
// EXAMPLE 5: Custom Hook for Business Plan Data
// ============================================================================
export const useBusinessPlan = (businessPlanId) => {
  const [data, setData] = useState({
    businessPlan: null,
    summary: null,
    productionRevenue: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!businessPlanId) return;

    setLoading(true);
    setError(null);

    try {
      const [businessPlan, summary, productionRevenue] = await Promise.all([
        getBusinessPlanDetail(businessPlanId),
        getRevenueSummary(businessPlanId),
        getProductionRevenue(businessPlanId),
      ]);

      setData({
        businessPlan,
        summary,
        productionRevenue,
      });
    } catch (err) {
      setError(err.message);
      message.error('Failed to load business plan data');
    } finally {
      setLoading(false);
    }
  }, [businessPlanId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...data,
    loading,
    error,
    refresh,
  };
};

// Usage of custom hook:
export const BusinessPlanPageWithHook = ({ businessPlanId }) => {
  const { businessPlan, productionRevenue, loading, error, refresh } = 
    useBusinessPlan(businessPlanId);

  if (loading) return <Spin tip="Loading..." />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      
      <h2>{businessPlan?.generalInfo?.businessPlanName}</h2>
      
      <RevenueSummaryDashboard businessPlanId={businessPlanId} />
      
      <div>
        <h3>Production Revenue Items: {productionRevenue?.revenueInfos?.length || 0}</h3>
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 6: Redux AsyncThunk Integration
// ============================================================================

// In your Redux slice file:
/*
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getBusinessPlanDetail, 
  getRevenueSummary,
  saveBusinessPlan 
} from '@/lib/business-plan/businessPlanApiConfig';

// Async thunk to fetch business plan
export const fetchBusinessPlanThunk = createAsyncThunk(
  'businessPlan/fetchDetail',
  async (businessPlanId, { rejectWithValue }) => {
    try {
      const [businessPlan, summary] = await Promise.all([
        getBusinessPlanDetail(businessPlanId),
        getRevenueSummary(businessPlanId),
      ]);
      return { businessPlan, summary };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to save business plan
export const saveBusinessPlanThunk = createAsyncThunk(
  'businessPlan/save',
  async ({ businessPlanId, data }, { rejectWithValue }) => {
    try {
      const result = await saveBusinessPlan(businessPlanId, data);
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Redux slice
const businessPlanSlice = createSlice({
  name: 'businessPlan',
  initialState: {
    detail: null,
    summary: null,
    loading: false,
    error: null,
    saveStatus: 'idle',
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch business plan
      .addCase(fetchBusinessPlanThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessPlanThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload.businessPlan;
        state.summary = action.payload.summary;
      })
      .addCase(fetchBusinessPlanThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Save business plan
      .addCase(saveBusinessPlanThunk.pending, (state) => {
        state.saveStatus = 'loading';
      })
      .addCase(saveBusinessPlanThunk.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.detail = action.payload;
      })
      .addCase(saveBusinessPlanThunk.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearError } = businessPlanSlice.actions;
export default businessPlanSlice.reducer;

// Usage in component:
import { useDispatch, useSelector } from 'react-redux';
import { fetchBusinessPlanThunk, saveBusinessPlanThunk } from '@/redux/businessPlanSlice';

export const BusinessPlanWithRedux = ({ businessPlanId }) => {
  const dispatch = useDispatch();
  const { detail, summary, loading, error } = useSelector(state => state.businessPlan);

  useEffect(() => {
    dispatch(fetchBusinessPlanThunk(businessPlanId));
  }, [dispatch, businessPlanId]);

  const handleSave = () => {
    dispatch(saveBusinessPlanThunk({ 
      businessPlanId, 
      data: { ...detail, modified: true } 
    }));
  };

  if (loading) return <Spin />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{detail?.generalInfo?.businessPlanName}</h2>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};
*/

// ============================================================================
// EXAMPLE 7: Form Integration with Ant Design
// ============================================================================

export const BusinessPlanForm = ({ businessPlanId, onSave }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const businessPlan = await getBusinessPlanDetail(businessPlanId);
        form.setFieldsValue({
          businessPlanName: businessPlan.generalInfo.businessPlanName,
          customerName: businessPlan.generalInfo.customerName,
          totalContractPrice: businessPlan.generalInfo.totalContractPrice,
          orderType: businessPlan.generalInfo.orderType,
        });
      } catch (error) {
        message.error('Failed to load business plan');
      }
    };

    if (businessPlanId) {
      fetchData();
    }
  }, [businessPlanId, form]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const currentPlan = await getBusinessPlanDetail(businessPlanId);
      const updatedPlan = {
        ...currentPlan,
        generalInfo: {
          ...currentPlan.generalInfo,
          ...values,
        },
      };

      await saveBusinessPlan(businessPlanId, updatedPlan);
      message.success('Business plan saved successfully');
      onSave?.();
    } catch (error) {
      message.error('Failed to save business plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item 
        label="Business Plan Name" 
        name="businessPlanName"
        rules={[{ required: true, message: 'Please enter business plan name' }]}
      >
        <Input placeholder="Enter business plan name" />
      </Form.Item>

      <Form.Item 
        label="Customer Name" 
        name="customerName"
        rules={[{ required: true, message: 'Please enter customer name' }]}
      >
        <Input placeholder="Enter customer name" />
      </Form.Item>

      <Form.Item 
        label="Total Contract Price" 
        name="totalContractPrice"
        rules={[{ required: true, message: 'Please enter contract price' }]}
      >
        <InputNumber 
          style={{ width: '100%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
        />
      </Form.Item>

      <Form.Item 
        label="Order Type" 
        name="orderType"
      >
        <Select>
          <Select.Option value="Commercial">Commercial</Select.Option>
          <Select.Option value="ODC">ODC</Select.Option>
          <Select.Option value="Fixed Price">Fixed Price</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>
          {saving ? 'Saving...' : 'Save Business Plan'}
        </Button>
      </Form.Item>
    </Form>
  );
};

// ============================================================================
// NOTE: These are examples showing integration patterns
// Adjust imports and implementations based on your actual project structure
// ============================================================================
