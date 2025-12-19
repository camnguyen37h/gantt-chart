import React, { useMemo } from 'react';
import { Row, Col, Tag, DatePicker, Button, Tabs } from 'antd';
import MetricCard from '../components/MetricCard/MetricCard';
import GanttChartGoogle from '../components/GanttChart/GanttChartGoogle';
import moment from 'moment';
import './ProjectSchedule.css';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ProjectSchedule = () => {
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

  const ganttTasks = useMemo(() => [
    { 
      id: 1,
      name: 'Initial Planning', 
      resource: 'Planning',
      start: '2023-01-10', 
      end: '2023-03-15', 
      progress: 100 
    },
    { 
      id: 2,
      name: 'Requirement phase 1', 
      resource: 'Finalized',
      start: '2023-02-01', 
      end: '2023-05-30', 
      progress: 100 
    },
    { 
      id: 3,
      name: 'Technical Research', 
      resource: 'Planning',
      start: '2023-05-01', 
      end: '2023-08-15', 
      progress: 100 
    },
    { 
      id: 4,
      name: 'Architecture Design', 
      resource: 'Finalized',
      start: '2023-07-15', 
      end: '2023-11-30', 
      progress: 100 
    },
    { 
      id: 5,
      name: 'Prototype Development', 
      resource: 'Released',
      start: '2023-10-01', 
      end: '2024-02-28', 
      progress: 100 
    },
    { 
      id: 6,
      name: 'Feasibility Study', 
      resource: 'Planning',
      start: '2024-01-15', 
      end: '2024-04-30', 
      progress: 100 
    },
    { 
      id: 7,
      name: 'Detailed Requirements', 
      resource: 'Finalized',
      start: '2024-03-01', 
      end: '2024-06-15', 
      progress: 100 
    },
    { 
      id: 8,
      name: 'Core Module Development', 
      resource: 'Released',
      start: '2024-05-15', 
      end: '2024-10-31', 
      progress: 100 
    },
    { 
      id: 9,
      name: 'Integration Testing', 
      resource: 'Released',
      start: '2024-09-01', 
      end: '2024-12-20', 
      progress: 100 
    },
    { 
      id: 10,
      name: 'Delivery UI/UX Phase 1', 
      resource: 'Finalized',
      start: '2024-01-15', 
      end: '2024-03-30', 
      progress: 100 
    },
    { 
      id: 11,
      name: 'Delivery phase 1', 
      resource: 'Implementing',
      start: '2024-03-01', 
      end: '2024-06-15', 
      progress: 100 
    },
    { 
      id: 12,
      name: 'Delivery 4', 
      resource: 'Implementing',
      start: '2024-06-01', 
      end: '2024-09-30', 
      progress: 90 
    },
    { 
      id: 13,
      name: 'Delivery 5', 
      resource: 'Released',
      start: '2024-08-15', 
      end: '2024-11-15', 
      progress: 85 
    },
    { 
      id: 14,
      name: 'Delivery 6', 
      resource: 'Finalized',
      start: '2024-11-01', 
      end: '2025-09-30', 
      progress: 45 
    },
    { 
      id: 15,
      name: 'Delivery 7', 
      resource: 'Finalized',
      start: '2025-09-01', 
      end: '2025-11-30', 
      progress: 20 
    },
    { 
      id: 16,
      name: 'Delivery 8', 
      resource: 'Finalized',
      start: '2025-11-01', 
      end: '2026-02-15', 
      progress: 10 
    },
    { 
      id: 17,
      name: 'Final Testing & QA', 
      resource: 'Implementing',
      start: '2026-01-15', 
      end: '2026-03-31', 
      progress: 5 
    },
    { 
      id: 18,
      name: 'User Acceptance Testing', 
      resource: 'No Start',
      start: '2026-03-01', 
      end: '2026-06-15', 
      progress: 0 
    },
    { 
      id: 19,
      name: 'Performance Optimization', 
      resource: 'No Start',
      start: '2026-05-15', 
      end: '2026-08-30', 
      progress: 0 
    },
    { 
      id: 20,
      name: 'Security Audit', 
      resource: 'No Start',
      start: '2026-08-01', 
      end: '2026-10-31', 
      progress: 0 
    },
    { 
      id: 21,
      name: 'Documentation & Training', 
      resource: 'No Start',
      start: '2026-10-01', 
      end: '2027-01-15', 
      progress: 0 
    },
    { 
      id: 22,
      name: 'Production Deployment', 
      resource: 'No Start',
      start: '2027-01-01', 
      end: '2027-03-31', 
      progress: 0 
    },
    { 
      id: 23,
      name: 'Post-Launch Support', 
      resource: 'No Start',
      start: '2027-03-15', 
      end: '2027-06-30', 
      progress: 0 
    },
    { 
      id: 24,
      name: 'Maintenance Phase 1', 
      resource: 'No Start',
      start: '2027-06-01', 
      end: '2027-09-30', 
      progress: 0 
    },
    { 
      id: 25,
      name: 'Project Closure', 
      resource: 'No Start',
      start: '2027-09-01', 
      end: '2027-12-31', 
      progress: 0 
    },
  ], []);

  const metricsData = useMemo(() => [
    { title: 'BILL IN MONTHS', value: '12.45', unit: '(MM)' },
    { title: 'ALLOCATION IN MONTHS', value: '5.71', subtitle: '3.65 WT | 2.06 Extra', unit: '(MM)' },
    { title: 'PLANNING BILL RATE IN MONTHS', value: '45.80', unit: '(%)', color: 'red' },
    { title: 'ACTUAL BILL RATE IN MONTHS', value: '42.35', unit: '(%)', color: 'red' },
    { title: 'ACTUAL TIMESHEET IN MONTHS', value: '8.92', subtitle: '5.43 WT | 3.49 Extra', unit: '(MM)' },
    { title: 'MM PLAN', value: '15.250', unit: '(MM)' },
    { title: 'AI SUPPORTING IN MONTHS', value: '2.350', unit: '(MM)' },
    { title: 'BUDGET BILLABLE', value: '100.00', unit: '(MM)' },
  ], []);

  return (
    <div className="project-schedule">
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
          {/* Schedule Section */}
          <div className="schedule-section">
            <h3 className="section-title">Schedule/Milestone</h3>
            <p className="section-subtitle">Project timeline from January 2024 to April 2026</p>
            
            <div className="gantt-section">
              <GanttChartGoogle 
                tasks={ganttTasks}
              />
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

export default ProjectSchedule;
