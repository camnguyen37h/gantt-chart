# Business Plan - API & State Management Guide

> **Version:** 1.0  
> **Last Updated:** March 6, 2026  
> **Purpose:** Tổng hợp chi tiết các API và cách quản lý state trong Business Plan module

---

## 📋 Table of Contents

1. [API Endpoints Overview](#1-api-endpoints-overview)
2. [API Call Flow](#2-api-call-flow)
3. [AsyncThunk Implementations](#3-asyncthunk-implementations)
4. [Redux State Structure](#4-redux-state-structure)
5. [Reducer State Management](#5-reducer-state-management)
6. [Hook Usage Patterns](#6-hook-usage-patterns)
7. [Component Integration](#7-component-integration)
8. [Complete Flow Examples](#8-complete-flow-examples)

---

## 1. API Endpoints Overview

### 1.1 API Configuration Files

| File | Purpose | Endpoints |
|------|---------|-----------|
| **`src/lib/service/api/businessPlan.js`** | Real API endpoints (Production) | 55+ endpoints |
| **`src/lib/business-plan/mockBusinessPlanApi.js`** | Mock API (Development) | 18 functions |
| **`src/lib/business-plan/businessPlanApiConfig.js`** | Hybrid switcher | Auto-select Mock/Real |

### 1.2 API Endpoint Categories

```
Business Plan APIs (55+ endpoints)
│
├── 📂 General Operations (10 endpoints)
│   ├── getBusinessPlanDetail(id)          ✅ Mock Available
│   ├── getStatus()
│   ├── getVersion()
│   ├── getCustomerName()
│   ├── getBusinessPlanName()
│   ├── getProjectCode()
│   ├── getApprovalStep()
│   ├── postListBusinessPlanList()
│   ├── getBusinessPlanWorkflow()
│   └── approveRejectWO()
│
├── 📂 CRUD Operations (5 endpoints)
│   ├── saveDraft()
│   ├── submit()
│   ├── createNewVersion(id)
│   ├── getHistory(id)
│   └── getBusinessPlanSettingMaxKPI()
│
├── 📂 Revenue Planning (10 endpoints)
│   ├── getProductionRevenue()             ✅ Mock Available
│   ├── getOtherRevenue()                  ✅ Mock Available
│   ├── updateOtherRevenue()               ✅ Mock Available
│   ├── getSellingPlan()                   ✅ Mock Available
│   ├── submitBaselineRevenuePlan()
│   ├── getSummaryRevenuePlan()            ✅ Mock Available
│   ├── getListDUByVersionRevenue()
│   ├── getPositionRevenuePlan()
│   ├── getHistoryRevenuePlan(...)
│   └── getMMBillService()                 ✅ Mock Available
│
├── 📂 Delivery Planning (13 endpoints)
│   ├── getListDUByVersionDelivery()
│   ├── getSummaryDeliveryPlan()           ✅ Mock Available
│   ├── getLocationExchangeRate()
│   ├── getResourcesInformationDeliveryPlan()
│   ├── getResourcesInformationReference()
│   ├── getListResourceType()
│   ├── getListResource()
│   ├── getLocation()
│   ├── getEmployeeType()
│   ├── getEmployeePosition()              ✅ Mock Available
│   ├── getEmployeeRole()
│   ├── getOtherExpensesTable()
│   └── saveDeliveryPlan()
│
├── 📂 Documents & Comments (5 endpoints)
│   ├── getDocuments()
│   ├── uploadDocuments()
│   ├── deleteDocument(id)
│   ├── getBusinessPlanDetailComments()
│   └── postBusinessPlanDetailComment()
│
└── 📂 Lookup Data (8 endpoints)
    ├── getIndustryDomain()                ✅ Mock Available
    ├── getIndustryCurrency()              ✅ Mock Available
    ├── getUserAndDepartmentCollaborator()
    ├── getListDU()
    ├── getListBU()
    ├── getListGroupUpload()
    ├── getAllPositions()                  ✅ Mock Available
    └── getAllApprovalSteps()              ✅ Mock Available
```

### 1.3 API Endpoint Details

#### 1.3.1 General Operations

| Endpoint | Method | URL | Description | Mock |
|----------|--------|-----|-------------|------|
| `getBusinessPlanDetail(id)` | GET | `/api/business-plan/detail/:id` | Lấy chi tiết Business Plan | ✅ |
| `getStatus()` | GET | `/api/business-plan/get-filter-status` | Lấy danh sách status | ❌ |
| `getVersion()` | GET | `/api/business-plan/get-filter-version` | Lấy danh sách version | ❌ |
| `getCustomerName()` | GET | `/api/business-plan/search-filter-customer-name` | Search customer | ❌ |
| `getBusinessPlanName()` | GET | `/api/business-plan/search-filter-business-plan-name` | Search BP name | ❌ |
| `getProjectCode()` | GET | `/api/business-plan/search-filter-project-code` | Search project code | ❌ |
| `getApprovalStep()` | GET | `/api/business-plan/get-filter-approval-step` | Lấy approval steps | ❌ |
| `postListBusinessPlanList()` | POST | `/api/business-plan/search-business-plan-version-list` | Search BP list | ❌ |
| `getBusinessPlanWorkflow()` | GET | `/api/business-plan/get-all-approval-steps` | Lấy workflow config | ❌ |
| `approveRejectWO()` | POST | `/api/business-plan/change-workflow` | Approve/Reject BP | ❌ |

#### 1.3.2 CRUD Operations

| Endpoint | Method | URL | Description | Mock |
|----------|--------|-----|-------------|------|
| `saveDraft()` | POST | `/api/business-plan/save` | Lưu draft | ❌ |
| `submit()` | POST | `/api/business-plan/submit` | Submit BP | ❌ |
| `createNewVersion(id)` | POST | `/api/business-plan/create-new-version/:id` | Tạo version mới | ❌ |
| `getHistory(id)` | GET | `/api/business-plan/history/:id` | Lấy lịch sử thay đổi | ❌ |
| `getBusinessPlanSettingMaxKPI()` | GET | `/api/business-plan/get-setting-max-kpi` | Lấy KPI settings | ❌ |

#### 1.3.3 Revenue Planning

| Endpoint | Method | URL | Description | Mock |
|----------|--------|-----|-------------|------|
| `getProductionRevenue()` | GET | `/api/business-plan/production-revenue` | Lấy production revenue | ✅ |
| `getOtherRevenue()` | GET | `/api/business-plan/other-revenue` | Lấy other revenue | ✅ |
| `updateOtherRevenue()` | POST | `/api/business-plan/other-revenue` | Cập nhật other revenue | ✅ |
| `getSellingPlan()` | GET | `/api/business-plan/selling-plan` | Lấy selling expenses | ✅ |
| `submitBaselineRevenuePlan()` | POST | `/api/business-plan/base-line-revenue-plan` | Submit baseline | ❌ |
| `getSummaryRevenuePlan()` | POST | `/api/revenue-plan/revenue-summary` | Tính tổng revenue | ✅ |
| `getListDUByVersionRevenue()` | GET | `/api/delivery-plan/filter-department-by-bp-version` | Lấy DU list | ❌ |
| `getPositionRevenuePlan()` | GET | `/api/revenue-plan/filter-position` | Lấy position list | ❌ |
| `getHistoryRevenuePlan(...)` | GET | `/api/business-plan-user-action-history/...` | Lấy history | ❌ |
| `getMMBillService()` | GET | `/api/business-plan/business-plan-mm-bills` | Lấy MM bills | ✅ |

#### 1.3.4 Delivery Planning

| Endpoint | Method | URL | Description | Mock |
|----------|--------|-----|-------------|------|
| `getResourcesInformationDeliveryPlan()` | POST | `/api/delivery-plan/get-list-delivery-plan-member` | Lấy resources | ❌ |
| `getSummaryDeliveryPlan()` | GET | `/api/delivery-plan/delivery-plan-summary` | Tính tổng delivery | ✅ |
| `getListResourceType()` | GET | `/api/delivery-plan/filter-resource-type` | Lấy resource types | ❌ |
| `getListResource()` | GET | `/api/delivery-plan/filter-resource` | Search resources | ❌ |
| `getLocation()` | GET | `/api/delivery-plan/filter-location` | Lấy locations | ❌ |
| `getEmployeeType()` | GET | `/api/delivery-plan/filter-employee-type` | Lấy employee types | ❌ |
| `getEmployeePosition()` | GET | `/api/delivery-plan/filter-position` | Lấy positions | ✅ |
| `getEmployeeRole()` | GET | `/api/delivery-plan/filter-role` | Lấy roles | ❌ |
| `getOtherExpensesTable()` | POST | `/api/delivery-plan/get-other-expenses-table` | Lấy other expenses | ❌ |
| `saveDeliveryPlan()` | POST | `/api/delivery-plan/save` | Lưu delivery plan | ❌ |

---

## 2. API Call Flow

### 2.1 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT LAYER                                     │
│  User Action → Component Event Handler → Hook Method Call                  │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ dispatch(asyncThunk())
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HOOK LAYER                                          │
│  Custom Hook wraps dispatch call, provides formatted data                  │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ dispatch(createAsyncThunk())
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REDUX THUNK LAYER                                   │
│  AsyncThunk: Call API, handle errors, return data                          │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │  createAsyncThunk('get/getBusinessPlanDetail', async (id) => {│          │
│  │    const result = await Request(                             │          │
│  │      BUSINESS_PLAN_API.getBusinessPlanDetail(id)             │          │
│  │    );                                                         │          │
│  │    if (result.status === 200) return result.data;            │          │
│  │  })                                                           │          │
│  └──────────────────────────────────────────────────────────────┘          │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ Request(api)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REQUEST INTERCEPTOR                                 │
│  Check if Mock API → Call mock function OR Call real API                   │
│                                                                              │
│  if (api.__isMock) {                                                        │
│    return api.__mockFunction();  // Mock API                                │
│  } else {                                                                   │
│    return axios({...});          // Real API                                │
│  }                                                                           │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────┐
                    │   API Response Data         │
                    └────────────┬────────────────┘
                                 │
                                 │ Return to AsyncThunk
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REDUCER LAYER                                       │
│  ExtraReducers handle AsyncThunk lifecycle: pending → fulfilled → rejected │
│                                                                              │
│  extraReducers: (builder) => {                                              │
│    builder                                                                  │
│      .addCase(getBusinessPlanDetail.pending, (state) => {                  │
│        state.loading = true;                                                │
│      })                                                                     │
│      .addCase(getBusinessPlanDetail.fulfilled, (state, action) => {        │
│        state.businessPlanItems = action.payload.data;                      │
│        state.loading = false;                                               │
│      })                                                                     │
│      .addCase(getBusinessPlanDetail.rejected, (state) => {                 │
│        state.loading = false;                                               │
│      });                                                                    │
│  }                                                                           │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ State Updated
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REDUX STORE                                         │
│  Global state tree updated, all subscribers notified                       │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ useSelector detects change
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT RE-RENDER                                 │
│  Component reads new state via useSelector, UI updates                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 API Configuration Flow

```
businessPlanApiConfig.js (Hybrid Switcher)
    │
    ├─ USE_MOCK_API = true
    │   │
    │   ├─ Mock Endpoint exists? → Use Mock API
    │   │   └─ mockBusinessPlanApi.js function
    │   │
    │   └─ Mock Endpoint NOT exists? → Fallback to Real API
    │       └─ src/lib/service/api/businessPlan.js endpoint
    │
    └─ USE_MOCK_API = false
        └─ Use Real API only
            └─ src/lib/service/api/businessPlan.js endpoint
```

---

## 3. AsyncThunk Implementations

### 3.1 AsyncThunk File Structure

```
src/lib/business-plan/redux/asyncThunks/
│
├── businessDetails.js              # Main BP operations
│   ├── getBusinessPlanDetail
│   ├── getCompareBusinessPlanDetail
│   └── getBusinessPlanDetailVersion
│
├── businessPlanRevenue.js          # Revenue operations
│   ├── getBusinessPlanOtherRevenue
│   ├── postBusinessPlanOtherRevenue
│   ├── getBusinessPlanSellingExpenses
│   ├── postSubmitBaselineRevenuePlan
│   ├── getPositionRevenuePlan
│   ├── getListDUByVersionRevenue
│   └── getSummaryRevenuePlan
│
├── businessPlanDelivery.js         # Delivery operations
│   ├── getResourcesInformationDeliveryPlan
│   ├── getListResourceType
│   ├── getListResource
│   ├── getLocation
│   ├── getEmployeeType
│   ├── getEmployeePosition
│   ├── getEmployeeRole
│   ├── getOtherExpensesTable
│   ├── getSummaryDeliveryPlan
│   └── getListDUByVersionDelivery
│
├── businessGeneralInformation.js   # General info operations
│   ├── getIndustryDomain
│   ├── getIndustryCurrency
│   ├── getUserAndDepartmentCollaborator
│   └── getBusinessPlanSettingMaxKPI
│
├── businessApproval.js             # Approval workflow
│   └── fetchBusinessPlanWorkflow
│
├── businessComments.js             # Comments operations
│   ├── getBusinessPlanDetailComment
│   ├── postBusinessPlanComment
│   └── getBusinessPlanHistory
│
├── businessDocuments.js            # Document operations
│   └── (Document functions)
│
└── bussinessPlanHistoryThunks.js   # History operations
```

### 3.2 AsyncThunk Pattern

#### Pattern 1: Simple GET Request

```javascript
// File: redux/asyncThunks/businessDetails.js

import { createAsyncThunk } from '@reduxjs/toolkit'
import Request from '../../../service/request'
import { ResponseStatusCode } from '../../../service/constant'
import BUSINESS_PLAN_API from '../../businessPlanApiConfig'
import { NotificationManager } from 'react-notifications'

export const getBusinessPlanDetail = createAsyncThunk(
  'get/getBusinessPlanDetail',      // Action type
  async (id) => {                    // Payload creator function
    // 1. Call API via Request utility
    const result = await Request(
      BUSINESS_PLAN_API.getBusinessPlanDetail(id)
    )
    
    // 2. Check response status
    if (result.status === ResponseStatusCode.success) {
      // 3. Return data on success
      return { 
        data: result.data, 
        errorMessage: result.errorMessage 
      }
    } else {
      // 4. Handle errors
      if (result.status === ResponseStatusCode.forbidden) {
        window.location.href = '/error/access-deny'
      }
      return NotificationManager.error(result.message)
    }
  }
)
```

**Usage in Reducer:**

```javascript
// File: redux/reducers/businessDetails.js

import { getBusinessPlanDetail } from '../asyncThunks'

const businessDetailsSlice = createSlice({
  name: 'businessDetails',
  initialState,
  reducers: {
    // Synchronous actions...
  },
  extraReducers: (builder) => {
    builder
      // Handle getBusinessPlanDetail lifecycle
      .addCase(getBusinessPlanDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBusinessPlanDetail.fulfilled, (state, action) => {
        const { data } = action.payload;
        
        // Transform and store data
        state.businessPlanItems = transformBusinessPlanData(data);
        state.columns = data.businessPlanItem[0]?.columnLabels || [];
        state.projectCode = data.projectCode;
        state.status = data.status;
        state.version = data.version;
        state.loading = false;
      })
      .addCase(getBusinessPlanDetail.rejected, (state) => {
        state.loading = false;
      });
  }
});
```

#### Pattern 2: POST Request with Params

```javascript
// File: redux/asyncThunks/businessPlanRevenue.js

export const postBusinessPlanOtherRevenue = createAsyncThunk(
  'post/postBusinessPlanOtherRevenue',
  async ({ params, apiType }) => {      // Destructure params
    const result = await Request(
      BUSINESS_PLAN_API.updateOtherRevenue, 
      params
    )
    
    if (result.status === ResponseStatusCode.success) {
      return {
        data: result.data,
        errorMessage: result.errorMessage,
        httpStatus: result.status,
        apiType,                         // Pass through for reducer
      }
    } else {
      return NotificationManager.error(result.message)
    }
  }
)
```

**Usage in Reducer:**

```javascript
// File: redux/reducers/businessPlanRevenue.js

extraReducers: (builder) => {
  builder
    .addCase(postBusinessPlanOtherRevenue.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(postBusinessPlanOtherRevenue.fulfilled, (state, action) => {
      const { apiType, data } = action.payload;
      
      // Different handling based on apiType
      switch (apiType) {
        case API_TYPE.CREATE:
          state.createOtherRevenuesData = [];
          break;
        case API_TYPE.UPDATE:
          state.updateOtherRevenuesData = [];
          break;
        case API_TYPE.DELETE:
          state.deleteOtherRevenuesData = [];
          break;
      }
      
      state.isUpdated = state.isUpdated + 1;
      state.isLoading = false;
    })
    .addCase(postBusinessPlanOtherRevenue.rejected, (state) => {
      state.isLoading = false;
    });
}
```

#### Pattern 3: Multiple Params with Custom Error Handling

```javascript
// File: redux/asyncThunks/businessPlanRevenue.js

export const getPositionRevenuePlan = createAsyncThunk(
  'get/getPositionRevenuePlan',
  async (param) => {
    const result = await Request(
      BUSINESS_PLAN_API.getPositionRevenuePlan, 
      {
        name: param.text,
        mvv: param.projectCode,
      }
    )
    
    if (result.status === ResponseStatusCode.success) {
      // Transform data before returning
      return {
        data: result.data.map(item => ({
          id: item.id,
          text: item.name,
          value: item.id,
        })),
        errorMessage: result.errorMessage,
        httpStatus: result.status,
      }
    } else {
      NotificationManager.error(result.message)
    }
  }
)
```

### 3.3 All AsyncThunks by Module

#### 3.3.1 Business Details Module

| AsyncThunk | Action Type | API Endpoint | Purpose |
|------------|-------------|--------------|---------|
| `getBusinessPlanDetail` | `get/getBusinessPlanDetail` | `getBusinessPlanDetail(id)` | Lấy chi tiết BP |
| `getCompareBusinessPlanDetail` | `get/getCompareBusinessPlanDetail` | `getBusinessPlanDetail(id)` | Lấy BP để compare |
| `getBusinessPlanDetailVersion` | - | `getBusinessPlanDetail(id)` | Lấy BP version |

#### 3.3.2 Revenue Module

| AsyncThunk | Action Type | API Endpoint | Purpose |
|------------|-------------|--------------|---------|
| `getBusinessPlanOtherRevenue` | `get/getBusinessPlanOtherRevenue` | `getOtherRevenue()` | Lấy other revenue |
| `postBusinessPlanOtherRevenue` | `post/postBusinessPlanOtherRevenue` | `updateOtherRevenue()` | Cập nhật other revenue |
| `getBusinessPlanSellingExpenses` | `get/getBusinessPlanSellingExpenses` | `getSellingPlan()` | Lấy selling expenses |
| `postSubmitBaselineRevenuePlan` | `post/postSubmitBaselineRevenuePlan` | `submitBaselineRevenuePlan()` | Submit baseline |
| `getPositionRevenuePlan` | `get/getPositionRevenuePlan` | `getPositionRevenuePlan()` | Lấy position list |
| `getListDUByVersionRevenue` | `get/getListDUByVersionRevenue` | `getListDUByVersionRevenue()` | Lấy DU list |
| `getSummaryRevenuePlan` | `get/getSummaryRevenuePlan` | `getSummaryRevenuePlan()` | Tính tổng revenue |

#### 3.3.3 Delivery Module

| AsyncThunk | Action Type | API Endpoint | Purpose |
|------------|-------------|--------------|---------|
| `getResourcesInformationDeliveryPlan` | `get/getResourcesInformationDeliveryPlan` | `getResourcesInformationDeliveryPlan()` | Lấy resources |
| `getListResourceType` | `get/getListResourceType` | `getListResourceType()` | Lấy resource types |
| `getListResource` | `get/getListResource` | `getListResource()` | Search resources |
| `getLocation` | `get/getLocation` | `getLocation()` | Lấy locations |
| `getEmployeeType` | `get/getEmployeeType` | `getEmployeeType()` | Lấy employee types |
| `getEmployeePosition` | `get/getEmployeePosition` | `getEmployeePosition()` | Lấy positions |
| `getEmployeeRole` | `get/getEmployeeRole` | `getEmployeeRole()` | Lấy roles |
| `getOtherExpensesTable` | `get/getOtherExpensesTable` | `getOtherExpensesTable()` | Lấy other expenses |
| `getSummaryDeliveryPlan` | `get/getSummaryDeliveryPlan` | `getSummaryDeliveryPlan()` | Tính tổng delivery |

---

## 4. Redux State Structure

### 4.1 Complete State Tree

```javascript
// File: src/store/index.js

{
  // Main business plan data
  businessPlanDetails: {
    isSaveShowed: false,              // Show/hide save button
    businessPlanItems: {},            // Main form data (sections → rows → cells)
    columns: [],                      // Month labels (["Jan-25", "Feb-25", ...])
    exchangeRate: 23000,              // Exchange rate VND/USD
    totalContractPrice: 1000000,      // Total contract value
    softwareDevelopmentFee: 800000,   // Software dev fee
    otherFees: 200000,                // Other fees
    validation: {},                   // Validation errors
    projectCode: 'GLBTM2500093',      // Project code
    version: 1,                       // Current version
    status: 'APPROVED',               // BP status
    originalBusinessPlanItems: [],    // Backup for comparison
    compareBusinessPlanItems: null,   // Data for version compare
    listVersions: [],                 // Available versions
    startDate: '2025-01-01',          // Start date
    endDate: '2025-12-31',            // End date
    versionId: 436,                   // Version ID
    warningMessage: null,             // Warning messages
    activePanel: '',                  // Active collapse panel
    deliveryUnitDataDelivery: {},     // DU data for delivery
    deliveryUnitDataRevenue: {},      // DU data for revenue
  },

  // General information & collaborators
  businessGeneralInformation: {
    listAM: [],                       // Account Managers
    listPM: [],                       // Project Managers
    listTeamLead: [],                 // Team Leads
    listPreSale: [],                  // Pre-sale members
    listPreparator: [],               // Preparators
    listAdviser: [],                  // Advisers
    industryCurrency: 'VND',          // Currency
    industryDomain: 'Finance',        // Industry domain
    businessPlanKpiDTO: {},           // KPI data
    loadingCollaborator: false,       // Loading state
  },

  // Revenue planning data
  businessPlanRevenue: {
    dataSourceTableRevenue: [],       // Revenue table data
    errorMessage: '',                 // Error messages
    isLoading: false,                 // Loading state
    isSaveConfirmShowed: false,       // Save indicator
    updateOtherRevenuesData: [],      // Update queue
    deleteOtherRevenuesData: [],      // Delete queue
    createOtherRevenuesData: [],      // Create queue
    isUpdated: 0,                     // Update counter
    
    dataSourceTableSellingExpenses: [], // Selling expenses data
    updateSellingExpensesData: [],    // Update queue
    deleteSellingExpensesData: [],    // Delete queue
    createSellingExpensesData: [],    // Create queue
    isUpdatedSellingExpenses: 0,      // Update counter
    isLoadingSellingExpenses: false,  // Loading state
    
    filtersRevenue: {},               // Filter values
    dataFilterPosition: [],           // Position filter options
    isLoadingFilterPosition: false,   // Loading state
    isSubmitBaseline: 0,              // Submit counter
    listRevenueInvalid: [],           // Validation errors
    
    summaryRevenuePlan: {             // Revenue summary
      mmBill: '',
      softwareProductionRevenues: '',
      deduction: '',
      onsiteFee: '',
      equipmentRevenue: '',
      otherRevenues: '',
      agencyExpenses: '',
      loading: false,
    },
    
    listDuRevenue: [],                // DU list
    deliveryUnitDataRevenue: {},      // DU data
    duValueRevenue: undefined,        // Selected DU
  },

  // Delivery planning data
  businessPlanDelivery: {
    dataResourcesInformation: {},     // Resources data
    listDUDelivery: [],               // DU list
    deliveryUnitDataDelivery: {},     // DU data
    duValueDelivery: undefined,       // Selected DU
    isSaveShowedDeliveryPlan: false,  // Save indicator
    dataCreateRequest: [],            // Create queue
    dataUpdateRequest: [],            // Update queue
    dataDeleteRequest: [],            // Delete queue
    
    // Lookup data
    listResourceType: [],             // Resource types
    listResource: [],                 // Resources
    listLocation: [],                 // Locations
    listEmployeeType: [],             // Employee types
    listEmployeePosition: [],         // Positions
    listEmployeeRole: [],             // Roles
    listLocationExchangeRateData: [], // Exchange rates by location
    
    // Other expenses
    dataOtherExpensesTable: {},       // Other expenses data
    
    // Summary
    summaryDeliveryPlan: {
      mmEffort: '',
      laborCost: '',
      otherExpenses: '',
      deliveryCost: '',
      loading: false,
    },
    
    // Loading states
    loadingResourcesInformation: false,
    loadingListResourceType: false,
    loadingListResource: false,
    loadingListLocation: false,
    loadingListEmployeeType: false,
    loadingListEmployeePosition: false,
    loadingListEmployeeRole: false,
  },

  // Approval workflow data
  businessApproval: {
    listApprovals: [],                // Approval steps
    currentStep: null,                // Current step
    loadingApproval: false,           // Loading state
  },

  // Documents
  businessDocuments: {
    listDocuments: [],                // Document list
  },
}
```

### 4.2 State Shape Explanation

#### 4.2.1 businessPlanItems Structure

```javascript
businessPlanItems: {
  // Section key
  SOFTWARE_PRODUCTION_REVENUE: {
    sectionKey: 'SOFTWARE_PRODUCTION_REVENUE',
    sectionName: 'Software Production Revenue',
    data: {
      // Row key
      UNIT_PRICE_DU: {
        label: 'Unit Price DU',
        rowKey: 'UNIT_PRICE_DU',
        data: [
          // Cell data
          {
            columnKey: 'Jan-25',
            value: 100,
            type: 'NUMBER',
            sectionKey: 'SOFTWARE_PRODUCTION_REVENUE',
            rowKey: 'UNIT_PRICE_DU',
            id: null,
            refFeeId: null,
            isEditable: true,
          },
          // ... more months
        ]
      },
      MM_BILL_DU: {
        label: 'MM Bill DU',
        rowKey: 'MM_BILL_DU',
        data: [...]
      },
      // ... more rows
    }
  },
  OTHER_REVENUE: {
    // ... similar structure
  },
  SELLING_EXPENSES: {
    // ... similar structure
  }
}
```

#### 4.2.2 Data Access Pattern

```javascript
// Access cell value
const cellValue = state.businessPlanDetails
  .businessPlanItems
  ['SOFTWARE_PRODUCTION_REVENUE']
  .data['UNIT_PRICE_DU']
  .data.find(cell => cell.columnKey === 'Jan-25')
  .value;

// Access row label
const rowLabel = state.businessPlanDetails
  .businessPlanItems
  ['SOFTWARE_PRODUCTION_REVENUE']
  .data['UNIT_PRICE_DU']
  .label;

// Access all cells in a row
const rowCells = state.businessPlanDetails
  .businessPlanItems
  ['SOFTWARE_PRODUCTION_REVENUE']
  .data['UNIT_PRICE_DU']
  .data;
```

---

## 5. Reducer State Management

### 5.1 Reducer File Structure

```
src/lib/business-plan/redux/reducers/
│
├── businessDetails.js              # Main BP state
├── businessPlanRevenue.js          # Revenue state
├── businessPlanDelivery.js         # Delivery state
├── businessGeneralInformation.js   # General info state
├── businessApproval.js             # Approval state
└── index.js                        # Export all reducers
```

### 5.2 businessDetails Reducer

**File:** `redux/reducers/businessDetails.js`

```javascript
import { createSlice } from '@reduxjs/toolkit'
import {
  getBusinessPlanDetail,
  getCompareBusinessPlanDetail,
  getSpecificPermission,
} from '../asyncThunks'

const initialState = {
  isSaveShowed: false,
  businessPlanItems: {},
  columns: [],
  exchangeRate: null,
  totalContractPrice: null,
  // ... other fields
}

const businessDetailsSlice = createSlice({
  name: 'businessDetails',
  initialState,
  
  // ===== SYNCHRONOUS ACTIONS =====
  reducers: {
    // Toggle save button visibility
    setIsSaveShowed: (state, action) => {
      state.isSaveShowed = action.payload
    },
    
    // Set entire business plan items
    setBusinessPlanItems: (state, { payload }) => {
      state.businessPlanItems = payload
    },
    
    // Update single cell
    setBusinessPlanItem: (state, { payload }) => {
      const { item } = payload
      const { rowKey, sectionKey, columnKey } = item
      
      // Find cell index
      const cellIndex = state.businessPlanItems[sectionKey]
        .data[rowKey]
        .data.findIndex(obj => obj.columnKey === columnKey)
      
      // Update cell
      if (cellIndex > -1) {
        state.businessPlanItems[sectionKey]
          .data[rowKey]
          .data[cellIndex] = item
      }
    },
    
    // Add new row
    addBusinessPlanRow: (state, { payload }) => {
      const { sectionKey, rowKey, row } = payload
      state.businessPlanItems[sectionKey].data[rowKey] = row
    },
    
    // Update entire row
    updateBusinessPlanRow: (state, { payload }) => {
      const { sectionKey, rowKey, row } = payload
      state.businessPlanItems[sectionKey].data[rowKey] = row
    },
    
    // Delete row
    deleteBusinessPlanRow: (state, { payload }) => {
      const { sectionKey, rowKey } = payload
      delete state.businessPlanItems[sectionKey].data[rowKey]
    },
    
    // Set validation errors
    setValidation: (state, action) => {
      state.validation = action.payload
    },
    
    // ... more synchronous actions
  },
  
  // ===== ASYNCHRONOUS ACTIONS (ExtraReducers) =====
  extraReducers: (builder) => {
    builder
      // Handle getBusinessPlanDetail
      .addCase(getBusinessPlanDetail.pending, (state) => {
        state.loading = true
      })
      .addCase(getBusinessPlanDetail.fulfilled, (state, action) => {
        const { data } = action.payload
        
        // Transform API response to state structure
        state.businessPlanItems = transformBusinessPlanData(data)
        state.columns = data.businessPlanItem[0]?.columnLabels || []
        state.projectCode = data.projectCode
        state.status = data.status
        state.version = data.version
        state.versionId = data.id
        state.startDate = data.startDate
        state.endDate = data.endDate
        state.exchangeRate = data.generalInfo?.exchangeRate
        state.totalContractPrice = data.generalInfo?.totalContractPrice
        state.originalBusinessPlanItems = data.businessPlanItem
        
        state.loading = false
      })
      .addCase(getBusinessPlanDetail.rejected, (state) => {
        state.loading = false
      })
      
      // Handle getCompareBusinessPlanDetail
      .addCase(getCompareBusinessPlanDetail.fulfilled, (state, action) => {
        state.compareBusinessPlanItems = transformBusinessPlanData(action.payload)
      })
      
      // ... more async handlers
  }
})

// Export synchronous actions
export const {
  setIsSaveShowed,
  setBusinessPlanItems,
  setBusinessPlanItem,
  addBusinessPlanRow,
  updateBusinessPlanRow,
  deleteBusinessPlanRow,
  setValidation,
} = businessDetailsSlice.actions

// Export reducer
export default businessDetailsSlice.reducer
```

### 5.3 businessPlanRevenue Reducer

**File:** `redux/reducers/businessPlanRevenue.js`

```javascript
import { createSlice } from '@reduxjs/toolkit'
import {
  getBusinessPlanOtherRevenue,
  postBusinessPlanOtherRevenue,
  getBusinessPlanSellingExpenses,
  getSummaryRevenuePlan,
  getListDUByVersionRevenue,
} from '../asyncThunks'

const initialState = {
  dataSourceTableRevenue: undefined,
  isLoading: false,
  isSaveConfirmShowed: false,
  updateOtherRevenuesData: [],
  deleteOtherRevenuesData: [],
  createOtherRevenuesData: [],
  isUpdated: 0,
  // ... more fields
}

const businessPlanRevenueSlice = createSlice({
  name: 'businessPlanRevenue',
  initialState,
  
  reducers: {
    // Set revenue table data
    setDataSourceTableRevenue: (state, action) => {
      state.dataSourceTableRevenue = action.payload
    },
    
    // Set filter values
    setFiltersRevenue: (state, action) => {
      state.filtersRevenue = action.payload
    },
    
    // Toggle save indicator
    setIsSaveConfirmShowed: (state, action) => {
      state.isSaveConfirmShowed = action.payload
    },
    
    // Add to update queue
    addOrUpdateOtherRevenue: (state, action) => {
      const { data } = action.payload
      const existingIndex = state.updateOtherRevenuesData.findIndex(
        item => item.id === data.id
      )
      
      if (existingIndex > -1) {
        state.updateOtherRevenuesData[existingIndex] = data
      } else {
        state.updateOtherRevenuesData.push(data)
      }
    },
    
    // Add to delete queue
    addDeleteOtherRevenue: (state, action) => {
      state.deleteOtherRevenuesData.push(action.payload)
    },
    
    // ... more synchronous actions
  },
  
  extraReducers: (builder) => {
    builder
      // Get other revenue
      .addCase(getBusinessPlanOtherRevenue.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getBusinessPlanOtherRevenue.fulfilled, (state, action) => {
        state.dataSourceTableRevenue = action.payload.data
        state.isLoading = false
      })
      .addCase(getBusinessPlanOtherRevenue.rejected, (state) => {
        state.isLoading = false
      })
      
      // Save other revenue
      .addCase(postBusinessPlanOtherRevenue.fulfilled, (state, action) => {
        const { apiType } = action.payload
        
        // Clear queues based on API type
        switch (apiType) {
          case 'CREATE':
            state.createOtherRevenuesData = []
            break
          case 'UPDATE':
            state.updateOtherRevenuesData = []
            break
          case 'DELETE':
            state.deleteOtherRevenuesData = []
            break
        }
        
        state.isUpdated = state.isUpdated + 1
      })
      
      // Get revenue summary
      .addCase(getSummaryRevenuePlan.pending, (state) => {
        state.summaryRevenuePlan.loading = true
      })
      .addCase(getSummaryRevenuePlan.fulfilled, (state, action) => {
        const summary = action.payload.data
        
        state.summaryRevenuePlan = {
          mmBill: summary.mmBill,
          softwareProductionRevenues: summary.softwareProductionRevenues,
          deduction: summary.deduction,
          onsiteFee: summary.onsiteFee,
          equipmentRevenue: summary.equipmentRevenue,
          otherRevenues: summary.otherRevenues,
          agencyExpenses: summary.agencyExpenses,
          loading: false,
        }
      })
      
      // ... more async handlers
  }
})

export const {
  setDataSourceTableRevenue,
  setFiltersRevenue,
  setIsSaveConfirmShowed,
  addOrUpdateOtherRevenue,
  addDeleteOtherRevenue,
} = businessPlanRevenueSlice.actions

export default businessPlanRevenueSlice.reducer
```

### 5.4 Reducer Action Types

#### 5.4.1 Synchronous Actions (Reducers)

| Reducer | Action | Purpose |
|---------|--------|---------|
| **businessDetails** | `setIsSaveShowed(boolean)` | Toggle save button |
| | `setBusinessPlanItems(items)` | Set all items |
| | `setBusinessPlanItem(item)` | Update single cell |
| | `addBusinessPlanRow(row)` | Add new row |
| | `updateBusinessPlanRow(row)` | Update row |
| | `deleteBusinessPlanRow(rowKey)` | Delete row |
| | `setValidation(errors)` | Set validation errors |
| **businessPlanRevenue** | `setDataSourceTableRevenue(data)` | Set revenue data |
| | `setFiltersRevenue(filters)` | Set filters |
| | `addOrUpdateOtherRevenue(data)` | Queue update |
| | `addDeleteOtherRevenue(id)` | Queue delete |
| **businessPlanDelivery** | `setDataResourcesInformation(data)` | Set resources |
| | `addOrUpdateCreateResource(data)` | Queue create |
| | `addOrUpdateUpdateResource(data)` | Queue update |
| | `addDeleteResource(id)` | Queue delete |

#### 5.4.2 Asynchronous Actions (ExtraReducers)

| AsyncThunk | States Handled | State Changes |
|------------|----------------|---------------|
| `getBusinessPlanDetail` | pending, fulfilled, rejected | `loading`, `businessPlanItems`, `columns`, `projectCode` |
| `getBusinessPlanOtherRevenue` | pending, fulfilled, rejected | `isLoading`, `dataSourceTableRevenue` |
| `postBusinessPlanOtherRevenue` | fulfilled | `updateOtherRevenuesData`, `isUpdated` |
| `getSummaryRevenuePlan` | pending, fulfilled | `summaryRevenuePlan.loading`, `summaryRevenuePlan.*` |
| `getResourcesInformationDeliveryPlan` | pending, fulfilled, rejected | `loadingResourcesInformation`, `dataResourcesInformation` |

---

## 6. Hook Usage Patterns

### 6.1 Custom Hook Structure

**File:** `hooks/useBusinessPlanDetails.js`

```javascript
import * as redux from '../redux'
import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'

const useBusinessPlanDetails = () => {
  const dispatch = useDispatch()

  // ===== SELECT STATE FROM REDUX =====
  const {
    isSaveShowed,
    businessPlanItems,
    columns,
    projectCode,
    status,
    version,
    versionId,
    exchangeRate,
    totalContractPrice,
    validation,
  } = useSelector(state => state.businessPlanDetails)

  const {
    listAM,
    listPM,
    listTeamLead,
    industryCurrency,
    industryDomain,
  } = useSelector(state => state.businessGeneralInformation)

  // ===== DISPATCH SYNCHRONOUS ACTIONS =====
  const updateIsSaveShowed = useCallback(
    (value) => {
      dispatch(redux.setIsSaveShowed(value))
    },
    [dispatch]
  )

  const updateBusinessPlanItem = useCallback(
    (item) => {
      dispatch(redux.setBusinessPlanItem({ item }))
      dispatch(redux.setIsSaveShowed(true))
    },
    [dispatch]
  )

  // ===== DISPATCH ASYNC THUNKS =====
  const getBusinessPlanDetail = useCallback(
    (id) => {
      return dispatch(redux.getBusinessPlanDetail(id))
    },
    [dispatch]
  )

  const saveDraft = useCallback(
    async (params) => {
      const result = await dispatch(redux.saveDraft(params))
      
      if (result.type.includes('fulfilled')) {
        NotificationManager.success('Save draft successfully')
        updateIsSaveShowed(false)
      }
      
      return result
    },
    [dispatch]
  )

  const submit = useCallback(
    async (params) => {
      const result = await dispatch(redux.submit(params))
      
      if (result.type.includes('fulfilled')) {
        NotificationManager.success('Submit successfully')
        updateIsSaveShowed(false)
      }
      
      return result
    },
    [dispatch]
  )

  // ===== COMPUTED VALUES =====
  const generalInformationParams = {
    listAM: formatCollaborators(listAM),
    listPM: formatCollaborators(listPM),
    listTeamLead: formatCollaborators(listTeamLead),
    currency: industryCurrency,
    exchangeRate,
    totalContractPrice,
    // ...
  }

  // ===== RETURN HOOK API =====
  return {
    // State
    isSaveShowed,
    businessPlanItems,
    columns,
    projectCode,
    status,
    version,
    validation,
    
    // Actions
    updateIsSaveShowed,
    updateBusinessPlanItem,
    getBusinessPlanDetail,
    saveDraft,
    submit,
    
    // Computed
    generalInformationParams,
  }
}

export default useBusinessPlanDetails
```

### 6.2 Hook Usage in Components

```javascript
// File: BusinessPlanDetail/index.jsx

import { useBusinessPlanDetails } from '../hooks'

function BusinessPlanDetail({ match }) {
  // 1. Get everything from hook
  const {
    isSaveShowed,
    businessPlanItems,
    projectCode,
    status,
    columns,
    getBusinessPlanDetail,
    updateBusinessPlanItem,
    saveDraft,
    submit,
    updateIsSaveShowed,
  } = useBusinessPlanDetails()

  // 2. Fetch data on mount
  useEffect(() => {
    if (match.params.buId) {
      getBusinessPlanDetail(match.params.buId)
    }
  }, [match.params.buId, getBusinessPlanDetail])

  // 3. Handle cell change
  const handleCellChange = (value, sectionKey, rowKey, columnKey) => {
    const updatedItem = {
      sectionKey,
      rowKey,
      columnKey,
      value,
      type: 'NUMBER',
    }
    
    updateBusinessPlanItem(updatedItem)
  }

  // 4. Handle save
  const handleSave = async () => {
    const params = {
      businessPlanVersionId: match.params.buId,
      businessPlanItem: businessPlanItems,
      // ...
    }
    
    await saveDraft(params)
  }

  // 5. Render
  return (
    <div>
      <h1>Business Plan: {projectCode}</h1>
      <span>Status: {status}</span>
      
      {/* Form sections */}
      <BusinessPlanFormSection
        businessPlanItems={businessPlanItems}
        columns={columns}
        onCellChange={handleCellChange}
      />
      
      {/* Save button */}
      {isSaveShowed && (
        <Button onClick={handleSave}>Save</Button>
      )}
    </div>
  )
}
```

### 6.3 All Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useBusinessPlanDetails` | `hooks/useBusinessPlanDetails.js` | Main BP operations |
| `useBusinessPlanRevenue` | `hooks/useBusinessPlanRevenue.js` | Revenue operations |
| `useBusinessPlanDelivery` | `hooks/useBusinessPlanDelivery.js` | Delivery operations |
| `useBusinessPlanForm` | `hooks/useBusinessPlanForm.js` | Form operations |
| `useBusinessPlanStep` | `hooks/useBusinessPlanStep.js` | Workflow operations |
| `useFormula` | `hooks/useFormula.js` | Calculation formulas |

---

## 7. Component Integration

### 7.1 Component → Hook → Redux Flow

```javascript
┌─────────────────────────────────────────────────────────────────┐
│                          COMPONENT                              │
│                                                                  │
│  function BusinessPlanDetail() {                                │
│    // 1. Get data & actions from hook                           │
│    const {                                                       │
│      businessPlanItems,  // ← From Redux state                  │
│      updateBusinessPlanItem,  // ← Dispatch action              │
│    } = useBusinessPlanDetails()                                 │
│                                                                  │
│    // 2. User interaction handler                               │
│    const handleCellChange = (value, rowKey, columnKey) => {    │
│      updateBusinessPlanItem({ value, rowKey, columnKey })      │
│    }                                                             │
│                                                                  │
│    // 3. Render UI with state                                   │
│    return <Input value={cellValue} onChange={handleCellChange}/>│
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ useBusinessPlanDetails()
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                            HOOK                                 │
│                                                                  │
│  const useBusinessPlanDetails = () => {                         │
│    const dispatch = useDispatch()                               │
│                                                                  │
│    // 1. Select state                                           │
│    const businessPlanItems = useSelector(                       │
│      state => state.businessPlanDetails.businessPlanItems       │
│    )                                                             │
│                                                                  │
│    // 2. Wrap dispatch                                          │
│    const updateBusinessPlanItem = useCallback((item) => {       │
│      dispatch(redux.setBusinessPlanItem({ item }))              │
│      dispatch(redux.setIsSaveShowed(true))                      │
│    }, [dispatch])                                                │
│                                                                  │
│    // 3. Return API                                             │
│    return { businessPlanItems, updateBusinessPlanItem }         │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ dispatch(action)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                          REDUX REDUCER                          │
│                                                                  │
│  reducers: {                                                     │
│    setBusinessPlanItem: (state, { payload }) => {               │
│      const { item } = payload                                   │
│      const { sectionKey, rowKey, columnKey, value } = item      │
│                                                                  │
│      // Find cell and update                                    │
│      const cellIndex = state.businessPlanItems[sectionKey]      │
│        .data[rowKey]                                             │
│        .data.findIndex(obj => obj.columnKey === columnKey)      │
│                                                                  │
│      if (cellIndex > -1) {                                      │
│        state.businessPlanItems[sectionKey]                      │
│          .data[rowKey]                                           │
│          .data[cellIndex] = item                                │
│      }                                                           │
│    },                                                            │
│                                                                  │
│    setIsSaveShowed: (state, action) => {                        │
│      state.isSaveShowed = action.payload                        │
│    }                                                             │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ State Updated
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        REDUX STORE                              │
│                                                                  │
│  {                                                               │
│    businessPlanDetails: {                                       │
│      isSaveShowed: true,     ← Updated                          │
│      businessPlanItems: {                                       │
│        SOFTWARE_PRODUCTION_REVENUE: {                           │
│          data: {                                                 │
│            UNIT_PRICE_DU: {                                     │
│              data: [                                             │
│                { columnKey: 'Jan-25', value: 150 }  ← Updated   │
│              ]                                                   │
│            }                                                     │
│          }                                                       │
│        }                                                         │
│      }                                                           │
│    }                                                             │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ useSelector detects change
                             ▼
                   Component Re-renders with new data
```

---

## 8. Complete Flow Examples

### 8.1 Example 1: Load Business Plan on Page Load

**Scenario:** User navigates to `/business-plan/436`

```javascript
// ===== STEP 1: Component Mount =====
// File: BusinessPlanDetail/index.jsx

function BusinessPlanDetail({ match }) {
  const { getBusinessPlanDetail, businessPlanItems } = useBusinessPlanDetails()

  useEffect(() => {
    // Trigger API call when buId available
    if (match.params.buId) {
      getBusinessPlanDetail(match.params.buId)  // buId = 436
    }
  }, [match.params.buId])

  return <div>{/* Render UI */}</div>
}

// ===== STEP 2: Hook Dispatches AsyncThunk =====
// File: hooks/useBusinessPlanDetails.js

const getBusinessPlanDetail = useCallback(
  (id) => {
    return dispatch(redux.getBusinessPlanDetail(id))
  },
  [dispatch]
)

// ===== STEP 3: AsyncThunk Calls API =====
// File: redux/asyncThunks/businessDetails.js

export const getBusinessPlanDetail = createAsyncThunk(
  'get/getBusinessPlanDetail',
  async (id) => {
    const result = await Request(
      BUSINESS_PLAN_API.getBusinessPlanDetail(id)  // Call API
    )
    
    if (result.status === 200) {
      return { data: result.data }
    }
  }
)

// ===== STEP 4: Request Interceptor =====
// File: service/request.js

const Request = (api, data) => {
  // Check if Mock API
  if (api.__isMock && api.__mockFunction) {
    console.log('🔷 Mock API Call:', api.url)
    return api.__mockFunction()  // Call Mock API
  }
  
  // Otherwise call Real API
  return axios(api)
}

// ===== STEP 5: Mock API Returns Data =====
// File: business-plan/mockBusinessPlanApi.js

export const getBusinessPlanDetail = async (businessPlanId) => {
  await delay(500)  // Simulate network
  
  return {
    status: 200,
    message: 'Success',
    data: mockBusinessPlanDetail  // Return mock data
  }
}

// ===== STEP 6: Reducer Handles Response =====
// File: redux/reducers/businessDetails.js

extraReducers: (builder) => {
  builder
    .addCase(getBusinessPlanDetail.pending, (state) => {
      state.loading = true
    })
    .addCase(getBusinessPlanDetail.fulfilled, (state, action) => {
      const { data } = action.payload
      
      // Transform and store data
      state.businessPlanItems = transformBusinessPlanData(data)
      state.columns = data.businessPlanItem[0]?.columnLabels || []
      state.projectCode = data.projectCode
      state.status = data.status
      state.version = data.version
      state.loading = false
    })
}

// ===== STEP 7: Component Re-renders =====
// useSelector detects state change and component updates

// Component receives new businessPlanItems and renders
```

**Console Output:**

```
🔷 Using Mock API for: getBusinessPlanDetail
🔷 Mock API Call: MOCK_API:getBusinessPlanDetail
```

**State Before:**

```javascript
{
  businessPlanDetails: {
    businessPlanItems: {},
    projectCode: '',
    status: null,
    loading: false
  }
}
```

**State After:**

```javascript
{
  businessPlanDetails: {
    businessPlanItems: {
      SOFTWARE_PRODUCTION_REVENUE: { ... },
      OTHER_REVENUE: { ... },
      SELLING_EXPENSES: { ... }
    },
    projectCode: 'GLBTM2500093',
    status: 'APPROVED',
    loading: false
  }
}
```

---

### 8.2 Example 2: Update Revenue Cell

**Scenario:** User changes Unit Price DU for Jan-25 from 100 to 150

```javascript
// ===== STEP 1: User Input =====
// File: BusinessPlanDetail/BusinessPlanFormSection/index.jsx

<InputNumber
  value={cellValue}  // Current: 100
  onChange={(value) => handleCellChange(value, 'SOFTWARE_PRODUCTION_REVENUE', 'UNIT_PRICE_DU', 'Jan-25')}
/>
// User types: 150

// ===== STEP 2: Component Handler =====
const handleCellChange = (value, sectionKey, rowKey, columnKey) => {
  const updatedItem = {
    sectionKey,
    rowKey,
    columnKey,
    value: 150,
    type: 'NUMBER',
  }
  
  // Call hook method
  updateBusinessPlanItem(updatedItem)
}

// ===== STEP 3: Hook Dispatches Action =====
// File: hooks/useBusinessPlanDetails.js

const updateBusinessPlanItem = useCallback(
  (item) => {
    // Dispatch update action
    dispatch(redux.setBusinessPlanItem({ item }))
    
    // Show save button
    dispatch(redux.setIsSaveShowed(true))
  },
  [dispatch]
)

// ===== STEP 4: Reducer Updates State =====
// File: redux/reducers/businessDetails.js

setBusinessPlanItem: (state, { payload }) => {
  const { item } = payload
  const { sectionKey, rowKey, columnKey } = item
  
  // Find cell index
  const cellIndex = state.businessPlanItems[sectionKey]
    .data[rowKey]
    .data.findIndex(obj => obj.columnKey === columnKey)
  
  // Update cell value
  if (cellIndex > -1) {
    state.businessPlanItems[sectionKey]
      .data[rowKey]
      .data[cellIndex] = item
  }
},

setIsSaveShowed: (state, action) => {
  state.isSaveShowed = true
}

// ===== STEP 5: Component Re-renders =====
// Input shows new value: 150
// Save button appears at bottom
```

**State Change:**

```javascript
// Before
state.businessPlanItems.SOFTWARE_PRODUCTION_REVENUE
  .data.UNIT_PRICE_DU
  .data[0] = { columnKey: 'Jan-25', value: 100 }

state.isSaveShowed = false

// After
state.businessPlanItems.SOFTWARE_PRODUCTION_REVENUE
  .data.UNIT_PRICE_DU
  .data[0] = { columnKey: 'Jan-25', value: 150 }  // Updated

state.isSaveShowed = true  // Save button shows
```

---

### 8.3 Example 3: Save Other Revenue

**Scenario:** User clicks "Save" after editing Other Revenue table

```javascript
// ===== STEP 1: User Action =====
<Button onClick={handleSaveOtherRevenue}>Save</Button>

// ===== STEP 2: Component Handler =====
const handleSaveOtherRevenue = async () => {
  setLoadingSave(true)
  
  // Collect queued changes
  const params = {
    businessPlanVersionId: buId,
    deliveryUnit: deliveryUnit.groupName,
    dataCreateRequest: createOtherRevenuesData,
    dataUpdateRequest: updateOtherRevenuesData,
    dataDeleteRequest: deleteOtherRevenuesData,
  }
  
  // Call hook method
  const result = await saveOtherRevenue(params)
  
  if (result.type.includes('fulfilled')) {
    // Refresh data after save
    await getBusinessPlanOtherRevenue({ businessPlanVersionId: buId })
  }
  
  setLoadingSave(false)
}

// ===== STEP 3: Hook Dispatches AsyncThunk =====
// File: hooks/useBusinessPlanRevenue.js

const saveOtherRevenue = useCallback(
  async (params) => {
    return dispatch(redux.postBusinessPlanOtherRevenue({
      params,
      apiType: 'UPDATE'
    }))
  },
  [dispatch]
)

// ===== STEP 4: AsyncThunk Calls API =====
// File: redux/asyncThunks/businessPlanRevenue.js

export const postBusinessPlanOtherRevenue = createAsyncThunk(
  'post/postBusinessPlanOtherRevenue',
  async ({ params, apiType }) => {
    const result = await Request(
      BUSINESS_PLAN_API.updateOtherRevenue,
      params
    )
    
    if (result.status === 200) {
      return {
        data: result.data,
        apiType,  // Pass through for reducer
      }
    }
  }
)

// ===== STEP 5: Mock API Saves Data =====
// File: business-plan/mockBusinessPlanApi.js

export const saveOtherRevenue = async (businessPlanId, revenueData) => {
  await delay(300)
  
  // Update in-memory store
  otherRevenueStore.set(businessPlanId, revenueData)
  
  return {
    status: 200,
    message: 'Save successfully'
  }
}

// ===== STEP 6: Reducer Handles Success =====
// File: redux/reducers/businessPlanRevenue.js

extraReducers: (builder) => {
  builder
    .addCase(postBusinessPlanOtherRevenue.fulfilled, (state, action) => {
      const { apiType } = action.payload
      
      // Clear queues based on type
      switch (apiType) {
        case 'CREATE':
          state.createOtherRevenuesData = []
          break
        case 'UPDATE':
          state.updateOtherRevenuesData = []  // Clear update queue
          break
        case 'DELETE':
          state.deleteOtherRevenuesData = []
          break
      }
      
      state.isUpdated = state.isUpdated + 1  // Trigger refresh
    })
}

// ===== STEP 7: Component Refreshes Data =====
// isUpdated counter changed, useEffect triggered
useEffect(() => {
  if (isUpdated > 0) {
    getBusinessPlanOtherRevenue({ businessPlanVersionId: buId })
  }
}, [isUpdated])

// ===== STEP 8: Success Notification =====
NotificationManager.success('Save successfully')
```

**State Changes:**

```javascript
// Before Save
{
  businessPlanRevenue: {
    updateOtherRevenuesData: [
      { id: 123, value: 50000 },
      { id: 124, value: 60000 }
    ],
    isUpdated: 0
  }
}

// After Save
{
  businessPlanRevenue: {
    updateOtherRevenuesData: [],  // Cleared
    isUpdated: 1  // Incremented
  }
}
```

---

## 9. Best Practices

### 9.1 API Call Best Practices

✅ **DO:**

```javascript
// Use config for API imports
import BUSINESS_PLAN_API from '../../businessPlanApiConfig'

// Handle all response states
extraReducers: (builder) => {
  builder
    .addCase(asyncThunk.pending, (state) => {
      state.loading = true
    })
    .addCase(asyncThunk.fulfilled, (state, action) => {
      state.data = action.payload
      state.loading = false
    })
    .addCase(asyncThunk.rejected, (state, action) => {
      state.error = action.error.message
      state.loading = false
    })
}

// Show user feedback
NotificationManager.success('Operation successful')
```

❌ **DON'T:**

```javascript
// Don't import Real API directly
import BUSINESS_PLAN_API from '../../../service/api/businessPlan'

// Don't forget error handling
const result = await Request(api)
return result.data  // What if error?

// Don't ignore loading states
// User has no feedback while waiting
```

### 9.2 State Management Best Practices

✅ **DO:**

```javascript
// Use Redux for shared data
const businessPlanItems = useSelector(state => state.businessPlanDetails.businessPlanItems)

// Use local state for UI-only data
const [activeTab, setActiveTab] = useState('1')

// Use useCallback for event handlers
const handleCellChange = useCallback(
  (value) => {
    dispatch(updateCell(value))
  },
  [dispatch]
)
```

❌ **DON'T:**

```javascript
// Don't put UI state in Redux
dispatch(setActiveTab('1'))

// Don't create new functions on every render
const handleCellChange = (value) => {
  dispatch(updateCell(value))
}
```

### 9.3 Hook Usage Best Practices

✅ **DO:**

```javascript
// Customize hook for specific needs
const useBusinessPlanDetails = () => {
  // Select only what you need
  const { businessPlanItems, projectCode } = useSelector(
    state => state.businessPlanDetails
  )
  
  // Provide clean API
  return {
    businessPlanItems,
    projectCode,
    updateBusinessPlanItem: (item) => dispatch(update(item))
  }
}
```

❌ **DON'T:**

```javascript
// Don't expose raw Redux in components
const dispatch = useDispatch()
dispatch(redux.setBusinessPlanItem({ item }))

// Don't select entire state
const allState = useSelector(state => state)
```

---

## 10. Summary

### 10.1 Key Concepts

1. **API Layer**: Hybrid Mock/Real API configuration
2. **AsyncThunk Layer**: Redux Toolkit async actions
3. **Reducer Layer**: State management with slices
4. **Hook Layer**: Custom hooks for business logic
5. **Component Layer**: UI rendering and user interaction

### 10.2 Data Flow Summary

```
User Action 
  → Component Handler 
  → Hook Method 
  → Dispatch AsyncThunk 
  → API Call 
  → Response 
  → Reducer Updates State 
  → useSelector Detects Change 
  → Component Re-renders
```

### 10.3 Quick Reference

| Task | Solution |
|------|----------|
| **Call API** | Dispatch AsyncThunk via Hook |
| **Update State** | Dispatch Reducer action |
| **Read State** | useSelector in Hook |
| **Handle Loading** | Use AsyncThunk pending/fulfilled/rejected |
| **Show Notifications** | NotificationManager in AsyncThunk |
| **Toggle Mock/Real API** | Change `USE_MOCK_API` in config |

---

**Document End**

*For implementation examples, see source code in `src/lib/business-plan/`*

**Last Updated:** March 6, 2026  
**Version:** 1.0
