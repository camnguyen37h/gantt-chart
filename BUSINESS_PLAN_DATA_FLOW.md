# Business Plan - Luồng Xử Lý Data Chi Tiết

> **Document Version:** 1.0  
> **Last Updated:** March 4, 2026  
> **Purpose:** Hướng dẫn chi tiết về luồng xử lý dữ liệu trong module Business Plan

---

## 📋 Mục Lục

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Cấu Trúc Thư Mục](#2-cấu-trúc-thư-mục)
3. [Luồng Dữ Liệu (Data Flow)](#3-luồng-dữ-liệu-data-flow)
4. [Redux State Management](#4-redux-state-management)
5. [Custom Hooks](#5-custom-hooks)
6. [Components Architecture](#6-components-architecture)
7. [Mock API System](#7-mock-api-system)
8. [Ví Dụ Cụ Thể](#8-ví-dụ-cụ-thể)
9. [Best Practices](#9-best-practices)

---

## 1. Tổng Quan Kiến Trúc

### 1.1 Architecture Pattern

Business Plan module sử dụng kiến trúc **Redux + Custom Hooks + Component-Based**:

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                         │
│  (BusinessPlanDetail Component + Child Components)          │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ dispatch actions / call hooks
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Custom Hooks Layer                       │
│  (useBusinessPlanDetails, useBusinessPlanRevenue, etc.)     │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             │ dispatch                  │ useSelector
             ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Redux Store Layer                         │
│  ┌────────────────────┬──────────────────────────────────┐  │
│  │  Async Thunks      │  Reducers (State Slices)         │  │
│  │  - API Calls       │  - businessPlanDetails           │  │
│  │  - Data Transform  │  - businessPlanRevenue           │  │
│  │                    │  - businessPlanDelivery           │  │
│  │                    │  - businessGeneralInformation    │  │
│  └────────────────────┴──────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTP Request
             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│  ┌──────────────────┬─────────────────────────────────┐    │
│  │  Mock API        │  Real API (production)          │    │
│  │  (Development)   │  (businessPlan.js endpoints)    │    │
│  └──────────────────┴─────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Key Technologies

- **React 16.14.0**: UI Component Framework
- **Redux Toolkit (@reduxjs/toolkit)**: State Management
- **React-Redux 8.0.5**: React bindings for Redux
- **Ant Design 3.26.20**: UI Component Library
- **Axios**: HTTP Client (trong Request utility)

---

## 2. Cấu Trúc Thư Mục

### 2.1 Directory Structure

```
src/lib/business-plan/
│
├── BusinessPlanDetail/              # ⭐ Main Component Directory
│   ├── index.jsx                    # Main container component
│   ├── style.css                    # Styles
│   │
│   ├── BusinessPlanGeneralInformation/   # General Info Section
│   │   ├── index.jsx
│   │   ├── CollaboratorBodyItem.jsx
│   │   └── ...
│   │
│   ├── BusinessPlanRevenue/         # Revenue Planning Section
│   │   ├── index.jsx
│   │   ├── RevenueInformation.js
│   │   ├── OtherRevenueTable.js
│   │   ├── SellingExpenses.jsx
│   │   ├── RevenueSummary.js
│   │   └── ...
│   │
│   ├── BusinessPlanDelivery/        # Delivery Planning Section
│   │   ├── index.jsx
│   │   ├── ResourcesInformation/
│   │   │   ├── HeadCountTable.js
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── BusinessPlanFormSection/     # Dynamic Form Section
│   ├── BusinessPlanVersion/         # Version Management
│   ├── BusinessPlanStep/            # Approval Workflow
│   ├── BusinessPlanActivity/        # Activity Logs
│   └── BusinessPlanDocuments/       # Document Management
│
├── hooks/                           # ⭐ Custom Hooks
│   ├── index.js                     # Export all hooks
│   ├── useBusinessPlanDetails.js    # Main business logic hook
│   ├── useBusinessPlanRevenue.js    # Revenue-specific logic
│   ├── useBusinessPlanForm.js       # Form handling
│   ├── useBusinessPlanStep.js       # Workflow/approval logic
│   ├── useFormula.js                # Calculation formulas
│   └── ...
│
├── redux/                           # ⭐ Redux State Management
│   ├── index.js                     # Export all redux items
│   │
│   ├── asyncThunks/                 # Async Actions (API Calls)
│   │   ├── index.js
│   │   ├── businessDetails.js       # API: Get/Save business plan
│   │   ├── businessPlanRevenue.js   # API: Revenue operations
│   │   ├── businessPlanDelivery.js  # API: Delivery operations
│   │   └── ...
│   │
│   └── reducers/                    # State Slices
│       ├── index.js
│       ├── businessDetails.js       # State: Main business plan data
│       ├── businessPlanRevenue.js   # State: Revenue data
│       ├── businessPlanDelivery.js  # State: Delivery data
│       └── ...
│
├── mockBusinessPlanApi.js           # ⭐ Mock API Implementation
├── mockBusinessPlanData.js          # Mock Data Definitions
├── businessPlanApiConfig.js         # API Configuration (Mock/Real switch)
├── constants.jsx                    # Constants & Configurations
└── utils.js                         # Utility Functions
```

### 2.2 File Roles Explanation

| File/Directory | Purpose | Đọc/Ghi State | Gọi API |
|----------------|---------|---------------|---------|
| **BusinessPlanDetail/index.jsx** | Main container, orchestrate child components | ✅ Đọc | ❌ |
| **hooks/useBusinessPlanDetails.js** | Business logic, API calls wrapper | ✅ Đọc | ✅ Gọi |
| **redux/asyncThunks/** | API calls, data fetching | ❌ | ✅ Gọi |
| **redux/reducers/** | State management, data transformation | ✅ Ghi | ❌ |
| **mockBusinessPlanApi.js** | Mock API for development | ❌ | ✅ Return data |

---

## 3. Luồng Dữ Liệu (Data Flow)

### 3.1 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: Component Mount & Initial Load                             │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ User navigates to /business-plan/:buId
                            ▼
    ┌───────────────────────────────────────────────────┐
    │ BusinessPlanDetail Component                      │
    │ - useEffect triggered with buId param             │
    └───────────┬───────────────────────────────────────┘
                │
                │ 1. Call getBusinessPlanDetail(buId)
                ▼
    ┌─────────────────────────────────────────────┐
    │ useBusinessPlanDetails Hook                 │
    │ - Wraps dispatch call                       │
    └───────────┬─────────────────────────────────┘
                │
                │ 2. dispatch(redux.getBusinessPlanDetail(buId))
                ▼
    ┌─────────────────────────────────────────────────────────┐
    │ Redux Async Thunk: getBusinessPlanDetail                │
    │ - Call API: BUSINESS_PLAN_API.getBusinessPlanDetail(id) │
    └───────────┬─────────────────────────────────────────────┘
                │
                │ 3. HTTP Request
                ▼
    ┌─────────────────────────────────────────────┐
    │ API Layer (Mock or Real)                   │
    │ - mockBusinessPlanApi.getBusinessPlanDetail │
    │   OR Real API endpoint                      │
    └───────────┬─────────────────────────────────┘
                │
                │ 4. Return Response Data
                ▼

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: Redux State Update                                         │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │ Redux Reducer: businessDetailsSlice                 │
    │ - extraReducers.getBusinessPlanDetail.fulfilled     │
    │                                                      │
    │ State Updates:                                       │
    │   - businessPlanItems = formatted data              │
    │   - columns = month labels                          │
    │   - projectCode, status, version                    │
    │   - startDate, endDate                              │
    │   - originalBusinessPlanItems (backup)              │
    │   - exchangeRate, totalContractPrice                │
    └───────────┬─────────────────────────────────────────┘
                │
                │ 5. State updated
                ▼

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: Component Re-render with New Data                          │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │ BusinessPlanDetail Component                        │
    │ - useSelector hooks detect state change             │
    │ - Component re-renders                              │
    └───────────┬─────────────────────────────────────────┘
                │
                │ 6. Pass data to child components
                ▼
    ┌──────────────────────────────────────────────────────────────┐
    │ Child Components Render                                       │
    │                                                               │
    │ ┌─────────────────────┐  ┌──────────────────────┐            │
    │ │ GeneralInformation  │  │ BusinessPlanRevenue  │            │
    │ │ - Display basic info│  │ - Revenue tables     │            │
    │ └─────────────────────┘  └──────────────────────┘            │
    │                                                               │
    │ ┌─────────────────────┐  ┌──────────────────────┐            │
    │ │ BusinessPlanDelivery│  │ FormSection          │            │
    │ │ - Resources table   │  │ - Dynamic forms      │            │
    │ └─────────────────────┘  └──────────────────────┘            │
    └───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: User Interaction & Data Update                             │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ User edits data (e.g., changes revenue value)
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │ Component (e.g., OtherRevenueTable)                 │
    │ - User types new value                              │
    │ - onChange handler triggered                        │
    └───────────┬─────────────────────────────────────────┘
                │
                │ 7. dispatch(updateRevenueData(newValue))
                ▼
    ┌─────────────────────────────────────────────────────┐
    │ Redux Reducer                                       │
    │ - Update state.businessPlanRevenue.dataSource       │
    │ - Set isSaveShowed = true (show save button)       │
    └───────────┬─────────────────────────────────────────┘
                │
                │ 8. State updated, component re-renders
                ▼
    ┌─────────────────────────────────────────────────────┐
    │ Component displays new value                        │
    │ Save button appears (isSaveShowed = true)           │
    └─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: Save Data Flow                                             │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ User clicks "Save"
                            ▼
    ┌─────────────────────────────────────────────────────┐
    │ Component                                           │
    │ - Call saveDraft() or submit()                      │
    └───────────┬─────────────────────────────────────────┘
                │
                │ 9. Call hook method
                ▼
    ┌─────────────────────────────────────────────────────┐
    │ useBusinessPlanDetails.saveDraft()                  │
    │ - Collect data from Redux state                     │
    │ - Format data for API                               │
    │ - dispatch save action                              │
    └───────────┬─────────────────────────────────────────┘
                │
                │ 10. dispatch(saveDraft(params))
                ▼
    ┌─────────────────────────────────────────────────────┐
    │ Redux Async Thunk                                   │
    │ - Make POST/PUT request to API                      │
    └───────────┬─────────────────────────────────────────┘
                │
                │ 11. API responds
                ▼
    ┌─────────────────────────────────────────────────────┐
    │ Success Handler                                     │
    │ - Show success notification                         │
    │ - Set isSaveShowed = false                          │
    │ - Optionally refresh data                           │
    └─────────────────────────────────────────────────────┘
```

### 3.2 Data Transformation Pipeline

```javascript
// Raw API Response
{
  projectCode: "GLBTM2500093",
  status: "APPROVED",
  generalInfo: {
    listAM: [...],
    totalContractPrice: 1000000,
    // ...
  },
  businessPlanItem: [
    {
      sectionKey: "SOFTWARE_PRODUCTION_REVENUE",
      sectionName: "Software Production Revenue",
      rowLabels: [
        {
          label: "Unit Price DU",
          rowKey: "UNIT_PRICE_DU",
          cellList: [
            { columnKey: "Jan-25", value: 100, type: "NUMBER" },
            // ...
          ]
        }
      ]
    }
  ]
}

          ↓ Transform in Reducer

// Redux State Structure
{
  businessPlanDetails: {
    projectCode: "GLBTM2500093",
    status: "APPROVED",
    businessPlanItems: {
      SOFTWARE_PRODUCTION_REVENUE: {
        sectionKey: "SOFTWARE_PRODUCTION_REVENUE",
        sectionName: "Software Production Revenue",
        data: {
          UNIT_PRICE_DU: {
            label: "Unit Price DU",
            rowKey: "UNIT_PRICE_DU",
            data: [
              { 
                columnKey: "Jan-25", 
                value: 100, 
                type: "NUMBER",
                sectionKey: "SOFTWARE_PRODUCTION_REVENUE"
              },
              // ...
            ]
          }
        }
      }
    },
    columns: ["Jan-25", "Feb-25", ...],
    originalBusinessPlanItems: [...] // Backup for comparison
  }
}

          ↓ Used in Components

// Component consumes data via hooks
const { businessPlanItems, columns } = useSelector(state => state.businessPlanDetails);

// Access specific cell value
const unitPriceDU = businessPlanItems.SOFTWARE_PRODUCTION_REVENUE
  .data.UNIT_PRICE_DU
  .data.find(cell => cell.columnKey === "Jan-25").value;
```

---

## 4. Redux State Management

### 4.1 Redux Store Structure

```javascript
// Store Configuration (src/store/index.js)
{
  businessPlanDetails: {          // Main business plan data
    isSaveShowed: false,
    businessPlanItems: {},
    columns: [],
    exchangeRate: 23000,
    totalContractPrice: 1000000,
    projectCode: "GLBTM2500093",
    status: "APPROVED",
    version: 1,
    versionId: 436,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    originalBusinessPlanItems: [], // Backup
    validation: {}
  },

  businessGeneralInformation: {   // General info & collaborators
    listAM: [],
    listPM: [],
    listTeamLead: [],
    listPreSale: [],
    listPreparator: [],
    listAdviser: [],
    industryCurrency: "VND",
    industryDomain: "Finance",
    businessPlanKpiDTO: {},
    loadingCollaborator: false
  },

  businessPlanRevenue: {          // Revenue planning data
    dataSourceTableRevenue: [],
    filtersRevenue: {},
    isLoading: false,
    isSaveConfirmShowed: false,
    listDuRevenue: [],
    deliveryUnitDataRevenue: {}
  },

  businessPlanDelivery: {         // Delivery planning data
    dataResourcesInformation: {},
    listDUDelivery: [],
    deliveryUnitDataDelivery: {},
    isSaveShowedDeliveryPlan: false,
    dataCreateRequest: [],
    dataUpdateRequest: [],
    dataDeleteRequest: []
  },

  businessApproval: {             // Workflow & approval
    listApprovals: [],
    currentStep: null,
    loadingApproval: false
  }
}
```

### 4.2 Redux Slices Overview

#### 4.2.1 businessDetails Slice

**File:** `redux/reducers/businessDetails.js`

**Purpose:** Quản lý dữ liệu chính của Business Plan (form data, metadata)

**Key Actions:**

```javascript
// Synchronous Actions (Reducers)
setIsSaveShowed(state, action)          // Toggle save button visibility
setBusinessPlanItems(state, action)     // Set entire business plan data
setBusinessPlanItem(state, action)      // Update single cell
addBusinessPlanRow(state, action)       // Add new row to section
updateBusinessPlanRow(state, action)    // Update entire row
deleteBusinessPlanRow(state, action)    // Delete row
setValidation(state, action)            // Set validation errors

// Async Actions (Thunks)
getBusinessPlanDetail(id)               // Fetch business plan by ID
saveDraft(params)                       // Save as draft
submit(params)                          // Submit for approval
createNewVersion(params)                // Create new version
```

**State Flow Example:**

```javascript
// Initial state
{ businessPlanItems: {} }

// After getBusinessPlanDetail.fulfilled
{
  businessPlanItems: {
    SOFTWARE_PRODUCTION_REVENUE: {
      data: {
        UNIT_PRICE_DU: { label: "Unit Price DU", data: [...] }
      }
    },
    OTHER_REVENUE: { ... },
    SELLING_EXPENSES: { ... }
  }
}

// After setBusinessPlanItem (user edits a cell)
{
  businessPlanItems: {
    SOFTWARE_PRODUCTION_REVENUE: {
      data: {
        UNIT_PRICE_DU: {
          data: [
            { columnKey: "Jan-25", value: 150 }, // Updated from 100 to 150
            // ...
          ]
        }
      }
    }
  },
  isSaveShowed: true // Save button appears
}
```

#### 4.2.2 businessPlanRevenue Slice

**File:** `redux/reducers/businessPlanRevenue.js`

**Purpose:** Quản lý Revenue Planning (Software Production Revenue, Other Revenue, Selling Expenses)

**Key Actions:**

```javascript
// Synchronous
setDataSourceTableRevenue(state, action)      // Set revenue table data
setFiltersRevenue(state, action)              // Set filter values
setIsSaveConfirmShowed(state, action)         // Toggle save indicator

// Async
getProductionRevenue(params)                  // Fetch production revenue
saveProductionRevenue(params)                 // Save production revenue
getOtherRevenue(params)                       // Fetch other revenue
saveOtherRevenue(params)                      // Save other revenue
getSellingPlan(params)                        // Fetch selling expenses
```

#### 4.2.3 businessPlanDelivery Slice

**File:** `redux/reducers/businessPlanDelivery.js`

**Purpose:** Quản lý Delivery Planning (Resources, HeadCount Table)

**Key Actions:**

```javascript
// Synchronous
setIsSaveShowedDeliveryPlan(state, action)
addOrUpdateCreateResource(state, action)      // Add/update new resource
addOrUpdateUpdateResource(state, action)      // Add/update existing resource
setListIdToDeleteResourceInformation(state, action)

// Async
getResourcesInformationDeliveryPlan(params)
saveDeliveryPlan(params)
getListDUByVersionDelivery(params)
```

### 4.3 Async Thunks Detailed

**File:** `redux/asyncThunks/businessDetails.js`

```javascript
// Example: getBusinessPlanDetail
export const getBusinessPlanDetail = createAsyncThunk(
  'get/getBusinessPlanDetail',
  async (id) => {
    // 1. Make API call
    const result = await Request(
      BUSINESS_PLAN_API.getBusinessPlanDetail(id)
    );

    // 2. Check response status
    if (result.status === ResponseStatusCode.success) {
      return { 
        data: result.data, 
        errorMessage: result.errorMessage 
      };
    } else {
      // 3. Handle errors
      if (result.status === ResponseStatusCode.forbidden) {
        window.location.href = '/error/access-deny';
      }
      return NotificationManager.error(result.message);
    }
  }
);

// Reducer handles this thunk in extraReducers
extraReducers: (builder) => {
  builder
    .addCase(getBusinessPlanDetail.pending, (state) => {
      state.loading = true;
    })
    .addCase(getBusinessPlanDetail.fulfilled, (state, action) => {
      // Transform and store data
      const { data } = action.payload;
      state.businessPlanItems = transformBusinessPlanData(data);
      state.columns = data.businessPlanItem[0]?.columnLabels || [];
      state.projectCode = data.projectCode;
      state.loading = false;
    })
    .addCase(getBusinessPlanDetail.rejected, (state) => {
      state.loading = false;
    });
}
```

---

## 5. Custom Hooks

### 5.1 useBusinessPlanDetails Hook

**File:** `hooks/useBusinessPlanDetails.js`

**Purpose:** Main hook để xử lý business logic của Business Plan

**What it does:**
1. Read data from Redux store via useSelector
2. Provide wrapper methods for dispatching actions
3. Format data for API requests
4. Handle validation logic

**Code Structure:**

```javascript
const useBusinessPlanDetails = () => {
  const dispatch = useDispatch();

  // 1. Read data from Redux
  const {
    isSaveShowed,
    businessPlanItems,
    projectCode,
    status,
    // ...
  } = useSelector(state => state.businessPlanDetails);

  const {
    listAM,
    listPM,
    // ...
  } = useSelector(state => state.businessGeneralInformation);

  // 2. Helper functions
  const changeDataWithoutId = (data) => {
    return data.map(item => {
      const { id, startDate, endDate, ...otherParams } = item;
      return {
        id: null,
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        ...otherParams,
      };
    });
  };

  // 3. Prepare params for API
  const generalInformationParams = {
    listAM: handleReturnDataWithLdap(changeDataWithoutId(listAM)),
    listTeamLead: handleReturnDataWithLdap(changeDataWithoutId(listTeamLead)),
    currency: industryCurrency,
    exchangeRate,
    totalContractPrice,
    // ...
  };

  // 4. API wrapper methods
  const getBusinessPlanDetail = useCallback(
    (id) => {
      return dispatch(redux.getBusinessPlanDetail(id));
    },
    [dispatch]
  );

  const saveDraft = useCallback(
    async (params) => {
      const result = await dispatch(
        redux.saveDraft({
          ...params,
          generalInformation: generalInformationParams,
        })
      );
      if (result.type.includes('fulfilled')) {
        NotificationManager.success('Save draft successfully');
        updateIsSaveShowed(false);
      }
      return result;
    },
    [dispatch, generalInformationParams]
  );

  const submit = useCallback(
    async (params) => {
      const result = await dispatch(
        redux.submit({
          ...params,
          generalInformation: generalInformationParams,
        })
      );
      if (result.type.includes('fulfilled')) {
        NotificationManager.success('Submit successfully');
        updateIsSaveShowed(false);
      }
      return result;
    },
    [dispatch, generalInformationParams]
  );

  // 5. Return everything components need
  return {
    // State
    isSaveShowed,
    businessPlanItems,
    projectCode,
    status,
    columns,
    validation,
    // ...

    // Methods
    getBusinessPlanDetail,
    saveDraft,
    submit,
    updateIsSaveShowed: (value) => dispatch(redux.setIsSaveShowed(value)),
    createNewVersion,
    // ...

    // Computed data
    generalInformationParams,
  };
};
```

**Usage in Components:**

```javascript
function BusinessPlanDetail({ match }) {
  // 1. Get everything from hook
  const {
    isSaveShowed,
    projectCode,
    status,
    getBusinessPlanDetail,
    saveDraft,
    submit,
    updateIsSaveShowed,
  } = useBusinessPlanDetails();

  // 2. Fetch data on mount
  useEffect(() => {
    if (match.params.buId) {
      getBusinessPlanDetail(match.params.buId);
    }
  }, [match.params.buId]);

  // 3. Handle save
  const handleSave = async () => {
    const result = await saveDraft({
      businessPlanVersionId: match.params.buId,
      // ... other params
    });
  };

  // 4. Render
  return (
    <div>
      <h1>Business Plan: {projectCode}</h1>
      <span>Status: {status}</span>
      
      {isSaveShowed && (
        <Button onClick={handleSave}>Save</Button>
      )}
      
      {/* Child components */}
    </div>
  );
}
```

### 5.2 useBusinessPlanRevenue Hook

**File:** `hooks/useBusinessPlanRevenue.js`

**Purpose:** Handle Revenue Planning specific logic

**Key Methods:**

```javascript
const useBusinessPlanRevenue = () => {
  const {
    dataSourceTableRevenue,
    filtersRevenue,
    isLoading,
  } = useSelector(state => state.businessPlanRevenue);

  const fetchProductionRevenue = useCallback(
    async (params) => {
      const result = await dispatch(
        redux.getProductionRevenue({
          businessPlanVersionId: params.buId,
          deliveryUnit: params.deliveryUnit,
          // ...
        })
      );
      return result;
    },
    [dispatch]
  );

  const saveProductionRevenue = useCallback(
    async (params) => {
      return dispatch(redux.saveProductionRevenue(params));
    },
    [dispatch]
  );

  return {
    dataSourceTableRevenue,
    filtersRevenue,
    isLoading,
    fetchProductionRevenue,
    saveProductionRevenue,
  };
};
```

### 5.3 Other Hooks

| Hook | Purpose |
|------|---------|
| **useBusinessPlanForm** | Handle dynamic form logic (add/remove rows) |
| **useBusinessPlanStep** | Manage approval workflow steps |
| **useFormula** | Calculate formulas (e.g., total = sum of cells) |
| **useBusinessPlanUpload** | Handle document upload/download |

---

## 6. Components Architecture

### 6.1 Component Hierarchy

```
BusinessPlanDetail (Container)
│
├── BusinessPlanVersion          # Version selector dropdown
│   └── Show list of versions, switch between them
│
├── BusinessPlanStep             # Approval workflow steps
│   └── Display current approval status & actions
│
├── Tabs (Ant Design)
│   │
│   ├── Tab 1: General Information
│   │   └── BusinessPlanGeneralInformation
│   │       ├── Basic Info Form (Project Code, Dates, etc.)
│   │       ├── Collaborator Tables (AM, PM, Team Lead, etc.)
│   │       └── Industry & Currency Selection
│   │
│   ├── Tab 2: Form Section (Dynamic Sections)
│   │   └── BusinessPlanFormSection
│   │       └── Collapse Panels (for each section)
│   │           ├── SOFTWARE_PRODUCTION_REVENUE
│   │           ├── OTHER_REVENUE
│   │           ├── SELLING_EXPENSES
│   │           └── ... (dynamic based on data)
│   │
│   ├── Tab 3: Revenue Plan
│   │   └── BusinessPlanRevenue
│   │       ├── FilterBusinessPlan (DU filter)
│   │       ├── RevenueInformation (Production Revenue Table)
│   │       ├── OtherRevenueTable
│   │       ├── SellingExpenses
│   │       ├── RevenueSummary
│   │       └── BusinessPlanHistoryTable
│   │
│   ├── Tab 4: Delivery Plan
│   │   └── BusinessPlanDelivery
│   │       ├── FilterBusinessPlan (DU filter)
│   │       ├── ResourcesInformation
│   │       │   └── HeadCountTable (Editable table)
│   │       └── DeliverySummary
│   │
│   ├── Tab 5: Documents
│   │   └── BusinessPlanDocuments
│   │       └── Document upload/download/delete
│   │
│   └── Tab 6: Activity Log
│       └── BusinessPlanActivity
│           └── Display user actions history
│
└── Sticky Footer (Save/Submit Buttons)
    └── Show when isSaveShowed === true
```

### 6.2 Key Components Explained

#### 6.2.1 BusinessPlanDetail (Main Container)

**File:** `BusinessPlanDetail/index.jsx`

**Responsibilities:**
- Orchestrate all child components
- Manage tab switching
- Handle Save/Submit actions
- Show/hide sticky footer based on `isSaveShowed`

**Code Example:**

```javascript
function BusinessPlanDetail({ match, history }) {
  const {
    isSaveShowed,
    saveDraft,
    submit,
    getBusinessPlanDetail,
    projectCode,
    status,
  } = useBusinessPlanDetails();

  const [activeTab, setActiveTab] = useState('1');
  const [loadingSave, setLoadingSave] = useState(false);

  useEffect(() => {
    // Fetch business plan when component mounts
    if (match.params.buId) {
      getBusinessPlanDetail(match.params.buId);
    }
  }, [match.params.buId]);

  const onSubmit = async () => {
    setLoadingSubmit(true);
    const params = {
      businessPlanVersionId: match.params.buId,
      // ... collect all data from Redux state
    };
    await submit(params);
    setLoadingSubmit(false);
  };

  const onSaveDraft = async () => {
    setLoadingSave(true);
    const params = { /* ... */ };
    await saveDraft(params);
    setLoadingSave(false);
  };

  return (
    <div className="business-plan-detail">
      {/* Version & Status */}
      <BusinessPlanVersion />
      <BusinessPlanStep />

      {/* Main Content Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="General Information" key="1">
          <BusinessPlanGeneralInformation />
        </TabPane>
        
        <TabPane tab="Form Section" key="2">
          <BusinessPlanFormSection />
        </TabPane>
        
        <TabPane tab="Revenue Plan" key="3">
          <BusinessPlanRevenue />
        </TabPane>
        
        <TabPane tab="Delivery Plan" key="4">
          <BusinessPlanDelivery />
        </TabPane>

        {/* ... other tabs */}
      </Tabs>

      {/* Sticky footer - shows when data changed */}
      {isSaveShowed && (
        <StyledAffix className="active">
          <div className="affix-content">
            <span>You have unsaved changes</span>
            <div>
              <Button onClick={onSaveDraft} loading={loadingSave}>
                Save Draft
              </Button>
              <Button 
                type="primary" 
                onClick={onSubmit} 
                loading={loadingSubmit}
              >
                Submit
              </Button>
            </div>
          </div>
        </StyledAffix>
      )}
    </div>
  );
}
```

#### 6.2.2 BusinessPlanRevenue (Revenue Tab)

**File:** `BusinessPlanDetail/BusinessPlanRevenue/index.jsx`

**Responsibilities:**
- Display revenue planning tables
- Handle DU (Delivery Unit) filtering
- Allow editing revenue data
- Calculate totals and summaries

**Sub-components:**
1. **RevenueInformation**: Software Production Revenue table
2. **OtherRevenueTable**: Other revenue sources
3. **SellingExpenses**: Selling & marketing expenses
4. **RevenueSummary**: Total revenue summary

#### 6.2.3 HeadCountTable (Delivery Resources)

**File:** `BusinessPlanDetail/BusinessPlanDelivery/ResourcesInformation/HeadCountTable.js`

**Responsibilities:**
- Display and edit resource allocation
- Support inline editing
- Handle expandable rows (show reference data)
- Calculate MM (Man-Month) effort

**Features:**
- Add/Remove rows
- Inline editing with debounce
- Dropdown selects for resource types, locations, positions
- Auto-calculate gross salary from exchange rate
- Fill function (auto-populate 1 for all months)

---

## 7. Mock API System

### 7.1 Mock API Architecture

```
businessPlanApiConfig.js (Switch)
    │
    ├─ USE_MOCK_API = true ──> mockBusinessPlanApi.js
    │                              │
    │                              └─> mockBusinessPlanData.js
    │
    └─ USE_MOCK_API = false ──> Real API (BUSINESS_PLAN_API)
```

### 7.2 Mock API Configuration

**File:** `businessPlanApiConfig.js`

```javascript
import * as mockApi from './mockBusinessPlanApi';

// Toggle between mock and real API
const USE_MOCK_API = true;

const api = USE_MOCK_API ? mockApi : null; // Replace null with real API

// Export all API functions
export const getBusinessPlanDetail = api.getBusinessPlanDetail;
export const saveProductionRevenue = api.saveProductionRevenue;
// ... 18 total API functions
```

### 7.3 Mock Data Structure

**File:** `mockBusinessPlanData.js`

```javascript
export const mockBusinessPlanDetail = {
  id: 436,
  projectCode: "GLBTM2500093",
  status: "Approved",
  version: 1,
  startDate: 1770915600000, // Unix timestamp
  endDate: 1784134800000,
  generalInfo: {
    listAM: [
      {
        id: 11233,
        businessPlanVersionId: 436,
        memberType: "AM",
        userId: 3744,
        ldap: "ntmanh6",
        departmentName: "BU3",
        // ...
      }
    ],
    // ... other collaborator lists
  },
  businessPlanItem: [
    {
      sectionKey: "SOFTWARE_PRODUCTION_REVENUE",
      sectionName: "Software Production Revenue",
      columnLabels: ["Jan-25", "Feb-25", ...],
      rowLabels: [
        {
          label: "Unit Price DU",
          rowKey: "UNIT_PRICE_DU",
          cellList: [
            {
              columnKey: "Jan-25",
              value: 100,
              type: "NUMBER",
              // ...
            }
          ]
        }
      ]
    }
  ]
};
```

### 7.4 Mock API Functions

**File:** `mockBusinessPlanApi.js`

```javascript
// In-memory storage for simulating database
let businessPlanStore = { ...mockBusinessPlanDetail };

// Get business plan by ID
export const getBusinessPlanDetail = async (id) => {
  await delay(500); // Simulate network delay
  
  return {
    status: 200,
    message: 'Success',
    data: businessPlanStore,
  };
};

// Save production revenue
export const saveProductionRevenue = async (params) => {
  await delay(300);
  
  // Update in-memory store
  businessPlanStore.productionRevenue = params.data;
  
  return {
    status: 200,
    message: 'Save successfully',
  };
};

// Auto-calculate revenue summary
export const getRevenueSummary = async (params) => {
  await delay(200);
  
  const productionRevenue = calculateProductionRevenue();
  const otherRevenue = calculateOtherRevenue();
  const totalRevenue = productionRevenue + otherRevenue;
  
  return {
    status: 200,
    data: {
      productionRevenue,
      otherRevenue,
      totalRevenue,
      // ...
    }
  };
};
```

**18 Mock API Functions:**

1. `getBusinessPlanDetail(id)` - Get BP detail
2. `getProductionRevenue(params)` - Get production revenue
3. `saveProductionRevenue(params)` - Save production revenue
4. `getOtherRevenue(params)` - Get other revenue
5. `saveOtherRevenue(params)` - Save other revenue
6. `getSellingPlan(params)` - Get selling expenses
7. `saveSellingPlan(params)` - Save selling expenses
8. `getRevenueSummary(params)` - Get revenue summary
9. `getMMBills(params)` - Get MM bills
10. `getDeliveryPlanSummary(params)` - Get delivery summary
11. `saveDeliveryPlan(params)` - Save delivery plan
12. `getResourcesInformation(params)` - Get resources
13. `saveDraft(params)` - Save as draft
14. `submit(params)` - Submit for approval
15. `approve(params)` - Approve BP
16. `reject(params)` - Reject BP
17. `createNewVersion(params)` - Create new version
18. `getDocuments(params)` - Get documents

---

## 8. Ví Dụ Cụ Thể

### 8.1 Example 1: Load Business Plan Detail

**Scenario:** User navigates to `/business-plan/436`

**Step-by-step:**

```javascript
// 1. Component mounts
function BusinessPlanDetail({ match }) {
  const { getBusinessPlanDetail } = useBusinessPlanDetails();

  useEffect(() => {
    // 2. Call hook method
    getBusinessPlanDetail(match.params.buId); // buId = 436
  }, [match.params.buId]);
}

// 3. Hook dispatches action
const getBusinessPlanDetail = useCallback(
  (id) => {
    return dispatch(redux.getBusinessPlanDetail(id));
  },
  [dispatch]
);

// 4. Async thunk calls API
export const getBusinessPlanDetail = createAsyncThunk(
  'get/getBusinessPlanDetail',
  async (id) => {
    const result = await Request(
      BUSINESS_PLAN_API.getBusinessPlanDetail(id)
    );
    return { data: result.data };
  }
);

// 5. Mock API returns data
export const getBusinessPlanDetail = async (id) => {
  return {
    status: 200,
    message: 'Success',
    data: mockBusinessPlanDetail, // Full BP data
  };
};

// 6. Reducer updates state
extraReducers: (builder) => {
  builder.addCase(getBusinessPlanDetail.fulfilled, (state, action) => {
    const { data } = action.payload;
    
    // Transform data
    state.businessPlanItems = transformData(data.businessPlanItem);
    state.projectCode = data.projectCode;
    state.status = data.status;
    state.columns = data.businessPlanItem[0]?.columnLabels || [];
    // ...
  });
}

// 7. Component re-renders with new data
// useSelector detects state change
const { businessPlanItems, projectCode } = useSelector(
  state => state.businessPlanDetails
);

// 8. Display data in UI
return <h1>Business Plan: {projectCode}</h1>;
```

### 8.2 Example 2: Edit Revenue Cell

**Scenario:** User changes Unit Price DU for Jan-25 from 100 to 150

```javascript
// 1. User types in input
<InputNumber
  value={cellValue}
  onChange={(value) => handleCellChange(value, rowKey, columnKey)}
/>

// 2. Component handler
const handleCellChange = (value, rowKey, columnKey) => {
  // Dispatch action to update Redux
  dispatch(setBusinessPlanItem({
    sectionKey: 'SOFTWARE_PRODUCTION_REVENUE',
    rowKey: 'UNIT_PRICE_DU',
    columnKey: 'Jan-25',
    value: 150,
    type: 'NUMBER'
  }));

  // Show save button
  dispatch(setIsSaveShowed(true));
};

// 3. Reducer updates state
setBusinessPlanItem: (state, { payload }) => {
  const { sectionKey, rowKey, columnKey, value } = payload;
  
  // Find cell and update
  const cellIndex = state.businessPlanItems[sectionKey]
    .data[rowKey]
    .data.findIndex(cell => cell.columnKey === columnKey);
  
  state.businessPlanItems[sectionKey]
    .data[rowKey]
    .data[cellIndex].value = value;
},

setIsSaveShowed: (state, action) => {
  state.isSaveShowed = action.payload; // true
}

// 4. Component re-renders
// Input shows new value: 150
// Save button appears at bottom
```

### 8.3 Example 3: Save Draft

**Scenario:** User clicks "Save Draft" button

```javascript
// 1. User clicks button
<Button onClick={handleSaveDraft}>Save Draft</Button>

// 2. Component handler
const handleSaveDraft = async () => {
  setLoadingSave(true);
  
  // Collect all data from Redux state
  const params = {
    businessPlanVersionId: match.params.buId,
    generalInformation: generalInformationParams,
    businessPlanItem: formatBusinessPlanItems(businessPlanItems),
  };
  
  // Call hook method
  const result = await saveDraft(params);
  
  setLoadingSave(false);
};

// 3. Hook method
const saveDraft = useCallback(
  async (params) => {
    const result = await dispatch(
      redux.saveDraft({
        ...params,
        generalInformation: generalInformationParams,
      })
    );

    if (result.type.includes('fulfilled')) {
      NotificationManager.success('Save draft successfully');
      updateIsSaveShowed(false); // Hide save button
    }
    
    return result;
  },
  [dispatch, generalInformationParams]
);

// 4. Async thunk
export const saveDraft = createAsyncThunk(
  'post/saveDraft',
  async (params) => {
    const result = await Request(
      BUSINESS_PLAN_API.saveDraft,
      params,
      'post'
    );
    
    if (result.status === ResponseStatusCode.success) {
      NotificationManager.success(result.message);
      return result.data;
    } else {
      NotificationManager.error(result.message);
      throw new Error(result.message);
    }
  }
);

// 5. Mock API
export const saveDraft = async (params) => {
  await delay(500);
  
  // Update in-memory store
  businessPlanStore = {
    ...businessPlanStore,
    ...params,
    status: 'Draft',
    updatedAt: new Date().toISOString(),
  };
  
  return {
    status: 200,
    message: 'Save draft successfully',
  };
};

// 6. Success notification shows
// isSaveShowed becomes false
// Save button disappears
```

### 8.4 Example 4: Add New Resource in Delivery Plan

**Scenario:** User adds a new resource to HeadCountTable

```javascript
// 1. User clicks "+" button
<Icon type="plus-circle" onClick={handleAddResourceType} />

// 2. Component creates new row
const handleAddResourceType = () => {
  const parentKey = uniqueId('NEW_DELIVERY_MEMBER-');
  
  const newRow = {
    key: parentKey,
    deliveryMemberId: null, // null = new resource
    resourceType: '',
    resourceFullName: '',
    ldap: '',
    location: '',
    position: '',
    role: 'Member',
    budgetMMValueDTO: {}, // Empty MM values
    children: [ /* reference rows */ ]
  };
  
  // Add to local state
  setData([newRow, ...data]);
  
  // Dispatch to Redux
  dispatch(addOrUpdateCreateResource(newRow));
  
  // Show save button
  dispatch(setIsSaveShowedDeliveryPlan(true));
};

// 3. Reducer adds to create queue
addOrUpdateCreateResource: (state, action) => {
  const newResource = action.payload;
  
  // Add to create queue
  const existingIndex = state.dataCreateRequest.findIndex(
    item => item.key === newResource.key
  );
  
  if (existingIndex > -1) {
    state.dataCreateRequest[existingIndex] = newResource;
  } else {
    state.dataCreateRequest.push(newResource);
  }
}

// 4. User fills in resource details
// Each change dispatches addOrUpdateCreateResource again

// 5. User clicks "Save"
const handleSaveDelivery = async () => {
  const params = {
    businessPlanVersionId: buId,
    deliveryUnit: deliveryUnit.groupName,
    dataCreateRequest: dataCreateRequest, // New resources
    dataUpdateRequest: dataUpdateRequest, // Updated resources
    dataDeleteRequest: dataDeleteRequest, // Deleted IDs
  };
  
  await dispatch(saveDeliveryPlan(params));
};

// 6. API saves all changes
export const saveDeliveryPlan = async (params) => {
  await delay(500);
  
  // Create new resources (assign IDs)
  params.dataCreateRequest.forEach((resource) => {
    resource.deliveryMemberId = generateId();
    businessPlanStore.deliveryPlan.resources.push(resource);
  });
  
  // Update existing resources
  params.dataUpdateRequest.forEach((resource) => {
    const index = businessPlanStore.deliveryPlan.resources.findIndex(
      r => r.deliveryMemberId === resource.deliveryMemberId
    );
    if (index > -1) {
      businessPlanStore.deliveryPlan.resources[index] = resource;
    }
  });
  
  // Delete resources
  params.dataDeleteRequest.forEach((id) => {
    businessPlanStore.deliveryPlan.resources = 
      businessPlanStore.deliveryPlan.resources.filter(
        r => r.deliveryMemberId !== id
      );
  });
  
  return {
    status: 200,
    message: 'Save delivery plan successfully',
  };
};

// 7. Success
// Clear create/update/delete queues
// Refresh data from API
```

---

## 9. Best Practices

### 9.1 When to Use Redux vs Local State

**Use Redux State when:**
- ✅ Data needs to be shared across multiple components
- ✅ Data needs to persist across route changes
- ✅ Data is fetched from API
- ✅ Data affects global UI state (e.g., isSaveShowed)

**Use Local State when:**
- ✅ Data is only used in one component
- ✅ Temporary UI state (e.g., dropdown open/closed)
- ✅ Form input values before submission
- ✅ Loading indicators for local actions

**Example:**

```javascript
function BusinessPlanDetail() {
  // ❌ DON'T: Use local state for API data
  const [businessPlanData, setBusinessPlanData] = useState({});

  // ✅ DO: Use Redux for API data
  const { businessPlanItems } = useSelector(
    state => state.businessPlanDetails
  );

  // ✅ DO: Use local state for UI state
  const [activeTab, setActiveTab] = useState('1');
  const [loadingSave, setLoadingSave] = useState(false);
}
```

### 9.2 Data Update Patterns

**Pattern 1: Immediate Update (Optimistic)**

```javascript
// Update Redux immediately, then save to API
const handleCellChange = (value) => {
  // 1. Update Redux first
  dispatch(setBusinessPlanItem({ value }));
  
  // 2. Show save button
  dispatch(setIsSaveShowed(true));
  
  // 3. Save happens later when user clicks "Save"
};
```

**Pattern 2: Save Then Update (Pessimistic)**

```javascript
// Save to API first, then update Redux
const handleSave = async (value) => {
  // 1. Save to API
  const result = await dispatch(saveBusinessPlan({ value }));
  
  // 2. If success, update Redux
  if (result.type.includes('fulfilled')) {
    dispatch(setBusinessPlanItem({ value }));
  }
};
```

**Pattern 3: Debounced Updates**

```javascript
// For inputs, debounce API calls to reduce requests
const handleInputChange = useCallback(
  debounce((value) => {
    dispatch(setBusinessPlanItem({ value }));
    dispatch(setIsSaveShowed(true));
  }, 350), // Wait 350ms after user stops typing
  []
);
```

### 9.3 Error Handling

```javascript
// Always handle errors in async thunks
export const getBusinessPlanDetail = createAsyncThunk(
  'get/getBusinessPlanDetail',
  async (id, { rejectWithValue }) => {
    try {
      const result = await Request(
        BUSINESS_PLAN_API.getBusinessPlanDetail(id)
      );
      
      if (result.status === ResponseStatusCode.success) {
        return result.data;
      } else {
        // Handle business logic errors
        NotificationManager.error(result.message);
        return rejectWithValue(result.message);
      }
    } catch (error) {
      // Handle network errors
      NotificationManager.error('Network error occurred');
      return rejectWithValue(error.message);
    }
  }
);

// Handle in reducer
extraReducers: (builder) => {
  builder
    .addCase(getBusinessPlanDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
}
```

### 9.4 Performance Optimization

**Use memo for expensive calculations:**

```javascript
const totalRevenue = useMemo(() => {
  return businessPlanItems.SOFTWARE_PRODUCTION_REVENUE
    .data.UNIT_PRICE_DU
    .data.reduce((sum, cell) => sum + cell.value, 0);
}, [businessPlanItems]);
```

**Use useCallback for event handlers:**

```javascript
const handleCellChange = useCallback(
  (value, rowKey, columnKey) => {
    dispatch(setBusinessPlanItem({ value, rowKey, columnKey }));
  },
  [dispatch] // Only recreate if dispatch changes
);
```

**Split large components:**

```javascript
// ❌ DON'T: One huge component
function BusinessPlanDetail() {
  // 1000+ lines of code
}

// ✅ DO: Split into smaller components
function BusinessPlanDetail() {
  return (
    <>
      <BusinessPlanHeader />
      <BusinessPlanContent />
      <BusinessPlanFooter />
    </>
  );
}
```

### 9.5 Testing Tips

**Test Redux logic:**

```javascript
// Test reducer
test('setBusinessPlanItem updates cell value', () => {
  const initialState = {
    businessPlanItems: {
      REVENUE: {
        data: {
          UNIT_PRICE: {
            data: [{ columnKey: 'Jan-25', value: 100 }]
          }
        }
      }
    }
  };

  const action = setBusinessPlanItem({
    sectionKey: 'REVENUE',
    rowKey: 'UNIT_PRICE',
    columnKey: 'Jan-25',
    value: 150
  });

  const newState = businessDetailsReducer(initialState, action);

  expect(newState.businessPlanItems.REVENUE.data.UNIT_PRICE.data[0].value)
    .toBe(150);
});
```

**Test hooks:**

```javascript
// Test custom hook
import { renderHook, act } from '@testing-library/react-hooks';

test('useBusinessPlanDetails fetches data', async () => {
  const { result, waitForNextUpdate } = renderHook(
    () => useBusinessPlanDetails()
  );

  act(() => {
    result.current.getBusinessPlanDetail(436);
  });

  await waitForNextUpdate();

  expect(result.current.projectCode).toBe('GLBTM2500093');
});
```

---

## 10. Debugging Guide

### 10.1 Common Issues & Solutions

**Issue 1: Data not loading**

```javascript
// ❌ Problem: useEffect missing dependency
useEffect(() => {
  getBusinessPlanDetail(buId);
}, []); // Missing buId dependency

// ✅ Solution: Add dependency
useEffect(() => {
  getBusinessPlanDetail(buId);
}, [buId, getBusinessPlanDetail]);
```

**Issue 2: State not updating**

```javascript
// ❌ Problem: Mutating state directly
state.businessPlanItems[sectionKey].data[rowKey] = newValue;

// ✅ Solution: Use immutable update
state.businessPlanItems = {
  ...state.businessPlanItems,
  [sectionKey]: {
    ...state.businessPlanItems[sectionKey],
    data: {
      ...state.businessPlanItems[sectionKey].data,
      [rowKey]: newValue
    }
  }
};
```

**Issue 3: Infinite re-render loop**

```javascript
// ❌ Problem: Calling dispatch in render
function Component() {
  dispatch(someAction()); // Causes infinite loop
  return <div>...</div>;
}

// ✅ Solution: Use useEffect
function Component() {
  useEffect(() => {
    dispatch(someAction());
  }, [dispatch]);
  return <div>...</div>;
}
```

### 10.2 Redux DevTools

**View state:**
```javascript
// In browser console
window.__REDUX_DEVTOOLS_EXTENSION__.open();

// Inspect state tree
state.businessPlanDetails.businessPlanItems
```

**Time-travel debugging:**
- Click on any action in DevTools to see state at that point
- Use "Jump" to go back to previous state

### 10.3 Logging

**Add logging to hooks:**

```javascript
const useBusinessPlanDetails = () => {
  const businessPlanItems = useSelector(
    state => state.businessPlanDetails.businessPlanItems
  );

  // Log when data changes
  useEffect(() => {
    console.log('Business Plan Items:', businessPlanItems);
  }, [businessPlanItems]);

  // ...
};
```

---

## 11. Summary

### 11.1 Key Takeaways

1. **Architecture**: Redux Toolkit + Custom Hooks + Component-Based
2. **Data Flow**: Components → Hooks → Redux → API → Redux → Components
3. **State Management**: 5 main slices (Details, Revenue, Delivery, General, Approval)
4. **Custom Hooks**: Encapsulate business logic, provide clean API to components
5. **Mock API**: Development-friendly, enables offline work
6. **Component Hierarchy**: Container → Tabs → Sections → Tables/Forms

### 11.2 Quick Reference

| Task | File to Edit |
|------|--------------|
| Add new API endpoint | `redux/asyncThunks/` + `mockBusinessPlanApi.js` |
| Add new state field | `redux/reducers/` |
| Add new business logic | `hooks/` |
| Add new UI component | `BusinessPlanDetail/` |
| Change data structure | `redux/reducers/` + update transformations |
| Add validation | `hooks/` or Component level |

### 11.3 Next Steps

To customize Business Plan Detail:

1. **Understand current flow**: Read this document, trace code from `BusinessPlanDetail/index.jsx`
2. **Identify what to change**: UI? Logic? Data structure?
3. **Find the right place**: Component? Hook? Reducer?
4. **Make changes**: Follow patterns shown in examples
5. **Test**: Use Mock API to test changes locally
6. **Debug**: Use Redux DevTools + console.log

---

## 12. Appendix

### 12.1 File Index

**Main Files:**
- `/BusinessPlanDetail/index.jsx` - Main container (464 lines)
- `/hooks/useBusinessPlanDetails.js` - Main business logic (396 lines)
- `/redux/reducers/businessDetails.js` - Main state slice (313 lines)
- `/redux/asyncThunks/businessDetails.js` - API calls
- `/mockBusinessPlanApi.js` - Mock API (497 lines)
- `/mockBusinessPlanData.js` - Mock data (337 lines)

**Key Components:**
- `/BusinessPlanRevenue/index.jsx` - Revenue tab
- `/BusinessPlanDelivery/index.jsx` - Delivery tab
- `/BusinessPlanGeneralInformation/index.jsx` - General info tab
- `/BusinessPlanFormSection/index.jsx` - Dynamic form section

### 12.2 Constants Reference

**Status Values:**
- `DRAFT` - Draft version (editable)
- `VERIFICATION` - In review
- `PEER_REVIEW` - Peer review
- `APPROVED` - Approved (read-only)

**Section Keys:**
- `SOFTWARE_PRODUCTION_REVENUE`
- `OTHER_REVENUE`
- `SELLING_EXPENSES`
- `DELIVERY_PLAN`

**Row Keys (examples):**
- `UNIT_PRICE_DU`
- `MM_BILL_DU`
- `PRODUCTION_REVENUE`

### 12.3 API Endpoints Reference

See `BUSINESS_PLAN_MOCK_API.md` for complete API documentation.

---

**Document End**

*For questions or clarifications, refer to the code examples in this document or check the inline comments in the source code.*
