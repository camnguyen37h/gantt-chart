import { BP_ROLES } from './roles'

export const SCOPE = {
  ALL: '*',
  TOTAL: 'total',
  OB: 'ob',
  ONSITE: 'onsite',
  OFFSHORE: 'offshore',
  GENERAL: 'generalInformation',
  REVENUE: 'revenuePlan',
  DELIVERY: 'deliveryPlan',
}

export const COL_CAT = {
  ALL: '*',
  TOTAL: 'total',
  INTERNAL: 'internal',
  ONSITE: 'onsite', // SALE_* fallback khi không có columnTypeMap
  OFFSHORE: 'offshore', // DELIVERY_UNIT_* fallback khi không có columnTypeMap
  BU_ONSITE: 'bu_onsite', // SALE_XX thuộc Onsite sub-plan — cần columnTypeMap
  BU_OFFSHORE: 'bu_offshore', // SALE_XX thuộc Offshore sub-plan — cần columnTypeMap
  DU_ONSITE: 'du_onsite', // DELIVERY_UNIT_XX thuộc Onsite — cần composite key map
  DU_OFFSHORE: 'du_offshore', // DELIVERY_UNIT_XX thuộc Offshore — cần composite key map
}

export const PERMISSION_MATRIX = {
  [BP_ROLES.DB_ADMIN]: {
    [SCOPE.TOTAL]: { columns: COL_CAT.ALL },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.REVENUE]: { columns: COL_CAT.ALL },
  },

  [BP_ROLES.DB_BOM]: {
    [SCOPE.TOTAL]: { columns: COL_CAT.ALL },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.REVENUE]: { columns: COL_CAT.ALL },
  },

  [BP_ROLES.DB_FCL]: {
    [SCOPE.TOTAL]: { columns: COL_CAT.ALL },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.REVENUE]: { columns: COL_CAT.ALL },
  },

  [BP_ROLES.DB_FC]: {
    [SCOPE.TOTAL]: { columns: COL_CAT.ALL },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.REVENUE]: { columns: COL_CAT.ALL },
  },

  // ONSITE
  [BP_ROLES.SALE_ONSITE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
    [SCOPE.REVENUE]: { columns: COL_CAT.ALL },
  },

  [BP_ROLES.BUL_ONSITE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
  },

  [BP_ROLES.DUL_ONSITE]: {
    [SCOPE.TOTAL]: {
      columns: [COL_CAT.BU_ONSITE, COL_CAT.DU_ONSITE],
    },
  },

  [BP_ROLES.G_LEAD_OB_SALE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
  },

  [BP_ROLES.G_LEAD_ONSITE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
  },

  // OFFSHORE
  [BP_ROLES.DUL_OFFSHORE]: {},

  [BP_ROLES.SPECIAL_VIEW_DU_ONSITE]: {
    [SCOPE.TOTAL]: {
      columns: [COL_CAT.DU_ONSITE],
    },
  },

  [BP_ROLES.SPECIAL_VIEW_DU_OFFSHORE]: {
    [SCOPE.TOTAL]: {
      columns: [COL_CAT.DU_OFFSHORE],
    },
  },

  [BP_ROLES.SPECIAL_VIEW_MARGIN_OFFSHORE]: {
    [SCOPE.TOTAL]: {
      dataColumns: [COL_CAT.BU_OFFSHORE, COL_CAT.DU_OFFSHORE],
      sectionColumns: [COL_CAT.BU_OFFSHORE, COL_CAT.DU_OFFSHORE],
      sections: ['MARGIN'],
    },
  },
}
