/**
 * Mock Data for Business Plan Module
 * Comprehensive test data for Business Plan features
 */

// Mock Business Plan Detail
export const mockBusinessPlanDetail = {
  id: 436,
  projectCode: "GLBTM2500093",
  status: "Approved",
  version: 1,
  startDate: 1770915600000,
  endDate: 1784134800000,
  warningMessage: [],
  versions: [
    {
      versionId: 436,
      versionName: "Version 1",
      status: "APPROVED",
      statusName: "Approved"
    },
    {
      versionId: 437,
      versionName: "Version 2",
      status: "DRAFT",
      statusName: "Draft"
    }
  ],
  generalInfo: {
    listAM: [
      {
        id: 11233,
        businessPlanVersionId: 436,
        memberType: "AM",
        userId: 3744,
        ldap: "ntmanh6",
        departmentId: 40,
        departmentName: "BU3",
        startDate: 1770915600000,
        endDate: 1784134800000,
        isDefault: true
      }
    ],
    listTeamLead: [
      {
        id: 11247,
        businessPlanVersionId: 436,
        memberType: "TEAM_LEAD",
        userId: 136,
        ldap: "lcnguyen",
        departmentId: 3,
        departmentName: "DU1.3",
        startDate: 1770915600000,
        endDate: 1784134800000,
        isDefault: false
      }
    ],
    listPreSale: [],
    listPreparator: [
      {
        id: 11246,
        businessPlanVersionId: 436,
        memberType: "PREPARATOR",
        userId: 3,
        ldap: "bhduc",
        departmentId: 6,
        departmentName: "DU1.6",
        startDate: 1770915600000,
        endDate: 1784134800000,
        isDefault: false
      }
    ],
    listAdviser: [],
    listPM: [
      {
        id: 11232,
        businessPlanVersionId: 436,
        memberType: "PM",
        userId: 3860,
        ldap: "ttlam1",
        departmentId: 2,
        departmentName: "DJ2",
        startDate: 1770915600000,
        endDate: 1784134800000,
        isDefault: true
      }
    ],
    businessPlanName: "Myfirstmillion Onsite",
    customerName: "MyFirstMillion",
    startDate: 1770915600000,
    endDate: 1784134800000,
    orderType: "Commercial",
    recurringNew: "New",
    pm: null,
    currency: 778,
    exchangeRate: 1,
    totalContractPrice: 12000000,
    industry: 18,
    customerMarket: "US",
    cooperationPeriod: "Less than 12 months",
    softwareDevelopmentFee: 12000000,
    otherFees: 0,
  }
}

// Mock Production Revenue
export const mockProductionRevenue = {
  startDate: 1770915600000,
  endDate: 1784134800000,
  revenueInfos: [
    {
      saleWorkOrderId: "271626",
      groupId: null,
      pipelineKey: "WO-7821",
      position: "Senior Engineer",
      unitPrice: 5000000,
      rateCard: null,
      department: "BU3",
      exchangeRate: 1,
      pipeLineRatio: 100,
      totalManMonth: 12,
      totalRevenue: 60000000,
      revenue: {
        "01-2026": { manMonth: 1, revenue: 5000000 },
        "02-2026": { manMonth: 1, revenue: 5000000 },
        "03-2026": { manMonth: 1, revenue: 5000000 },
        "04-2026": { manMonth: 1, revenue: 5000000 },
        "05-2026": { manMonth: 1, revenue: 5000000 },
        "06-2026": { manMonth: 1, revenue: 5000000 },
        "07-2026": { manMonth: 1, revenue: 5000000 },
        "08-2026": { manMonth: 1, revenue: 5000000 },
        "09-2026": { manMonth: 1, revenue: 5000000 },
        "10-2026": { manMonth: 1, revenue: 5000000 },
        "11-2026": { manMonth: 1, revenue: 5000000 },
        "12-2026": { manMonth: 1, revenue: 5000000 },
      }
    },
    {
      saleWorkOrderId: "271627",
      groupId: null,
      pipelineKey: "WO-7822",
      position: "Tech Lead",
      unitPrice: 8000000,
      rateCard: null,
      department: "BU3",
      exchangeRate: 1,
      pipeLineRatio: 100,
      totalManMonth: 6,
      totalRevenue: 48000000,
      revenue: {
        "01-2026": { manMonth: 1, revenue: 8000000 },
        "02-2026": { manMonth: 1, revenue: 8000000 },
        "03-2026": { manMonth: 1, revenue: 8000000 },
        "04-2026": { manMonth: 1, revenue: 8000000 },
        "05-2026": { manMonth: 1, revenue: 8000000 },
        "06-2026": { manMonth: 1, revenue: 8000000 },
      }
    }
  ]
}

// Mock Other Revenue
export const mockOtherRevenue = {
  startDate: 1770915600000,
  endDate: 1784134800000,
  otherRevenueInfos: [
    {
      id: 1,
      groupId: null,
      revenueSource: "Training Revenue",
      currency: "VND",
      exchangeRate: 1,
      totalRevenue: 50000000,
      revenue: {
        "01-2026": 10000000,
        "02-2026": 10000000,
        "03-2026": 10000000,
        "04-2026": 10000000,
        "05-2026": 10000000,
      }
    },
    {
      id: 2,
      groupId: null,
      revenueSource: "Consulting Revenue",
      currency: "VND",
      exchangeRate: 1,
      totalRevenue: 30000000,
      revenue: {
        "01-2026": 5000000,
        "02-2026": 5000000,
        "03-2026": 5000000,
        "04-2026": 5000000,
        "05-2026": 5000000,
        "06-2026": 5000000,
      }
    }
  ]
}

// Mock Selling Plan (Expenses)
export const mockSellingPlan = {
  startDate: 1770915600000,
  endDate: 1784134800000,
  sellingExpenseInfos: [
    {
      id: 1,
      groupId: null,
      expenseCategory: "Marketing Campaign",
      totalExpense: 20000000,
      expense: {
        "01-2026": 5000000,
        "02-2026": 5000000,
        "03-2026": 5000000,
        "04-2026": 5000000,
      }
    },
    {
      id: 2,
      groupId: null,
      expenseCategory: "Travel Expense",
      totalExpense: 15000000,
      expense: {
        "01-2026": 2500000,
        "02-2026": 2500000,
        "03-2026": 2500000,
        "04-2026": 2500000,
        "05-2026": 2500000,
        "06-2026": 2500000,
      }
    }
  ]
}

// Mock Revenue Summary
export const mockRevenueSummary = {
  businessPlanVersionId: 436,
  totalProductionRevenue: 108000000,
  totalOtherRevenue: 80000000,
  totalRevenue: 188000000,
  totalSellingExpense: 35000000,
  netRevenue: 153000000,
  profitMargin: 81.38,
}

// Mock MM Bills
export const mockMMBills = {
  businessPlanVersionId: 436,
  totalMMBill: 21.6,
  departmentBreakdown: [
    { department: "BU3", mmBill: 12 },
    { department: "BU2", mmBill: 6 },
    { department: "BU1", mmBill: 3.6 },
  ]
}

// Mock Delivery Plan Summary
export const mockDeliveryPlanSummary = {
  businessPlanVersionId: 436,
  totalProjects: 5,
  activeProjects: 3,
  completedProjects: 2,
  projects: [
    {
      id: 1,
      projectCode: "PRJ001",
      projectName: "E-commerce Platform",
      status: "Active",
      progress: 65,
      startDate: 1770915600000,
      endDate: 1780915600000,
    },
    {
      id: 2,
      projectCode: "PRJ002",
      projectName: "Mobile App Development",
      status: "Active",
      progress: 40,
      startDate: 1770915600000,
      endDate: 1785915600000,
    },
    {
      id: 3,
      projectCode: "PRJ003",
      projectName: "CRM System",
      status: "Completed",
      progress: 100,
      startDate: 1760915600000,
      endDate: 1770915600000,
    }
  ]
}

// Mock Departments
export const mockDepartments = [
  { id: 1, code: "BU1", name: "Business Unit 1" },
  { id: 2, code: "BU2", name: "Business Unit 2" },
  { id: 3, code: "BU3", name: "Business Unit 3" },
  { id: 4, code: "DU1", name: "Development Unit 1" },
  { id: 5, code: "DU2", name: "Development Unit 2" },
  { id: 6, code: "DU3", name: "Development Unit 3" },
]

// Mock Positions
export const mockPositions = [
  { id: 1, code: "SE01", name: "Junior Engineer", unitPrice: 3000000 },
  { id: 2, code: "SE02", name: "Senior Engineer", unitPrice: 5000000 },
  { id: 3, code: "SE03", name: "Tech Lead", unitPrice: 8000000 },
  { id: 4, code: "SE04", name: "Architect", unitPrice: 12000000 },
  { id: 5, code: "QA01", name: "QA Engineer", unitPrice: 3500000 },
  { id: 6, code: "BA01", name: "Business Analyst", unitPrice: 4000000 },
]

// Mock Currencies
export const mockCurrencies = [
  { id: 1, code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { id: 2, code: "USD", name: "US Dollar", symbol: "$" },
  { id: 3, code: "JPY", name: "Japanese Yen", symbol: "¥" },
]

// Mock Industries
export const mockIndustries = [
  { id: 1, code: "FIN", name: "Finance & Banking" },
  { id: 2, code: "EDU", name: "Education" },
  { id: 3, code: "HEA", name: "Healthcare" },
  { id: 4, code: "RET", name: "Retail & E-commerce" },
  { id: 5, code: "MAN", name: "Manufacturing" },
]

// Mock Approval Steps
export const mockApprovalSteps = [
  { id: 1, stepName: "Initial Review", order: 1, required: true },
  { id: 2, stepName: "Technical Review", order: 2, required: true },
  { id: 3, stepName: "Financial Review", order: 3, required: true },
  { id: 4, stepName: "Final Approval", order: 4, required: true },
]
