/**
 * Mock Data for Performance Bonus Setting
 * This file contains sample data for development and testing
 */

// Sample roles data
export const mockRoles = [
  { id: 1, name: 'Senior Developer', code: 'SENIOR_DEV', description: 'Senior software developer' },
  { id: 2, name: 'Junior Developer', code: 'JUNIOR_DEV', description: 'Junior software developer' },
  { id: 3, name: 'Team Leader', code: 'TEAM_LEAD', description: 'Team leader and coordinator' },
  { id: 4, name: 'Project Manager', code: 'PM', description: 'Project manager' },
  { id: 5, name: 'Business Analyst', code: 'BA', description: 'Business analyst' },
  { id: 6, name: 'QA Engineer', code: 'QA', description: 'Quality assurance engineer' },
  { id: 7, name: 'DevOps Engineer', code: 'DEVOPS', description: 'DevOps specialist' },
  { id: 8, name: 'UI/UX Designer', code: 'DESIGNER', description: 'UI/UX designer' },
  { id: 9, name: 'Technical Architect', code: 'ARCHITECT', description: 'Technical architect' },
  { id: 10, name: 'Scrum Master', code: 'SCRUM_MASTER', description: 'Scrum master' },
  { id: 11, name: 'Product Owner', code: 'PO', description: 'Product owner' },
  { id: 12, name: 'Tech Lead', code: 'TECH_LEAD', description: 'Technical lead' },
  { id: 13, name: 'Frontend Developer', code: 'FE_DEV', description: 'Frontend developer' },
  { id: 14, name: 'Backend Developer', code: 'BE_DEV', description: 'Backend developer' },
  { id: 15, name: 'Full Stack Developer', code: 'FULL_STACK', description: 'Full stack developer' },
]

// Sample score levels by role
export const mockScoreLevels = {
  1: [ // Senior Developer
    { scoreId: 101, level: 'N/A', baseScore: 0, status: true, description: 'Not applicable' },
    { scoreId: 102, level: 'A+', baseScore: 95, status: true, description: 'Outstanding performance' },
    { scoreId: 103, level: 'A', baseScore: 90, status: true, description: 'Excellent performance' },
    { scoreId: 104, level: 'B+', baseScore: 85, status: true, description: 'Very good performance' },
    { scoreId: 105, level: 'B', baseScore: 80, status: true, description: 'Good performance' },
    { scoreId: 106, level: 'C+', baseScore: 75, status: true, description: 'Satisfactory performance' },
    { scoreId: 107, level: 'C', baseScore: 70, status: true, description: 'Acceptable performance' },
    { scoreId: 108, level: 'D', baseScore: 60, status: false, description: 'Below expectations' },
  ],
  2: [ // Junior Developer
    { scoreId: 201, level: 'N/A', baseScore: 0, status: true, description: 'Not applicable' },
    { scoreId: 202, level: 'A', baseScore: 90, status: true, description: 'Excellent work' },
    { scoreId: 203, level: 'B', baseScore: 80, status: true, description: 'Good work' },
    { scoreId: 204, level: 'C', baseScore: 70, status: true, description: 'Satisfactory work' },
    { scoreId: 205, level: 'D', baseScore: 60, status: false, description: 'Needs improvement' },
  ],
  3: [ // Team Leader
    { scoreId: 301, level: 'N/A', baseScore: 0, status: true, description: 'Not applicable' },
    { scoreId: 302, level: 'Outstanding', baseScore: 95, status: true, description: 'Exceptional leadership' },
    { scoreId: 303, level: 'Excellent', baseScore: 85, status: true, description: 'Strong leadership' },
    { scoreId: 304, level: 'Good', baseScore: 75, status: true, description: 'Competent leadership' },
    { scoreId: 305, level: 'Fair', baseScore: 65, status: false, description: 'Basic leadership' },
  ],
  4: [ // Project Manager
    { scoreId: 401, level: 'N/A', baseScore: 0, status: true, description: 'Not applicable' },
    { scoreId: 402, level: '5 Star', baseScore: 100, status: true, description: 'Perfect project delivery' },
    { scoreId: 403, level: '4 Star', baseScore: 85, status: true, description: 'Excellent project delivery' },
    { scoreId: 404, level: '3 Star', baseScore: 70, status: true, description: 'Good project delivery' },
    { scoreId: 405, level: '2 Star', baseScore: 55, status: false, description: 'Needs improvement' },
  ],
  5: [ // Business Analyst
    { scoreId: 501, level: 'N/A', baseScore: 0, status: true, description: 'Not applicable' },
    { scoreId: 502, level: 'Expert', baseScore: 90, status: true, description: 'Expert analysis skills' },
    { scoreId: 503, level: 'Advanced', baseScore: 80, status: true, description: 'Advanced analysis skills' },
    { scoreId: 504, level: 'Intermediate', baseScore: 70, status: true, description: 'Intermediate skills' },
    { scoreId: 505, level: 'Basic', baseScore: 60, status: false, description: 'Basic skills' },
  ],
}

// Generate default score levels for roles without specific data
const generateDefaultScoreLevels = (roleId) => {
  const baseId = roleId * 100
  return [
    { scoreId: baseId + 1, level: 'N/A', baseScore: 0, status: true, description: 'Not applicable' },
    { scoreId: baseId + 2, level: 'Excellent', baseScore: 90, status: true, description: 'Excellent performance' },
    { scoreId: baseId + 3, level: 'Good', baseScore: 80, status: true, description: 'Good performance' },
    { scoreId: baseId + 4, level: 'Average', baseScore: 70, status: true, description: 'Average performance' },
    { scoreId: baseId + 5, level: 'Poor', baseScore: 60, status: false, description: 'Below average' },
  ]
}

// Ensure all roles have score levels
mockRoles.forEach(role => {
  if (!mockScoreLevels[role.id]) {
    mockScoreLevels[role.id] = generateDefaultScoreLevels(role.id)
  }
})
