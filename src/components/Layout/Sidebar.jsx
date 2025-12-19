import React, { useState, useCallback } from 'react';
import { Layout, Menu, Icon } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const onCollapse = useCallback((collapsed) => {
    setCollapsed(collapsed);
  }, []);

  const menuItems = [
    {
      key: '/project-overview',
      icon: 'bar-chart',
      title: 'Project Overview',
    },
    {
      key: '/project-schedule',
      icon: 'calendar',
      title: 'Project Schedule',
    },
    {
      key: '/workforce-planning',
      icon: 'team',
      title: 'Workforce Planning',
    },
    {
      key: '/project-member',
      icon: 'user',
      title: 'Project Member',
    },
    {
      key: '/project-resources',
      icon: 'folder',
      title: 'Project Resources',
    },
    {
      key: '/project-kpi',
      icon: 'line-chart',
      title: 'Project KPI',
    },
    {
      key: '/project-inputs',
      icon: 'edit',
      title: 'Project Inputs',
    },
    {
      key: '/project-information',
      icon: 'info-circle',
      title: 'Project Information',
    },
    {
      key: '/project-issues',
      icon: 'warning',
      title: 'Project Issues',
    },
    {
      key: '/project-risks',
      icon: 'exclamation-circle',
      title: 'Project Risks',
    },
    {
      key: '/project-monitoring',
      icon: 'eye',
      title: 'Project Monitoring',
    },
  ];

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={onCollapse}
      width={240}
      className="sidebar"
    >
      <div className="sidebar-header">
        <Icon type="arrow-left" className="back-icon" />
        <span className="sidebar-title">Back to Project List</span>
      </div>
      
      <Menu 
        mode="inline" 
        selectedKeys={[location.pathname]}
        className="sidebar-menu"
      >
        {menuItems.map(item => (
          <Menu.Item key={item.key}>
            <Link to={item.key}>
              <Icon type={item.icon} />
              <span>{item.title}</span>
            </Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
