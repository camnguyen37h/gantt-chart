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
                    <Redirect to="/delivery/business-plan-list/494/business-plan-detail" />
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
