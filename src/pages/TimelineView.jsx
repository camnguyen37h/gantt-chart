import React, { useMemo } from 'react';
import TimelineChart from '../components/Timeline/TimelineChart';
import './TimelineView.css';

const TimelineView = () => {
  // Mock data for timeline items (updated to 2025)
  const timelineItems = useMemo(() => [
    {
      id: 1,
      name: 'Tart Tasting Event',
      startDate: '2025-02-15',
      endDate: '2025-03-20',
      color: '#9b59d0'
    },
    {
      id: 2,
      name: 'Eclair Affair Event',
      startDate: '2025-02-01',
      endDate: '2025-03-15',
      color: '#ff3d85'
    },
    {
      id: 3,
      name: 'Cupcake',
      startDate: '2025-03-01',
      endDate: '2025-03-20',
      color: '#ff3d85'
    },
    {
      id: 4,
      name: 'Birthday Cake Baking',
      startDate: '2025-03-10',
      endDate: '2025-05-15',
      color: '#9b59d0'
    },
    {
      id: 5,
      name: 'Cupcake Campaign',
      startDate: '2025-05-01',
      endDate: '2025-09-30',
      color: '#9b59d0'
    },
    {
      id: 6,
      name: 'How to Decorate',
      startDate: '2025-02-15',
      endDate: '2025-03-30',
      color: '#ff3d85'
    },
    {
      id: 7,
      name: 'Weekly Update',
      startDate: '2025-02-20',
      endDate: '2025-04-10',
      color: '#9b59d0'
    },
    {
      id: 8,
      name: 'Red Velvet Cake',
      startDate: '2025-02-25',
      endDate: '2025-04-20',
      color: '#33c2e7'
    },
    {
      id: 9,
      name: 'Flavour of the month',
      startDate: '2025-04-01',
      endDate: '2025-08-31',
      color: '#5559df'
    },
    {
      id: 10,
      name: 'Flavour Red Velvet',
      startDate: '2025-03-01',
      endDate: '2025-05-15',
      color: '#33c2e7'
    },
    {
      id: 11,
      name: 'Birthday Cake Design',
      startDate: '2025-03-15',
      endDate: '2025-05-31',
      color: '#9b59d0'
    },
    {
      id: 12,
      name: 'Red Velvet Cake Ads',
      startDate: '2025-03-20',
      endDate: '2025-05-25',
      color: '#33c2e7'
    },
    {
      id: 13,
      name: 'Macaron Launch',
      startDate: '2025-09-15',
      endDate: '2026-02-28',
      color: '#9b59d0'
    },
    {
      id: 14,
      name: 'Eclair Affair Event Planning',
      startDate: '2025-10-01',
      endDate: '2025-11-15',
      color: '#5559df'
    },
    {
      id: 15,
      name: 'Birthday Cake Design Classes',
      startDate: '2025-05-01',
      endDate: '2025-12-31',
      color: '#9b59d0'
    },
    {
      id: 16,
      name: 'Macaron Launch Planning',
      startDate: '2025-07-01',
      endDate: '2025-10-31',
      color: '#33c2e7'
    },
    {
      id: 17,
      name: 'Red Velvet Cake Ads',
      startDate: '2025-07-15',
      endDate: '2025-09-30',
      color: '#5559df'
    },
    {
      id: 18,
      name: 'Flavour of the Month',
      startDate: '2025-07-01',
      endDate: '2025-09-15',
      color: '#9b59d0'
    },
    {
      id: 19,
      name: 'Cupcake Campaign (copy)',
      startDate: '2025-03-15',
      endDate: '2025-05-30',
      color: '#33c2e7'
    },
    {
      id: 20,
      name: 'Cupcake Campaign',
      startDate: '2025-04-01',
      endDate: '2025-05-20',
      color: '#9b59d0'
    },
    {
      id: 21,
      name: 'Red Velvet Cake Ads',
      startDate: '2025-07-01',
      endDate: '2025-10-31',
      color: '#ff3d85'
    },
    {
      id: 22,
      name: 'Cupcake Campaign (copy)',
      startDate: '2025-04-15',
      endDate: '2025-06-30',
      color: '#5559df'
    },
    {
      id: 23,
      name: 'Birthday Cake Design Classes',
      startDate: '2025-09-01',
      endDate: '2025-12-15',
      color: '#ff3d85'
    },
    {
      id: 24,
      name: 'Birthday Cake Design Classes',
      startDate: '2026-03-01',
      endDate: '2026-07-31',
      color: '#33c2e7'
    },
    {
      id: 25,
      name: 'Birthday Cake Design Classes (copy)',
      startDate: '2026-01-15',
      endDate: '2026-03-31',
      color: '#5559df'
    },
    {
      id: 26,
      name: 'Flavour of the month',
      startDate: '2026-02-01',
      endDate: '2026-03-15',
      color: '#ff3d85'
    },
    {
      id: 27,
      name: 'Macaron',
      startDate: '2025-10-15',
      endDate: '2026-01-31',
      color: '#5559df'
    },
    {
      id: 28,
      name: 'Funfetti Cake Introduction (copy)',
      startDate: '2025-11-15',
      endDate: '2026-02-28',
      color: '#33c2e7'
    },
    {
      id: 29,
      name: 'Funfetti Cake Introduction',
      startDate: '2025-09-15',
      endDate: '2025-12-31',
      color: '#5559df'
    },
    {
      id: 30,
      name: 'Flavour of the month',
      startDate: '2025-10-01',
      endDate: '2025-12-15',
      color: '#5559df'
    }
  ], []);

  return (
    <div className="timeline-view">
      <div className="timeline-view-header">
        <h2 className="timeline-view-title">Marketing Overview</h2>
        <div className="timeline-view-tabs">
          <button className="timeline-tab">All Views</button>
          <button className="timeline-tab">Main Table</button>
          <button className="timeline-tab active">Timeline</button>
        </div>
      </div>
      
      <TimelineChart items={timelineItems} />
    </div>
  );
};

export default TimelineView;
