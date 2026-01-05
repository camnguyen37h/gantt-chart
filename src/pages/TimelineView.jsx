import React, { useMemo, useState } from 'react';
import { Timeline } from '../lib/Timeline';
import './TimelineView.css';

const TimelineView = () => {
  const [resourceFilter, setResourceFilter] = useState('all');

  // Gantt tasks data (from ProjectOverview)
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
      progress: 100 
    },
    { 
      id: 13,
      name: 'UAT Testing', 
      resource: 'Implementing',
      start: '2024-08-15', 
      end: '2024-11-30', 
      progress: 75 
    },
    { 
      id: 14,
      name: 'Bug Fixing Sprint 1', 
      resource: 'Resolved',
      start: '2024-11-01', 
      end: '2025-01-31', 
      progress: 50 
    },
    { 
      id: 15,
      name: 'Feature Enhancement', 
      resource: 'Implementing',
      start: '2025-01-15', 
      end: '2025-04-30', 
      progress: 25 
    },
    { 
      id: 16,
      name: 'System Integration Phase 2', 
      resource: 'Planning',
      start: '2025-03-01', 
      end: '2025-06-30', 
      progress: 10 
    },
    { 
      id: 17,
      name: 'Load Testing', 
      resource: 'No Start',
      start: '2025-12-01', 
      end: '2026-02-28', 
      progress: 0 
    },
    { 
      id: 18,
      name: 'Beta Release', 
      resource: 'No Start',
      start: '2026-02-15', 
      end: '2026-05-15', 
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

  // Convert to timeline format with milestones
  const allTimelineItems = useMemo(() => {
    const items = ganttTasks.map(task => ({
      id: task.id,
      name: task.name,
      startDate: task.start,
      endDate: task.end,
      resource: task.resource,
      progress: task.progress,
      color: getResourceColor(task.resource)
    }));

    // Add milestone events
    const milestones = [
      {
        id: 'milestone-1',
        name: 'Project Start',
        createdDate: '2023-01-10',
        resource: 'milestone',
        color: '#52c41a'
      },
      {
        id: 'milestone-2',
        name: 'Phase 1 Complete',
        createdDate: '2023-05-30',
        resource: 'milestone',
        color: '#1890ff'
      },
      {
        id: 'milestone-3',
        name: 'Mid-Project Review',
        createdDate: '2024-12-20',
        resource: 'milestone',
        color: '#faad14'
      },
      {
        id: 'milestone-4',
        name: 'Go-Live Target',
        createdDate: '2027-03-31',
        resource: 'milestone',
        color: '#ff4d4f'
      }
    ];

    return [...items, ...milestones];
  }, [ganttTasks]);

  // Filter items by resource
  const timelineItems = useMemo(() => {
    if (resourceFilter === 'all') {
      return allTimelineItems;
    }
    return allTimelineItems.filter(item => item.resource === resourceFilter);
  }, [allTimelineItems, resourceFilter]);

  // Get unique resources for filter
  const resources = useMemo(() => {
    const uniqueResources = [...new Set(ganttTasks.map(t => t.resource))];
    return uniqueResources.sort();
  }, [ganttTasks]);

  const handleItemClick = (item) => {
    console.log('Item clicked:', item);
  };

  return (
    <div className="timeline-view">
      <div className="timeline-view-header">
        <h2 className="timeline-view-title">Project Timeline View</h2>
        <div className="timeline-view-tabs">
          <button className="timeline-tab">All Views</button>
          <button className="timeline-tab">Main Table</button>
          <button className="timeline-tab active">Timeline</button>
        </div>
      </div>

      {/* Resource Filter */}
      <div className="timeline-filters">
        <label className="filter-label">Filter by Status:</label>
        <select 
          className="filter-select"
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {resources.map(resource => (
            <option key={resource} value={resource}>{resource}</option>
          ))}
          <option value="milestone">Milestones Only</option>
        </select>
        <span className="filter-count">
          Showing {timelineItems.length} of {allTimelineItems.length} items
        </span>
      </div>
      
      <Timeline 
        items={timelineItems}
        onItemClick={handleItemClick}
        config={{
          viewMode: 'months',
          enableAutoScroll: true,
          enableCurrentDate: true,
          enableGrid: true
        }}
        toolbarProps={{
          showNewButton: true,
          showSearch: true,
          showFilters: false
        }}
      />
    </div>
  );
};

export default TimelineView;
