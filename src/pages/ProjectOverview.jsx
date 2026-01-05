import React, { useMemo } from 'react';
import GanttChartGoogle from '../components/GanttChart/GanttChartGoogle';
import { Timeline } from '../lib/Timeline';
import './ProjectOverview.css';

const ProjectOverview = () => {
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

  // Helper function to map resource to color
  const getResourceColor = (resource) => {
    const colorMap = {
      'Planning': '#69c0ff',
      'Finalized': '#597ef7',
      'Implementing': '#ffa940',
      'Resolved': '#95de64',
      'Released': '#b37feb',
      'No Start': '#bfbfbf'
    };
    return colorMap[resource] || '#5559df';
  };

  // Convert Gantt tasks to Timeline format
  const timelineItems = useMemo(() => {
    const items = ganttTasks.map(task => ({
      id: task.id,
      name: task.name,
      startDate: task.start,
      endDate: task.end,
      resource: task.resource,
      progress: task.progress,
      // Map resource to colors
      color: getResourceColor(task.resource)
    }));

    // Add some milestone events
    const milestones = [
      {
        id: 'milestone-1',
        name: 'Project Start',
        createdDate: '2023-01-10',
        color: '#52c41a'
      },
      {
        id: 'milestone-2',
        name: 'Phase 1 Complete',
        createdDate: '2023-05-30',
        color: '#1890ff'
      },
      {
        id: 'milestone-3',
        name: 'Mid-Project Review',
        createdDate: '2024-12-20',
        color: '#faad14'
      },
      {
        id: 'milestone-4',
        name: 'Go-Live Target',
        createdDate: '2027-03-31',
        color: '#ff4d4f'
      }
    ];

    return [...items, ...milestones];
  }, [ganttTasks]);

  return (
    <div className="project-overview">
      {/* Gantt Chart */}
      <div className="gantt-section">
        <div className="gantt-header-section">
          <h3 className="section-title">Schedule/Milestone</h3>
          <p className="section-subtitle">Project timeline from Jan 2023 to Dec 2027</p>
        </div>
        <GanttChartGoogle 
          tasks={ganttTasks}
        />
      </div>

      {/* Timeline View Section */}
      <div className="timeline-section">
        <div className="timeline-header-section">
          <h3 className="section-title">Project Timeline View</h3>
          <p className="section-subtitle">Interactive timeline with resource tracking</p>
        </div>
        <Timeline 
          items={timelineItems}
          config={{
            viewMode: 'months',
            rowHeight: 50,
            enableAutoScroll: true,
            enableCurrentDate: true
          }}
          toolbarProps={{
            showNewButton: false,
            showSearch: true,
            showFilters: false
          }}
        />
      </div>
    </div>
  );
};

export default ProjectOverview;
