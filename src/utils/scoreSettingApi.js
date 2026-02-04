/**
 * Mock API for Score Setting
 * Simulates fetching roles with their associated scores
 */

// Mock database of roles with scores
const mockRolesDatabase = [
  {
    id: 1,
    name: 'PM',
    scores: [
      { id: 101, score: 'N/A', baseScore: 0, status: true, definition: 'Điểm 0 đáng nghĩa với việc không có khả năng quản lý dự án' },
      { id: 102, score: 'L0', baseScore: 0, status: true, definition: 'Điểm 0 đáng nghĩa với việc không có kinh nghiệm quản lý' },
      { id: 103, score: 'L1', baseScore: 1, status: true, definition: 'Điểm 1 đáng nghĩa với việc có ít kinh nghiệm quản lý cơ bản' },
      { id: 104, score: 'L2', baseScore: 2, status: true, definition: 'Điểm 2 đáng nghĩa với việc có kinh nghiệm quản lý trung bình' },
      { id: 105, score: 'L3', baseScore: 3, status: true, definition: 'Điểm 3 đáng nghĩa với việc có kinh nghiệm quản lý tốt' },
      { id: 106, score: 'L4', baseScore: 4, status: true, definition: 'Điểm 4 đáng nghĩa với việc có kinh nghiệm quản lý xuất sắc' }
    ]
  },
  {
    id: 2,
    name: 'QA',
    scores: [
      { id: 201, score: 'N/A', baseScore: 0, status: true, definition: 'Điểm 0 đáng nghĩa với việc không có khả năng kiểm thử' },
      { id: 202, score: 'Junior', baseScore: 1, status: true, definition: 'Điểm 1 đáng nghĩa với việc có kỹ năng kiểm thử cơ bản' },
      { id: 203, score: 'Middle', baseScore: 2, status: true, definition: 'Điểm 2 đáng nghĩa với việc có kỹ năng kiểm thử trung bình' },
      { id: 204, score: 'Senior', baseScore: 3, status: true, definition: 'Điểm 3 đáng nghĩa với việc có kỹ năng kiểm thử chuyên sâu' }
    ]
  },
  {
    id: 3,
    name: 'Developer',
    scores: [
      { id: 301, score: 'N/A', baseScore: 0, status: true, definition: 'Điểm 0 đáng nghĩa với việc không có khả năng lập trình' },
      { id: 302, score: 'Intern', baseScore: 0, status: true, definition: 'Điểm 0 đáng nghĩa với việc đang thực tập, chưa có kinh nghiệm' },
      { id: 303, score: 'Fresher', baseScore: 1, status: true, definition: 'Điểm 1 đáng nghĩa với việc mới tốt nghiệp, có kiến thức cơ bản' },
      { id: 304, score: 'Junior', baseScore: 2, status: true, definition: 'Điểm 2 đáng nghĩa với việc có 1-2 năm kinh nghiệm' },
      { id: 305, score: 'Middle', baseScore: 3, status: true, definition: 'Điểm 3 đáng nghĩa với việc có 3-5 năm kinh nghiệm' },
      { id: 306, score: 'Senior', baseScore: 4, status: true, definition: 'Điểm 4 đáng nghĩa với việc có trên 5 năm kinh nghiệm' }
    ]
  },
  {
    id: 4,
    name: 'Tester',
    scores: [
      { id: 401, score: 'N/A', baseScore: 0, status: true, definition: 'Điểm 0 đáng nghĩa với việc không có khả năng test' },
      { id: 402, score: 'Manual Tester', baseScore: 1, status: true, definition: 'Điểm 1 đáng nghĩa với việc chỉ test thủ công' },
      { id: 403, score: 'Automation Tester', baseScore: 2, status: true, definition: 'Điểm 2 đáng nghĩa với việc có khả năng tự động hóa test' }
    ]
  },
  {
    id: 5,
    name: 'Test Lead',
    scores: [
      { id: 501, score: 'N/A', baseScore: 0, status: true, definition: 'Điểm 0 đáng nghĩa với việc không có khả năng quản lý test' },
      { id: 502, score: 'Junior Lead', baseScore: 1, status: true, definition: 'Điểm 1 đáng nghĩa với việc có ít kinh nghiệm quản lý team test' },
      { id: 503, score: 'Senior Lead', baseScore: 2, status: true, definition: 'Điểm 2 đáng nghĩa với việc có nhiều kinh nghiệm quản lý team test' }
    ]
  },
  {
    id: 6,
    name: 'Business Analyst',
    scores: [
      { id: 601, score: 'N/A', baseScore: 0, status: true, definition: 'Điểm 0 đáng nghĩa với việc không có khả năng phân tích nghiệp vụ' },
      { id: 602, score: 'Junior BA', baseScore: 1, status: true, definition: 'Điểm 1 đáng nghĩa với việc có kỹ năng phân tích cơ bản' },
      { id: 603, score: 'Senior BA', baseScore: 2, status: true, definition: 'Điểm 2 đáng nghĩa với việc có kỹ năng phân tích chuyên sâu' }
    ]
  },
  {
    id: 7,
    name: 'Designer',
    scores: [
      { id: 701, score: 'N/A', baseScore: 0, status: true, definition: 'Điểm 0 đáng nghĩa với việc không có khả năng thiết kế' },
      { id: 702, score: 'UI Designer', baseScore: 1, status: true, definition: 'Điểm 1 đáng nghĩa với việc thiết kế giao diện người dùng' },
      { id: 703, score: 'UX Designer', baseScore: 2, status: true, definition: 'Điểm 2 đáng nghĩa với việc thiết kế trải nghiệm người dùng' },
      { id: 704, score: 'UI/UX Designer', baseScore: 3, status: true, definition: 'Điểm 3 đáng nghĩa với việc thiết kế cả UI và UX' }
    ]
  }
];

/**
 * Simulates fetching roles with scores from an API
 * @returns {Promise<Array>} Promise that resolves to array of roles
 */
export const fetchRolesWithScores = async () => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Deep copy to avoid mutations
      const roles = JSON.parse(JSON.stringify(mockRolesDatabase));
      resolve(roles);
    }, 500);
  });
};

/**
 * Simulates saving scores for a specific role
 * @param {number} roleId - The role ID
 * @param {Array} scores - The scores to save
 * @returns {Promise<Object>} Promise that resolves to success response
 */
export const saveRoleScores = async (roleId, scores) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const roleIndex = mockRolesDatabase.findIndex(r => r.id === roleId);
      
      if (roleIndex === -1) {
        reject(new Error('Role not found'));
        return;
      }

      // Update mock database
      mockRolesDatabase[roleIndex].scores = JSON.parse(JSON.stringify(scores));
      
      resolve({
        success: true,
        message: 'Scores saved successfully',
        roleId,
        scoresCount: scores.length
      });
    }, 300);
  });
};

/**
 * Simulates fetching a single role with its scores
 * @param {number} roleId - The role ID
 * @returns {Promise<Object>} Promise that resolves to role object
 */
export const fetchRoleById = async (roleId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const role = mockRolesDatabase.find(r => r.id === roleId);
      
      if (!role) {
        reject(new Error('Role not found'));
        return;
      }

      resolve(JSON.parse(JSON.stringify(role)));
    }, 300);
  });
};

/**
 * Get total count of roles
 * @returns {Promise<number>} Promise that resolves to total count
 */
export const getRolesCount = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRolesDatabase.length);
    }, 100);
  });
};
