import { BP_ROLES } from './roles'

export const SCOPE = {
  ALL: '*',
  TOTAL: 'total',
  OB: 'ob',
  ONSITE: 'onsite',
  OFFSHORE: 'offshore',
  GENERAL: 'generalInformation',
  GENERAL_ONSITE: 'general_onsite',
  GENERAL_OFFSHORE: 'general_offshore',
  REVENUE_ONSITE: 'revenue_onsite',
  REVENUE_OFFSHORE: 'revenue_offshore',
  DELIVERY_ONSITE: 'delivery_onsite',
  DELIVERY_OFFSHORE: 'delivery_offshore',
  DELIVERY: 'deliveryPlan',
  SUBMIT: 'submit',
}

export const COL_CAT = {
  ALL: '*',
  TOTAL: 'total',
  INTERNAL: 'internal',
  ONSITE: 'onsite',
  OFFSHORE: 'offshore',
  BU_ONSITE: 'bu_onsite',
  BU_OFFSHORE: 'bu_offshore',
  DU_ONSITE: 'du_onsite',
  DU_OFFSHORE: 'du_offshore',
}

export const PERMISSION_MATRIX = {
  [BP_ROLES.DB_ADMIN]: {
    [SCOPE.TOTAL]: { columns: COL_CAT.ALL },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.OFFSHORE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.REVENUE_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.REVENUE_OFFSHORE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.DELIVERY_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.DELIVERY_OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.GENERAL_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.GENERAL_OFFSHORE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.SUBMIT]: {},
  },

  [BP_ROLES.DB_BOM]: {
    [SCOPE.TOTAL]: { columns: COL_CAT.ALL },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.REVENUE_ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.REVENUE_OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.DELIVERY_ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.DELIVERY_OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.GENERAL_ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.GENERAL_OFFSHORE]: { columns: COL_CAT.ALL },
  },

  [BP_ROLES.DB_FCL]: {
    [SCOPE.TOTAL]: { columns: COL_CAT.ALL },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.OFFSHORE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.REVENUE_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.REVENUE_OFFSHORE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.DELIVERY_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.DELIVERY_OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.GENERAL_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.GENERAL_OFFSHORE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.SUBMIT]: {},
  },

  [BP_ROLES.DB_FC]: {
    [SCOPE.TOTAL]: { columns: COL_CAT.ALL },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.OFFSHORE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.REVENUE_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.REVENUE_OFFSHORE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.DELIVERY_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.DELIVERY_OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.GENERAL_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.GENERAL_OFFSHORE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.SUBMIT]: {},
  },

  [BP_ROLES.SALE_ONSITE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: {
      columns: COL_CAT.ALL,
      edit: true,
    },
    [SCOPE.OFFSHORE]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
      sections: ['REVENUES', 'DELIVERY_EXPENSES'],
    },
    [SCOPE.REVENUE_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.REVENUE_OFFSHORE]: { columns: COL_CAT.ALL, summaryOnly: true, edit: true },
    [SCOPE.DELIVERY_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.GENERAL_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.SUBMIT]: {},
  },

  [BP_ROLES.SALE_OFFSHORE]: {
    [SCOPE.OB]: {
      sectionColumns: [COL_CAT.DU_ONSITE],
      dataColumns: [COL_CAT.DU_ONSITE],
      sections: ['REVENUES'],
    },
    [SCOPE.OFFSHORE]: {
      columns: COL_CAT.ALL,
      edit: true,
    },
    [SCOPE.REVENUE_OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.DELIVERY_OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.GENERAL_OFFSHORE]: { columns: COL_CAT.ALL, edit: true },
  },

  [BP_ROLES.BUL_ONSITE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: {
      columns: COL_CAT.ALL,
    },
    [SCOPE.REVENUE_ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.DELIVERY_ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.GENERAL_ONSITE]: { columns: COL_CAT.ALL },
  },

  [BP_ROLES.BUL_OFFSHORE]: {
    [SCOPE.OFFSHORE]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
      sections: ['REVENUES', 'DELIVERY_EXPENSES'],
    },
    [SCOPE.REVENUE_OFFSHORE]: { columns: COL_CAT.ALL, summaryOnly: true },
    [SCOPE.GENERAL_OFFSHORE]: { columns: COL_CAT.ALL },
  },

  [BP_ROLES.DUL_ONSITE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: {
      columns: COL_CAT.ALL,
      edit: true,
    },
    [SCOPE.REVENUE_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.DELIVERY_ONSITE]: { columns: COL_CAT.ALL, edit: true },
    [SCOPE.GENERAL_ONSITE]: { columns: COL_CAT.ALL, edit: true },
  },

  [BP_ROLES.DUL_OFFSHORE]: {
    [SCOPE.OFFSHORE]: {
      columns: COL_CAT.ALL,
      edit: true,
    },
    [SCOPE.GENERAL_OFFSHORE]: { columns: COL_CAT.ALL, edit: true },
  },

  [BP_ROLES.G_LEAD_OB_SALE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: {
      columns: COL_CAT.ALL,
    },
    [SCOPE.OFFSHORE]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
      sections: ['REVENUES', 'DELIVERY_EXPENSES'],
    },
    [SCOPE.REVENUE_ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.REVENUE_OFFSHORE]: { columns: COL_CAT.ALL, summaryOnly: true },
    [SCOPE.DELIVERY_ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.GENERAL_ONSITE]: { columns: COL_CAT.ALL },
  },

  [BP_ROLES.G_LEAD_ONSITE]: {
    [SCOPE.TOTAL]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
    },
    [SCOPE.OB]: { columns: COL_CAT.ALL },
    [SCOPE.ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.OFFSHORE]: {
      sectionColumns: [COL_CAT.TOTAL],
      dataColumns: [],
      sections: ['REVENUES', 'DELIVERY_EXPENSES'],
    },
    [SCOPE.REVENUE_ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.REVENUE_OFFSHORE]: { columns: COL_CAT.ALL, summaryOnly: true },
    [SCOPE.DELIVERY_ONSITE]: { columns: COL_CAT.ALL },
    [SCOPE.GENERAL_ONSITE]: { columns: COL_CAT.ALL },
  },

  [BP_ROLES.G_LEAD_OFFSHORE]: {
    [SCOPE.OFFSHORE]: {
      columns: COL_CAT.ALL,
    },
    [SCOPE.REVENUE_OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.DELIVERY_OFFSHORE]: { columns: COL_CAT.ALL },
    [SCOPE.GENERAL_OFFSHORE]: { columns: COL_CAT.ALL },
  },

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
