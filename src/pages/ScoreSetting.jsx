import React, { useState, useEffect } from 'react';
import './ScoreSetting.css';
import ScoreForm from '../components/ScoreForm/ScoreForm';
import { fetchRolesWithScores } from '../utils/scoreSettingApi';

const ITEMS_PER_PAGE = 5;

const ScoreSetting = () => {
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRoles, setExpandedRoles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await fetchRolesWithScores();
      setRoles(data);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (roleId) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const handleSaveScores = (roleId, scores) => {
    setRoles(prevRoles =>
      prevRoles.map(role =>
        role.id === roleId ? { ...role, scores } : role
      )
    );
    console.log('Saved scores for role:', roleId, scores);
    // Here you would typically make an API call to save the data
  };

  // Pagination logic
  const totalPages = Math.ceil(roles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRoles = roles.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return <div className="score-setting-loading">Loading...</div>;
  }

  return (
    <div className="score-setting-container">
      <h1 className="score-setting-title">Score Setting</h1>

      <div className="roles-list">
        {paginatedRoles.map(role => (
          <div key={role.id} className="role-item">
            <div
              className="role-header"
              onClick={() => toggleRole(role.id)}
            >
              <span className="role-toggle-icon">
                {expandedRoles[role.id] ? '▼' : '▶'}
              </span>
              <span className="role-name">{role.name}</span>
            </div>

            {expandedRoles[role.id] && (
              <div className="role-content">
                <ScoreForm
                  roleId={role.id}
                  roleName={role.name}
                  initialScores={role.scores}
                  onSave={(scores) => handleSaveScores(role.id, scores)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ScoreSetting;
