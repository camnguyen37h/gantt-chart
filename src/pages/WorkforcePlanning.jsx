import React, { useMemo, useState, useCallback } from 'react';
import { Row, Col, Tag, DatePicker, Button, Tabs, Radio } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MetricCard from '../components/MetricCard/MetricCard';
import moment from 'moment';
import './WorkforcePlanning.css';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const WorkforcePlanning = () => {
  const [viewMode, setViewMode] = useState('headcount');

  const projectInfo = useMemo(() => ({
    projectCode: 'P-3063',
    clientCode: 'G3_DH3.1_Client_Z602_Test',
    phase: 'DH3.1',
    dateRange: 'from 26-09-2025 to 26-09-2026',
    status: 'Development',
    globalId: 'GLBOD2500044',
    type: 'Project Based',
    runningStatus: 'Running',
  }), []);

  const workforceData = useMemo(() => [
    { month: 'Jan', actual: 45, planning: 42 },
    { month: 'Feb', actual: 48, planning: 47 },
    { month: 'Mar', actual: 52, planning: 55 },
    { month: 'Apr', actual: 50, planning: 53 },
    { month: 'May', actual: 58, planning: 58 },
    { month: 'Jun', actual: 62, planning: 63 },
    { month: 'Jul', actual: 68, planning: 67 },
    { month: 'Aug', actual: 62, planning: 65 },
    { month: 'Sep', actual: 70, planning: 72 },
    { month: 'Oct', actual: 75, planning: 78 },
    { month: 'Nov', actual: 72, planning: 76 },
    { month: 'Dec', actual: 75, planning: 79 },
  ], []);

  const metricsData = useMemo(() => [
    { title: 'BILL IN MONTHS', value: '12.45', unit: '(MM)' },
    { title: 'ALLOCATION IN MONTHS', value: '5.71', subtitle: '3.65 WT | 2.06 Extra', unit: '(MM)' },
    { title: 'PLANNING BILL RATE IN MONTHS', value: '45.80', unit: '(%)', color: 'red' },
    { title: 'ACTUAL BILL RATE IN MONTHS', value: '42.35', unit: '(%)', color: 'red' },
    { title: 'ACTUAL TIMESHEET IN MONTHS', value: '8.92', subtitle: '5.43 WT | 3.49 Extra', unit: '(MM)' },
    { title: 'MM Plan', value: '15.250', unit: '(MM)' },
    { title: 'AI SUPPORTING IN MONTHS', value: '2.350', unit: '(MM)' },
    { title: 'BUDGET BILLABLE', value: '100.00', unit: '(MM)' },
  ], []);

  const handleViewModeChange = useCallback((e) => {
    setViewMode(e.target.value);
  }, []);

  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-actual">
            Actual: <strong>{payload[0].value}</strong>
          </p>
          <p className="tooltip-planning">
            Planning: <strong>{payload[1].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  }, []);

  return (
    <div className="workforce-planning">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-item">Delivery</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item">Project</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">Project Overview</span>
      </div>

      {/* Project Header */}
      <div className="project-header">
        <div className="project-tags">
          <Tag color="red" className="tag-large">{projectInfo.projectCode}</Tag>
          <Tag color="blue" className="tag-large">{projectInfo.clientCode}</Tag>
          <span className="project-phase">Q1</span>
          <Tag color="blue" className="tag-medium">{projectInfo.phase}</Tag>
          <span className="project-dates">{projectInfo.dateRange}</span>
          <Tag color="cyan">{projectInfo.status}</Tag>
          <Tag>{projectInfo.globalId}</Tag>
          <Tag>{projectInfo.type}</Tag>
          <Tag color="green">{projectInfo.runningStatus}</Tag>
        </div>
        <div className="project-actions">
          <RangePicker 
            defaultValue={[moment('11-2025', 'MM-YYYY'), moment('11-2025', 'MM-YYYY')]}
            format="MM-YYYY"
            picker="month"
          />
          <Button type="link" className="view-financial-link">
            View Financial Margin
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultActiveKey="1" className="project-tabs">
        <TabPane tab="IN MONTH" key="1">
          {/* Workforce Planning Section */}
          <div className="workforce-section">
            <div className="section-header">
              <div>
                <h3 className="section-title">Workforce Planning</h3>
                <p className="section-subtitle">Planning vs Actual</p>
              </div>
              <Radio.Group 
                value={viewMode} 
                onChange={handleViewModeChange}
                buttonStyle="solid"
              >
                <Radio.Button value="headcount">Headcount</Radio.Button>
                <Radio.Button value="mm-months">MM-Months</Radio.Button>
              </Radio.Group>
            </div>

            <div className="chart-container">
              <h4 className="chart-title">Monthly Comparison - Headcount</h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={workforceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#666', fontSize: 12 }}
                    axisLine={{ stroke: '#d9d9d9' }}
                  />
                  <YAxis 
                    tick={{ fill: '#666', fontSize: 12 }}
                    axisLine={{ stroke: '#d9d9d9' }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Bar 
                    dataKey="actual" 
                    fill="#52c41a" 
                    name="Actual"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                  <Bar 
                    dataKey="planning" 
                    fill="#1890ff" 
                    name="Planning"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metrics Grid */}
          <Row gutter={[16, 16]} className="metrics-grid">
            {metricsData.map((metric, index) => (
              <Col key={index} xs={24} sm={12} lg={6}>
                <MetricCard {...metric} />
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="ACCUMULATED" key="2">
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            Accumulated data will be displayed here
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default WorkforcePlanning;
