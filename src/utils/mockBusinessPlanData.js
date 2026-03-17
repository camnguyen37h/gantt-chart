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

// ==================== BUSINESS PLAN DETAIL ====================
export const mockBusinessPlanDetail = {
  "httpStatus": 200,
  "data": {
    "id": 436,
    "projectCode": "GLBTM2500093",
    "status": "Draft",
    "version": 1,
    "startDate": 1770915600000,
    "endDate": 1784134800000,
    "warningMessage": [],
    "versions": [
      {
        "versionId": 436,
        "versionName": "Version 1",
        "status": "APPROVED",
        "statusName": "Approved"
      },
      {
        "versionId": 437,
        "versionName": "Version 2",
        "status": "DRAFT",
        "statusName": "Draft"
      }
    ],
    "generalInfos": [
      {
        "listAM": [
          {
            "id": 11233,
            "businessPlanVersionId": 436,
            "memberType": "AM",
            "userId": 3744,
            "ldap": "ntmanh6",
            "departmentId": 40,
            "departmentName": "BU3",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": true
          }
        ],
        "listTeamLead": [
          {
            "id": 11247,
            "businessPlanVersionId": 436,
            "memberType": "TEAM_LEAD",
            "userId": 136,
            "ldap": "lcnguyen",
            "departmentId": 3,
            "departmentName": "DU1.3",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": false
          }
        ],
        "listPreSale": [],
        "listPreparator": [
          {
            "id": 11246,
            "businessPlanVersionId": 436,
            "memberType": "PREPARATOR",
            "userId": 3,
            "ldap": "bhduc",
            "departmentId": 6,
            "departmentName": "DU1.6",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": false
          }
        ],
        "listAdviser": [],
        "listPM": [
          {
            "id": 11232,
            "businessPlanVersionId": 436,
            "memberType": "PM",
            "userId": 3860,
            "ldap": "ttlam1",
            "departmentId": 2,
            "departmentName": "DJ2",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": true
          }
        ],
        "businessPlanName": "Myfirstmillion Onsite",
        "customerName": "MyFirstMillion",
        "startDate": 1770915600000,
        "endDate": 1784134800000,
        "orderType": "Commercial",
        "recurringNew": "New",
        "pm": null,
        "currency": 778,
        "exchangeRate": 1,
        "totalContractPrice": 12000000,
        "industry": 18,
        "customerMarket": "US",
        "cooperationPeriod": "Less than 12 months",
        "softwareDevelopmentFee": 12000000,
        "otherFees": 0,
        "planningStartDate": null,
        "planningEndDate": null,
        "businessPlanKpiDTO": {
          "id": 68,
          "businessPlanVersionId": 436,
          "kpiPm": 30,
          "kpiQa": 3,
          "kpiMember": 67
        },
        "projectCode": "GLBTM2500093",
        "mvvLocationType": "Onsite",
        "id": 436
      },
      {
        "listAM": [
          {
            "id": 11234,
            "businessPlanVersionId": 437,
            "memberType": "AM",
            "userId": 624,
            "ldap": "hmy",
            "departmentId": 169,
            "departmentName": "BKR1",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": true
          }
        ],
        "listTeamLead": [
          {
            "id": 11248,
            "businessPlanVersionId": 437,
            "memberType": "TEAM_LEAD",
            "userId": 10561,
            "ldap": "ltlinh7",
            "departmentId": 107,
            "departmentName": "DU3.21",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": false
          }
        ],
        "listPreSale": [],
        "listPreparator": [
          {
            "id": 11249,
            "businessPlanVersionId": 437,
            "memberType": "PREPARATOR",
            "userId": 3,
            "ldap": "bhduc",
            "departmentId": 6,
            "departmentName": "DU1.6",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": false
          }
        ],
        "listAdviser": [],
        "listPM": [
          {
            "id": 11235,
            "businessPlanVersionId": 437,
            "memberType": "PM",
            "userId": 6,
            "ldap": "bmthin",
            "departmentId": 203,
            "departmentName": "HNO",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": true
          }
        ],
        "businessPlanName": "GLBOD2500047 Offshore",
        "customerName": "MyFirstMillion",
        "startDate": 1770915600000,
        "endDate": 1784134800000,
        "orderType": "T&M",
        "recurringNew": "New",
        "pm": null,
        "currency": 778,
        "exchangeRate": 1,
        "totalContractPrice": 8000000,
        "industry": 18,
        "customerMarket": "Korea",
        "cooperationPeriod": "Less than 12 months",
        "softwareDevelopmentFee": 8000000,
        "otherFees": 0,
        "planningStartDate": null,
        "planningEndDate": null,
        "businessPlanKpiDTO": {
          "id": 69,
          "businessPlanVersionId": 437,
          "kpiPm": 25,
          "kpiQa": 2,
          "kpiMember": 50
        },
        "projectCode": "GLBOD2500047",
        "mvvLocationType": "Offshore",
        "id": 437
      }
    ],
    "columnLabels": [
      {
        "id": null,
        "label": "Total",
        "index": 1,
        "columnKey": "TOTAL"
      },
      {
        "id": 40,
        "label": "BU3",
        "index": 2,
        "columnKey": "SALE_40"
      },
      {
        "id": null,
        "label": "Internal",
        "index": 3,
        "columnKey": "INTERNAL"
      },
      {
        "id": 66,
        "label": "DU1.3",
        "index": 4,
        "columnKey": "DELIVERY_UNIT_66",
        "mvvLocationType": "Onsite"
      },
      {
        "id": 39,
        "label": "DU3.2",
        "index": 5,
        "columnKey": "DELIVERY_UNIT_39",
        "mvvLocationType": "Offshore"
      },
      {
        "id": 1,
        "label": "DU2.1",
        "index": 6,
        "columnKey": "DELIVERY_UNIT_1",
        "mvvLocationType": "Onsite"
      }
    ],
    "sectionList": [
      {
        "index": 1,
        "sectionTitle": "Unit price & MM Bill",
        "sectionKey": "MAN_MONTH",
        "rowLabels": [
          {
            "label": "Unit price",
            "rowKey": "UNIT_PRICE",
            "cellList": [
              {
                "value": 5000000,
                "columnKey": "TOTAL",
                "rowKey": "UNIT_PRICE",
                "normUnitPriceConfig": 77100163,
                "normUnitPriceFloor": 52343300.6607,
                "normUnitPriceCeiling": 101857025.3393,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 5000000,
                "columnKey": "SALE_40",
                "rowKey": "UNIT_PRICE",
                "normUnitPriceConfig": 77100163,
                "normUnitPriceFloor": 52343300.6607,
                "normUnitPriceCeiling": 101857025.3393,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "UNIT_PRICE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 5000000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "UNIT_PRICE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 3800000,
                "columnKey": "DELIVERY_UNIT_39",
                "rowKey": "UNIT_PRICE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 6200000,
                "columnKey": "DELIVERY_UNIT_1",
                "rowKey": "UNIT_PRICE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "MM effort (MM)",
            "rowKey": "MM_PRODUCTION",
            "cellList": [
              {
                "value": 6,
                "columnKey": "TOTAL",
                "rowKey": "MM_PRODUCTION",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 1,
                "columnKey": "SALE_40",
                "rowKey": "MM_PRODUCTION",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "MM_PRODUCTION",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 6,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "MM_PRODUCTION",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 3,
                "columnKey": "DELIVERY_UNIT_39",
                "rowKey": "MM_PRODUCTION",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 4,
                "columnKey": "DELIVERY_UNIT_1",
                "rowKey": "MM_PRODUCTION",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "MM bill (MM)",
            "rowKey": "MM_BILL",
            "cellList": [
              {
                "value": 1,
                "columnKey": "TOTAL",
                "rowKey": "MM_BILL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 1,
                "columnKey": "SALE_40",
                "rowKey": "MM_BILL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "MM_BILL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 1,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "MM_BILL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "241",
            "rowKey": "MM_BILL_1",
            "cellList": [
              {
                "value": 1,
                "columnKey": "TOTAL",
                "rowKey": "MM_BILL_1",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "SALE_40",
                "rowKey": "MM_BILL_1",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "MM_BILL_1",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 1,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "MM_BILL_1",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          }
        ]
      },
      {
        "index": 2,
        "sectionTitle": "Revenues",
        "sectionKey": "REVENUES",
        "rowLabels": [
          {
            "label": "Revenues",
            "rowKey": "REVENUES_TOTAL",
            "cellList": [
              {
                "value": 5000000,
                "columnKey": "TOTAL",
                "rowKey": "REVENUES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 5000000,
                "columnKey": "SALE_40",
                "rowKey": "REVENUES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -5000000,
                "columnKey": "INTERNAL",
                "rowKey": "REVENUES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 5000000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "REVENUES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Revenues from work delivered (VND)",
            "rowKey": "SOFTWARE_PRODUCTION_REVENUES",
            "cellList": [
              {
                "value": 12000000,
                "columnKey": "TOTAL",
                "rowKey": "SOFTWARE_PRODUCTION_REVENUES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 12000000,
                "columnKey": "SALE_40",
                "rowKey": "SOFTWARE_PRODUCTION_REVENUES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -5000000,
                "columnKey": "INTERNAL",
                "rowKey": "SOFTWARE_PRODUCTION_REVENUES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 5000000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "SOFTWARE_PRODUCTION_REVENUES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Deduction",
            "rowKey": "DEDUCTION",
            "cellList": [
              {
                "value": -7000000,
                "columnKey": "TOTAL",
                "rowKey": "DEDUCTION",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -7000000,
                "columnKey": "SALE_40",
                "rowKey": "DEDUCTION",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "DEDUCTION",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "DEDUCTION",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Onsite fee",
            "rowKey": "ONSITE_FEE",
            "cellList": [
              {
                "value": 0,
                "columnKey": "TOTAL",
                "rowKey": "ONSITE_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "ONSITE_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "ONSITE_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "ONSITE_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Revenues from Equipment, Internet, Server,...",
            "rowKey": "EQUIPMENT_FEE",
            "cellList": [
              {
                "value": 0,
                "columnKey": "TOTAL",
                "rowKey": "EQUIPMENT_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "EQUIPMENT_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "EQUIPMENT_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "EQUIPMENT_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Other revenues",
            "rowKey": "OTHER_FEE",
            "cellList": [
              {
                "value": 0,
                "columnKey": "TOTAL",
                "rowKey": "OTHER_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "OTHER_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "OTHER_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "OTHER_FEE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          }
        ]
      },
      {
        "index": 3,
        "sectionTitle": "Cost of sales",
        "sectionKey": "COST_PRICE",
        "rowLabels": [
          {
            "label": "Cost of sales",
            "rowKey": "COST_PRICE_TOTAL",
            "cellList": [
              {
                "value": null,
                "columnKey": "TOTAL",
                "rowKey": "COST_PRICE_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 5000000,
                "columnKey": "SALE_40",
                "rowKey": "COST_PRICE_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -5000000,
                "columnKey": "INTERNAL",
                "rowKey": "COST_PRICE_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "COST_PRICE_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Cost of sales (Ratecard DU)",
            "rowKey": "COST_OF_DU_SOLD",
            "cellList": [
              {
                "value": null,
                "columnKey": "TOTAL",
                "rowKey": "COST_OF_DU_SOLD",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 5000000,
                "columnKey": "SALE_40",
                "rowKey": "COST_OF_DU_SOLD",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -5000000,
                "columnKey": "INTERNAL",
                "rowKey": "COST_OF_DU_SOLD",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "COST_OF_DU_SOLD",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          }
        ]
      },
      {
        "index": 4,
        "sectionTitle": "Selling expenses",
        "sectionKey": "SELLING_EXPENSES",
        "rowLabels": [
          {
            "label": "Selling expenses",
            "rowKey": "SELLING_EXPENSES_TOTAL",
            "cellList": [
              {
                "value": 240000,
                "columnKey": "TOTAL",
                "rowKey": "SELLING_EXPENSES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 240000,
                "columnKey": "SALE_40",
                "rowKey": "SELLING_EXPENSES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "SELLING_EXPENSES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "SELLING_EXPENSES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Incentives",
            "rowKey": "INCENTIVES",
            "cellList": [
              {
                "value": 240000,
                "columnKey": "TOTAL",
                "rowKey": "INCENTIVES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 240000,
                "columnKey": "SALE_40",
                "rowKey": "INCENTIVES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "INCENTIVES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "INCENTIVES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Agency expenses",
            "rowKey": "AGENCY_EXPENSE",
            "cellList": [
              {
                "value": 0,
                "columnKey": "TOTAL",
                "rowKey": "AGENCY_EXPENSE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "AGENCY_EXPENSE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "AGENCY_EXPENSE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "AGENCY_EXPENSE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          }
        ]
      },
      {
        "index": 5,
        "sectionTitle": "Delivery expenses",
        "sectionKey": "DELIVERY_EXPENSES",
        "rowLabels": [
          {
            "label": "Delivery expenses",
            "rowKey": "DELIVERY_EXPENSES_TOTAL",
            "cellList": [
              {
                "value": 88800000,
                "columnKey": "TOTAL",
                "rowKey": "DELIVERY_EXPENSES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "DELIVERY_EXPENSES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "DELIVERY_EXPENSES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 88800000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "DELIVERY_EXPENSES_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Direct labor cost",
            "rowKey": "DIRECT_LABOR_COST",
            "cellList": [
              {
                "value": 87600000,
                "columnKey": "TOTAL",
                "rowKey": "DIRECT_LABOR_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "DIRECT_LABOR_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "DIRECT_LABOR_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 87600000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "DIRECT_LABOR_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Outsourcing cost",
            "rowKey": "OUTSOURCING_COST",
            "cellList": [
              {
                "value": 0,
                "columnKey": "TOTAL",
                "rowKey": "OUTSOURCING_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "OUTSOURCING_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "OUTSOURCING_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "OUTSOURCING_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Equipment, Internet, Server cost",
            "rowKey": "EQUIPMENT_INTERNET_SERVER_COST",
            "cellList": [
              {
                "value": 0,
                "columnKey": "TOTAL",
                "rowKey": "EQUIPMENT_INTERNET_SERVER_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "EQUIPMENT_INTERNET_SERVER_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "EQUIPMENT_INTERNET_SERVER_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "EQUIPMENT_INTERNET_SERVER_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Onsite expenses (Onsite allowance, perdiem, travelling, accommodation, etc.)",
            "rowKey": "ONSITE_DEVELOPMENT_COST",
            "cellList": [
              {
                "value": 0,
                "columnKey": "TOTAL",
                "rowKey": "ONSITE_DEVELOPMENT_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "ONSITE_DEVELOPMENT_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "ONSITE_DEVELOPMENT_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "ONSITE_DEVELOPMENT_COST",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Project bonus",
            "rowKey": "PROJECT_BONUS",
            "cellList": [
              {
                "value": 1200000,
                "columnKey": "TOTAL",
                "rowKey": "PROJECT_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "SALE_40",
                "rowKey": "PROJECT_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "PROJECT_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 1200000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "PROJECT_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Overtime",
            "rowKey": "OVERTIME",
            "cellList": [
              {
                "value": 0,
                "columnKey": "TOTAL",
                "rowKey": "OVERTIME",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "OVERTIME",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "OVERTIME",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "OVERTIME",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Non-deductible input VAT",
            "rowKey": "NON_DEDUCTION_VAT",
            "cellList": [
              {
                "value": 0,
                "columnKey": "TOTAL",
                "rowKey": "NON_DEDUCTION_VAT",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "NON_DEDUCTION_VAT",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "NON_DEDUCTION_VAT",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "NON_DEDUCTION_VAT",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Other expenses",
            "rowKey": "OTHER_EXPENSES",
            "cellList": [
              {
                "value": 0,
                "columnKey": "TOTAL",
                "rowKey": "OTHER_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "OTHER_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "OTHER_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": 0,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "OTHER_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          }
        ]
      },
      {
        "index": 6,
        "sectionTitle": "Tax expenses",
        "sectionKey": "TAX",
        "rowLabels": [
          {
            "label": "Tax expenses",
            "rowKey": "TAX_TOTAL",
            "cellList": [
              {
                "value": 1000000,
                "columnKey": "TOTAL",
                "rowKey": "TAX_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 1000000,
                "columnKey": "SALE_40",
                "rowKey": "TAX_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "TAX_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 1000000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "TAX_TOTAL",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "CIT and VAT (if any) (%)",
            "rowKey": "PIC_CIT",
            "cellList": [
              {
                "value": 20,
                "columnKey": "TOTAL",
                "rowKey": "PIC_CIT",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": null,
                "columnKey": "SALE_40",
                "rowKey": "PIC_CIT",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "PIC_CIT",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "PIC_CIT",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          }
        ]
      },
      {
        "index": 7,
        "sectionTitle": "Margin",
        "sectionKey": "MARGIN",
        "rowLabels": [
          {
            "label": "Direct Margin",
            "rowKey": "DIRECT_MARGIN",
            "cellList": [
              {
                "value": -85040000,
                "columnKey": "TOTAL",
                "rowKey": "DIRECT_MARGIN",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -1240000,
                "columnKey": "SALE_40",
                "rowKey": "DIRECT_MARGIN",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "DIRECT_MARGIN",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -84800000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "DIRECT_MARGIN",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Direct Margin before Incentives and Project bonus",
            "rowKey": "DIRECT_MARGIN_BONUS",
            "cellList": [
              {
                "value": -83600000,
                "columnKey": "TOTAL",
                "rowKey": "DIRECT_MARGIN_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -1000000,
                "columnKey": "SALE_40",
                "rowKey": "DIRECT_MARGIN_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "DIRECT_MARGIN_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -83600000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "DIRECT_MARGIN_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Allocation of pool and unbillable",
            "rowKey": "ALLOCATION_OF_POOL_AND_UNBILLABLE",
            "cellList": [
              {
                "value": 15458823.529,
                "columnKey": "TOTAL",
                "rowKey": "ALLOCATION_OF_POOL_AND_UNBILLABLE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "SALE_40",
                "rowKey": "ALLOCATION_OF_POOL_AND_UNBILLABLE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "ALLOCATION_OF_POOL_AND_UNBILLABLE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 15458823.529,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "ALLOCATION_OF_POOL_AND_UNBILLABLE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Indirect margin",
            "rowKey": "INDIRECT_MARGIN",
            "cellList": [
              {
                "value": -100498823.529,
                "columnKey": "TOTAL",
                "rowKey": "INDIRECT_MARGIN",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -1240000,
                "columnKey": "SALE_40",
                "rowKey": "INDIRECT_MARGIN",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "INDIRECT_MARGIN",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -100258823.529,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "INDIRECT_MARGIN",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Direct margin %",
            "rowKey": "DIRECT_MARGIN_RATE",
            "cellList": [
              {
                "value": -1700.8,
                "columnKey": "TOTAL",
                "rowKey": "DIRECT_MARGIN_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -24.8,
                "columnKey": "SALE_40",
                "rowKey": "DIRECT_MARGIN_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "DIRECT_MARGIN_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -1696,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "DIRECT_MARGIN_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Direct Margin before Incentives and Project bonus %",
            "rowKey": "DIRECT_MARGIN_BONUS_RATE",
            "cellList": [
              {
                "value": -1672,
                "columnKey": "TOTAL",
                "rowKey": "DIRECT_MARGIN_BONUS_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": 66.888,
                "editable": false
              },
              {
                "value": -20,
                "columnKey": "SALE_40",
                "rowKey": "DIRECT_MARGIN_BONUS_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": 66.888,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "DIRECT_MARGIN_BONUS_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -1672,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "DIRECT_MARGIN_BONUS_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": 66.888,
                "editable": false
              }
            ]
          },
          {
            "label": "Indirect margin %",
            "rowKey": "INDIRECT_MARGIN_RATE",
            "cellList": [
              {
                "value": -2009.976,
                "columnKey": "TOTAL",
                "rowKey": "INDIRECT_MARGIN_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -24.8,
                "columnKey": "SALE_40",
                "rowKey": "INDIRECT_MARGIN_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "INTERNAL",
                "rowKey": "INDIRECT_MARGIN_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -2005.176,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "INDIRECT_MARGIN_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          }
        ]
      },
      {
        "index": 8,
        "sectionTitle": "Reference",
        "sectionKey": "REFERENCE",
        "rowLabels": [
          {
            "label": "Average delivery expenses",
            "rowKey": "DELIVERY_AVERAGE_EXPENSES",
            "cellList": [
              {
                "value": 14800000,
                "columnKey": "TOTAL",
                "rowKey": "DELIVERY_AVERAGE_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 5000000,
                "columnKey": "SALE_40",
                "rowKey": "DELIVERY_AVERAGE_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "DELIVERY_AVERAGE_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 14800000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "DELIVERY_AVERAGE_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Average direct labor cost/MM",
            "rowKey": "SALARY_AVERAGE_EXPENSES",
            "cellList": [
              {
                "value": 14600000,
                "columnKey": "TOTAL",
                "rowKey": "SALARY_AVERAGE_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 0,
                "columnKey": "SALE_40",
                "rowKey": "SALARY_AVERAGE_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "SALARY_AVERAGE_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 14600000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "SALARY_AVERAGE_EXPENSES",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Billable rate (%)",
            "rowKey": "BILLABLE_RATE",
            "cellList": [
              {
                "value": 16.667,
                "columnKey": "TOTAL",
                "rowKey": "BILLABLE_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": 0,
                "editable": false
              },
              {
                "value": 100,
                "columnKey": "SALE_40",
                "rowKey": "BILLABLE_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": 0,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "BILLABLE_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 16.667,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "BILLABLE_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": 0,
                "editable": false
              }
            ]
          },
          {
            "label": "Productivity",
            "rowKey": "PRODUCTIVITY",
            "cellList": [
              {
                "value": 2000000,
                "columnKey": "TOTAL",
                "rowKey": "PRODUCTIVITY",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "SALE_40",
                "rowKey": "PRODUCTIVITY",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "PRODUCTIVITY",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 833333.333,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "PRODUCTIVITY",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Efficiency",
            "rowKey": "EFFICIENCY",
            "cellList": [
              {
                "value": -14173333.333,
                "columnKey": "TOTAL",
                "rowKey": "EFFICIENCY",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "SALE_40",
                "rowKey": "EFFICIENCY",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "EFFICIENCY",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": -14133333.333,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "EFFICIENCY",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Incentives rate (%)",
            "rowKey": "INCENTIVES_RATE",
            "cellList": [
              {
                "value": null,
                "columnKey": "TOTAL",
                "rowKey": "INCENTIVES_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 2,
                "columnKey": "SALE_40",
                "rowKey": "INCENTIVES_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "INCENTIVES_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "INCENTIVES_RATE",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              }
            ]
          },
          {
            "label": "Project bonus/MM",
            "rowKey": "PRODUCTION_MM_BONUS",
            "cellList": [
              {
                "value": null,
                "columnKey": "TOTAL",
                "rowKey": "PRODUCTION_MM_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "SALE_40",
                "rowKey": "PRODUCTION_MM_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "PRODUCTION_MM_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 1200000,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "PRODUCTION_MM_BONUS",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              }
            ]
          },
          {
            "label": "Billable rate norm (%)",
            "rowKey": "BILL_RATE_NORM",
            "cellList": [
              {
                "value": null,
                "columnKey": "TOTAL",
                "rowKey": "BILL_RATE_NORM",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "SALE_40",
                "rowKey": "BILL_RATE_NORM",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": null,
                "columnKey": "INTERNAL",
                "rowKey": "BILL_RATE_NORM",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": false
              },
              {
                "value": 85,
                "columnKey": "DELIVERY_UNIT_66",
                "rowKey": "BILL_RATE_NORM",
                "normUnitPriceConfig": null,
                "normUnitPriceFloor": null,
                "normUnitPriceCeiling": null,
                "normBusinessPlanConfig": null,
                "editable": true
              }
            ]
          }
        ]
      }
    ]
  },
  "messageId": "Success",
  "errorMessage": ""
};

// Create business plan detail for id=437 (Version 2: GLBTM2500093 - GLBOD2500087)
export const mockBusinessPlanDetail437 = {
  "httpStatus": 200,
  "data": {
    "id": 437,
    "projectCode": "GLBTM2500093",
    "status": "Draft",
    "version": 2,
    "startDate": 1770915600000,
    "endDate": 1784134800000,
    "warningMessage": [],
    "versions": [
      {
        "versionId": 436,
        "versionName": "Version 1",
        "status": "APPROVED",
        "statusName": "Approved"
      },
      {
        "versionId": 437,
        "versionName": "Version 2",
        "status": "DRAFT",
        "statusName": "Draft"
      }
    ],
    "generalInfos": [
      {
        "listAM": [
          {
            "id": 11240,
            "businessPlanVersionId": 437,
            "memberType": "AM",
            "userId": 3744,
            "ldap": "ntmanh6",
            "departmentId": 2,
            "departmentName": "DJ2",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": true
          }
        ],
        "listTeamLead": [],
        "listPreSale": [],
        "listPreparator": [
          {
            "id": 99437,
            "businessPlanVersionId": 437,
            "memberType": "PREPARATOR",
            "userId": 1,
            "ldap": "Demo User",
            "departmentId": 2,
            "departmentName": "DJ2",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": false
          }
        ],
        "listAdviser": [],
        "listPM": [
          {
            "id": 11241,
            "businessPlanVersionId": 437,
            "memberType": "PM",
            "userId": 3860,
            "ldap": "ttlam1",
            "departmentId": 2,
            "departmentName": "DJ2",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": true
          }
        ],
        "businessPlanName": "GLBTM2500093 Onsite V2",
        "customerName": "MyFirstMillion",
        "startDate": 1770915600000,
        "endDate": 1784134800000,
        "orderType": "Commercial",
        "recurringNew": "New",
        "pm": null,
        "currency": 778,
        "exchangeRate": 1,
        "totalContractPrice": 15000000,
        "industry": 18,
        "customerMarket": "US",
        "cooperationPeriod": "Less than 12 months",
        "softwareDevelopmentFee": 15000000,
        "otherFees": 0,
        "planningStartDate": null,
        "planningEndDate": null,
        "businessPlanKpiDTO": {
          "id": 70,
          "businessPlanVersionId": 437,
          "kpiPm": 30,
          "kpiQa": 3,
          "kpiMember": 67
        },
        "projectCode": "GLBTM2500093",
        "mvvLocationType": "Onsite",
        "id": 437
      },
      {
        "listAM": [
          {
            "id": 11242,
            "businessPlanVersionId": 438,
            "memberType": "AM",
            "userId": 700,
            "ldap": "vdtung",
            "departmentId": 3,
            "departmentName": "DJ2",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": true
          }
        ],
        "listTeamLead": [
          {
            "id": 11243,
            "businessPlanVersionId": 438,
            "memberType": "TEAM_LEAD",
            "userId": 800,
            "ldap": "ntthuong",
            "departmentId": 4,
            "departmentName": "BJ2",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": false
          }
        ],
        "listPreSale": [],
        "listPreparator": [
          {
            "id": 99438,
            "businessPlanVersionId": 438,
            "memberType": "PREPARATOR",
            "userId": 1,
            "ldap": "Demo User",
            "departmentId": 4,
            "departmentName": "BJ2",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": false
          }
        ],
        "listAdviser": [],
        "listPM": [
          {
            "id": 11244,
            "businessPlanVersionId": 438,
            "memberType": "PM",
            "userId": 900,
            "ldap": "pmuser",
            "departmentId": 5,
            "departmentName": "BJ2",
            "startDate": 1770915600000,
            "endDate": 1784134800000,
            "isDefault": true
          }
        ],
        "businessPlanName": "GLBOD2500087 Offshore V2",
        "customerName": "MyFirstMillion",
        "startDate": 1770915600000,
        "endDate": 1784134800000,
        "orderType": "T&M",
        "recurringNew": "New",
        "pm": null,
        "currency": 778,
        "exchangeRate": 1,
        "totalContractPrice": 10000000,
        "industry": 18,
        "customerMarket": "Korea",
        "cooperationPeriod": "Less than 12 months",
        "softwareDevelopmentFee": 10000000,
        "otherFees": 0,
        "planningStartDate": null,
        "planningEndDate": null,
        "businessPlanKpiDTO": {
          "id": 71,
          "businessPlanVersionId": 438,
          "kpiPm": 25,
          "kpiQa": 2,
          "kpiMember": 50
        },
        "projectCode": "GLBOD2500087",
        "mvvLocationType": "Offshore",
        "id": 438
      }
    ],
    "columnLabels": [
      { "id": null, "label": "Total", "index": 1, "columnKey": "TOTAL" },
      { "id": 40, "label": "DJ2", "index": 2, "columnKey": "SALE_40" },
      { "id": null, "label": "Internal", "index": 3, "columnKey": "INTERNAL" },
      { "id": 1, "label": "DU-DJ2", "index": 4, "columnKey": "DELIVERY_UNIT_1", "mvvLocationType": "Onsite" },
      { "id": 39, "label": "DU-BJ2", "index": 5, "columnKey": "DELIVERY_UNIT_39", "mvvLocationType": "Offshore" }
    ],
    "sectionList": []
  },
  "messageId": "Success",
  "errorMessage": ""
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
    // Revenue departments (groupSale: true)
    { groupName: "BU3", groupId: 220, groupSale: true, locationType: "Onsite" },
    { groupName: "BU5", groupId: 40, groupSale: true, locationType: "Offshore" },
    
    // Delivery departments (groupSale: false)
    { groupName: "BJ3", groupId: 66, groupSale: false, locationType: "Offshore" },
    { groupName: "DJ2", groupId: 39, groupSale: false, locationType: "Offshore" },
    { groupName: "DU1", groupId: 1, groupSale: false, locationType: "Onsite" }
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

// Single combined workflow — both G3 (offshore) and G1+GKR (onsite) groups in one flow
// Mirrors response get all approval.json: steps share the same workOrder {G1, G3, GKR}
export const mockApprovalSteps = {
  httpStatus: 200,
  data: {
    data: {
      "draft": {
        stepName: "Draft",
        stateName: "Draft",
        stateOrder: 10,
        stateHidden: false,
        order: 1,
        map: { None: [] }
      },
      // BU/DU Lead — combines G1 (DU1.12), G3 (DU3.1, BU3), GKR (BKR1)
      "budu_lead": {
        stepName: "BU/DU Lead Pending Approval",
        stateName: "Verification",
        stateOrder: 100,
        stateHidden: false,
        order: 1,
        map: {
          G1:  [{ id: 5310, taskKey: "BP-5310", approvalStepId: 8579, ldap: "nvthang9", departmentName: "DU1.12", processStatus: "APPROVED", history: [{ id: 3479, approvalPersonId: 5310, ldap: "ltlinh7", previousLdap: "nvthang9", stepAction: "APPROVED", lastProcessStatus: "TODO" }] }],
          G3:  [
            { id: 5182, taskKey: "BP-5182", approvalStepId: 8448, ldap: "ntviet2", departmentName: "DU3.1", processStatus: "APPROVED", history: [{ id: 3405, approvalPersonId: 5182, ldap: "nbtduy", previousLdap: "ntviet2", stepAction: "APPROVED", lastProcessStatus: "TODO" }] },
            { id: 5183, taskKey: "BP-5183", approvalStepId: 8448, ldap: "nvtung2", departmentName: "DU3.1", processStatus: "APPROVED", history: [{ id: 3406, approvalPersonId: 5183, ldap: "nbtduy", previousLdap: "nvtung2", stepAction: "APPROVED", lastProcessStatus: "TODO" }] },
            { id: 5184, taskKey: "BP-5184", approvalStepId: 8448, ldap: "vttung3", departmentName: "BU3",   processStatus: "APPROVED", history: [{ id: 3407, approvalPersonId: 5184, ldap: "nbtduy", previousLdap: "vttung3",  stepAction: "APPROVED", lastProcessStatus: "TODO" }] }
          ],
          GKR: [{ id: 5311, taskKey: "BP-5311", approvalStepId: 8579, ldap: "nngiang", departmentName: "BKR1", processStatus: "APPROVED", history: [{ id: 3480, approvalPersonId: 5311, ldap: "ltlinh7", previousLdap: "nngiang", stepAction: "APPROVED", lastProcessStatus: "TODO" }] }]
        }
      },
      // G Lead — combines G1 (G1 dept), G3 (G3 dept), GKR (GKR dept)
      "g_lead": {
        stepName: "G Lead Pending Approval",
        stateName: "Verification",
        stateOrder: 100,
        stateHidden: false,
        order: 2,
        map: {
          G1: [
            { id: 5312, taskKey: "BP-5312", approvalStepId: 8581, ldap: "btdon",   departmentName: "G1", processStatus: "APPROVED", history: [{ id: 3481, approvalPersonId: 5312, ldap: "ltlinh7", previousLdap: "btdon",   stepAction: "APPROVED", lastProcessStatus: "TODO" }] },
            { id: 5313, taskKey: "BP-5313", approvalStepId: 8581, ldap: "ddhung",  departmentName: "G1", processStatus: "APPROVED", history: [{ id: 3482, approvalPersonId: 5313, ldap: "ltlinh7", previousLdap: "ddhung",  stepAction: "APPROVED", lastProcessStatus: "TODO" }] },
            { id: 5314, taskKey: "BP-5314", approvalStepId: 8581, ldap: "lvdung2", departmentName: "G1", processStatus: "APPROVED", history: [{ id: 3484, approvalPersonId: 5314, ldap: "ltlinh7", previousLdap: "lvdung2", stepAction: "APPROVED", lastProcessStatus: "TODO" }] },
            { id: 5315, taskKey: "BP-5315", approvalStepId: 8581, ldap: "ptdung2", departmentName: "G1", processStatus: "APPROVED", history: [{ id: 3483, approvalPersonId: 5315, ldap: "ltlinh7", previousLdap: "ptdung2", stepAction: "APPROVED", lastProcessStatus: "TODO" }] }
          ],
          G3: [
            { id: 5185, taskKey: "BP-5185", approvalStepId: 8450, ldap: "ltoanh", departmentName: "G3", processStatus: "APPROVED", history: [{ id: 3491, approvalPersonId: 5185, ldap: "nbtduy", previousLdap: "ltoanh", stepAction: "APPROVED", lastProcessStatus: "TODO" }] },
            { id: 5186, taskKey: "BP-5186", approvalStepId: 8450, ldap: "nbtduy", departmentName: "G3", processStatus: "APPROVED", history: [{ id: 3492, approvalPersonId: 5186, ldap: "nbtduy", previousLdap: "nbtduy", stepAction: "APPROVED", lastProcessStatus: "TODO" }] }
          ],
          GKR: [
            { id: 5316, taskKey: "BP-5316", approvalStepId: 8581, ldap: "nngiang", departmentName: "GKR", processStatus: "APPROVED", history: [{ id: 3485, approvalPersonId: 5316, ldap: "ltlinh7", previousLdap: "nngiang", stepAction: "APPROVED", lastProcessStatus: "TODO" }] }
          ]
        }
      },
      "fc": {
        stepName: "FC Pending Approval",
        stateName: "Peer Review",
        stateOrder: 1000,
        stateHidden: false,
        order: 1,
        map: {
          None: [
            { id: 5317, taskKey: "BP-5317", approvalStepId: 8582, ldap: "ttmy", departmentName: null, processStatus: "APPROVED", history: [{ id: 3486, approvalPersonId: 5317, ldap: "ltlinh7", previousLdap: "ttmy", stepAction: "APPROVED", lastProcessStatus: "TODO" }] }
          ]
        }
      },
      "bom": {
        stepName: "BOM Pending Approval",
        stateName: "Peer Review",
        stateOrder: 1000,
        stateHidden: false,
        order: 2,
        map: {
          None: [
            { id: 5318, taskKey: "BP-5318", approvalStepId: 8583, ldap: "htthoa",  departmentName: null, processStatus: "APPROVED", history: [{ id: 3487, approvalPersonId: 5318, ldap: "ltlinh7", previousLdap: "htthoa",  stepAction: "APPROVED", lastProcessStatus: "TODO" }] },
            { id: 5319, taskKey: "BP-5319", approvalStepId: 8583, ldap: "nvbach",   departmentName: null, processStatus: "APPROVED", history: [{ id: 3488, approvalPersonId: 5319, ldap: "ltlinh7", previousLdap: "nvbach",   stepAction: "APPROVED", lastProcessStatus: "TODO" }] },
            { id: 5320, taskKey: "BP-5320", approvalStepId: 8583, ldap: "mthuong", departmentName: null, processStatus: "APPROVED", history: [{ id: 3489, approvalPersonId: 5320, ldap: "ltlinh7", previousLdap: "mthuong", stepAction: "APPROVED", lastProcessStatus: "TODO" }] }
          ]
        }
      },
      "ceo": {
        stepName: "CEO Pending Approval",
        stateName: "Peer Review",
        stateOrder: 1000,
        stateHidden: false,
        order: 3,
        map: {
          None: [
            { id: 5321, taskKey: "BP-5321", approvalStepId: 8584, ldap: "dnbao", departmentName: null, processStatus: "APPROVED", history: [{ id: 3490, approvalPersonId: 5321, ldap: "ltlinh7", previousLdap: "dnbao", stepAction: "APPROVED", lastProcessStatus: "TODO" }] }
          ]
        }
      },
      "approved": {
        stepName: "Approved",
        stateName: "Approved",
        stateOrder: 10000,
        stateHidden: false,
        order: 1,
        map: { None: [] }
      }
    },
    workOrder: {
      G1:  [{ duName: "DU1.12" }],
      G3:  [{ duName: "DU3.1" }, { duName: "BU3" }],
      GKR: [{ duName: "BKR1" }]
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
  436: JSON.parse(JSON.stringify(mockBusinessPlanDetail.data)),
  437: JSON.parse(JSON.stringify(mockBusinessPlanDetail437.data))
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

// ==================== VIEW MODE FILTERING ====================
/**
 * Filter columns and cells by view mode
 * @param {object} data - The full business plan data
 * @param {string} viewMode - 'Total' | 'OB' | 'Onsite' | 'Offshore'
 * @returns {object} Filtered data with appropriate columns and cells
 */
const filterDataByViewMode = (data, viewMode) => {
  if (!data || !viewMode) return data;
  
  // Define column keys for each view mode as Sets for fast lookup
  const columnKeysByViewMode = {
    'Total': new Set(['TOTAL', 'INTERNAL', 'SALE_40', 'DELIVERY_UNIT_66', 'DELIVERY_UNIT_39', 'DELIVERY_UNIT_1']),
    'OB': new Set(['TOTAL', 'INTERNAL', 'SALE_40']),
    'Onsite': new Set(['TOTAL', 'INTERNAL', 'DELIVERY_UNIT_1', 'DELIVERY_UNIT_66']),
    'Offshore': new Set(['TOTAL', 'INTERNAL', 'DELIVERY_UNIT_39'])
  };
  
  const allowedColumnKeys = columnKeysByViewMode[viewMode] || columnKeysByViewMode['Total'];
  
  // Filter columnLabels while maintaining original order
  const filteredColumnLabels = data.columnLabels
    .filter(col => allowedColumnKeys.has(col.columnKey))
    .map((col, idx) => ({ ...col, index: idx + 1 })); // Re-index
  
  // Filter cells in sectionList
  const filteredSectionList = data.sectionList.map(section => ({
    ...section,
    rowLabels: section.rowLabels.map(row => ({
      ...row,
      cellList: row.cellList.filter(cell => allowedColumnKeys.has(cell.columnKey))
    }))
  }));
  
  return {
    ...data,
    columnLabels: filteredColumnLabels,
    sectionList: filteredSectionList
  };
};

/**
 * Get Business Plan data by view mode
 * Returns filtered mock data based on view mode
 * @param {string} viewMode - 'Total' | 'OB' | 'Onsite' | 'Offshore'
 * @returns {object} Mock data for the specified view mode
 */
// V2 business plan IDs: 437 (Onsite), 438 (Offshore)
var V2_BUSINESS_PLAN_IDS = [437, 438]

export const getBusinessPlanDataByViewMode = (viewMode, businessPlanId) => {
  viewMode = viewMode || 'Total'
  var id = Number(businessPlanId)
  var isV2 = V2_BUSINESS_PLAN_IDS.indexOf(id) !== -1

  var offshoreData = isV2 ? mockBusinessPlanByViewOffshoreV2 : mockBusinessPlanByViewOffshore

  var dataMap = {
    'Total': mockBusinessPlanByViewTotal,
    'OB': mockBusinessPlanByViewOB,
    'Onsite': mockBusinessPlanByViewOnsite,
    'Offshore': offshoreData,
  }

  var data = dataMap[viewMode] || mockBusinessPlanByViewTotal
  return JSON.parse(JSON.stringify(data))
};


