/**
 * Example Integration Guide for Score Setting Feature
 * 
 * This file demonstrates how to integrate the Score Setting feature
 * into your React application
 */

// ============================================
// Option 1: Add to App.js as a new page
// ============================================

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ScoreSetting from './pages/ScoreSetting';
import ProjectOverview from './pages/ProjectOverview';
// ... other imports

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/score-setting" component={ScoreSetting} />
        <Route path="/project-overview" component={ProjectOverview} />
        {/* ... other routes */}
      </Switch>
    </Router>
  );
}

export default App;

// ============================================
// Option 2: Add to Sidebar navigation
// ============================================

// In Sidebar.jsx, add:
const navigationItems = [
  { path: '/project-overview', label: 'Project Overview', icon: '📊' },
  { path: '/score-setting', label: 'Score Setting', icon: '⚙️' },
  // ... other items
];

// ============================================
// Option 3: Standalone usage (no router)
// ============================================

import React from 'react';
import ScoreSetting from './pages/ScoreSetting';

function App() {
  return (
    <div className="App">
      <header>
        <h1>My Application</h1>
      </header>
      <main>
        <ScoreSetting />
      </main>
    </div>
  );
}

export default App;

// ============================================
// Option 4: As a modal/dialog
// ============================================

import React, { useState } from 'react';
import ScoreSetting from './pages/ScoreSetting';
import './ScoreSettingModal.css';

function ScoreSettingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content score-setting-modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <ScoreSetting />
      </div>
    </div>
  );
}

// Usage:
function ParentComponent() {
  const [showScoreSetting, setShowScoreSetting] = useState(false);

  return (
    <div>
      <button onClick={() => setShowScoreSetting(true)}>
        Open Score Settings
      </button>
      <ScoreSettingModal 
        isOpen={showScoreSetting} 
        onClose={() => setShowScoreSetting(false)} 
      />
    </div>
  );
}

// ============================================
// API Integration Example (Replace Mock API)
// ============================================

// Create a new file: src/api/scoreSettingService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fetchRolesWithScores = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/roles/scores`);
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const saveRoleScores = async (roleId, scores) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/roles/${roleId}/scores`,
      { scores }
    );
    return response.data;
  } catch (error) {
    console.error('Error saving scores:', error);
    throw error;
  }
};

export const fetchRoleById = async (roleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching role:', error);
    throw error;
  }
};

export const getRolesCount = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/roles/count`);
    return response.data.count;
  } catch (error) {
    console.error('Error getting roles count:', error);
    throw error;
  }
};

// Then in ScoreSetting.jsx, replace:
// import { fetchRolesWithScores } from '../utils/scoreSettingApi';
// with:
// import { fetchRolesWithScores } from '../api/scoreSettingService';

// ============================================
// Environment Variables (.env file)
// ============================================

// Create .env file in project root:
/*
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ITEMS_PER_PAGE=5
*/

// Usage in components:
const ITEMS_PER_PAGE = process.env.REACT_APP_ITEMS_PER_PAGE || 5;

// ============================================
// Testing Example (Jest + React Testing Library)
// ============================================

// Create: src/pages/__tests__/ScoreSetting.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ScoreSetting from '../ScoreSetting';
import * as api from '../../utils/scoreSettingApi';

jest.mock('../../utils/scoreSettingApi');

describe('ScoreSetting Component', () => {
  const mockRoles = [
    {
      id: 1,
      name: 'PM',
      scores: [
        { id: 1, score: 'N/A', baseScore: 0, status: true, definition: 'Test definition' }
      ]
    }
  ];

  beforeEach(() => {
    api.fetchRolesWithScores.mockResolvedValue(mockRoles);
  });

  test('renders score setting title', async () => {
    render(<ScoreSetting />);
    expect(screen.getByText('Score Setting')).toBeInTheDocument();
  });

  test('loads and displays roles', async () => {
    render(<ScoreSetting />);
    await waitFor(() => {
      expect(screen.getByText('PM')).toBeInTheDocument();
    });
  });

  test('expands role on click', async () => {
    render(<ScoreSetting />);
    await waitFor(() => {
      const roleHeader = screen.getByText('PM');
      fireEvent.click(roleHeader);
    });
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});

// ============================================
// State Management Integration (Redux Example)
// ============================================

// Create: src/store/scoreSettingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../utils/scoreSettingApi';

export const fetchRoles = createAsyncThunk(
  'scoreSetting/fetchRoles',
  async () => {
    const response = await api.fetchRolesWithScores();
    return response;
  }
);

export const saveScores = createAsyncThunk(
  'scoreSetting/saveScores',
  async ({ roleId, scores }) => {
    const response = await api.saveRoleScores(roleId, scores);
    return { roleId, scores };
  }
);

const scoreSettingSlice = createSlice({
  name: 'scoreSetting',
  initialState: {
    roles: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default scoreSettingSlice.reducer;

// ============================================
// Custom Hooks Example
// ============================================

// Create: src/hooks/useScoreSetting.js
import { useState, useEffect } from 'react';
import { fetchRolesWithScores, saveRoleScores } from '../utils/scoreSettingApi';

export const useScoreSetting = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await fetchRolesWithScores();
      setRoles(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveScores = async (roleId, scores) => {
    try {
      await saveRoleScores(roleId, scores);
      setRoles(prevRoles =>
        prevRoles.map(role =>
          role.id === roleId ? { ...role, scores } : role
        )
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { roles, loading, error, saveScores, refetch: loadRoles };
};

// Usage in component:
// const { roles, loading, error, saveScores } = useScoreSetting();

// ============================================
// TypeScript Interface Definitions
// ============================================

// Create: src/types/scoreSetting.ts
export interface Score {
  id: number;
  score: string;
  baseScore: number;
  status: boolean;
  definition: string;
}

export interface Role {
  id: number;
  name: string;
  scores: Score[];
}

export interface ValidationError {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError;
}
