import React, { memo, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './GanttChartGoogle.css';

const GanttChartGoogle = memo(({ tasks, height }) => {
  const containerRef = useRef(null);
  const currentDateLineRef = useRef(null);

  const timelineData = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;

    // Filter tasks with valid start and end dates
    const validTasks = tasks.filter(t => t.start && t.end);
    if (validTasks.length === 0) return null;

    const allDates = validTasks.flatMap(t => [moment(t.start), moment(t.end)]);
    const start = moment.min(allDates).startOf('month');
    const end = moment.max(allDates).endOf('month');
    const totalDays = end.diff(start, 'days');
    
    // Generate month labels with increased spacing
    const widthMultiplier = 3; // Increase spacing between months
    const months = [];
    let current = start.clone();
    while (current.isSameOrBefore(end)) {
      const monthWidth = current.daysInMonth();
      const widthPercent = (monthWidth / totalDays) * 100 * widthMultiplier;
      months.push({
        label: current.format('M/YYYY'),
        width: widthPercent,
      });
      current.add(1, 'month');
    }
    
    return { start, end, totalDays, months };
  }, [tasks]);

  // Calculate current date position (already accounts for widthMultiplier through months)
  const currentDatePosition = useMemo(() => {
    if (!timelineData) return null;
    const now = moment();
    if (now.isBefore(timelineData.start) || now.isAfter(timelineData.end)) return null;
    const days = now.diff(timelineData.start, 'days');
    // This percentage matches the percentage in the multiplied width
    return (days / timelineData.totalDays) * 100;
  }, [timelineData]);

  const calculatePosition = (date) => {
    const days = moment(date).diff(timelineData.start, 'days');
    return (days / timelineData.totalDays) * 100;
  };

  const calculateWidth = (taskStart, taskEnd) => {
    const days = moment(taskEnd).diff(moment(taskStart), 'days');
    return Math.max((days / timelineData.totalDays) * 100, 0.5);
  };

  // Auto-layout algorithm
  const layoutTasks = useMemo(() => {
    if (!tasks || !timelineData) return [];

    const sortedTasks = [...tasks].sort((a, b) => 
      moment(a.start).valueOf() - moment(b.start).valueOf()
    );

    const rows = [];
    sortedTasks.forEach(task => {
      const taskStart = moment(task.start);
      const taskEnd = moment(task.end);
      
      let rowIndex = rows.findIndex(row => {
        const lastTask = row[row.length - 1];
        return moment(lastTask.end).isBefore(taskStart);
      });

      if (rowIndex === -1) {
        rowIndex = rows.length;
        rows.push([]);
      }

      rows[rowIndex].push({ ...task, row: rowIndex });
    });

    return rows.flat();
  }, [tasks, timelineData]);

  const getResourceColor = (resource) => {
    const colors = {
      'Planning': '#52c41a',
      'Finalized': '#1890ff',
      'Implementing': '#fa8c16',
      'Released': '#722ed1',
      'No Start': '#d9d9d9',
    };
    return colors[resource] || '#1890ff';
  };

  // Auto-scroll to current date on mount and on window resize
  useEffect(() => {
    if (!containerRef.current || currentDatePosition === null || !timelineData) return;
    
    const scrollContainer = containerRef.current;
    
    const scrollToCurrentDate = () => {
      const containerWidth = scrollContainer.clientWidth;
      const timelineFooter = scrollContainer.querySelector('.gantt-timeline-footer');
      
      if (timelineFooter) {
        // Use timeline footer width which is the actual content width
        const contentWidth = timelineFooter.scrollWidth;
        
        // currentDatePosition is percentage of original timeline
        const currentDatePixelPosition = (currentDatePosition / 100) * contentWidth;
        
        // Calculate desired scroll position to center the date
        let scrollPosition = currentDatePixelPosition - containerWidth / 2;
        
        // Ensure we don't scroll beyond the available scroll range
        const maxScroll = contentWidth - containerWidth;
        scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
        
        scrollContainer.scrollLeft = scrollPosition;
      }
    };
    
    // Initial scroll with delay for DOM render
    requestAnimationFrame(() => {
      setTimeout(scrollToCurrentDate, 300);
    });
    
    // Add resize listener to recalculate on window resize
    window.addEventListener('resize', scrollToCurrentDate);
    
    return () => {
      window.removeEventListener('resize', scrollToCurrentDate);
    };
  }, [currentDatePosition, timelineData]);

  if (!timelineData) return null;

  const rowHeight = 40;
  const headerHeight = 60;
  const legendHeight = 50;
  const padding = 40;
  const maxRow = layoutTasks.length > 0 ? Math.max(...layoutTasks.map(t => t.row)) : 0;
  const totalHeight = headerHeight + (maxRow + 1) * rowHeight + padding + legendHeight;

  return (
    <div className="gantt-chart-google">
      <div className="gantt-scroll-container" ref={containerRef}>
        <div className="gantt-tasks-container">
          {/* Current date line indicator */}
          {currentDatePosition !== null && (
            <div 
              ref={currentDateLineRef}
              className="gantt-current-date-line"
              style={{ left: `${currentDatePosition}%` }}
            >
              <div className="gantt-current-date-label">
                {moment().format('DD/MM/YYYY')}
              </div>
            </div>
          )}
          
          {layoutTasks.map((task, index) => {
          // Check if task has no start or end date
          const hasNoDates = !task.start || !task.end;
          
          if (hasNoDates) {
            // Show circle for tasks without dates
            const createdDate = task.createdDate || new Date().toISOString();
            const left = calculatePosition(createdDate);
            const top = task.row * rowHeight + 80;
            
            return (
              <div
                key={index}
                className="gantt-task-circle"
                style={{
                  left: `${left}%`,
                  top: `${top}px`,
                  backgroundColor: getResourceColor(task.resource),
                  animationDelay: `${index * 0.05}s`,
                }}
                title={`${task.name} (${task.resource})\nNo start/end date set\nCreated: ${moment(createdDate).format('DD MMM YYYY')}`}
              >
                <div className="gantt-task-tooltip">
                  <div><strong>{task.name}</strong></div>
                  <div>Status: {task.resource}</div>
                  <div>No start/end date set</div>
                  <div>Created: {moment(createdDate).format('DD MMM YYYY')}</div>
                </div>
              </div>
            );
          }
          
          const left = calculatePosition(task.start);
          const width = calculateWidth(task.start, task.end);
          const top = task.row * rowHeight + 80;

          return (
            <div
              key={index}
              className="gantt-task-bar"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: `${top}px`,
                backgroundColor: getResourceColor(task.resource),
                animationDelay: `${index * 0.05}s`,
              }}
              title={`${task.name} (${task.resource})\n${moment(task.start).format('DD MMM YYYY')} - ${moment(task.end).format('DD MMM YYYY')}\nProgress: ${task.progress}%`}
            >
              <div className="gantt-task-content">
                <span className="gantt-task-name">{task.name}</span>
                {task.progress !== undefined && (
                  <div 
                    className="gantt-task-progress" 
                    style={{ width: `${task.progress}%` }}
                  />
                )}
              </div>
              <div className="gantt-task-tooltip">
                <div><strong>{task.name}</strong></div>
                <div>Status: {task.resource}</div>
                <div>{moment(task.start).format('DD MMM YYYY')} - {moment(task.end).format('DD MMM YYYY')}</div>
                <div>Progress: {task.progress}%</div>
              </div>
            </div>
          );
        })}
        </div>

        <div className="gantt-timeline-footer">
          {timelineData.months.map((month, index) => (
            <div 
              key={index} 
              className="timeline-month"
              style={{ width: `${month.width}%` }}
            >
              {month.label}
            </div>
          ))}
        </div>
      </div>

      <div className="gantt-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#52c41a' }}></span>
          <span>Planning</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#1890ff' }}></span>
          <span>Finalized</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#fa8c16' }}></span>
          <span>Implementing</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#722ed1' }}></span>
          <span>Released</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#d9d9d9' }}></span>
          <span>No Start</span>
        </div>
      </div>
    </div>
  );
});

GanttChartGoogle.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      resource: PropTypes.string,
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
      progress: PropTypes.number,
    })
  ).isRequired,
  height: PropTypes.number,
};

export default GanttChartGoogle;
