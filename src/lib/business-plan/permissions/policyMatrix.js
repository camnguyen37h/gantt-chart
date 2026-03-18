import { BP_ROLES } from './roles'

export const SCOPE = {
  ALL: '*',
  TOTAL: 'total',
  OB: 'OB',
  ONSITE: 'Onsite',
  OFFSHORE: 'Offshore',
  GENERAL: 'generalInformation',
  REVENUE: 'revenuePlan',
  DELIVERY: 'deliveryPlan',
}

export const COL_CAT = {
  ALL: '*',
  TOTAL: 'total',
  INTERNAL: 'internal',
  ONSITE: 'onsite',
  OFFSHORE: 'offshore',
}

export const PERMISSION_MATRIX = {
  [BP_ROLES.DB_ADMIN]: {
    [SCOPE.ALL]: { columns: COL_CAT.ALL },
  },
  [BP_ROLES.DB_BOM]: {
    [SCOPE.ALL]: { columns: COL_CAT.ALL },
  },
  [BP_ROLES.DB_FCL]: {
    [SCOPE.ALL]: { columns: COL_CAT.ALL },
  },
  [BP_ROLES.DB_FC]: {
    [SCOPE.ALL]: { columns: COL_CAT.ALL },
  },

  // ONSITE
  [BP_ROLES.SALE_ONSITE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
  },

  [BP_ROLES.BUL_ONSITE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
  },

  [BP_ROLES.DUL_ONSITE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
  },

  [BP_ROLES.G_LEAD_OB_SALE]: {
    [SCOPE.TOTAL]: {
      columns: [COL_CAT.TOTAL],
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

  // [BP_ROLES.MARGIN_OFFSHORE]: {
  //   [SCOPE.TOTAL]: {
  //     columns: [COL_CAT.TOTAL, COL_CAT.OFFSHORE],
  //     sections: ['MARGIN'],
  //   },
  // },
}
