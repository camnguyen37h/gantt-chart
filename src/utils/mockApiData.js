/**
 * Mock API Response Data
 * Simulates backend API response
 */

export const mockApiResponse = [
  // Completed tasks
  {
    issueId: "258437",
    issueName: "Ticket delivery Japan 2025 - npcam test",
    startDate: "2024-01-17",
    dueDate: "2024-01-30",
    resolvedDate: "2024-01-30",
    createdDate: "2024-01-17",
    status: "Draft"
  },
  {
    issueId: "258438",
    issueName: "Backend API Development",
    startDate: "2024-01-01",
    dueDate: "2024-04-01",
    resolvedDate: "2024-07-05",
    createdDate: "2023-09-25",
    status: "Completed"
  },
  {
    issueId: "258439",
    issueName: "Frontend Development",
    startDate: "2024-01-15",
    dueDate: "2024-08-31",
    resolvedDate: "2024-08-31",
    createdDate: "2024-01-10",
    status: "Completed"
  },
  {
    issueId: "258440",
    issueName: "Database Design",
    startDate: "2024-03-01",
    dueDate: "2024-06-15",
    resolvedDate: "2024-06-10",
    createdDate: "2024-02-20",
    status: "Approved"
  },
  
  // In progress tasks
  {
    issueId: "258441",
    issueName: "API Integration Testing",
    startDate: "2024-05-15",
    dueDate: "2024-10-31",
    resolvedDate: null,
    createdDate: "2024-05-10",
    status: "In Progress"
  },
  {
    issueId: "258442",
    issueName: "UAT Testing Phase 1",
    startDate: "2024-11-15",
    dueDate: "2025-03-31",
    resolvedDate: null,
    createdDate: "2024-11-10",
    status: "Testing"
  },
  {
    issueId: "258443",
    issueName: "Performance Testing",
    startDate: "2025-01-01",
    dueDate: "2025-04-30",
    resolvedDate: null,
    createdDate: "2024-12-20",
    status: "Testing"
  },
  {
    issueId: "258444",
    issueName: "Bug Fixing Sprint 1",
    startDate: "2024-11-01",
    dueDate: "2025-01-31",
    resolvedDate: "2025-02-05",
    createdDate: "2024-10-25",
    status: "Completed"
  },
  {
    issueId: "258445",
    issueName: "Bug Fixing Sprint 2",
    startDate: "2025-02-01",
    dueDate: "2025-05-15",
    resolvedDate: null,
    createdDate: "2025-01-25",
    status: "In Progress"
  },
  
  // Planning tasks
  {
    issueId: "258446",
    issueName: "Performance Optimization",
    startDate: "2025-03-15",
    dueDate: "2025-07-31",
    resolvedDate: null,
    createdDate: "2025-03-10",
    status: "Planning"
  },
  {
    issueId: "258447",
    issueName: "Security Audit",
    startDate: "2025-06-01",
    dueDate: "2025-09-30",
    resolvedDate: null,
    createdDate: "2025-05-25",
    status: "Planning"
  },
  {
    issueId: "258448",
    issueName: "Documentation",
    startDate: "2025-08-01",
    dueDate: "2025-11-30",
    resolvedDate: null,
    createdDate: "2025-07-25",
    status: "Not Started"
  },
  
  // Future tasks
  {
    issueId: "258449",
    issueName: "Training Materials",
    startDate: "2025-10-01",
    dueDate: "2026-01-31",
    resolvedDate: null,
    createdDate: "2025-09-25",
    status: "Not Started"
  },
  {
    issueId: "258450",
    issueName: "Staging Deployment",
    startDate: "2025-12-01",
    dueDate: "2026-02-28",
    resolvedDate: null,
    createdDate: "2025-11-25",
    status: "Not Started"
  },
  {
    issueId: "258451",
    issueName: "Production Deployment",
    startDate: "2026-03-01",
    dueDate: "2026-05-31",
    resolvedDate: null,
    createdDate: "2026-02-25",
    status: "Pending"
  },
  
  // Milestone events (no startDate/dueDate, only createdDate)
  {
    issueId: "MS-001",
    issueName: "Project Kickoff",
    startDate: null,
    dueDate: null,
    resolvedDate: null,
    createdDate: "2023-01-10",
    status: "Completed"
  },
  {
    issueId: "MS-002",
    issueName: "Design Review Complete",
    startDate: null,
    dueDate: null,
    resolvedDate: null,
    createdDate: "2024-01-15",
    status: "Milestone"
  },
  {
    issueId: "MS-003",
    issueName: "Development Complete",
    startDate: null,
    dueDate: null,
    resolvedDate: null,
    createdDate: "2024-08-31",
    status: "Milestone"
  },
  {
    issueId: "MS-004",
    issueName: "UAT Sign-off",
    startDate: null,
    dueDate: null,
    resolvedDate: null,
    createdDate: "2025-03-31",
    status: "Milestone"
  },
  {
    issueId: "MS-005",
    issueName: "Go-Live Project Launch 2026-05-31",
    startDate: null,
    dueDate: null,
    resolvedDate: null,
    createdDate: "2026-05-31",
    status: "Milestone"
  },
  
  // Additional tasks with various statuses
  {
    issueId: "258452",
    issueName: "Code Review Process",
    startDate: "2023-02-01",
    dueDate: "2023-05-30",
    resolvedDate: "2023-05-30",
    createdDate: "2023-01-25",
    status: "Reviewed"
  },
  {
    issueId: "258453",
    issueName: "Architecture Design",
    startDate: "2023-07-15",
    dueDate: "2023-11-30",
    resolvedDate: "2023-11-25",
    createdDate: "2023-07-10",
    status: "Approved"
  },
  {
    issueId: "258454",
    issueName: "UI/UX Design",
    startDate: "2023-09-01",
    dueDate: "2024-01-15",
    resolvedDate: "2024-01-20",
    createdDate: "2023-08-25",
    status: "Completed"
  },
  {
    issueId: "258455",
    issueName: "Unit Testing",
    startDate: "2024-06-01",
    dueDate: "2024-09-30",
    resolvedDate: "2024-09-28",
    createdDate: "2024-05-25",
    status: "Verified"
  },
  {
    issueId: "258456",
    issueName: "Integration Testing",
    startDate: "2024-09-01",
    dueDate: "2024-12-20",
    resolvedDate: "2024-12-22",
    createdDate: "2024-08-25",
    status: "Verified"
  }
];

/**
 * Simulate API call
 * @returns {Promise<Array>} Promise resolving to API data
 */
export const fetchTimelineData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockApiResponse);
    }, 300);
  });
};
