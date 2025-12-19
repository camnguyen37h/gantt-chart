import React, { memo } from 'react';
import { Card, Icon } from 'antd';
import PropTypes from 'prop-types';
import './MetricCard.css';

const MetricCard = memo(({ title, value, unit, subtitle, subtitleValue, color, icon }) => {
  return (
    <Card className={`metric-card ${color ? `metric-card-${color}` : ''}`}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {icon && <Icon type={icon} className="metric-info-icon" />}
      </div>
      
      <div className="metric-value">
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      
      {subtitle && (
        <div className="metric-subtitle">
          {subtitleValue && <span className="subtitle-value">{subtitleValue}</span>}
          <span className="subtitle-text">{subtitle}</span>
        </div>
      )}
    </Card>
  );
});

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  subtitle: PropTypes.string,
  subtitleValue: PropTypes.string,
  color: PropTypes.oneOf(['red', 'orange', 'blue', 'green']),
  icon: PropTypes.string,
};

MetricCard.defaultProps = {
  unit: '',
  subtitle: '',
  subtitleValue: '',
  color: null,
  icon: 'question-circle',
};

export default MetricCard;
