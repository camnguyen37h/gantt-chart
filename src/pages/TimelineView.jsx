import React, { useMemo, useState, useEffect } from 'react';
import { Timeline } from '../lib/Timeline';
import { fetchTimelineData } from '../utils/mockApiData';
import { 
  normalizeTimelineData, 
  extractUniqueStatuses,
  filterByStatus,
  filterByVisibleStatuses
} from '../utils/timelineUtils';
import { 
  buildStatusColorMap, 
  getStatusColor 
} from '../constants/statusColors';
import './TimelineView.css';

const TimelineView = () => {
  const [resourceFilter, setResourceFilter] = useState('all');
  const [visibleStatuses, setVisibleStatuses] = useState({});
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchTimelineData();
        setApiData(data);
      } catch (error) {
        console.error('Failed to fetch timeline data:', error);
        setApiData([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Normalize API data (memoized for performance)
  const normalizedItems = useMemo(() => {
    return normalizeTimelineData(apiData);
  }, [apiData]);

  // Extract unique statuses and build color map (memoized)
  const uniqueStatuses = useMemo(() => {
    return extractUniqueStatuses(normalizedItems);
  }, [normalizedItems]);

  const statusColorMap = useMemo(() => {
    return buildStatusColorMap(uniqueStatuses);
  }, [uniqueStatuses]);

  // Add color to items based on status (memoized)
  const itemsWithColors = useMemo(() => {
    if (!normalizedItems || normalizedItems.length === 0) {
      return [];
    }
    
    return normalizedItems.map(item => {
      return {
        ...item,
        color: getStatusColor(item.status, statusColorMap)
      };
    });
  }, [normalizedItems, statusColorMap]);

  // Filter items by status and visibility (memoized for performance)
  const filteredItems = useMemo(() => {
    let items = itemsWithColors;
    
    // Filter by dropdown selection
    items = filterByStatus(items, resourceFilter);
    
    // Filter by legend visibility
    items = filterByVisibleStatuses(items, visibleStatuses);
    
    return items;
  }, [itemsWithColors, resourceFilter, visibleStatuses]);

  const handleStatusToggle = (status) => {
    setVisibleStatuses(prev => {
      const newVisibleStatuses = { ...prev };
      newVisibleStatuses[status] = newVisibleStatuses[status] === false ? true : false;
      return newVisibleStatuses;
    });
  };

  const handleItemClick = (item) => {
    // Handle item click - can be extended for modal/details view
    console.info('Timeline item selected:', {
      id: item.id,
      name: item.name,
      status: item.status,
      duration: item.duration,
      lateTime: item.lateTime
    });
  };

  if (loading) {
    return (
      <div className="timeline-view">
        <div className="timeline-view-header">
          <h2 className="timeline-view-title">Project Timeline View</h2>
        </div>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#8c8c8c' }}>
          Loading timeline data...
        </div>
      </div>
    );
  }

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

      <div className="timeline-filters">
        <label className="filter-label">Filter by Status:</label>
        <select 
          className="filter-select"
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <span className="filter-count">
          Showing {filteredItems.length} of {normalizedItems.length} items
        </span>
      </div>
      
      <Timeline 
        items={filteredItems}
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
          statuses: uniqueStatuses,
          statusColorMap: statusColorMap,
          visibleStatuses: visibleStatuses,
          onStatusToggle: handleStatusToggle
        }}
      />
    </div>
  );
};

export default TimelineView;
