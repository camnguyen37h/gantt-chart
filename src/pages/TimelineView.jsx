import React, { useMemo, useState } from 'react';
import { Timeline } from '../lib/Timeline';
import './TimelineView.css';

const TimelineView = () => {
  const [resourceFilter, setResourceFilter] = useState('all');
  const [visibleStatuses, setVisibleStatuses] = useState({});

  // Project timeline data with unified status field
  const projectTasks = useMemo(() => [
    // Planning phase
    { 
      id: 1,
      name: 'Initial Planning', 
      status: 'Finalized',
      startDate: '2023-01-10', 
      endDate: '2023-03-15', 
      progress: 100 
    },
    { 
      id: 2,
      name: 'Requirement Analysis', 
      status: 'Finalized',
      startDate: '2023-02-01', 
      endDate: '2023-05-30', 
      progress: 100 
    },
    { 
      id: 3,
      name: 'Technical Research', 
      status: 'Finalized',
      startDate: '2023-05-01', 
      endDate: '2023-08-15', 
      progress: 100 
    },
    
    // Design phase
    { 
      id: 4,
      name: 'Architecture Design', 
      status: 'Finalized',
      startDate: '2023-07-15', 
      endDate: '2023-11-30', 
      progress: 100 
    },
    { 
      id: 5,
      name: 'UI/UX Design', 
      status: 'Released',
      startDate: '2023-09-01', 
      endDate: '2024-01-15', 
      progress: 100 
    },
    
    // Development phase
    { 
      id: 6,
      name: 'Backend Development', 
      status: 'Released',
      startDate: '2023-10-01', 
      endDate: '2024-06-30', 
      progress: 100 
    },
    { 
      id: 7,
      name: 'Frontend Development', 
      status: 'Released',
      startDate: '2024-01-15', 
      endDate: '2024-08-31', 
      progress: 100 
    },
    { 
      id: 8,
      name: 'Database Design', 
      status: 'Released',
      startDate: '2024-03-01', 
      endDate: '2024-06-15', 
      progress: 100 
    },
    { 
      id: 9,
      name: 'API Integration', 
      status: 'Released',
      startDate: '2024-05-15', 
      endDate: '2024-10-31', 
      progress: 100 
    },
    
    // Testing phase
    { 
      id: 10,
      name: 'Unit Testing', 
      status: 'Resolved',
      startDate: '2024-06-01', 
      endDate: '2024-09-30', 
      progress: 100 
    },
    { 
      id: 11,
      name: 'Integration Testing', 
      status: 'Resolved',
      startDate: '2024-09-01', 
      endDate: '2024-12-20', 
      progress: 100 
    },
    { 
      id: 12,
      name: 'UAT Testing', 
      status: 'Implementing',
      startDate: '2024-11-15', 
      endDate: '2025-03-31', 
      progress: 75 
    },
    { 
      id: 13,
      name: 'Performance Testing', 
      status: 'Implementing',
      startDate: '2025-01-01', 
      endDate: '2025-04-30', 
      progress: 60 
    },
    
    // Bug fixing & optimization
    { 
      id: 14,
      name: 'Bug Fixing Sprint 1', 
      status: 'Resolved',
      startDate: '2024-11-01', 
      endDate: '2025-01-31', 
      progress: 100 
    },
    { 
      id: 15,
      name: 'Bug Fixing Sprint 2', 
      status: 'Implementing',
      startDate: '2025-02-01', 
      endDate: '2025-05-15', 
      progress: 50 
    },
    { 
      id: 16,
      name: 'Performance Optimization', 
      status: 'Planning',
      startDate: '2025-03-15', 
      endDate: '2025-07-31', 
      progress: 25 
    },
    
    // Deployment preparation
    { 
      id: 17,
      name: 'Security Audit', 
      status: 'Planning',
      startDate: '2025-06-01', 
      endDate: '2025-09-30', 
      progress: 10 
    },
    { 
      id: 18,
      name: 'Documentation', 
      status: 'No Start',
      startDate: '2025-08-01', 
      endDate: '2025-11-30', 
      progress: 0 
    },
    { 
      id: 19,
      name: 'Training Materials', 
      status: 'No Start',
      startDate: '2025-10-01', 
      endDate: '2026-01-31', 
      progress: 0 
    },
    
    // Production rollout
    { 
      id: 20,
      name: 'Staging Deployment', 
      status: 'No Start',
      startDate: '2025-12-01', 
      endDate: '2026-02-28', 
      progress: 0 
    },
    { 
      id: 21,
      name: 'Production Deployment', 
      status: 'No Start',
      startDate: '2026-03-01', 
      endDate: '2026-05-31', 
      progress: 0 
    },
    { 
      id: 22,
      name: 'Post-Launch Monitoring', 
      status: 'No Start',
      startDate: '2026-06-01', 
      endDate: '2026-09-30', 
      progress: 0 
    },
    
    // Maintenance
    { 
      id: 23,
      name: 'Maintenance Phase 1', 
      status: 'No Start',
      startDate: '2026-10-01', 
      endDate: '2027-03-31', 
      progress: 0 
    },
    { 
      id: 24,
      name: 'Feature Enhancements', 
      status: 'No Start',
      startDate: '2027-04-01', 
      endDate: '2027-09-30', 
      progress: 0 
    },
    { 
      id: 25,
      name: 'Project Closure', 
      status: 'No Start',
      startDate: '2027-10-01', 
      endDate: '2027-12-31', 
      progress: 0 
    },
  ], []);

  // Convert to timeline format with milestones
  const allTimelineItems = useMemo(() => {
    const items = projectTasks.map(task => ({
      id: task.id,
      name: task.name,
      startDate: task.startDate,
      endDate: task.endDate,
      status: task.status,
      progress: task.progress
    }));

    // Milestone events (status: 'No Plan', startDate/endDate wrap actual milestone date)
    const milestones = [
      {
        id: 'ms-1',
        name: 'Project Kickoff',
        startDate: '2023-01-09',  // Actual: 2023-01-10
        endDate: '2023-01-11',
        status: 'No Plan',
        progress: 0
      },
      {
        id: 'ms-2',
        name: 'Design Review Complete',
        startDate: '2024-01-14',  // Actual: 2024-01-15
        endDate: '2024-01-16',
        status: 'No Plan',
        progress: 0
      },
      {
        id: 'ms-3',
        name: 'Development Complete',
        startDate: '2024-08-30',  // Actual: 2024-08-31
        endDate: '2024-09-01',
        status: 'No Plan',
        progress: 0
      },
      {
        id: 'ms-4',
        name: 'UAT Sign-off',
        startDate: '2025-03-30',  // Actual: 2025-03-31
        endDate: '2025-04-01',
        status: 'No Plan',
        progress: 0
      },
      {
        id: 'ms-5',
        name: 'Go-Live',
        startDate: '2026-05-30',  // Actual: 2026-05-31
        endDate: '2026-06-01',
        status: 'No Plan',
        progress: 0
      },
      {
        id: 'ms-6',
        name: 'Project Closure',
        startDate: '2027-12-30',  // Actual: 2027-12-31
        endDate: '2028-01-01',
        status: 'No Plan',
        progress: 0
      }
    ];

    return [...items, ...milestones];
  }, [projectTasks]);

  // Filter items by status
  const timelineItems = useMemo(() => {
    let filtered = allTimelineItems;
    
    // Filter by dropdown selection
    if (resourceFilter !== 'all') {
      filtered = filtered.filter(item => item.status === resourceFilter);
    }
    
    // Filter by legend visibility toggles
    const hasHiddenStatus = Object.values(visibleStatuses).some(v => v === false);
    if (hasHiddenStatus) {
      filtered = filtered.filter(item => visibleStatuses[item.status] !== false);
    }
    
    return filtered;
  }, [allTimelineItems, resourceFilter, visibleStatuses]);

  // Get unique statuses for filter (include all statuses from tasks and milestones)
  const resources = useMemo(() => {
    const uniqueStatuses = [...new Set(allTimelineItems.map(t => t.status))];
    return uniqueStatuses.filter(Boolean).sort();
  }, [allTimelineItems]);

  const handleStatusToggle = (status) => {
    setVisibleStatuses(prev => ({
      ...prev,
      [status]: prev[status] === false ? true : false
    }));
  };

  const handleItemClick = (item) => {
    // Handle item click - can be extended for modal/details view
    console.info('Timeline item selected:', item.name);
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
        showLegend={true}
        legendProps={{
          visibleStatuses: visibleStatuses,
          onStatusToggle: handleStatusToggle
        }}
      />
    </div>
  );
};

export default TimelineView;
