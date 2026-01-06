/**
 * Timeline Toolbar Component
 * Provides controls for timeline (search, filter, actions)
 */

import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Icon } from 'antd';
import './TimelineToolbar.css';

const TimelineToolbar = memo(({
  searchQuery,
  onSearchChange,
  onTodayClick,
  onNewItem,
  showNewButton,
  showSearch,
  showFilters,
  showTodayButton,
  extraActions,
  className
}) => {
  const handleSearchChange = useCallback((e) => {
    onSearchChange?.(e.target.value);
  }, [onSearchChange]);

  return (
    <div className={`timeline-toolbar ${className || ''}`}>
      <div className="timeline-toolbar-left">
        {showNewButton && (
          <Button type="primary" onClick={onNewItem}>
            <Icon type="plus" /> New Item
          </Button>
        )}
        
        {showSearch && (
          <Input
            prefix={<Icon type="search" />}
            placeholder="Search items..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ width: 240 }}
            allowClear
          />
        )}

        {showFilters && (
          <>
            <Button>
              <Icon type="user" /> Person
            </Button>
            <Button>
              <Icon type="filter" /> Filter
            </Button>
          </>
        )}

        {extraActions}
      </div>

      <div className="timeline-toolbar-right">
        {showTodayButton && (
          <Button onClick={onTodayClick} type="default">
            <Icon type="calendar" /> Today
          </Button>
        )}
      </div>
    </div>
  );
});

TimelineToolbar.propTypes = {
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  onTodayClick: PropTypes.func,
  onNewItem: PropTypes.func,
  showNewButton: PropTypes.bool,
  showSearch: PropTypes.bool,
  showFilters: PropTypes.bool,
  showTodayButton: PropTypes.bool,
  extraActions: PropTypes.node,
  className: PropTypes.string
};

TimelineToolbar.defaultProps = {
  searchQuery: '',
  showNewButton: true,
  showSearch: true,
  showFilters: true,
  showTodayButton: true
};

export default TimelineToolbar;
