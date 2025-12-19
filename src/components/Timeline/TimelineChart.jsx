import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button, Input, Icon } from 'antd';
import moment from 'moment';
import './TimelineChart.css';

const TimelineChart = ({ items = [] }) => {
  const [viewMode, setViewMode] = useState('Months');
  const containerRef = useRef(null);
  const currentDateLineRef = useRef(null);

  // Generate timeline data based on view mode
  const timelineData = useMemo(() => {
    if (!items || items.length === 0) return null;

    const validItems = items.filter(item => item.startDate && item.endDate);
    if (validItems.length === 0) return null;

    const allDates = validItems.flatMap(item => [
      moment(item.startDate),
      moment(item.endDate)
    ]);

    const start = moment.min(allDates).startOf('month');
    const end = moment.max(allDates).endOf('month').add(2, 'months');
    const totalDays = end.diff(start, 'days');

    // Generate periods based on view mode
    const periods = [];
    let current = start.clone();

    if (viewMode === 'Months') {
      while (current.isBefore(end)) {
        const monthWidth = current.daysInMonth();
        const widthPercent = (monthWidth / totalDays) * 100;
        periods.push({
          label: current.format('MMMM'),
          year: current.format('YYYY'),
          width: widthPercent,
          start: current.clone()
        });
        current.add(1, 'month');
      }
    }

    return { start, end, totalDays, periods };
  }, [items, viewMode]);

  // Calculate current date position
  const currentDatePosition = useMemo(() => {
    if (!timelineData) return null;
    const now = moment();
    if (now.isBefore(timelineData.start) || now.isAfter(timelineData.end)) return null;
    const days = now.diff(timelineData.start, 'days');
    return (days / timelineData.totalDays) * 100;
  }, [timelineData]);

  // Calculate position and width for items
  const calculatePosition = (date) => {
    if (!timelineData) return 0;
    const days = moment(date).diff(timelineData.start, 'days');
    return (days / timelineData.totalDays) * 100;
  };

  const calculateWidth = (startDate, endDate) => {
    if (!timelineData) return 0;
    const days = moment(endDate).diff(moment(startDate), 'days');
    return Math.max((days / timelineData.totalDays) * 100, 1);
  };

  // Auto-layout algorithm to prevent overlapping
  const layoutItems = useMemo(() => {
    if (!items || !timelineData) return [];

    const sortedItems = [...items].sort((a, b) =>
      moment(a.startDate).valueOf() - moment(b.startDate).valueOf()
    );

    const rows = [];
    sortedItems.forEach(item => {
      if (!item.startDate || !item.endDate) return;

      const itemStart = moment(item.startDate);
      const itemEnd = moment(item.endDate);

      let rowIndex = rows.findIndex(row => {
        const lastItem = row[row.length - 1];
        return moment(lastItem.endDate).isBefore(itemStart);
      });

      if (rowIndex === -1) {
        rowIndex = rows.length;
        rows.push([]);
      }

      rows[rowIndex].push({ ...item, row: rowIndex });
    });

    return rows.flat();
  }, [items, timelineData]);

  // Auto-scroll to current date
  useEffect(() => {
    if (!containerRef.current || currentDatePosition === null || !timelineData) return;

    const scrollContainer = containerRef.current;

    const scrollToCurrentDate = () => {
      const containerWidth = scrollContainer.clientWidth;
      const contentWidth = scrollContainer.scrollWidth;
      const currentDatePixelPosition = (currentDatePosition / 100) * contentWidth;
      let scrollPosition = currentDatePixelPosition - containerWidth / 2;
      const maxScroll = contentWidth - containerWidth;
      scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
      scrollContainer.scrollLeft = scrollPosition;
    };

    requestAnimationFrame(() => {
      setTimeout(scrollToCurrentDate, 300);
    });

    window.addEventListener('resize', scrollToCurrentDate);
    return () => window.removeEventListener('resize', scrollToCurrentDate);
  }, [currentDatePosition, timelineData]);

  const scrollToToday = () => {
    if (!containerRef.current || currentDatePosition === null) return;
    const scrollContainer = containerRef.current;
    const containerWidth = scrollContainer.clientWidth;
    const contentWidth = scrollContainer.scrollWidth;
    const currentDatePixelPosition = (currentDatePosition / 100) * contentWidth;
    scrollContainer.scrollLeft = currentDatePixelPosition - containerWidth / 2;
  };

  if (!timelineData) return <div>No data to display</div>;

  const rowHeight = 50;

  return (
    <div className="timeline-chart">
      {/* Toolbar */}
      <div className="timeline-toolbar">
        <div className="timeline-toolbar-left">
          <Button type="primary">New Item</Button>
          <Input
            prefix={<Icon type="search" />}
            placeholder="Search"
            style={{ width: 200 }}
          />
          <Button><Icon type="user" /> Person</Button>
          <Button><Icon type="filter" /> Filter</Button>
          <Button>Sort</Button>
        </div>
        <div className="timeline-toolbar-right">
          <Button onClick={scrollToToday}>Today</Button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="timeline-view-selector">
        {['Days', 'Weeks', 'Months', 'Years'].map(mode => (
          <button
            key={mode}
            className={`view-mode-btn ${viewMode === mode ? 'active' : ''}`}
            onClick={() => setViewMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Timeline Container */}
      <div className="timeline-main-container">
        {/* Timeline Grid */}
        <div className="timeline-scroll-container" ref={containerRef}>
          <div className="timeline-content">
            {/* Timeline Header */}
            <div className="timeline-header">
              {timelineData.periods.map((period, index) => (
                <div
                  key={index}
                  className="timeline-period"
                  style={{ width: `${period.width}%` }}
                >
                  <div className="period-label">{period.label}</div>
                </div>
              ))}
            </div>

            {/* Timeline Grid */}
            <div className="timeline-grid" style={{ minHeight: `${(layoutItems.length > 0 ? Math.max(...layoutItems.map(i => i.row)) + 1 : 1) * rowHeight + 40}px` }}>
              {/* Vertical Grid Lines */}
              {timelineData.periods.map((period, index) => {
                const left = timelineData.periods.slice(0, index).reduce((sum, p) => sum + p.width, 0);
                return (
                  <div
                    key={`grid-${index}`}
                    className="timeline-grid-line"
                    style={{ left: `${left}%` }}
                  />
                );
              })}

              {/* Horizontal Grid Lines */}
              {Array.from({ length: (layoutItems.length > 0 ? Math.max(...layoutItems.map(i => i.row)) + 1 : 1) }).map((_, index) => (
                <div
                  key={`hline-${index}`}
                  className="timeline-horizontal-line"
                  style={{ top: `${index * rowHeight}px` }}
                />
              ))}

              {/* Current Date Line */}
              {currentDatePosition !== null && (
                <div
                  ref={currentDateLineRef}
                  className="timeline-current-date"
                  style={{ left: `${currentDatePosition}%` }}
                >
                  <div className="current-date-marker"></div>
                  <div className="current-date-label">
                    {moment().format('D MMM')}
                  </div>
                </div>
              )}

              {/* Timeline Items (Bars) */}
              {layoutItems.map((item, index) => {
                const left = calculatePosition(item.startDate);
                const width = calculateWidth(item.startDate, item.endDate);
                const top = item.row * rowHeight + 8;

                return (
                  <div
                    key={index}
                    className="timeline-item"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      top: `${top}px`,
                      backgroundColor: item.color || '#5559df',
                    }}
                  >
                    <div className="timeline-item-content">
                      <span className="timeline-item-name">{item.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;
