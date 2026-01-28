import { Tabs } from 'antd'
import React, { useMemo, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { PROJECT_CHARTS, Timeline } from '../lib/Timeline';
import { fetchTimelineData } from '../utils/mockApiData';
import { 
  normalizeTimelineData,
  extractUniqueStatuses,
  filterByVisibleStatuses
} from '../utils/timelineUtils';
import { 
  buildStatusColorMap, 
  getStatusColor 
} from '../constants/statusColors';
import WorkforceChart from '../components/WorkforceChart/WorkforceChart';
import './TimelineView.css';

const TimelineView = () => {
  const history = useHistory();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialTab = urlParams.get('tab') || PROJECT_CHARTS.MILESTONE;
  
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

  // Filter items by legend visibility (memoized for performance)
  const filteredItems = useMemo(() => {
    return filterByVisibleStatuses(itemsWithColors, visibleStatuses);
  }, [itemsWithColors, visibleStatuses]);

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

  const handleTabChange = (key) => {
    history.push(`${location.pathname}?tab=${key}`);
  };

  if (loading) {
    return (
      <Tabs
        defaultActiveKey={initialTab}
        animated={false}
        destroyInactiveTabPane={true}
        className="mb-24">
        <Tabs.TabPane
          tab={PROJECT_CHARTS.MILESTONE}
          key={PROJECT_CHARTS.MILESTONE}>
          <div className="timeline-view">
            <div className="timeline-view-header">
              <h2 className="timeline-view-title">Project Timeline View</h2>
            </div>
            <div className="timeline-skeleton">
              {/* Skeleton Toolbar */}
              <div className="skeleton-toolbar">
                <div className="skeleton-button"></div>
              </div>
              
              {/* Skeleton Grid */}
              <div className="skeleton-grid">
                {/* Skeleton Items */}
                <div className="skeleton-item skeleton-item-1"></div>
                <div className="skeleton-item skeleton-item-2"></div>
                <div className="skeleton-item skeleton-item-3"></div>
                <div className="skeleton-item skeleton-item-4"></div>
                <div className="skeleton-item skeleton-item-5"></div>
              </div>
              
              {/* Skeleton Header */}
              <div className="skeleton-header">
                {[1, 2, 3, 4, 5, 6].map((month) => (
                  <div key={month} className="skeleton-month"></div>
                ))}
              </div>
              
              {/* Skeleton Legend */}
              <div className="skeleton-legend">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((status) => (
                  <div key={status} className="skeleton-status"></div>
                ))}
              </div>
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={PROJECT_CHARTS.WORKLOAD} key={PROJECT_CHARTS.WORKLOAD}>
          <div>Loading...</div>
        </Tabs.TabPane>
      </Tabs>
    );
  }

  return (
    <Tabs
      defaultActiveKey={initialTab}
      onChange={handleTabChange}
      animated={false}
      destroyInactiveTabPane={true}
      className="mb-24">
      <Tabs.TabPane
        tab={PROJECT_CHARTS.MILESTONE}
        key={PROJECT_CHARTS.MILESTONE}>
        <div className="timeline-view">
          <div className="timeline-view-header">
            <h2 className="timeline-view-title">Project Timeline View</h2>
            <div className="timeline-view-tabs">
              <button className="timeline-tab">All Views</button>
              <button className="timeline-tab">Main Table</button>
              <button className="timeline-tab active">Timeline</button>
            </div>
          </div>

          <Timeline
            items={filteredItems}
            onItemClick={handleItemClick}
            loading={loading}
            config={{
              enableAutoScroll: true,
              enableCurrentDate: true,
              enableGrid: true,
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
      </Tabs.TabPane>
      <Tabs.TabPane tab={PROJECT_CHARTS.WORKLOAD} key={PROJECT_CHARTS.WORKLOAD}>
        <WorkforceChart />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default TimelineView;
