import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
import { Layout } from 'antd'
import { NotificationContainer } from 'react-notifications'
import AppHeader from './components/Layout/AppHeader'
import Sidebar from './components/Layout/Sidebar'
import BusinessPlanDetailPage from './pages/BusinessPlanDetailPage'
import RelationshipOverviewPage from './pages/RelationshipOverviewPage'
import CMPlanDashboardPage from './pages/CMPlan/CMPlanDashboardPage'
import AttributeSettingsPage from './pages/CMPlan/AttributeSettingsPage'
import ConfigurationItemsPage from './pages/CMPlan/ConfigurationItemsPage'
import RelationshipMapPage from './pages/CMPlan/RelationshipMapPage'
import GroupsPage from './pages/CMPlan/GroupsPage'
import GroupMapPage from './pages/CMPlan/GroupMapPage'
import CIConfigPage from './pages/CMPlan/CIConfigPage'
import CRMConfigPage from './pages/CMPlan/CRMConfigPage'
import BulkAddRelationshipPage from './pages/CMPlan/BulkAddRelationshipPage'
import RelationshipListPage from './pages/CMPlan/RelationshipListPage'
import 'react-notifications/lib/notifications.css'
import './App.css'

const { Content } = Layout

const App = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Layout>
          <Sidebar />
          <Layout style={{ padding: '24px' }}>
            <Content
              style={{
                background: '#fff',
                padding: 24,
                margin: 0,
                minHeight: 280,
                borderRadius: 4,
              }}>
              <Switch>
                <Route
                  exact
                  path="/"
                  render={() => (
                    <Redirect to="/cmplan/dashboard" />
                  )}
                />
                <Route
                  path="/delivery/business-plan-list/:buId/business-plan-detail"
                  component={BusinessPlanDetailPage}
                />
                <Route
                  path="/relationship-overview"
                  component={RelationshipOverviewPage}
                />
                {/* ── CMPlan Routes ───────────────────────────────────── */}
                <Route
                  exact
                  path="/cmplan/dashboard"
                  component={CMPlanDashboardPage}
                />
                <Route
                  exact
                  path="/cmplan/attribute-settings"
                  component={AttributeSettingsPage}
                />
                <Route
                  exact
                  path="/cmplan/configuration-items"
                  component={ConfigurationItemsPage}
                />
                <Route
                  exact
                  path="/cmplan/relationship-map"
                  component={RelationshipMapPage}
                />
                <Route
                  exact
                  path="/cmplan/groups"
                  component={GroupsPage}
                />
                <Route
                  exact
                  path="/cmplan/group-map"
                  component={GroupMapPage}
                />
                <Route
                  exact
                  path="/cmplan/ci-config"
                  component={CIConfigPage}
                />
                <Route
                  exact
                  path="/cmplan/crm-config"
                  component={CRMConfigPage}
                />
                <Route
                  exact
                  path="/cmplan/bulk-add-relationships"
                  component={BulkAddRelationshipPage}
                />
                <Route
                  exact
                  path="/cmplan/relationships"
                  component={RelationshipListPage}
                />
                <Route
                  path="/cmplan"
                  render={() => <Redirect to="/cmplan/dashboard" />}
                />
              </Switch>
            </Content>
          </Layout>
        </Layout>
      </Layout>
      <NotificationContainer />
    </Router>
  )
}

export default App
