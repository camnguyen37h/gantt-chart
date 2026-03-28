export const statusBusinessPlanDetail = {
  draft: 'Draft',
  approved: 'Approved',
}

export const permissionType = {
  DB_ADMIN: 'DB-ADMIN',
  DB_BOM: 'DB-BOM',
  DB_FC: 'DB-FC',
  DB_BUL: 'DB-BUL',
  DB_DUL: 'DB-DUL',
  DB_GLEAD: 'DB-GLEAD',
  DB_SALE: 'DB-Sale',
  DB_BUL_ONSITE: 'DB-BUL-Onsite',
  DB_DUL_ONSITE: 'DB-DUL-Onsite',
  DB_GLEAD_ONSITE: 'DB-GLEAD-Onsite',
  DB_SALE_ONSITE: 'DB-Sale-Onsite',
  DB_BUL_OFFSHORE: 'DB-BUL-Offshore',
  DB_DUL_OFFSHORE: 'DB-DUL-Offshore',
  DB_GLEAD_OFFSHORE: 'DB-GLEAD-Offshore',
  DB_SALE_OFFSHORE: 'DB-Sale-Offshore',
  DB_GLEAD_OB_SALE: 'DB-GLEAD-OB-SALE',
  DB_SPECIAL_VIEW_DU_ONSITE: 'DB_SPECIAL_VIEW_DU_ONSITE',
  DB_SPECIAL_VIEW_DU_OFFSHORE: 'DB_SPECIAL_VIEW_DU_OFFSHORE',
  DB_SPECIAL_VIEW_MARGIN_OFFSHORE: 'DB_SPECIAL_VIEW_MARGIN_OFFSHORE',
}

export const APPROVAL_STATUS_STEP = {
  FC_PENDING: 5,
  BOM_PENDING: 6,
}

export const dummyPlan = {
  id: 'loading',
  generalInformation: {
    customerName: '',
    projectName: '',
    projectCode: '',
    industry: null,
    orderType: '',
    customerMarket: '',
    originalRevenue: '',
    revenues: '',
    version: '',
    am: '',
    status: '',
    curencyCode: null,
    mvvLocationType: '',
  },
  summaryInfo: {
    unitPrice: { value: null, permissionView: null },
    revenues: { value: null, permissionView: null },
    costOfSales: { value: null, permissionView: null },
    sellingExpenses: { value: null, permissionView: null },
    deliveryExpenses: { value: null, permissionView: null },
    taxExpenses: { value: null, permissionView: null },
    directMargin: { value: null, permissionView: null },
    directMarginBeforeIncentivesAndProjectBonus: {
      value: null,
      permissionView: null,
    },
    allocationOfPoolAndUnbillable: { value: null, permissionView: null },
    indirectMargin: { value: null, permissionView: null },
    directMarginRate: { value: null, permissionView: null },
    directMarginBeforeIncentivesAndProjectBonusRate: {
      value: null,
      permissionView: null,
    },
    indirectMarginRate: { value: null, permissionView: null },
  },
  allProjectCode: [],
}
