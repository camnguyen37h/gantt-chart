import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from './components/Layout/AppHeader';
import Sidebar from './components/Layout/Sidebar';
import ProjectOverview from './pages/ProjectOverview';
import ProjectSchedule from './pages/ProjectSchedule';
import WorkforcePlanning from './pages/WorkforcePlanning';
import TimelineView from './pages/TimelineView';
import './App.css';

const { Content } = Layout;

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
              }}
            >
              <Switch>
                <Route exact path="/" render={() => <Redirect to="/timeline" />} />
                <Route path="/project-overview" component={ProjectOverview} />
                <Route path="/project-schedule" component={ProjectSchedule} />
                <Route path="/workforce-planning" component={WorkforcePlanning} />
                <Route path="/timeline" component={TimelineView} />
              </Switch>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
