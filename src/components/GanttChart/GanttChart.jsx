import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './GanttChart.css';

const GanttChart = memo(({ tasks, startDate, endDate, milestones }) => {
  const timelineData = useMemo(() => {
    const start = moment(startDate);
    const end = moment(endDate);
    const totalDays = end.diff(start, 'days');
    
    // Generate month labels
    const months = [];
    let current = start.clone().startOf('month');
    while (current.isBefore(end)) {
      months.push({
        label: current.format('MMM YYYY'),
        date: current.clone(),
      });
      current.add(1, 'month');
    }
    
    return { start, end, totalDays, months };
  }, [startDate, endDate]);

  const calculatePosition = (date) => {
    const days = moment(date).diff(timelineData.start, 'days');
    return (days / timelineData.totalDays) * 100;
  };

  const calculateWidth = (taskStart, taskEnd) => {
    const days = moment(taskEnd).diff(moment(taskStart), 'days');
    return (days / timelineData.totalDays) * 100;
  };

  return (
    <div className="gantt-chart">
      <div className="gantt-header">
        <div className="gantt-timeline">
          {timelineData.months.map((month, index) => (
            <div key={index} className="timeline-month">
              {month.label}
            </div>
          ))}
        </div>
        <div className="gantt-timeline-labels">
          {['Planning Bill', 'Planning Bill', 'Planning Bill', 'Planning Bill', 'Planning Bill', 'Planning Bill'].map((label, index) => (
            <div key={index} className="timeline-label">
              <span>{label}</span>
              <span className="timeline-value">20MM</span>
            </div>
          ))}
        </div>
      </div>

      <div className="gantt-body">
        {/* Milestones */}
        {milestones && milestones.map((milestone, index) => (
          <div 
            key={`milestone-${index}`}
            className="gantt-milestone"
            style={{ left: `${calculatePosition(milestone.date)}%` }}
          >
            <div className="milestone-line" />
            <div className="milestone-label">
              <div className="milestone-title">{milestone.title}</div>
              <div className="milestone-date">{milestone.label}</div>
            </div>
          </div>
        ))}

        {/* Tasks */}
        {tasks.map((task, index) => (
          <div key={index} className="gantt-row">
            <div
              className={`gantt-bar gantt-bar-${task.color || 'blue'}`}
              style={{
                left: `${calculatePosition(task.start)}%`,
                width: `${calculateWidth(task.start, task.end)}%`,
              }}
            >
              <span className="gantt-bar-label">{task.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

GanttChart.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  milestones: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    })
  ),
};

GanttChart.defaultProps = {
  milestones: [],
};

export default GanttChart;
