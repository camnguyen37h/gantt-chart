import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Card, Icon, Progress, Button } from 'antd'
import { Link } from 'react-router-dom'
import {
  fetchCITypes,
  fetchDashboardStats,
} from '../../store/cmplan'
import CIStatsCards from '../../components/CMPlan/Dashboard/CIStatsCards'
import CITypeDistributionChart from '../../components/CMPlan/Dashboard/CITypeDistributionChart'
import CIStatusChart from '../../components/CMPlan/Dashboard/CIStatusChart'
import RecentCITable from '../../components/CMPlan/Dashboard/RecentCITable'
import './CMPlan.css'

const CMPlanDashboardPage = () => {
  const dispatch = useDispatch()
  const ciTypes = useSelector(state => state.cmplan.ciTypes.items)
  const stats = useSelector(state => state.cmplan.configurationItems.dashboardStats)
  const statsLoading = useSelector(state => state.cmplan.configurationItems.statsLoading)

  useEffect(() => {
    dispatch(fetchCITypes())
    dispatch(fetchDashboardStats())
  }, [dispatch])

  return (
    <div className="cmplan-page">
      {/* Page Header */}
      <div className="cmplan-page-header">
        <div className="cmplan-page-header-left">
          <Icon type="dashboard" className="cmplan-page-header-icon" />
          <div>
            <h2 className="cmplan-page-title">CMDB Overview Dashboard</h2>
            <p className="cmplan-page-subtitle">
              Real-time overview of all Configuration Items, classes, and
              compliance across your infrastructure.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/cmplan/configuration-items">
            <Button icon="database">View CIs</Button>
          </Link>
          <Link to="/cmplan/attribute-settings">
            <Button type="primary" icon="setting">
              Attribute Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <CIStatsCards stats={stats} loading={statsLoading} />

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <CITypeDistributionChart stats={stats} loading={statsLoading} />
        </Col>
        <Col xs={24} lg={14}>
          <CIStatusChart stats={stats} loading={statsLoading} />
        </Col>
      </Row>

      {/* Recent CIs + Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <RecentCITable
            recentItems={stats && stats.recent}
            ciTypes={ciTypes}
            loading={statsLoading}
          />
        </Col>

        <Col xs={24} lg={8}>
          {/* CI Class Overview */}
          <Card
            title={
              <span>
                <Icon type="appstore" style={{ marginRight: 6, color: '#722ed1' }} />
                CI Class Inventory
              </span>
            }
            size="small"
            style={{ borderRadius: 8 }}
            bodyStyle={{ padding: '8px 16px 12px' }}
          >
            {((stats && stats.byClass) || [])
              .filter((c) => c.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((cls) => (
                <div
                  key={cls.classId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: cls.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#595959' }}>{cls.className}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                    <Progress
                      percent={
                        stats && stats.total > 0
                          ? Math.round((cls.count / stats.total) * 100)
                          : 0
                      }
                      showInfo={false}
                      size="small"
                      strokeColor={cls.color}
                      style={{ flex: 1, margin: 0 }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#262626',
                        minWidth: 24,
                        textAlign: 'right',
                      }}
                    >
                      {cls.count}
                    </span>
                  </div>
                </div>
              ))}

            {statsLoading && (
              <div style={{ padding: '8px 0', color: '#8c8c8c', textAlign: 'center' }}>
                Loading...
              </div>
            )}
          </Card>

          {/* Quick Navigation */}
          <Card
            title={
              <span>
                <Icon type="rocket" style={{ marginRight: 6, color: '#fa8c16' }} />
                Quick Actions
              </span>
            }
            size="small"
            style={{ borderRadius: 8, marginTop: 16 }}
            bodyStyle={{ padding: '8px 16px 12px' }}
          >
            {[
              {
                icon: 'plus-circle',
                color: '#52c41a',
                label: 'Add Configuration Item',
                to: '/cmplan/configuration-items',
              },
              {
                icon: 'setting',
                color: '#1890ff',
                label: 'Manage Attributes',
                to: '/cmplan/attribute-settings',
              },
              {
                icon: 'database',
                color: '#722ed1',
                label: 'Browse All CIs',
                to: '/cmplan/configuration-items',
              },
            ].map((action) => (
              <Link key={action.label} to={action.to}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 4px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = '#f5f5f5')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <Icon
                    type={action.icon}
                    style={{
                      color: action.color,
                      fontSize: 16,
                      width: 20,
                      textAlign: 'center',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#262626' }}>{action.label}</span>
                  <Icon
                    type="right"
                    style={{ marginLeft: 'auto', color: '#bfbfbf', fontSize: 10 }}
                  />
                </div>
              </Link>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CMPlanDashboardPage
