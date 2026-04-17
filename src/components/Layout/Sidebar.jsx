import React, { useState, useCallback } from 'react'
import { Layout, Menu, Icon } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

const { Sider, SubMenu } = Layout
// AntD v3 uses Menu.SubMenu
const AntSubMenu = Menu.SubMenu

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const onCollapse = useCallback(value => {
    setCollapsed(value)
  }, [])

  const isCMPlan = location.pathname.startsWith('/cmplan')

  // Default open submenus
  const defaultOpenKeys = isCMPlan ? ['cmplan-sub'] : ['project-sub']

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={240}
      className="sidebar">
      <div className="sidebar-header">
        <Icon type="arrow-left" className="back-icon" />
        {!collapsed && (
          <span className="sidebar-title">Back to Project List</span>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={defaultOpenKeys}
        className="sidebar-menu">
        {/* ── Project Management ───────────────────────────────────────────── */}
        <AntSubMenu
          key="project-sub"
          title={
            <span>
              <Icon type="project" />
              <span>Project Mgmt</span>
            </span>
          }>
          {[
            { key: '/project-overview', icon: 'bar-chart', title: 'Overview' },
            { key: '/project-schedule', icon: 'calendar', title: 'Schedule' },
            { key: '/workforce-planning', icon: 'team', title: 'Workforce' },
            { key: '/project-member', icon: 'user', title: 'Members' },
            { key: '/project-resources', icon: 'folder', title: 'Resources' },
            { key: '/project-kpi', icon: 'line-chart', title: 'KPI' },
            { key: '/project-inputs', icon: 'edit', title: 'Inputs' },
            {
              key: '/project-information',
              icon: 'info-circle',
              title: 'Information',
            },
            { key: '/project-issues', icon: 'warning', title: 'Issues' },
            {
              key: '/project-risks',
              icon: 'exclamation-circle',
              title: 'Risks',
            },
            { key: '/project-monitoring', icon: 'eye', title: 'Monitoring' },
          ].map(item => (
            <Menu.Item key={item.key}>
              <Link to={item.key}>
                <Icon type={item.icon} />
                <span>{item.title}</span>
              </Link>
            </Menu.Item>
          ))}
        </AntSubMenu>

        {/* ── CMPlan (CMDB) ─────────────────────────────────────────────────── */}
        <AntSubMenu
          key="cmplan-sub"
          title={
            <span>
              <Icon type="deployment-unit" style={{ color: '#722ed1' }} />
              <span>CMPlan</span>
            </span>
          }>
          <Menu.Item key="/cmplan/dashboard">
            <Link to="/cmplan/dashboard">
              <Icon type="dashboard" />
              <span>Dashboard</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="/cmplan/configuration-items">
            <Link to="/cmplan/configuration-items">
              <Icon type="database" />
              <span>Config Items</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="/cmplan/relationship-map">
            <Link to="/cmplan/relationship-map">
              <Icon type="share-alt" />
              <span>Relationship Map</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="/cmplan/groups">
            <Link to="/cmplan/groups">
              <Icon type="cluster" />
              <span>Groups</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="/cmplan/group-map">
            <Link to="/cmplan/group-map">
              <Icon type="apartment" />
              <span>Group Map</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="/cmplan/attribute-settings">
            <Link to="/cmplan/attribute-settings">
              <Icon type="setting" />
              <span>Attr. Settings</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="/cmplan/ci-config">
            <Link to="/cmplan/ci-config">
              <Icon type="tool" />
              <span>CI Configuration</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="/cmplan/crm-config">
            <Link to="/cmplan/crm-config">
              <Icon type="api" />
              <span>CRM Configuration</span>
            </Link>
          </Menu.Item>
        </AntSubMenu>

        {/* ── Existing Delivery ────────────────────────────────────────────── */}
        {/*<Menu.Item*/}
        {/*  key="/delivery/business-plan-list/494/business-plan-detail"*/}
        {/*>*/}
        {/*  <Link to="/delivery/business-plan-list/494/business-plan-detail">*/}
        {/*    <Icon type="fund" />*/}
        {/*    <span>Business Plan</span>*/}
        {/*  </Link>*/}
        {/*</Menu.Item>*/}
        {/*<Menu.Item key="/relationship-overview">*/}
        {/*  <Link to="/relationship-overview">*/}
        {/*    <Icon type="share-alt" />*/}
        {/*    <span>Relationships</span>*/}
        {/*  </Link>*/}
        {/*</Menu.Item>*/}
      </Menu>
    </Sider>
  )
}

export default Sidebar
