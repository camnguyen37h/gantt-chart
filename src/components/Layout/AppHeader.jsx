import React from 'react';
import { Layout, Avatar, Select, Badge, Icon } from 'antd';
import './AppHeader.css';

const { Header } = Layout;
const { Option } = Select;

const AppHeader = () => {
  return (
    <Header className="app-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">📊</span>
          <span className="logo-text">PROJECT MANAGEMENT</span>
        </div>
      </div>
      
      <div className="header-center">
        <div className="header-tabs">
          <a href="#dashboard" className="header-tab active">DASHBOARD</a>
          <a href="#delivery" className="header-tab">DELIVERY</a>
          <a href="#tasks" className="header-tab">TASKS</a>
        </div>
      </div>

      <div className="header-right">
        <Select 
          defaultValue="project1" 
          className="project-selector"
          dropdownMatchSelectWidth={false}
        >
          <Option value="project1">Select project</Option>
          <Option value="project2">Project Alpha</Option>
          <Option value="project3">Project Beta</Option>
        </Select>
        
        <Badge count={5} offset={[-5, 5]}>
          <Icon type="bell" className="header-icon" />
        </Badge>
        
        <div className="user-profile">
          <Avatar 
            icon="user" 
            style={{ backgroundColor: '#ff6b35' }}
          />
          <span className="user-name">Ngan, Le Hoang Kim - CMC Global TDX</span>
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;
