/**
 * ========================================
 * MOCK BUSINESS PLAN DATA - COMPREHENSIVE
 * ========================================
 * This file contains all mock data loaded from Mock API folder
 * Last updated: 2024
 */

// ==================== BUSINESS PLAN DETAIL ====================
export const mockBusinessPlanDetail = {
  httpStatus: 200,
  data: {
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
      planningStartDate: null,
      planningEndDate: null,
      businessPlanKpiDTO: {
        id: 68,
        businessPlanVersionId: 436,
        kpiPm: 30,
        kpiQa: 3,
        kpiMember: 67
      }
    },
    columnLabels: [
      {
        id: null,
        label: "Total",
        index: 1,
        columnKey: "TOTAL"
      },
      {
        id: 40,
        label: "BU3",
        index: 2,
        columnKey: "SALE"
      },
      {
        id: null,
        label: "Internal",
        index: 3,
        columnKey: "INTERNAL"
      },
      {
        id: 66,
        label: "BJ3",
        index: 4,
        columnKey: "DELIVERY_UNIT_66"
      }
    ],
    sectionList: [
      {
        index: 1,
        sectionTitle: "Unit price & MM Bill",
        sectionKey: "MAN_MONTH",
        rowLabels: [
          {
            label: "Unit price",
            rowKey: "UNIT_PRICE",
            cellList: [
              {
                value: 5000000,
                columnKey: "TOTAL",
                rowKey: "UNIT_PRICE",
                normUnitPriceConfig: 77100163,
                normUnitPriceFloor: 52343300.6607,
                normUnitPriceCeiling: 101857025.3393,
                normBusinessPlanConfig: null,
                editable: false
              },
              {
                value: 5000000,
                columnKey: "SALE",
                rowKey: "UNIT_PRICE",
                normUnitPriceConfig: 77100163,
                normUnitPriceFloor: 52343300.6607,
                normUnitPriceCeiling: 101857025.3393,
                normBusinessPlanConfig: null,
                editable: false
              },
              {
                value: null,
                columnKey: "INTERNAL",
                rowKey: "UNIT_PRICE",
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false
              },
              {
                value: 5000000,
                columnKey: "DELIVERY_UNIT_66",
                rowKey: "UNIT_PRICE",
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false
              }
            ]
          },
          {
            label: "MM effort (MM)",
            rowKey: "MM_PRODUCTION",
            cellList: [
              { value: 6, columnKey: "TOTAL", rowKey: "MM_PRODUCTION", editable: false },
              { value: 1, columnKey: "SALE", rowKey: "MM_PRODUCTION", editable: false },
              { value: null, columnKey: "INTERNAL", rowKey: "MM_PRODUCTION", editable: false },
              { value: 6, columnKey: "DELIVERY_UNIT_66", rowKey: "MM_PRODUCTION", editable: false }
            ]
          },
          {
            label: "MM bill (MM)",
            rowKey: "MM_BILL",
            cellList: [
              { value: 1, columnKey: "TOTAL", rowKey: "MM_BILL", editable: false },
              { value: 1, columnKey: "SALE", rowKey: "MM_BILL", editable: false },
              { value: null, columnKey: "INTERNAL", rowKey: "MM_BILL", editable: false },
              { value: 1, columnKey: "DELIVERY_UNIT_66", rowKey: "MM_BILL", editable: false }
            ]
          }
        ]
      },
      {
        index: 2,
        sectionTitle: "Revenues",
        sectionKey: "REVENUES",
        rowLabels: [
          {
            label: "Revenues",
            rowKey: "REVENUES_TOTAL",
            cellList: [
              { value: 5000000, columnKey: "TOTAL", rowKey: "REVENUES_TOTAL", editable: false },
              { value: 5000000, columnKey: "SALE", rowKey: "REVENUES_TOTAL", editable: false },
              { value: -5000000, columnKey: "INTERNAL", rowKey: "REVENUES_TOTAL", editable: false },
              { value: 5000000, columnKey: "DELIVERY_UNIT_66", rowKey: "REVENUES_TOTAL", editable: false }
            ]
          }
        ]
      }
    ]
  },
  messageId: "Success",
  errorMessage: ""
};

// ==================== PRODUCTION REVENUE ====================
export const mockProductionRevenue = {
  httpStatus: 200,
  data: {
    startDate: 1770915600000,
    endDate: 1784134800000,
    revenueInfos: [
      {
        saleWorkOrderId: "271626",
        groupId: null,
        pipelineKey: "WO-7821",
        position: "",
        unitPrice: 5000000,
        rateCard: null,
        department: "BU3",
        exchangeRate: 1,
        pipeLineRatio: 100,
        totalManMonth: 1,
        totalRevenue: 5000000,
        revenue: {
          "03-2026": {
            manMonth: 1,
            revenue: 5000000
          }
        }
      }
    ]
  },
  messageId: "Success",
  errorMessage: ""
};

// ==================== OTHER REVENUE ====================
export const mockOtherRevenue = {
  httpStatus: 200,
  data: {
    startDate: 1770915600000,
    endDate: 1784134800000,
    revenues: []
  },
  messageId: "Success",
  errorMessage: ""
};

// ==================== SELLING PLAN ====================
export const mockSellingPlan = {
  httpStatus: 200,
  data: {
    startDate: 1770915600000,
    endDate: 1784134800000,
    revenues: []
  },
  messageId: "Success",
  errorMessage: ""
};

// ==================== REVENUE SUMMARY ====================
export const mockRevenueSummary = {
  httpStatus: 200,
  data: {
    mmBill: 1,
    softwareProductionRevenues: 12000000,
    deduction: -7000000,
    onsiteFee: null,
    equipmentRevenue: null,
    otherRevenues: null,
    agencyExpenses: null
  },
  messageId: "Success",
  errorMessage: ""
};

// ==================== MM BILLS SERVICE ====================
export const mockMMBillsService = {
  httpStatus: 200,
  data: {
    crmMasterDataMappings: [
      {
        id: 236,
        name: "1.Traditional Services",
        isCategory: true,
        parentId: 8,
        status: 1,
        data: [
          { id: 237, name: "1.1 Application Development (Web/App/Mobile)", isCategory: false, parentId: 236, status: 1, data: null, masterdata: "", masterdataName: "Sub-service" },
          { id: 241, name: "1.3 Testing", isCategory: false, parentId: 236, status: 1, data: null, masterdata: "", masterdataName: "Sub-service" }
        ],
        masterdata: "",
        masterdataName: "Service"
      },
      {
        id: 238,
        name: "2.Digital Transformation Services",
        isCategory: true,
        parentId: 8,
        status: 1,
        data: [
          { id: 247, name: "2.1 Cloud Professional Services", isCategory: false, parentId: 238, status: 1, data: null, masterdata: "", masterdataName: "Sub-service" },
          { id: 248, name: "2.2 AI Implementation", isCategory: false, parentId: 238, status: 1, data: null, masterdata: "", masterdataName: "Sub-service" }
        ],
        masterdata: "",
        masterdataName: "Service"
      }
    ]
  },
  messageId: "Success",
  errorMessage: ""
};

// ==================== DELIVERY PLAN SUMMARY ====================
export const mockDeliveryPlanSummary = {
  httpStatus: 200,
  data: {
    mmEffort: 6,
    directLaborCost: 87600000,
    outsourcingCost: null,
    equipmentExpense: null,
    onsiteExpense: null,
    overtime: null,
    other: null,
    nonDeductibleInputVAT: null
  },
  messageId: "Success",
  errorMessage: ""
};

// ==================== DELIVERY PLAN MEMBERS ====================
export const mockDeliveryPlanMembers = {
  httpStatus: 200,
  data: {
    total: 1,
    body: {
      listLabelMonth: ["Feb-26", "Mar-26", "Apr-26", "May-26", "Jun-26", "Jul-26"],
      listBudgetMMForEachMonth: {
        "Feb-26": 1,
        "Mar-26": 1,
        "Apr-26": 1,
        "May-26": 1,
        "Jun-26": 1,
        "Jul-26": 1
      },
      deliveryPlanByHeadCountList: [
        {
          deliveryMemberId: 1000110,
          userId: 3860,
          resourceType: "User",
          resourceFullName: "Lam. Tran Tung  - CMCGlobal DJ2",
          location: "Vietnam",
          ldap: "ttlam1",
          employeeType: "In-house",
          originalGrossSalary: 5000000,
          grossSalary: 5000000,
          position: "SE02",
          role: "Member",
          rowTotal: 6,
          budgetMMValue: null,
          budgetMMValueDTO: {
            "Feb-26": { id: 1000283, deliveryMemberId: 1000110, month: 2, year: 2026, value: 1 },
            "Mar-26": { id: 1000284, deliveryMemberId: 1000110, month: 3, year: 2026, value: 1 },
            "Apr-26": { id: 1000285, deliveryMemberId: 1000110, month: 4, year: 2026, value: 1 },
            "May-26": { id: 1000286, deliveryMemberId: 1000110, month: 5, year: 2026, value: 1 },
            "Jun-26": { id: 1000287, deliveryMemberId: 1000110, month: 6, year: 2026, value: 1 },
            "Jul-26": { id: 1000288, deliveryMemberId: 1000110, month: 7, year: 2026, value: 1 }
          },
          groupId: 2,
          groupName: "DJ2"
        }
      ],
      totalRecord: 1
    },
    page: 1,
    size: 20
  },
  messageId: "Success",
  errorMessage: ""
};

// ==================== OTHER EXPENSES TABLE ====================
export const mockOtherExpensesTable = {
  httpStatus: 200,
  data: {
    total: 5,
    body: {
      labelMonth: ["Feb-26", "Mar-26", "Apr-26", "May-26", "Jun-26", "Jul-26"],
      dataList: [
        { otherExpenseId: null, expenseCategoriesEnum: "Onsite", categoriesDataList: null, totalExpenseValue: null },
        { otherExpenseId: null, expenseCategoriesEnum: "Equipment", categoriesDataList: null, totalExpenseValue: null },
        { otherExpenseId: null, expenseCategoriesEnum: "Overtime", categoriesDataList: null, totalExpenseValue: null },
        { otherExpenseId: null, expenseCategoriesEnum: "Non-deductible input VAT", categoriesDataList: null, totalExpenseValue: null },
        { otherExpenseId: null, expenseCategoriesEnum: "Others", categoriesDataList: null, totalExpenseValue: null }
      ],
      totalRecords: 5
    },
    page: 1,
    size: 10
  },
  messageId: "Success",
  errorMessage: ""
};

// ==================== FILTERS & LOOKUPS ====================
export const mockDepartmentsByVersion = {
  httpStatus: 200,
  data: [
    { groupName: "BU3", groupId: 220, groupSale: true },
    { groupName: "BJ3", groupId: 66, groupSale: false }
  ],
  messageId: "Success",
  errorMessage: ""
};

export const mockPositions = {
  httpStatus: 200,
  data: [
    { id: 803, idStr: null, name: "SE02", value: "SE02" },
    { id: 804, idStr: null, name: "SE01", value: "SE01" },
    { id: 805, idStr: null, name: "TEST03", value: "TEST03" },
    { id: 806, idStr: null, name: "PM01", value: "PM01" },
    { id: 807, idStr: null, name: "SA01", value: "SA01" },
    { id: 808, idStr: null, name: "SE04", value: "SE04" },
    { id: 809, idStr: null, name: "TEST02", value: "TEST02" },
    { id: 810, idStr: null, name: "COMTOR02", value: "COMTOR02" },
    { id: 811, idStr: null, name: "SYE02", value: "SYE02" },
    { id: 812, idStr: null, name: "SYE01", value: "SYE01" }
  ],
  messageId: "Success",
  errorMessage: ""
};

export const mockCurrencies = {
  httpStatus: 200,
  data: [
    { id: 776, currency: "USD" },
    { id: 777, currency: "JPY" },
    { id: 778, currency: "VND" },
    { id: 779, currency: "EUR" },
    { id: 780, currency: "SGD" },
    { id: 781, currency: "AUD" },
    { id: 782, currency: "KRW" },
    { id: 789, currency: "MYR" }
  ],
  messageId: "Success",
  errorMessage: ""
};

export const mockIndustries = {
  httpStatus: 200,
  data: [
    { id: 18, industry: "1.BFSI (Banking, Finance, Security, Insurance)" },
    { id: 30, industry: "2.Communication Media" },
    { id: 39, industry: "3.Public & Government" },
    { id: 47, industry: "4.Manufacturing and Natural Resources" },
    { id: 53, industry: "5.Retail" },
    { id: 59, industry: "6.Logistic" },
    { id: 65, industry: "7.Advetisement" },
    { id: 71, industry: "8.Information Technology" },
    { id: 303, industry: "9.Telecom Communication" },
    { id: 305, industry: "10.Healthcare & Medication" },
    { id: 307, industry: "11.Education" },
    { id: 309, industry: "12.Automotive" }
  ],
  messageId: "Success",
  errorMessage: ""
};

export const mockMaxKPISetting = {
  httpStatus: 200,
  data: [
    { settingId: 418, startDate: 1759338000000, endDate: 1759338000000, type: 15, value: "30", settingConfigKey: "MAX_BUSINESS_PLAN_KPI_PM", groupId: 0, on: true },
    { settingId: 419, startDate: 1759338000000, endDate: 1759338000000, type: 15, value: "3", settingConfigKey: "MAX_BUSINESS_PLAN_KPI_QA", groupId: 0, on: true },
    { settingId: 420, startDate: 1759338000000, endDate: 1759338000000, type: 15, value: "100", settingConfigKey: "MAX_BUSINESS_PLAN_KPI_TOTAL", groupId: 0, on: true }
  ],
  messageId: "Success",
  errorMessage: ""
};

export const mockApprovalSteps = {
  httpStatus: 200,
  data: {
    data: {
      "9130": {
        stepName: "Draft",
        stateName: "Draft",
        stateOrder: 10,
        stateHidden: false,
        order: 1,
        map: { None: [] }
      },
      "9131": {
        stepName: "BU/DU Lead Pending Approval",
        stateName: "Verification",
        stateOrder: 100,
        stateHidden: false,
        order: 1,
        map: {
          CJP: [
            { id: 5832, taskKey: "BP-5832", approvalStepId: 9131, ldap: "nxcanh", departmentName: "BJ3", processStatus: "APPROVED" }
          ],
          G3: [
            { id: 5831, taskKey: "BP-5831", approvalStepId: 9131, ldap: "vttung3", departmentName: "BU3", processStatus: "APPROVED" }
          ]
        }
      },
      "9132": {
        stepName: "Approved",
        stateName: "Approved",
        stateOrder: 10000,
        stateHidden: false,
        order: 1,
        map: { None: [] }
      }
    },
    workOrder: {
      CJP: [{ duName: "BJ3" }],
      G3: [{ duName: "BU3" }]
    }
  },
  messageId: "Success",
  errorMessage: ""
};

export const mockUserActionHistory = {
  httpStatus: 200,
  data: {
    total: 2,
    body: {
      userActionHistoryDtoList: [
        {
          id: 116603,
          actionTime: "10/Feb/26 14:33 PM",
          author: "ttlam1",
          historyType: "DELIVERY_PLAN",
          oldValueString: '{"id":1000110,"items":{}}',
          newValueString: '{"id":1000110,"items":{"04-2026":1.0,"05-2026":1.0,"06-2026":1.0,"07-2026":1.0}}',
          entity: "Resource Info - ttlam1"
        }
      ],
      total: 2,
      pageNum: 1,
      pageSize: 10
    },
    page: 1,
    size: 10
  },
  messageId: "Success",
  errorMessage: ""
};

export const mockDocuments = {
  httpStatus: 200,
  data: {
    documentDtoList: [],
    total: 0
  },
  messageId: "Success",
  errorMessage: ""
};

// ==================== ADDITIONAL LOOKUPS ====================
export const mockStatusList = {
  httpStatus: 200,
  data: [
    { id: 1, name: "Draft", value: "DRAFT" },
    { id: 2, name: "Pending Approval", value: "PENDING_APPROVAL" },
    { id: 3, name: "Approved", value: "APPROVED" },
    { id: 4, name: "Rejected", value: "REJECTED" }
  ],
  messageId: "Success",
  errorMessage: ""
};

export const mockResourceTypes = {
  httpStatus: 200,
  data: [
    { id: 1, name: "User", value: "User" },
    { id: 2, name: "TBH", value: "TBH" }
  ],
  messageId: "Success",
  errorMessage: ""
};

export const mockLocations = {
  httpStatus: 200,
  data: [
    { id: 1, name: "Vietnam", value: "Vietnam" },
    { id: 2, name: "Japan", value: "Japan" },
    { id: 3, name: "Singapore", value: "Singapore" }
  ],
  messageId: "Success",
  errorMessage: ""
};

export const mockEmployeeTypes = {
  httpStatus: 200,
  data: [
    { id: 1, name: "In-house", value: "In-house" },
    { id: 2, name: "Outsourcing", value: "Outsourcing" },
    { id: 3, name: "Freelancer", value: "Freelancer" }
  ],
  messageId: "Success",
  errorMessage: ""
};

export const mockRoles = {
  httpStatus: 200,
  data: [
    { id: 1, name: "PM", value: "PM" },
    { id: 2, name: "Team Lead", value: "Team Lead" },
    { id: 3, name: "Member", value: "Member" },
    { id: 4, name: "BA", value: "BA" },
    { id: 5, name: "QA", value: "QA" },
    { id: 6, name: "Comtor", value: "Comtor" }
  ],
  messageId: "Success",
  errorMessage: ""
};

export const mockBusinessPlanList = {
  httpStatus: 200,
  data: {
    total: 1,
    body: [
      {
        id: 436,
        projectCode: "GLBTM2500093",
        businessPlanName: "Myfirstmillion Onsite",
        customerName: "MyFirstMillion",
        version: 1,
        status: "APPROVED",
        statusName: "Approved",
        currentApprovalStep: "Approved",
        createdDate: 1770915600000,
        lastModifiedDate: 1770925600000
      }
    ],
    page: 1,
    size: 20
  },
  messageId: "Success",
  errorMessage: ""
};

export const mockResourceList = {
  httpStatus: 200,
  data: [
    { userId: 3860, ldap: "ttlam1", fullName: "Lam. Tran Tung", department: "DJ2" },
    { userId: 3744, ldap: "ntmanh6", fullName: "Manh. Nguyen Trong", department: "BU3" },
    { userId: 136, ldap: "lcnguyen", fullName: "Nguyen. Le Chi", department: "DU1.3" }
  ],
  messageId: "Success",
  errorMessage: ""
};

export const mockUserAndDepartment = {
  httpStatus: 200,
  data: {
    users: [
      { userId: 3860, ldap: "ttlam1", fullName: "Lam. Tran Tung", departmentId: 2, departmentName: "DJ2" },
      { userId: 3744, ldap: "ntmanh6", fullName: "Manh. Nguyen Trong", departmentId: 40, departmentName: "BU3" }
    ],
    departments: [
      { id: 2, name: "DJ2", type: "DU" },
      { id: 40, name: "BU3", type: "BU" },
      { id: 66, name: "BJ3", type: "DU" }
    ]
  },
  messageId: "Success",
  errorMessage: ""
};

// ==================== IN-MEMORY STORAGE ====================
let businessPlanStore = {
  436: JSON.parse(JSON.stringify(mockBusinessPlanDetail.data))
};

// Future use for delivery and revenue plan storage
// eslint-disable-next-line no-unused-vars
let deliveryPlanStore = {};
// eslint-disable-next-line no-unused-vars
let revenuePlanStore = {};

// ==================== HELPER FUNCTIONS ====================
export const getBusinessPlanById = (id) => {
  return businessPlanStore[id] || null;
};

export const updateBusinessPlan = (id, data) => {
  businessPlanStore[id] = { ...businessPlanStore[id], ...data };
  return businessPlanStore[id];
};

export const createBusinessPlanVersion = (baseId) => {
  const base = businessPlanStore[baseId];
  const newId = Math.max(...Object.keys(businessPlanStore).map(Number)) + 1;
  const newVersion = JSON.parse(JSON.stringify(base));
  newVersion.id = newId;
  newVersion.version = base.version + 1;
  newVersion.status = "Draft";
  businessPlanStore[newId] = newVersion;
  return newVersion;
};

export const resetMockData = () => {
  businessPlanStore = {
    436: JSON.parse(JSON.stringify(mockBusinessPlanDetail.data))
  };
  deliveryPlanStore = {};
  revenuePlanStore = {};
};
