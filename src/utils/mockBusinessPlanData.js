/**
 * ========================================
 * MOCK BUSINESS PLAN DATA - COMPREHENSIVE
 * ========================================
 * This file contains all mock data for Business Plan module
 * Last updated: 2024
 */

// ==================== VIEW MODE SPECIFIC DATA ====================
import mockBusinessPlanByViewTotal from './mock-data/businessPlanTotal.json'
import mockBusinessPlanByViewOB from './mock-data/businessPlanOB.json'
import mockBusinessPlanByViewOnsite from './mock-data/businessPlanOnsite.json'
import mockBusinessPlanByViewOffshore from './mock-data/businessPlanOffshore.json'
import mockBusinessPlanByViewOffshoreV2 from './mock-data/businessPlanOffshoreV2.json'
import mockBusinessPlanDetail464Raw from './mock-data/businessPlanDetail464.json'
import mockBusinessPlanDetail468Raw from './mock-data/businessPlanDetail468.json'
import mockBusinessPlanTotal468Raw from './mock-data/businessPlanTotal468.json'
import mockBusinessPlanOB468Raw from './mock-data/businessPlanOB468.json'
import mockBusinessPlanOnsite468Raw from './mock-data/businessPlanOnsite468.json'
import mockBusinessPlanOffshore468Raw from './mock-data/businessPlanOffshore468.json'
import mockProductionRevenue468Raw from './mock-data/productionRevenue468.json'
import mockOtherRevenue468Raw from './mock-data/otherRevenue468.json'
import mockSellingPlan468Raw from './mock-data/sellingPlan468.json'
import mockRevenueSummary468Raw from './mock-data/revenueSummary468.json'
import mockOtherExpensesTable468Raw from './mock-data/otherExpensesTable468.json'
import mockListDeliveryPlanMember468Raw from './mock-data/listDeliveryPlanMember468.json'
import mockUserActionHistory468Raw from './mock-data/userActionHistoryRevenue468.json'
import mockUserActionHistoryDelivery468Raw from './mock-data/userActionHistoryDelivery468.json'
import mockMMBillsService468Raw from './mock-data/mmBillsService468.json'

export const mockBusinessPlanDetail464 = mockBusinessPlanDetail464Raw
export const mockBusinessPlanDetail468 = mockBusinessPlanDetail468Raw

// ==================== REAL API DATA FOR ID 468 ====================
export const mockProductionRevenue468 = mockProductionRevenue468Raw
export const mockOtherRevenue468 = mockOtherRevenue468Raw
export const mockSellingPlan468 = mockSellingPlan468Raw
export const mockRevenueSummary468 = mockRevenueSummary468Raw
export const mockOtherExpensesTable468 = mockOtherExpensesTable468Raw
export const mockListDeliveryPlanMember468 = mockListDeliveryPlanMember468Raw
export const mockUserActionHistory468 = mockUserActionHistory468Raw
export const mockUserActionHistoryDelivery468 =
  mockUserActionHistoryDelivery468Raw

// ==================== BUSINESS PLAN DETAIL ====================
export const mockBusinessPlanDetail = {
  httpStatus: 200,
  data: {
    id: 448,
    projectCode: 'GLBOD2500102',
    status: 'Verification',
    version: 1,
    startDate: 1772298000000,
    endDate: 1801328400000,
    userRoles: ['DB-DUL-Onsite'],
    warningMessage: [],
    versions: [
      {
        versionId: 448,
        versionName: 'Version 1',
        status: 'VERIFICATION',
        statusName: 'Verification',
      },
    ],
    generalInfos: [
      {
        listAM: [
          {
            id: 11233,
            businessPlanVersionId: 448,
            memberType: 'AM',
            userId: 3744,
            ldap: 'ntmanh6',
            departmentId: 40,
            departmentName: 'BU3',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: true,
          },
        ],
        listTeamLead: [
          {
            id: 11247,
            businessPlanVersionId: 448,
            memberType: 'TEAM_LEAD',
            userId: 136,
            ldap: 'lcnguyen',
            departmentId: 3,
            departmentName: 'DU1.3',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: false,
          },
        ],
        listPreSale: [],
        listPreparator: [
          {
            id: 11246,
            businessPlanVersionId: 448,
            memberType: 'PREPARATOR',
            userId: 3,
            ldap: 'bhduc',
            departmentId: 6,
            departmentName: 'DU1.6',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: false,
          },
        ],
        listAdviser: [],
        listPM: [
          {
            id: 11232,
            businessPlanVersionId: 448,
            memberType: 'PM',
            userId: 3860,
            ldap: 'ttlam1',
            departmentId: 2,
            departmentName: 'DJ2',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: true,
          },
        ],
        businessPlanName: 'GLBOD2500102 Onsite',
        customerName: 'MyFirstMillion',
        startDate: 1772298000000,
        endDate: 1801328400000,
        orderType: 'Commercial',
        recurringNew: 'New',
        pm: null,
        currency: 778,
        exchangeRate: 25000,
        totalContractPrice: 1726116,
        industry: 18,
        customerMarket: 'US',
        cooperationPeriod: 'Less than 12 months',
        softwareDevelopmentFee: 1726116,
        otherFees: 0,
        planningStartDate: null,
        planningEndDate: null,
        businessPlanKpiDTO: {
          id: 68,
          businessPlanVersionId: 448,
          kpiPm: 30,
          kpiQa: 3,
          kpiMember: 67,
        },
        projectCode: 'GLBOD2500102',
        mvvLocationType: 'Onsite',
        id: 448,
        status: 'Draft',
      },
    ],
    columnLabels: [
      {
        id: null,
        label: 'Total',
        index: 1,
        columnKey: 'TOTAL',
      },
      {
        id: 40,
        label: 'BU3',
        index: 2,
        columnKey: 'SALE_40',
      },
      {
        id: null,
        label: 'Internal',
        index: 3,
        columnKey: 'INTERNAL',
      },
      {
        id: 66,
        label: 'DU1.3',
        index: 4,
        columnKey: 'DELIVERY_UNIT_66',
        mvvLocationType: 'Onsite',
      },
      {
        id: 39,
        label: 'DU3.2',
        index: 5,
        columnKey: 'DELIVERY_UNIT_39',
        mvvLocationType: 'Offshore',
      },
      {
        id: 1,
        label: 'DU2.1',
        index: 6,
        columnKey: 'DELIVERY_UNIT_1',
        mvvLocationType: 'Onsite',
      },
    ],
    sectionList: [
      {
        index: 1,
        sectionTitle: 'Unit price & MM Bill',
        sectionKey: 'MAN_MONTH',
        rowLabels: [
          {
            label: 'Unit price',
            rowKey: 'UNIT_PRICE',
            cellList: [
              {
                value: 5000000,
                columnKey: 'TOTAL',
                rowKey: 'UNIT_PRICE',
                normUnitPriceConfig: 77100163,
                normUnitPriceFloor: 52343300.6607,
                normUnitPriceCeiling: 101857025.3393,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 5000000,
                columnKey: 'SALE_40',
                rowKey: 'UNIT_PRICE',
                normUnitPriceConfig: 77100163,
                normUnitPriceFloor: 52343300.6607,
                normUnitPriceCeiling: 101857025.3393,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'UNIT_PRICE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 5000000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'UNIT_PRICE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 3800000,
                columnKey: 'DELIVERY_UNIT_39',
                rowKey: 'UNIT_PRICE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 6200000,
                columnKey: 'DELIVERY_UNIT_1',
                rowKey: 'UNIT_PRICE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'MM effort (MM)',
            rowKey: 'MM_PRODUCTION',
            cellList: [
              {
                value: 6,
                columnKey: 'TOTAL',
                rowKey: 'MM_PRODUCTION',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 1,
                columnKey: 'SALE_40',
                rowKey: 'MM_PRODUCTION',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'MM_PRODUCTION',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 6,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'MM_PRODUCTION',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 3,
                columnKey: 'DELIVERY_UNIT_39',
                rowKey: 'MM_PRODUCTION',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 4,
                columnKey: 'DELIVERY_UNIT_1',
                rowKey: 'MM_PRODUCTION',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'MM bill (MM)',
            rowKey: 'MM_BILL',
            cellList: [
              {
                value: 1,
                columnKey: 'TOTAL',
                rowKey: 'MM_BILL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 1,
                columnKey: 'SALE_40',
                rowKey: 'MM_BILL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'MM_BILL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 1,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'MM_BILL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: '241',
            rowKey: 'MM_BILL_1',
            cellList: [
              {
                value: 1,
                columnKey: 'TOTAL',
                rowKey: 'MM_BILL_1',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'SALE_40',
                rowKey: 'MM_BILL_1',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'MM_BILL_1',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 1,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'MM_BILL_1',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
        ],
      },
      {
        index: 2,
        sectionTitle: 'Revenues',
        sectionKey: 'REVENUES',
        rowLabels: [
          {
            label: 'Revenues',
            rowKey: 'REVENUES_TOTAL',
            cellList: [
              {
                value: 5000000,
                columnKey: 'TOTAL',
                rowKey: 'REVENUES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 5000000,
                columnKey: 'SALE_40',
                rowKey: 'REVENUES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -5000000,
                columnKey: 'INTERNAL',
                rowKey: 'REVENUES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 5000000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'REVENUES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Revenues from work delivered (VND)',
            rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
            cellList: [
              {
                value: 12000000,
                columnKey: 'TOTAL',
                rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 12000000,
                columnKey: 'SALE_40',
                rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -5000000,
                columnKey: 'INTERNAL',
                rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 5000000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'SOFTWARE_PRODUCTION_REVENUES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Deduction',
            rowKey: 'DEDUCTION',
            cellList: [
              {
                value: -7000000,
                columnKey: 'TOTAL',
                rowKey: 'DEDUCTION',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -7000000,
                columnKey: 'SALE_40',
                rowKey: 'DEDUCTION',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'DEDUCTION',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'DEDUCTION',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Onsite fee',
            rowKey: 'ONSITE_FEE',
            cellList: [
              {
                value: 0,
                columnKey: 'TOTAL',
                rowKey: 'ONSITE_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'ONSITE_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'ONSITE_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'ONSITE_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Revenues from Equipment, Internet, Server,...',
            rowKey: 'EQUIPMENT_FEE',
            cellList: [
              {
                value: 0,
                columnKey: 'TOTAL',
                rowKey: 'EQUIPMENT_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'EQUIPMENT_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'EQUIPMENT_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'EQUIPMENT_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Other revenues',
            rowKey: 'OTHER_FEE',
            cellList: [
              {
                value: 0,
                columnKey: 'TOTAL',
                rowKey: 'OTHER_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'OTHER_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'OTHER_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'OTHER_FEE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
        ],
      },
      {
        index: 3,
        sectionTitle: 'Cost of sales',
        sectionKey: 'COST_PRICE',
        rowLabels: [
          {
            label: 'Cost of sales',
            rowKey: 'COST_PRICE_TOTAL',
            cellList: [
              {
                value: null,
                columnKey: 'TOTAL',
                rowKey: 'COST_PRICE_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 5000000,
                columnKey: 'SALE_40',
                rowKey: 'COST_PRICE_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -5000000,
                columnKey: 'INTERNAL',
                rowKey: 'COST_PRICE_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'COST_PRICE_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Cost of sales (Ratecard DU)',
            rowKey: 'COST_OF_DU_SOLD',
            cellList: [
              {
                value: null,
                columnKey: 'TOTAL',
                rowKey: 'COST_OF_DU_SOLD',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 5000000,
                columnKey: 'SALE_40',
                rowKey: 'COST_OF_DU_SOLD',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -5000000,
                columnKey: 'INTERNAL',
                rowKey: 'COST_OF_DU_SOLD',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'COST_OF_DU_SOLD',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
        ],
      },
      {
        index: 4,
        sectionTitle: 'Selling expenses',
        sectionKey: 'SELLING_EXPENSES',
        rowLabels: [
          {
            label: 'Selling expenses',
            rowKey: 'SELLING_EXPENSES_TOTAL',
            cellList: [
              {
                value: 240000,
                columnKey: 'TOTAL',
                rowKey: 'SELLING_EXPENSES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 240000,
                columnKey: 'SALE_40',
                rowKey: 'SELLING_EXPENSES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'SELLING_EXPENSES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'SELLING_EXPENSES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Incentives',
            rowKey: 'INCENTIVES',
            cellList: [
              {
                value: 240000,
                columnKey: 'TOTAL',
                rowKey: 'INCENTIVES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 240000,
                columnKey: 'SALE_40',
                rowKey: 'INCENTIVES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'INCENTIVES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'INCENTIVES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Agency expenses',
            rowKey: 'AGENCY_EXPENSE',
            cellList: [
              {
                value: 0,
                columnKey: 'TOTAL',
                rowKey: 'AGENCY_EXPENSE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'AGENCY_EXPENSE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'AGENCY_EXPENSE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'AGENCY_EXPENSE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
        ],
      },
      {
        index: 5,
        sectionTitle: 'Delivery expenses',
        sectionKey: 'DELIVERY_EXPENSES',
        rowLabels: [
          {
            label: 'Delivery expenses',
            rowKey: 'DELIVERY_EXPENSES_TOTAL',
            cellList: [
              {
                value: 88800000,
                columnKey: 'TOTAL',
                rowKey: 'DELIVERY_EXPENSES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'DELIVERY_EXPENSES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'DELIVERY_EXPENSES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 88800000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'DELIVERY_EXPENSES_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Direct labor cost',
            rowKey: 'DIRECT_LABOR_COST',
            cellList: [
              {
                value: 87600000,
                columnKey: 'TOTAL',
                rowKey: 'DIRECT_LABOR_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'DIRECT_LABOR_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'DIRECT_LABOR_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 87600000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'DIRECT_LABOR_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Outsourcing cost',
            rowKey: 'OUTSOURCING_COST',
            cellList: [
              {
                value: 0,
                columnKey: 'TOTAL',
                rowKey: 'OUTSOURCING_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'OUTSOURCING_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'OUTSOURCING_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'OUTSOURCING_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Equipment, Internet, Server cost',
            rowKey: 'EQUIPMENT_INTERNET_SERVER_COST',
            cellList: [
              {
                value: 0,
                columnKey: 'TOTAL',
                rowKey: 'EQUIPMENT_INTERNET_SERVER_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'EQUIPMENT_INTERNET_SERVER_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'EQUIPMENT_INTERNET_SERVER_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'EQUIPMENT_INTERNET_SERVER_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label:
              'Onsite expenses (Onsite allowance, perdiem, travelling, accommodation, etc.)',
            rowKey: 'ONSITE_DEVELOPMENT_COST',
            cellList: [
              {
                value: 0,
                columnKey: 'TOTAL',
                rowKey: 'ONSITE_DEVELOPMENT_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'ONSITE_DEVELOPMENT_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'ONSITE_DEVELOPMENT_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'ONSITE_DEVELOPMENT_COST',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Project bonus',
            rowKey: 'PROJECT_BONUS',
            cellList: [
              {
                value: 1200000,
                columnKey: 'TOTAL',
                rowKey: 'PROJECT_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'SALE_40',
                rowKey: 'PROJECT_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'PROJECT_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 1200000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'PROJECT_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Overtime',
            rowKey: 'OVERTIME',
            cellList: [
              {
                value: 0,
                columnKey: 'TOTAL',
                rowKey: 'OVERTIME',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'OVERTIME',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'OVERTIME',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'OVERTIME',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Non-deductible input VAT',
            rowKey: 'NON_DEDUCTION_VAT',
            cellList: [
              {
                value: 0,
                columnKey: 'TOTAL',
                rowKey: 'NON_DEDUCTION_VAT',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'NON_DEDUCTION_VAT',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'NON_DEDUCTION_VAT',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'NON_DEDUCTION_VAT',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Other expenses',
            rowKey: 'OTHER_EXPENSES',
            cellList: [
              {
                value: 0,
                columnKey: 'TOTAL',
                rowKey: 'OTHER_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'OTHER_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'OTHER_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: 0,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'OTHER_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
        ],
      },
      {
        index: 6,
        sectionTitle: 'Tax expenses',
        sectionKey: 'TAX',
        rowLabels: [
          {
            label: 'Tax expenses',
            rowKey: 'TAX_TOTAL',
            cellList: [
              {
                value: 1000000,
                columnKey: 'TOTAL',
                rowKey: 'TAX_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 1000000,
                columnKey: 'SALE_40',
                rowKey: 'TAX_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'TAX_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 1000000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'TAX_TOTAL',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'CIT and VAT (if any) (%)',
            rowKey: 'PIC_CIT',
            cellList: [
              {
                value: 20,
                columnKey: 'TOTAL',
                rowKey: 'PIC_CIT',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: null,
                columnKey: 'SALE_40',
                rowKey: 'PIC_CIT',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'PIC_CIT',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'PIC_CIT',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
        ],
      },
      {
        index: 7,
        sectionTitle: 'Margin',
        sectionKey: 'MARGIN',
        rowLabels: [
          {
            label: 'Direct Margin',
            rowKey: 'DIRECT_MARGIN',
            cellList: [
              {
                value: -85040000,
                columnKey: 'TOTAL',
                rowKey: 'DIRECT_MARGIN',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -1240000,
                columnKey: 'SALE_40',
                rowKey: 'DIRECT_MARGIN',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'DIRECT_MARGIN',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -84800000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'DIRECT_MARGIN',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Direct Margin before Incentives and Project bonus',
            rowKey: 'DIRECT_MARGIN_BONUS',
            cellList: [
              {
                value: -83600000,
                columnKey: 'TOTAL',
                rowKey: 'DIRECT_MARGIN_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -1000000,
                columnKey: 'SALE_40',
                rowKey: 'DIRECT_MARGIN_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'DIRECT_MARGIN_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -83600000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'DIRECT_MARGIN_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Allocation of pool and unbillable',
            rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
            cellList: [
              {
                value: 15458823.529,
                columnKey: 'TOTAL',
                rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'SALE_40',
                rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 15458823.529,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'ALLOCATION_OF_POOL_AND_UNBILLABLE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Indirect margin',
            rowKey: 'INDIRECT_MARGIN',
            cellList: [
              {
                value: -100498823.529,
                columnKey: 'TOTAL',
                rowKey: 'INDIRECT_MARGIN',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -1240000,
                columnKey: 'SALE_40',
                rowKey: 'INDIRECT_MARGIN',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'INDIRECT_MARGIN',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -100258823.529,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'INDIRECT_MARGIN',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Direct margin %',
            rowKey: 'DIRECT_MARGIN_RATE',
            cellList: [
              {
                value: -1700.8,
                columnKey: 'TOTAL',
                rowKey: 'DIRECT_MARGIN_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -24.8,
                columnKey: 'SALE_40',
                rowKey: 'DIRECT_MARGIN_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'DIRECT_MARGIN_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -1696,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'DIRECT_MARGIN_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Direct Margin before Incentives and Project bonus %',
            rowKey: 'DIRECT_MARGIN_BONUS_RATE',
            cellList: [
              {
                value: -1672,
                columnKey: 'TOTAL',
                rowKey: 'DIRECT_MARGIN_BONUS_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: 66.888,
                editable: false,
              },
              {
                value: -20,
                columnKey: 'SALE_40',
                rowKey: 'DIRECT_MARGIN_BONUS_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: 66.888,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'DIRECT_MARGIN_BONUS_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -1672,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'DIRECT_MARGIN_BONUS_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: 66.888,
                editable: false,
              },
            ],
          },
          {
            label: 'Indirect margin %',
            rowKey: 'INDIRECT_MARGIN_RATE',
            cellList: [
              {
                value: -2009.976,
                columnKey: 'TOTAL',
                rowKey: 'INDIRECT_MARGIN_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -24.8,
                columnKey: 'SALE_40',
                rowKey: 'INDIRECT_MARGIN_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'INTERNAL',
                rowKey: 'INDIRECT_MARGIN_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -2005.176,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'INDIRECT_MARGIN_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
        ],
      },
      {
        index: 8,
        sectionTitle: 'Reference',
        sectionKey: 'REFERENCE',
        rowLabels: [
          {
            label: 'Average delivery expenses',
            rowKey: 'DELIVERY_AVERAGE_EXPENSES',
            cellList: [
              {
                value: 14800000,
                columnKey: 'TOTAL',
                rowKey: 'DELIVERY_AVERAGE_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 5000000,
                columnKey: 'SALE_40',
                rowKey: 'DELIVERY_AVERAGE_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'DELIVERY_AVERAGE_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 14800000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'DELIVERY_AVERAGE_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Average direct labor cost/MM',
            rowKey: 'SALARY_AVERAGE_EXPENSES',
            cellList: [
              {
                value: 14600000,
                columnKey: 'TOTAL',
                rowKey: 'SALARY_AVERAGE_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 0,
                columnKey: 'SALE_40',
                rowKey: 'SALARY_AVERAGE_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'SALARY_AVERAGE_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 14600000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'SALARY_AVERAGE_EXPENSES',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Billable rate (%)',
            rowKey: 'BILLABLE_RATE',
            cellList: [
              {
                value: 16.667,
                columnKey: 'TOTAL',
                rowKey: 'BILLABLE_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: 0,
                editable: false,
              },
              {
                value: 100,
                columnKey: 'SALE_40',
                rowKey: 'BILLABLE_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: 0,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'BILLABLE_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 16.667,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'BILLABLE_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: 0,
                editable: false,
              },
            ],
          },
          {
            label: 'Productivity',
            rowKey: 'PRODUCTIVITY',
            cellList: [
              {
                value: 2000000,
                columnKey: 'TOTAL',
                rowKey: 'PRODUCTIVITY',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'SALE_40',
                rowKey: 'PRODUCTIVITY',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'PRODUCTIVITY',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 833333.333,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'PRODUCTIVITY',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Efficiency',
            rowKey: 'EFFICIENCY',
            cellList: [
              {
                value: -14173333.333,
                columnKey: 'TOTAL',
                rowKey: 'EFFICIENCY',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'SALE_40',
                rowKey: 'EFFICIENCY',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'EFFICIENCY',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: -14133333.333,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'EFFICIENCY',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Incentives rate (%)',
            rowKey: 'INCENTIVES_RATE',
            cellList: [
              {
                value: null,
                columnKey: 'TOTAL',
                rowKey: 'INCENTIVES_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 2,
                columnKey: 'SALE_40',
                rowKey: 'INCENTIVES_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'INCENTIVES_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'INCENTIVES_RATE',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
            ],
          },
          {
            label: 'Project bonus/MM',
            rowKey: 'PRODUCTION_MM_BONUS',
            cellList: [
              {
                value: null,
                columnKey: 'TOTAL',
                rowKey: 'PRODUCTION_MM_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'SALE_40',
                rowKey: 'PRODUCTION_MM_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'PRODUCTION_MM_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 1200000,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'PRODUCTION_MM_BONUS',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
            ],
          },
          {
            label: 'Billable rate norm (%)',
            rowKey: 'BILL_RATE_NORM',
            cellList: [
              {
                value: null,
                columnKey: 'TOTAL',
                rowKey: 'BILL_RATE_NORM',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'SALE_40',
                rowKey: 'BILL_RATE_NORM',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: null,
                columnKey: 'INTERNAL',
                rowKey: 'BILL_RATE_NORM',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: false,
              },
              {
                value: 85,
                columnKey: 'DELIVERY_UNIT_66',
                rowKey: 'BILL_RATE_NORM',
                normUnitPriceConfig: null,
                normUnitPriceFloor: null,
                normUnitPriceCeiling: null,
                normBusinessPlanConfig: null,
                editable: true,
              },
            ],
          },
        ],
      },
    ],
  },
  messageId: 'Success',
  errorMessage: '',
}

// Create business plan detail for id=437 (Version 2: GLBTM2500093 - GLBOD2500087)
export const mockBusinessPlanDetail437 = {
  httpStatus: 200,
  data: {
    id: 437,
    projectCode: 'GLBTM2500093',
    status: 'Draft',
    version: 2,
    startDate: 1770915600000,
    endDate: 1784134800000,
    userRoles: ['DB-DUL-Onsite'],
    warningMessage: [],
    versions: [
      {
        versionId: 436,
        versionName: 'Version 1',
        status: 'APPROVED',
        statusName: 'Approved',
      },
      {
        versionId: 437,
        versionName: 'Version 2',
        status: 'DRAFT',
        statusName: 'Draft',
      },
    ],
    generalInfos: [
      {
        listAM: [
          {
            id: 11240,
            businessPlanVersionId: 437,
            memberType: 'AM',
            userId: 3744,
            ldap: 'ntmanh6',
            departmentId: 2,
            departmentName: 'DJ2',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: true,
          },
        ],
        listTeamLead: [],
        listPreSale: [],
        listPreparator: [
          {
            id: 99437,
            businessPlanVersionId: 437,
            memberType: 'PREPARATOR',
            userId: 1,
            ldap: 'Demo User',
            departmentId: 2,
            departmentName: 'DJ2',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: false,
          },
        ],
        listAdviser: [],
        listPM: [
          {
            id: 11241,
            businessPlanVersionId: 437,
            memberType: 'PM',
            userId: 3860,
            ldap: 'ttlam1',
            departmentId: 2,
            departmentName: 'DJ2',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: true,
          },
        ],
        businessPlanName: 'GLBTM2500093 Onsite V2',
        customerName: 'MyFirstMillion',
        startDate: 1770915600000,
        endDate: 1784134800000,
        orderType: 'Commercial',
        recurringNew: 'New',
        pm: null,
        currency: 778,
        exchangeRate: 1,
        totalContractPrice: 15000000,
        industry: 18,
        customerMarket: 'US',
        cooperationPeriod: 'Less than 12 months',
        softwareDevelopmentFee: 15000000,
        otherFees: 0,
        planningStartDate: null,
        planningEndDate: null,
        businessPlanKpiDTO: {
          id: 70,
          businessPlanVersionId: 437,
          kpiPm: 30,
          kpiQa: 3,
          kpiMember: 67,
        },
        projectCode: 'GLBTM2500093',
        mvvLocationType: 'Onsite',
        id: 437,
      },
      {
        listAM: [
          {
            id: 11242,
            businessPlanVersionId: 438,
            memberType: 'AM',
            userId: 700,
            ldap: 'vdtung',
            departmentId: 3,
            departmentName: 'DJ2',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: true,
          },
        ],
        listTeamLead: [
          {
            id: 11243,
            businessPlanVersionId: 438,
            memberType: 'TEAM_LEAD',
            userId: 800,
            ldap: 'ntthuong',
            departmentId: 4,
            departmentName: 'BJ2',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: false,
          },
        ],
        listPreSale: [],
        listPreparator: [
          {
            id: 99438,
            businessPlanVersionId: 438,
            memberType: 'PREPARATOR',
            userId: 1,
            ldap: 'Demo User',
            departmentId: 4,
            departmentName: 'BJ2',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: false,
          },
        ],
        listAdviser: [],
        listPM: [
          {
            id: 11244,
            businessPlanVersionId: 438,
            memberType: 'PM',
            userId: 900,
            ldap: 'pmuser',
            departmentId: 5,
            departmentName: 'BJ2',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: true,
          },
        ],
        businessPlanName: 'GLBOD2500087 Offshore V2',
        customerName: 'MyFirstMillion',
        startDate: 1770915600000,
        endDate: 1784134800000,
        orderType: 'T&M',
        recurringNew: 'New',
        pm: null,
        currency: 778,
        exchangeRate: 1,
        totalContractPrice: 10000000,
        industry: 18,
        customerMarket: 'Korea',
        cooperationPeriod: 'Less than 12 months',
        softwareDevelopmentFee: 10000000,
        otherFees: 0,
        planningStartDate: null,
        planningEndDate: null,
        businessPlanKpiDTO: {
          id: 71,
          businessPlanVersionId: 438,
          kpiPm: 25,
          kpiQa: 2,
          kpiMember: 50,
        },
        projectCode: 'GLBOD2500087',
        mvvLocationType: 'Offshore',
        id: 438,
      },
    ],
    columnLabels: [
      { id: null, label: 'Total', index: 1, columnKey: 'TOTAL' },
      { id: 40, label: 'DJ2', index: 2, columnKey: 'SALE_40' },
      { id: null, label: 'Internal', index: 3, columnKey: 'INTERNAL' },
      {
        id: 1,
        label: 'DU-DJ2',
        index: 4,
        columnKey: 'DELIVERY_UNIT_1',
        mvvLocationType: 'Onsite',
      },
      {
        id: 39,
        label: 'DU-BJ2',
        index: 5,
        columnKey: 'DELIVERY_UNIT_39',
        mvvLocationType: 'Offshore',
      },
    ],
    sectionList: [],
  },
  messageId: 'Success',
  errorMessage: '',
}

// ==================== REAL DATA DETAIL (GLBPB2500108 / GLBOD2500109) ====================
// Navigate to BP id=455 to use the real API response data.
// Sub-version 454 → Onsite (GLBPB2500108), 455 → Offshore (GLBOD2500109).
// getBusinessPlanDataByViewMode will serve the real JSON files for these IDs.
export const mockBusinessPlanDetailReal = {
  httpStatus: 200,
  data: {
    id: 455,
    projectCode: 'GLBOD2500109',
    status: 'Draft',
    version: 1,
    startDate: 1767200400000,
    endDate: 1798736400000,
    userRoles: ['DB-DUL-Onsite'],
    warningMessage: [],
    versions: [
      {
        versionId: 455,
        versionName: 'Version 1',
        status: 'DRAFT',
        statusName: 'Draft',
      },
    ],
    generalInfos: [
      {
        listAM: [],
        listTeamLead: [],
        listPreSale: [],
        listPreparator: [],
        listAdviser: [],
        listPM: [],
        businessPlanName: 'GLBPB2500108 Onsite',
        customerName: 'Real Customer',
        startDate: 1767200400000,
        endDate: 1798736400000,
        orderType: 'Commercial',
        recurringNew: 'New',
        pm: null,
        currency: 778,
        exchangeRate: 1,
        totalContractPrice: 0,
        industry: 18,
        customerMarket: 'US',
        cooperationPeriod: 'Less than 12 months',
        softwareDevelopmentFee: 0,
        otherFees: 0,
        planningStartDate: null,
        planningEndDate: null,
        businessPlanKpiDTO: {
          id: 454,
          businessPlanVersionId: 454,
          kpiPm: 30,
          kpiQa: 3,
          kpiMember: 67,
        },
        projectCode: 'GLBPB2500108',
        mvvLocationType: 'Onsite',
        id: 454,
      },
      {
        listAM: [],
        listTeamLead: [],
        listPreSale: [],
        listPreparator: [],
        listAdviser: [],
        listPM: [],
        businessPlanName: 'GLBOD2500109 Offshore',
        customerName: 'Real Customer',
        startDate: 1767200400000,
        endDate: 1798736400000,
        orderType: 'T&M',
        recurringNew: 'New',
        pm: null,
        currency: 778,
        exchangeRate: 1,
        totalContractPrice: 0,
        industry: 18,
        customerMarket: 'Korea',
        cooperationPeriod: 'Less than 12 months',
        softwareDevelopmentFee: 0,
        otherFees: 0,
        planningStartDate: null,
        planningEndDate: null,
        businessPlanKpiDTO: {
          id: 455,
          businessPlanVersionId: 455,
          kpiPm: 25,
          kpiQa: 2,
          kpiMember: 50,
        },
        projectCode: 'GLBOD2500109',
        mvvLocationType: 'Offshore',
        id: 455,
      },
    ],
    columnLabels: [
      { id: null, label: 'Total', index: 1, columnKey: 'TOTAL' },
      { id: 1, label: 'DU3.1', index: 2, columnKey: 'SALE_1' },
      { id: 45, label: 'BU1', index: 3, columnKey: 'SALE_45' },
      { id: null, label: 'Internal', index: 4, columnKey: 'INTERNAL' },
      {
        id: 173,
        label: 'DU1.26',
        index: 5,
        columnKey: 'DELIVERY_UNIT_173',
        mvvLocationType: 'Offshore',
      },
      {
        id: 176,
        label: 'DE3',
        index: 6,
        columnKey: 'DELIVERY_UNIT_176',
        mvvLocationType: 'Offshore',
      },
      {
        id: 34,
        label: 'DU3.11',
        index: 7,
        columnKey: 'DELIVERY_UNIT_34',
        mvvLocationType: 'Onsite',
      },
      {
        id: 39,
        label: 'DU1.12',
        index: 8,
        columnKey: 'DELIVERY_UNIT_39',
        mvvLocationType: 'Onsite',
      },
    ],
    sectionList: [],
  },
  messageId: 'Success',
  errorMessage: '',
}

// ==================== EDGE-CASE DETAIL (NaN / Infinity test) ====================
// Use business plan ID 500 to navigate to this scenario.
// Sub-version 501 → Onsite, 502 → Offshore.
// getBusinessPlanDataByViewMode returns patched data for IDs 501/502 via EDGE_CASE_BP_IDS.
export const mockBusinessPlanEdgeCaseDetail = {
  httpStatus: 200,
  data: {
    id: 500,
    projectCode: 'GLBTM_EDGE_CASE',
    status: 'Draft',
    version: 1,
    startDate: 1770915600000,
    endDate: 1784134800000,
    warningMessage: [],
    versions: [
      {
        versionId: 500,
        versionName: 'Version 1 (Edge Case)',
        status: 'DRAFT',
        statusName: 'Draft',
      },
    ],
    generalInfos: [
      {
        listAM: [],
        listTeamLead: [],
        listPreSale: [],
        listPreparator: [],
        listAdviser: [],
        listPM: [
          {
            id: 19501,
            businessPlanVersionId: 501,
            memberType: 'PM',
            userId: 3860,
            ldap: 'ttlam1',
            departmentId: 2,
            departmentName: 'DJ2',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: true,
          },
        ],
        businessPlanName: 'Edge Case Onsite',
        customerName: 'EdgeCaseCustomer',
        startDate: 1770915600000,
        endDate: 1784134800000,
        orderType: 'Commercial',
        recurringNew: 'New',
        pm: null,
        currency: 778,
        exchangeRate: 1,
        totalContractPrice: 0,
        industry: 18,
        customerMarket: 'US',
        cooperationPeriod: 'Less than 12 months',
        softwareDevelopmentFee: 0,
        otherFees: 0,
        planningStartDate: null,
        planningEndDate: null,
        businessPlanKpiDTO: {
          id: 501,
          businessPlanVersionId: 501,
          kpiPm: 30,
          kpiQa: 3,
          kpiMember: 67,
        },
        projectCode: 'GLBTM_EDGE_ONSITE',
        mvvLocationType: 'Onsite',
        id: 501,
      },
      {
        listAM: [],
        listTeamLead: [],
        listPreSale: [],
        listPreparator: [],
        listAdviser: [],
        listPM: [
          {
            id: 19502,
            businessPlanVersionId: 502,
            memberType: 'PM',
            userId: 7873,
            ldap: 'nvthai3',
            departmentId: 2,
            departmentName: 'DJ2',
            startDate: 1770915600000,
            endDate: 1784134800000,
            isDefault: true,
          },
        ],
        businessPlanName: 'Edge Case Offshore',
        customerName: 'EdgeCaseCustomer',
        startDate: 1770915600000,
        endDate: 1784134800000,
        orderType: 'T&M',
        recurringNew: 'New',
        pm: null,
        currency: 778,
        exchangeRate: 1,
        totalContractPrice: 0,
        industry: 18,
        customerMarket: 'Korea',
        cooperationPeriod: 'Less than 12 months',
        softwareDevelopmentFee: 0,
        otherFees: 0,
        planningStartDate: null,
        planningEndDate: null,
        businessPlanKpiDTO: {
          id: 502,
          businessPlanVersionId: 502,
          kpiPm: 25,
          kpiQa: 2,
          kpiMember: 50,
        },
        projectCode: 'GLBOD_EDGE_OFFSHORE',
        mvvLocationType: 'Offshore',
        id: 502,
      },
    ],
    columnLabels: [
      { id: null, label: 'Total', index: 1, columnKey: 'TOTAL' },
      { id: 169, label: 'BKR1', index: 2, columnKey: 'SALE' },
      { id: null, label: 'Internal', index: 3, columnKey: 'INTERNAL' },
      { id: 39, label: 'DU1.12', index: 4, columnKey: 'DELIVERY_UNIT_39' },
    ],
    sectionList: [],
  },
  messageId: 'Success',
  errorMessage: '',
}

// ==================== PRODUCTION REVENUE ====================
export const mockProductionRevenue = mockProductionRevenue468Raw

export const mockOtherRevenue = mockOtherRevenue468Raw

// ==================== SELLING PLAN ====================
export const mockSellingPlan = mockSellingPlan468Raw

// ==================== REVENUE SUMMARY ====================
export const mockRevenueSummary = mockRevenueSummary468Raw

// ==================== MM BILLS SERVICE ====================
export const mockMMBillsService = mockMMBillsService468Raw

// ==================== DELIVERY PLAN SUMMARY ====================
export const mockDeliveryPlanSummary = {
  httpStatus: 200,
  data: {
    mmEffort: 8,
    directLaborCost: 134523552,
    outsourcingCost: null,
    equipmentExpense: 400000,
    onsiteExpense: 400000,
    overtime: 400000,
    other: 400000,
    permissionView: true,
    nonDeductibleInputVAT: 400000,
  },
  messageId: 'Success',
  errorMessage: '',
}

// ==================== DELIVERY PLAN MEMBERS ====================
export const mockDeliveryPlanMembers = mockListDeliveryPlanMember468Raw

// ==================== OTHER EXPENSES TABLE ====================
export const mockOtherExpensesTable = mockOtherExpensesTable468Raw

// ==================== FILTERS & LOOKUPS ====================
export const mockDepartmentsByVersion = {
  httpStatus: 200,
  data: [
    { groupName: 'BJ2', groupId: 331, groupSale: true },
    { groupName: 'DU1.12', groupId: 39, groupSale: false },
    { groupName: 'DU3.11', groupId: 34, groupSale: false },
  ],
  messageId: 'Success',
  errorMessage: '',
}

export const mockDepartmentsByVersionDelivery = {
  httpStatus: 200,
  data: [
    { groupName: 'DU1.8', groupId: 7, groupSale: false },
    { groupName: 'DU1.6', groupId: 6, groupSale: false },
  ],
  messageId: 'Success',
  errorMessage: '',
}

export const mockPositions = {
  httpStatus: 200,
  data: [
    { id: 803, idStr: null, name: 'SE02', value: 'SE02' },
    { id: 804, idStr: null, name: 'SE01', value: 'SE01' },
    { id: 805, idStr: null, name: 'TEST03', value: 'TEST03' },
    { id: 806, idStr: null, name: 'PM01', value: 'PM01' },
    { id: 807, idStr: null, name: 'SA01', value: 'SA01' },
    { id: 808, idStr: null, name: 'SE04', value: 'SE04' },
    { id: 809, idStr: null, name: 'TEST02', value: 'TEST02' },
    { id: 810, idStr: null, name: 'COMTOR02', value: 'COMTOR02' },
    { id: 811, idStr: null, name: 'SYE02', value: 'SYE02' },
    { id: 812, idStr: null, name: 'SYE01', value: 'SYE01' },
  ],
  messageId: 'Success',
  errorMessage: '',
}

export const mockCurrencies = {
  httpStatus: 200,
  data: [
    { id: 776, currency: 'USD' },
    { id: 777, currency: 'JPY' },
    { id: 778, currency: 'VND' },
    { id: 779, currency: 'EUR' },
    { id: 780, currency: 'SGD' },
    { id: 781, currency: 'AUD' },
    { id: 782, currency: 'KRW' },
    { id: 789, currency: 'MYR' },
  ],
  messageId: 'Success',
  errorMessage: '',
}

export const mockIndustries = {
  httpStatus: 200,
  data: [
    { id: 18, industry: '1.BFSI (Banking, Finance, Security, Insurance)' },
    { id: 30, industry: '2.Communication Media' },
    { id: 39, industry: '3.Public & Government' },
    { id: 47, industry: '4.Manufacturing and Natural Resources' },
    { id: 53, industry: '5.Retail' },
    { id: 59, industry: '6.Logistic' },
    { id: 65, industry: '7.Advetisement' },
    { id: 71, industry: '8.Information Technology' },
    { id: 303, industry: '9.Telecom Communication' },
    { id: 305, industry: '10.Healthcare & Medication' },
    { id: 307, industry: '11.Education' },
    { id: 309, industry: '12.Automotive' },
  ],
  messageId: 'Success',
  errorMessage: '',
}

export const mockMaxKPISetting = {
  httpStatus: 200,
  data: [
    {
      settingId: 418,
      startDate: 1759338000000,
      endDate: 1759338000000,
      type: 15,
      value: '30',
      settingConfigKey: 'MAX_BUSINESS_PLAN_KPI_PM',
      groupId: 0,
      on: true,
    },
    {
      settingId: 419,
      startDate: 1759338000000,
      endDate: 1759338000000,
      type: 15,
      value: '3',
      settingConfigKey: 'MAX_BUSINESS_PLAN_KPI_QA',
      groupId: 0,
      on: true,
    },
    {
      settingId: 420,
      startDate: 1759338000000,
      endDate: 1759338000000,
      type: 15,
      value: '100',
      settingConfigKey: 'MAX_BUSINESS_PLAN_KPI_TOTAL',
      groupId: 0,
      on: true,
    },
  ],
  messageId: 'Success',
  errorMessage: '',
}

// Approval workflow from BE get-all-approval-steps (id=468, GLBOD2500127)
export const mockApprovalSteps = {
  httpStatus: 200,
  data: {
    data: {
      9130: {
        stepName: 'Draft',
        stateName: 'Draft',
        stateOrder: 10,
        stateHidden: false,
        order: 1,
        map: {
          None: [],
        },
      },
      9131: {
        stepName: 'BU/DU Lead Pending Approval',
        stateName: 'Verification',
        stateOrder: 100,
        stateHidden: false,
        order: 1,
        map: {
          CJP: [
            {
              createdBy: 'ttlam1',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:43:39.0',
              updatedOn: '2026-02-12 10:43:48.0',
              id: 5832,
              taskKey: 'BP-5832',
              approvalStepId: 9131,
              ldap: 'nxcanh',
              departmentName: 'BJ3',
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:43:48.0',
                  updatedOn: '2026-02-12 10:43:48.0',
                  id: 3959,
                  approvalPersonId: 5832,
                  ldap: 'nbtduy',
                  previousLdap: 'nxcanh',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
          ],
          G3: [
            {
              createdBy: 'ttlam1',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:43:39.0',
              updatedOn: '2026-02-12 10:43:54.0',
              id: 5831,
              taskKey: 'BP-5831',
              approvalStepId: 9131,
              ldap: 'vttung3',
              departmentName: 'BU3',
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:43:52.0',
                  updatedOn: '2026-02-12 10:43:52.0',
                  id: 3960,
                  approvalPersonId: 5831,
                  ldap: 'nbtduy',
                  previousLdap: 'vttung3',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
          ],
        },
      },
      9132: {
        stepName: 'Approved',
        stateName: 'Approved',
        stateOrder: 10000,
        stateHidden: false,
        order: 1,
        map: {
          None: [],
        },
      },
      9133: {
        stepName: 'G Lead Pending Approval',
        stateName: 'Verification',
        stateOrder: 100,
        stateHidden: false,
        order: 2,
        map: {
          CJP: [
            {
              createdBy: 'nbtduy',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:43:54.0',
              updatedOn: '2026-02-12 10:43:57.0',
              id: 5833,
              taskKey: 'BP-5833',
              approvalStepId: 9133,
              ldap: 'ncchinh1',
              departmentName: 'CJP',
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:43:57.0',
                  updatedOn: '2026-02-12 10:43:57.0',
                  id: 3961,
                  approvalPersonId: 5833,
                  ldap: 'nbtduy',
                  previousLdap: 'ncchinh1',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
            {
              createdBy: 'nbtduy',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:43:54.0',
              updatedOn: '2026-02-12 10:44:01.0',
              id: 5834,
              taskKey: 'BP-5834',
              approvalStepId: 9133,
              ldap: 'ndtoi',
              departmentName: 'CJP',
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:01.0',
                  updatedOn: '2026-02-12 10:44:01.0',
                  id: 3962,
                  approvalPersonId: 5834,
                  ldap: 'nbtduy',
                  previousLdap: 'ndtoi',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
          ],
          G3: [
            {
              createdBy: 'nbtduy',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:43:54.0',
              updatedOn: '2026-02-12 10:44:04.0',
              id: 5835,
              taskKey: 'BP-5835',
              approvalStepId: 9133,
              ldap: 'ltoanh',
              departmentName: 'G3',
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:04.0',
                  updatedOn: '2026-02-12 10:44:04.0',
                  id: 3963,
                  approvalPersonId: 5835,
                  ldap: 'nbtduy',
                  previousLdap: 'ltoanh',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
            {
              createdBy: 'nbtduy',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:43:54.0',
              updatedOn: '2026-02-12 10:44:25.0',
              id: 5836,
              taskKey: 'BP-5836',
              approvalStepId: 9133,
              ldap: 'ttlam1',
              departmentName: 'G3',
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:06.0',
                  updatedOn: '2026-02-12 10:44:06.0',
                  id: 3964,
                  approvalPersonId: 5836,
                  ldap: 'nbtduy',
                  previousLdap: 'nbtduy',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:08.0',
                  updatedOn: '2026-02-12 10:44:08.0',
                  id: 3965,
                  approvalPersonId: 5836,
                  ldap: 'nbtduy',
                  previousLdap: 'nbtduy',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'APPROVED',
                },
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:11.0',
                  updatedOn: '2026-02-12 10:44:11.0',
                  id: 3966,
                  approvalPersonId: 5836,
                  ldap: 'nbtduy',
                  previousLdap: 'nbtduy',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'APPROVED',
                },
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:22.0',
                  updatedOn: '2026-02-12 10:44:22.0',
                  id: 3967,
                  approvalPersonId: 5836,
                  ldap: 'ttlam1',
                  previousLdap: 'nbtduy',
                  stepAction: 'REASSIGN',
                  lastProcessStatus: 'APPROVED',
                },
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:25.0',
                  updatedOn: '2026-02-12 10:44:25.0',
                  id: 3968,
                  approvalPersonId: 5836,
                  ldap: 'nbtduy',
                  previousLdap: 'ttlam1',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
            {
              createdBy: 'nbtduy',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:43:54.0',
              updatedOn: '2026-02-12 10:44:27.0',
              id: 5837,
              taskKey: 'BP-5837',
              approvalStepId: 9133,
              ldap: 'nhanh16',
              departmentName: 'G3',
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:27.0',
                  updatedOn: '2026-02-12 10:44:27.0',
                  id: 3969,
                  approvalPersonId: 5837,
                  ldap: 'nbtduy',
                  previousLdap: 'nhanh16',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
            {
              createdBy: 'nbtduy',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:43:54.0',
              updatedOn: '2026-02-12 10:44:32.0',
              id: 5838,
              taskKey: 'BP-5838',
              approvalStepId: 9133,
              ldap: 'vttung3',
              departmentName: 'G3',
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:30.0',
                  updatedOn: '2026-02-12 10:44:30.0',
                  id: 3970,
                  approvalPersonId: 5838,
                  ldap: 'nbtduy',
                  previousLdap: 'vttung3',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
          ],
        },
      },
      9134: {
        stepName: 'FC Pending Approval',
        stateName: 'Peer Review',
        stateOrder: 1000,
        stateHidden: false,
        order: 1,
        map: {
          None: [
            {
              createdBy: 'nbtduy',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:44:32.0',
              updatedOn: '2026-02-12 10:44:39.0',
              id: 5839,
              taskKey: 'BP-5839',
              approvalStepId: 9134,
              ldap: 'ttmy',
              departmentName: null,
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:36.0',
                  updatedOn: '2026-02-12 10:44:36.0',
                  id: 3971,
                  approvalPersonId: 5839,
                  ldap: 'nbtduy',
                  previousLdap: 'ttmy',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
          ],
        },
      },
      9135: {
        stepName: 'BOM Pending Approval',
        stateName: 'Peer Review',
        stateOrder: 1000,
        stateHidden: false,
        order: 2,
        map: {
          None: [
            {
              createdBy: 'nbtduy',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:44:39.0',
              updatedOn: '2026-02-12 10:44:42.0',
              id: 5840,
              taskKey: 'BP-5840',
              approvalStepId: 9135,
              ldap: 'htthoa',
              departmentName: null,
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:42.0',
                  updatedOn: '2026-02-12 10:44:42.0',
                  id: 3972,
                  approvalPersonId: 5840,
                  ldap: 'nbtduy',
                  previousLdap: 'htthoa',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
            {
              createdBy: 'nbtduy',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:44:39.0',
              updatedOn: '2026-02-12 10:44:45.0',
              id: 5841,
              taskKey: 'BP-5841',
              approvalStepId: 9135,
              ldap: 'nvbach',
              departmentName: null,
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:45.0',
                  updatedOn: '2026-02-12 10:44:45.0',
                  id: 3973,
                  approvalPersonId: 5841,
                  ldap: 'nbtduy',
                  previousLdap: 'nvbach',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
            {
              createdBy: 'nbtduy',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:44:39.0',
              updatedOn: '2026-02-12 10:44:50.0',
              id: 5842,
              taskKey: 'BP-5842',
              approvalStepId: 9135,
              ldap: 'mthuong',
              departmentName: null,
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:47.0',
                  updatedOn: '2026-02-12 10:44:47.0',
                  id: 3974,
                  approvalPersonId: 5842,
                  ldap: 'nbtduy',
                  previousLdap: 'mthuong',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
          ],
        },
      },
      9136: {
        stepName: 'CEO Pending Approval',
        stateName: 'Peer Review',
        stateOrder: 1000,
        stateHidden: false,
        order: 3,
        map: {
          None: [
            {
              createdBy: 'nbtduy',
              updatedBy: 'nbtduy',
              createdOn: '2026-02-12 10:44:50.0',
              updatedOn: '2026-02-12 10:44:54.0',
              id: 5843,
              taskKey: 'BP-5843',
              approvalStepId: 9136,
              ldap: 'dnbao',
              departmentName: null,
              processStatus: 'APPROVED',
              history: [
                {
                  createdBy: 'nbtduy',
                  updatedBy: 'nbtduy',
                  createdOn: '2026-02-12 10:44:54.0',
                  updatedOn: '2026-02-12 10:44:54.0',
                  id: 3975,
                  approvalPersonId: 5843,
                  ldap: 'nbtduy',
                  previousLdap: 'dnbao',
                  stepAction: 'APPROVED',
                  lastProcessStatus: 'TODO',
                },
              ],
            },
          ],
        },
      },
    },
    workOrder: {
      CJP: [
        {
          duName: 'BJ3',
        },
      ],
      G3: [
        {
          duName: 'BU3',
        },
      ],
    },
  },
  messageId: 'Success',
  errorMessage: '',
}

export const mockUserActionHistory = mockUserActionHistory468Raw
export const mockUserActionHistoryDelivery = mockUserActionHistoryDelivery468Raw

export const mockDocuments = {
  httpStatus: 200,
  data: {
    documentDtoList: [],
    total: 0,
  },
  messageId: 'Success',
  errorMessage: '',
}

// ==================== ADDITIONAL LOOKUPS ====================
export const mockStatusList = {
  httpStatus: 200,
  data: [
    { id: 1, name: 'Draft', value: 'DRAFT' },
    { id: 2, name: 'Pending Approval', value: 'PENDING_APPROVAL' },
    { id: 3, name: 'Approved', value: 'APPROVED' },
    { id: 4, name: 'Rejected', value: 'REJECTED' },
  ],
  messageId: 'Success',
  errorMessage: '',
}

export const mockResourceTypes = {
  httpStatus: 200,
  data: [
    { id: 1, name: 'User', value: 'User' },
    { id: 2, name: 'TBH', value: 'TBH' },
  ],
  messageId: 'Success',
  errorMessage: '',
}

export const mockLocations = {
  httpStatus: 200,
  data: [
    { id: 1, name: 'Vietnam', value: 'Vietnam' },
    { id: 2, name: 'Japan', value: 'Japan' },
    { id: 3, name: 'Singapore', value: 'Singapore' },
  ],
  messageId: 'Success',
  errorMessage: '',
}

export const mockEmployeeTypes = {
  httpStatus: 200,
  data: [
    { id: 1, name: 'In-house', value: 'In-house' },
    { id: 2, name: 'Outsourcing', value: 'Outsourcing' },
    { id: 3, name: 'Freelancer', value: 'Freelancer' },
  ],
  messageId: 'Success',
  errorMessage: '',
}

export const mockRoles = {
  httpStatus: 200,
  data: [
    { id: 1, name: 'PM', value: 'PM' },
    { id: 2, name: 'Team Lead', value: 'Team Lead' },
    { id: 3, name: 'Member', value: 'Member' },
    { id: 4, name: 'BA', value: 'BA' },
    { id: 5, name: 'QA', value: 'QA' },
    { id: 6, name: 'Comtor', value: 'Comtor' },
  ],
  messageId: 'Success',
  errorMessage: '',
}

export const mockBusinessPlanList = {
  httpStatus: 200,
  data: {
    total: 1,
    body: [
      {
        id: 436,
        projectCode: 'GLBTM2500093',
        businessPlanName: 'Myfirstmillion Onsite',
        customerName: 'MyFirstMillion',
        version: 1,
        status: 'APPROVED',
        statusName: 'Approved',
        currentApprovalStep: 'Approved',
        createdDate: 1770915600000,
        lastModifiedDate: 1770925600000,
      },
    ],
    page: 1,
    size: 20,
  },
  messageId: 'Success',
  errorMessage: '',
}

export const mockResourceList = {
  httpStatus: 200,
  data: [
    {
      userId: 3860,
      ldap: 'ttlam1',
      fullName: 'Lam. Tran Tung',
      department: 'DJ2',
    },
    {
      userId: 3744,
      ldap: 'ntmanh6',
      fullName: 'Manh. Nguyen Trong',
      department: 'BU3',
    },
    {
      userId: 136,
      ldap: 'lcnguyen',
      fullName: 'Nguyen. Le Chi',
      department: 'DU1.3',
    },
  ],
  messageId: 'Success',
  errorMessage: '',
}

export const mockUserAndDepartment = {
  httpStatus: 200,
  data: {
    users: [
      {
        userId: 3860,
        ldap: 'ttlam1',
        fullName: 'Lam. Tran Tung',
        departmentId: 2,
        departmentName: 'DJ2',
      },
      {
        userId: 3744,
        ldap: 'ntmanh6',
        fullName: 'Manh. Nguyen Trong',
        departmentId: 40,
        departmentName: 'BU3',
      },
    ],
    departments: [
      { id: 2, name: 'DJ2', type: 'DU' },
      { id: 40, name: 'BU3', type: 'BU' },
      { id: 66, name: 'BJ3', type: 'DU' },
    ],
  },
  messageId: 'Success',
  errorMessage: '',
}

// ==================== IN-MEMORY STORAGE ====================
let businessPlanStore = {
  436: JSON.parse(JSON.stringify(mockBusinessPlanDetail.data)),
  437: JSON.parse(JSON.stringify(mockBusinessPlanDetail437.data)),
  454: JSON.parse(JSON.stringify(mockBusinessPlanDetailReal.data)),
  455: JSON.parse(JSON.stringify(mockBusinessPlanDetailReal.data)),
  468: JSON.parse(JSON.stringify(mockBusinessPlanDetail468Raw.data)),
  500: JSON.parse(JSON.stringify(mockBusinessPlanEdgeCaseDetail.data)),
}

// Future use for delivery and revenue plan storage
// eslint-disable-next-line no-unused-vars
let deliveryPlanStore = {}
// eslint-disable-next-line no-unused-vars
let revenuePlanStore = {}

// ==================== HELPER FUNCTIONS ====================
export const getBusinessPlanById = id => {
  return businessPlanStore[id] || null
}

export const updateBusinessPlan = (id, data) => {
  businessPlanStore[id] = { ...businessPlanStore[id], ...data }
  return businessPlanStore[id]
}

export const createBusinessPlanVersion = baseId => {
  const base = businessPlanStore[baseId]
  const newId = Math.max(...Object.keys(businessPlanStore).map(Number)) + 1
  const newVersion = JSON.parse(JSON.stringify(base))
  newVersion.id = newId
  newVersion.version = base.version + 1
  newVersion.status = 'Draft'
  businessPlanStore[newId] = newVersion
  return newVersion
}

export const resetMockData = () => {
  businessPlanStore = {
    436: JSON.parse(JSON.stringify(mockBusinessPlanDetail.data)),
    437: JSON.parse(JSON.stringify(mockBusinessPlanDetail437.data)),
    454: JSON.parse(JSON.stringify(mockBusinessPlanDetailReal.data)),
    455: JSON.parse(JSON.stringify(mockBusinessPlanDetailReal.data)),
    468: JSON.parse(JSON.stringify(mockBusinessPlanDetail468Raw.data)),
    500: JSON.parse(JSON.stringify(mockBusinessPlanEdgeCaseDetail.data)),
  }
  deliveryPlanStore = {}
  revenuePlanStore = {}
}

// ==================== VIEW MODE FILTERING ====================
/**
 * Filter columns and cells by view mode
 * @param {object} data - The full business plan data
 * @param {string} viewMode - 'Total' | 'OB' | 'Onsite' | 'Offshore'
 * @returns {object} Filtered data with appropriate columns and cells
 */
const filterDataByViewMode = (data, viewMode) => {
  if (!data || !viewMode) return data

  // Define column keys for each view mode as Sets for fast lookup
  const columnKeysByViewMode = {
    Total: new Set([
      'TOTAL',
      'INTERNAL',
      'SALE_40',
      'DELIVERY_UNIT_66',
      'DELIVERY_UNIT_39',
      'DELIVERY_UNIT_1',
    ]),
    OB: new Set(['TOTAL', 'INTERNAL', 'SALE_40']),
    Onsite: new Set([
      'TOTAL',
      'INTERNAL',
      'DELIVERY_UNIT_1',
      'DELIVERY_UNIT_66',
    ]),
    Offshore: new Set(['TOTAL', 'INTERNAL', 'DELIVERY_UNIT_39']),
  }

  const allowedColumnKeys =
    columnKeysByViewMode[viewMode] || columnKeysByViewMode['Total']

  // Filter columnLabels while maintaining original order
  const filteredColumnLabels = data.columnLabels
    .filter(col => allowedColumnKeys.has(col.columnKey))
    .map((col, idx) => ({ ...col, index: idx + 1 })) // Re-index

  // Filter cells in sectionList
  const filteredSectionList = data.sectionList.map(section => ({
    ...section,
    rowLabels: section.rowLabels.map(row => ({
      ...row,
      cellList: row.cellList.filter(cell =>
        allowedColumnKeys.has(cell.columnKey)
      ),
    })),
  }))

  return {
    ...data,
    columnLabels: filteredColumnLabels,
    sectionList: filteredSectionList,
  }
}

/**
 * Get Business Plan data by view mode
 * Returns filtered mock data based on view mode
 * @param {string} viewMode - 'Total' | 'OB' | 'Onsite' | 'Offshore'
 * @returns {object} Mock data for the specified view mode
 */
// V2 business plan IDs: 437 (Onsite), 438 (Offshore)
var V2_BUSINESS_PLAN_IDS = [437, 438]

// Real API data business plan IDs: 468
var REAL_BP_IDS = [468]

// Edge-case business plan IDs: 501 (Offshore), 502 (Onsite)
// Use these IDs to verify NaN / Infinity guards are working correctly.
var EDGE_CASE_BP_IDS = [501, 502]

/**
 * Patch a deep-cloned BP section data object with zero-denominator values so
 * every division inside useFormula.js that can produce NaN or Infinity is
 * exercised.  Numerators are kept non-zero so the result is Infinity (not NaN)
 * ΓÇö the guards must reduce it to null before display.
 *
 * Triggered division paths covered:
 *  1. getUnitPriceSale      ΓÇö MM_BILL[SALE]=0,  SOFTWARE_PRODUCTION_REVENUES[SALE]>0
 *  2. getBillableRate*      ΓÇö MM_PRODUCTION[TOTAL|DU]=0, MM_BILL>0
 *  3. getProductivity*      ΓÇö MM_PRODUCTION[TOTAL|DU]=0, SOFTWARE_PRODUCTION_REVENUES>0
 *  4. getEfficiency*        ΓÇö MM_PRODUCTION[TOTAL|DU]=0, DIRECT_MARGIN>0
 *  5. getDeliveryAvgExp.*   ΓÇö MM_PRODUCTION[TOTAL|DU]=0, DELIVERY_EXPENSES_TOTAL>0
 *  6. getSalaryAvgExp.*     ΓÇö MM_PRODUCTION[TOTAL|DU]=0, DIRECT_LABOR_COST>0
 *  7. getDirectMarginRate   ΓÇö REVENUES_TOTAL=0, DIRECT_MARGIN>0
 *  8. getDirectMarginBonusRate ΓÇö REVENUES_TOTAL=0, DIRECT_MARGIN_BONUS>0
 *  9. getIndirectMarginRate ΓÇö REVENUES_TOTAL=0, INDIRECT_MARGIN>0
 * 10. getAllocationOfPoolDU ΓÇö BILL_RATE_NORM[DU]=0, DIRECT_LABOR_COST[DU]>0
 */
var applyEdgeCasePatches = function (cloned) {
  var setCell = function (sectionKey, rowKey, columnKey, value) {
    var sectionList = cloned.data && cloned.data.sectionList
    if (!sectionList) return
    var section = sectionList.find(function (s) {
      return s.sectionKey === sectionKey
    })
    if (!section) return
    var row = section.rowLabels.find(function (r) {
      return r.rowKey === rowKey
    })
    if (!row) return
    var cell = row.cellList.find(function (c) {
      return c.columnKey === columnKey
    })
    if (cell) cell.value = value
  }

  // Case 1 ΓÇô unit price sale: MM_BILL[SALE]=0, revenue>0
  setCell('MAN_MONTH', 'MM_BILL', 'SALE', 0)

  // Cases 2-6 ΓÇô all per-MM averages and rates: MM_PRODUCTION=0 for TOTAL and DU
  setCell('MAN_MONTH', 'MM_PRODUCTION', 'TOTAL', 0)
  setCell('MAN_MONTH', 'MM_PRODUCTION', 'DELIVERY_UNIT_39', 0)

  // Ensure non-zero numerators for cases 3-6
  setCell('REVENUES', 'SOFTWARE_PRODUCTION_REVENUES', 'TOTAL', 50000000)
  setCell(
    'REVENUES',
    'SOFTWARE_PRODUCTION_REVENUES',
    'DELIVERY_UNIT_39',
    50000000
  )
  setCell('DELIVERY_EXPENSES', 'DELIVERY_EXPENSES_TOTAL', 'TOTAL', 5000000)
  setCell(
    'DELIVERY_EXPENSES',
    'DELIVERY_EXPENSES_TOTAL',
    'DELIVERY_UNIT_39',
    5000000
  )
  setCell('DELIVERY_EXPENSES', 'DIRECT_LABOR_COST', 'TOTAL', 5000000)
  setCell('DELIVERY_EXPENSES', 'DIRECT_LABOR_COST', 'DELIVERY_UNIT_39', 5000000)

  // Cases 7-9 ΓÇô margin rates: REVENUES_TOTAL=0, margins>0
  setCell('REVENUES', 'REVENUES_TOTAL', 'TOTAL', 0)
  setCell('REVENUES', 'REVENUES_TOTAL', 'SALE', 0)
  setCell('REVENUES', 'REVENUES_TOTAL', 'DELIVERY_UNIT_39', 0)
  setCell('MARGIN', 'DIRECT_MARGIN', 'TOTAL', 1000000)
  setCell('MARGIN', 'DIRECT_MARGIN', 'DELIVERY_UNIT_39', 1000000)
  setCell('MARGIN', 'DIRECT_MARGIN_BONUS', 'TOTAL', 1000000)
  setCell('MARGIN', 'DIRECT_MARGIN_BONUS', 'DELIVERY_UNIT_39', 1000000)
  setCell('MARGIN', 'INDIRECT_MARGIN', 'TOTAL', 1000000)
  setCell('MARGIN', 'INDIRECT_MARGIN', 'DELIVERY_UNIT_39', 1000000)

  // Case 10 ΓÇô allocation pool: BILL_RATE_NORM[DU]=0, DIRECT_LABOR_COST[DU]>0
  setCell('REFERENCE', 'BILL_RATE_NORM', 'DELIVERY_UNIT_39', 0)

  return cloned
}

export const getBusinessPlanDataByViewMode = (viewMode, businessPlanId) => {
  viewMode = viewMode || 'Total'
  var id = Number(businessPlanId)
  var isV2 = V2_BUSINESS_PLAN_IDS.indexOf(id) !== -1
  var isEdgeCase = EDGE_CASE_BP_IDS.indexOf(id) !== -1
  var isReal = REAL_BP_IDS.indexOf(id) !== -1

  if (isReal) {
    var realDataMap = {
      Total: mockBusinessPlanTotal468Raw,
      OB: mockBusinessPlanOB468Raw,
      Onsite: mockBusinessPlanOnsite468Raw,
      Offshore: mockBusinessPlanOffshore468Raw,
    }
    return JSON.parse(
      JSON.stringify(realDataMap[viewMode] || mockBusinessPlanTotal468Raw)
    )
  }

  var offshoreData = isV2
    ? mockBusinessPlanByViewOffshoreV2
    : mockBusinessPlanByViewOffshore

  var dataMap = {
    Total: mockBusinessPlanByViewTotal,
    OB: mockBusinessPlanByViewOB,
    Onsite: mockBusinessPlanByViewOnsite,
    Offshore: offshoreData,
  }

  var data = dataMap[viewMode] || mockBusinessPlanByViewTotal
  var cloned = JSON.parse(JSON.stringify(data))

  if (isEdgeCase && (viewMode === 'Offshore' || viewMode === 'Onsite')) {
    cloned = applyEdgeCasePatches(cloned)
  }

  return cloned
}
