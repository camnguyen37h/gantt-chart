# Business Plan Detail - Comprehensive Component Analysis

## 📋 Overview
Phân tích chi tiết hệ thống Business Plan Detail đã được copy từ hệ thống phát triển vào `src/lib/business-plan`. Tài liệu này tổng hợp kiến trúc, logic nghiệp vụ, và luồng dữ liệu của toàn bộ module.

## 🏗️ Kiến Trúc Tổng Quan

### 1. Cấu Trúc Thư Mục

```
src/lib/business-plan/
├── BusinessPlanDetail/          # Component chính
│   ├── index.jsx                # Main container component
│   ├── style.css                # Styles
│   ├── constant.js              # Local constants
│   ├── SVGIcon.js              # Icon components
│   ├── ExportBusinessPlanDetail.js  # Export functionality
│   ├── ExportGeneralInfo.js    # Export general info
│   │
│   ├── BusinessPlanActivity/   # Tab Activity - theo dõi hoạt động
│   ├── BusinessPlanDelivery/   # Tab Delivery Plan - quản lý delivery
│   ├── BusinessPlanDocuments/  # Tab Documents - quản lý tài liệu
│   ├── BusinessPlanDropdownDu/ # Dropdown chọn DU
│   ├── BusinessPlanFormSection/# Main Business Plan form với calculations
│   ├── BusinessPlanGeneralInformation/  # General Information panel
│   ├── BusinessPlanReport/     # Report generation
│   ├── BusinessPlanRevenue/    # Tab Revenue Plan - quản lý revenue
│   ├── BusinessPlanStep/       # Workflow steps display
│   ├── BusinessPlanVersion/    # Version management header
│   └── FilterBusinessPlan/     # Filter functionality
│
├── hooks/                      # Custom React hooks
│   ├── index.js
│   ├── useBusinessPlanDetails.js      # Main business logic
│   ├── useBusinessPlanDelivery.js     # Delivery plan logic
│   ├── useBusinessPlanRevenue.js      # Revenue plan logic
│   ├── useBusinessPlanStep.js         # Workflow step logic
│   ├── useBusinessPlanForm.js         # Form calculations
│   ├── useBusinessPlanUpload.js       # Document upload
│   ├── useFormula.js                  # Formula calculations
│   └── useBussinessPlanHistoryService.jsx  # History service
│
├── redux/                      # State management
│   ├── asyncThunks/           # Async actions
│   │   ├── businessDetails.js
│   │   ├── businessApproval.js
│   │   ├── businessGeneralInformation.js
│   │   ├── businessDocuments.js
│   │   ├── businessPlanRevenue.js
│   │   ├── businessPlanDelivery.js
│   │   ├── businessComments.js
│   │   └── bussinessPlanHistoryThunks.js
│   │
│   └── reducers/              # State slices
│       ├── businessDetails.js
│       ├── businessApproval.js
│       ├── businessGeneralInformation.js
│       ├── businessDocuments.js
│       ├── businessPlanRevenue.js
│       ├── businessPlanDelivery.js
│       ├── businessComments.js
│       └── bussinessPlanHistoryReducers.js
│
├── constants.jsx              # Business constants & formulas
└── utils.js                   # Utility functions

```

---

## 🎯 Component Chính: BusinessPlanDetail

### File: `BusinessPlanDetail/index.jsx`

**Mục đích**: Container component chính điều phối toàn bộ Business Plan Detail

### Props
```javascript
{
  match: {
    params: {
      buId: string  // Business Plan Version ID
    }
  },
  history: Object  // React Router history
}
```

### State Management

#### Internal States
```javascript
const [loadingSave, setLoadingSave] = useState(false)
const [loadingSubmit, setLoadingSubmit] = useState(false)
const [loadingExport, setLoadingExport] = useState(false)
const [visible, setVisible] = useState(false)        // Cancel confirmation modal
const [activeTab, setActiveTab] = useState('1')      // Active business plan tab
```

#### Redux States (từ useBusinessPlanDetails hook)
- `isSaveShowed`: Hiển thị save confirmation bar
- `projectCode`: Mã dự án (MVV)
- `status`: Trạng thái BP (Draft, Approved, etc.)
- `originalBusinessPlanItems`: Dữ liệu Business Plan gốc
- `columns`: Column labels (MM columns)
- `startDate/endDate`: Thời gian dự án
- `versionId`: ID version hiện tại
- `generalInformationParams`: Thông tin chung

#### Redux States (Business Plan Revenue)
- `listDuRevenue`: Danh sách DU cho Revenue Plan
- `deliveryUnitDataRevenue`: DU data đang active
- `isEditingRevenuePlan`: Đang edit revenue plan

#### Redux States (Business Plan Delivery)
- `isSaveShowedDeliveryPlan`: Đang có thay đổi delivery plan
- `resourceInfoTableParams`: Params cho resource table
- `listDUDelivery`: Danh sách DU cho Delivery Plan
- `deliveryUnitDataDelivery`: DU data đang active
- `dataCreateRequest/dataUpdateRequest/dataDeleteRequest`: Batch changes

### Lifecycle & Effects

```javascript
useEffect(() => {
  // Load business plan detail và workflow khi mount
  (async () => {
    if (match.params.buId) {
      const res = await getBusinessPlanDetail(match.params.buId)
      if (res.type.includes('fulfilled'))
        await getBusinessPlanWorkflow({
          referenceId: match.params.buId,
          mvv: res.payload ? res.payload.projectCode : null,
        })
    }
  })()
}, [match.params.buId])

useEffect(() => {
  // Initialize validation và load DU lists
  dispatch(setValidation(defaultValidation))
  dispatch(getListDUByVersionDelivery({ businessPlanVersionId, type: 'Delivery' }))
  dispatch(getListDUByVersionRevenue({ businessPlanVersionId, type: 'Revenue' }))
}, [])
```

### Key Methods

#### 1. **onSaveDraft()**
```javascript
// Lưu bản nháp
// - Validate draft (không yêu cầu đầy đủ)
// - Lọc bỏ rows rỗng
// - Gọi API saveDraft
// - Reload history
```

#### 2. **onSubmit()**
```javascript
// Submit để gửi phê duyệt
// - Validate đầy đủ (required fields)
// - Gọi API submit
// - Reload business plan detail và workflow
// - Reload history
```

#### 3. **onBaselineRevenuePlan()**
```javascript
// Submit baseline cho Revenue Plan
// - Validate revenue plan
// - Gọi API postSubmitBaselineRevenuePlan
// - Trả về result
```

#### 4. **onBaselineDeliveryPlan()**
```javascript
// Submit baseline cho Delivery Plan
// - Nếu có changes: validate và save trước
// - Gọi API saveDeliveryPlan với isSubmit=true
// - Trả về result
```

#### 5. **handleCreateNewVersion()**
```javascript
// Tạo version mới
// - Gọi API createNewVersion
// - Navigate đến version mới
```

#### 6. **handleChangeTab(activeKey)**
```javascript
// Chuyển tab Business Plan
// - Nếu quay về tab Business Plan: reload data
// - Update active panel in Redux
```

### UI Structure (Render)

```jsx
<div className="main-content-pr">
  {/* Loading overlay */}
  <Loading loading={loadingCollaborator || loadingApproval} />
  
  {/* Version header với actions */}
  <BusinessPlanVersion 
    onSubmit={onSubmit}
    onBaselineRevenuePlan={onBaselineRevenuePlan}
    onBaselineDeliveryPlan={onBaselineDeliveryPlan}
    onCreateNewVersion={handleCreateNewVersion}
    onExport={handleExport}
  />
  
  <Divider />
  
  {/* Workflow steps */}
  <BusinessPlanStep status={status} projectCode={projectCode} />
  
  {/* Main collapsible panels */}
  <StyledCollapse>
    {/* Panel 1: General Information */}
    <Panel header="General Information">
      <BusinessPlanGeneralInformation />
    </Panel>
    
    {/* Panel 2: Business Plan với 3 tabs */}
    <Panel header="Business Plan">
      <Tabs activeKey={activeTab} onChange={handleChangeTab}>
        {/* Tab 1: Business Plan Formula */}
        <TabPane tab="Business Plan" key="1">
          <BusinessPlanFormSection />
        </TabPane>
        
        {/* Tab 2: Revenue Plan (nếu có DU) */}
        {listDuRevenue?.length > 0 && (
          <TabPane tab="Revenue Plan" key="2" disabled={isSaveShowedDeliveryPlan || isSaveShowed}>
            <BusinessPlanRevenue 
              businessVersion={buId}
              projectCode={projectCode}
              status={status}
              dataDu={listDuRevenue}
            />
          </TabPane>
        )}
        
        {/* Tab 3: Delivery Plan (nếu có DU) */}
        {listDUDelivery?.length > 0 && (
          <TabPane tab="Delivery Plan" key="3" disabled={isEditingRevenuePlan || isSaveShowed}>
            <BusinessPlanDelivery 
              ref={businessPlanDeliveryRef}
              buId={buId}
              mvv={projectCode}
              status={status}
              dataDu={listDUDelivery}
            />
          </TabPane>
        )}
      </Tabs>
    </Panel>
    
    {/* Panel 3: Documents */}
    <Panel header="Documents">
      <BusinessPlanDocuments />
    </Panel>
    
    {/* Panel 4: Activity */}
    <Panel header="Activity">
      <BusinessPlanActivity />
    </Panel>
  </StyledCollapse>
  
  {/* Sticky save/cancel bar (hiển thị khi có changes) */}
  <StyledAffix className={isSaveShowed ? 'active' : ''}>
    <Popconfirm onConfirm={handleConfirmCancel}>
      <Button onClick={handleCancel}>Cancel</Button>
    </Popconfirm>
    <Button type="primary" onClick={onSaveDraft} loading={loadingSave}>
      Save
    </Button>
  </StyledAffix>
</div>
```

---

## 🎨 Sub-Components Chi Tiết

### 1. BusinessPlanGeneralInformation

**Mục đích**: Quản lý thông tin chung của Business Plan

**File**: `BusinessPlanDetail/BusinessPlanGeneralInformation/index.jsx`

#### Dữ Liệu Quản Lý

##### A. Collaborator Information
Quản lý danh sách các role:
- **AM** (Account Manager)
- **Team Lead**
- **Adviser**
- **Preparator**
- **Pre-Sale**
- **PM** (Project Manager)

Mỗi collaborator có:
```javascript
{
  id: number | null,
  ldap: string,        // Username
  startDate: Date,
  endDate: Date
}
```

##### B. Industry Information
- **Industry Domain**: Lĩnh vực (Automotive, Banking, etc.)
- **Currency**: Loại tiền tệ
- **Exchange Rate**: Tỷ giá
- **Total Contract Price**: Tổng giá trị hợp đồng
- **Software Development Fee**: Phí phát triển phần mềm
- **Other Fees**: Các phí khác

##### C. KPI Bonus
```javascript
{
  kpiPm: number,      // KPI cho PM
  kpiQa: number,      // KPI cho QA
  kpiMember: number,  // KPI cho Member
  total: number       // Tổng (phải = kpiPm + kpiQa + kpiMember)
}
```

##### D. Project Planning
- **Planning Start Date**: Ngày bắt đầu kế hoạch
- **Planning End Date**: Ngày kết thúc kế hoạch

#### Validation Rules

1. **Collaborators**:
   - Ít nhất 1 AM phải có
   - Ít nhất 1 Team Lead phải có
   - Ít nhất 1 Preparator phải có
   - Ít nhất 1 PM phải có
   - LDAP không được trùng trong cùng role

2. **Industry**:
   - Industry Domain bắt buộc
   - Currency bắt buộc

3. **KPI Bonus**:
   - Total phải bằng tổng kpiPm + kpiQa + kpiMember
   - Mỗi giá trị phải <= max setting

#### UI Components

```jsx
<div>
  {/* Project Information (Read-only) */}
  <GeneralInformationHeader 
    businessPlanName={...}
    customerName={...}
    orderType={...}
    recurringNew={...}
    cooperationPeriod={...}
    customerMarket={...}
  />
  
  {/* Collaborators Tables */}
  <CollaboratorSection>
    <Table dataSource={listAM} columns={collaboratorColumns} />
    <Table dataSource={listPM} columns={collaboratorColumns} />
    <Table dataSource={listTeamLead} columns={collaboratorColumns} />
    <Table dataSource={listPreparator} columns={collaboratorColumns} />
    <Table dataSource={listPreSale} columns={collaboratorColumns} />
    <Table dataSource={listAdviser} columns={collaboratorColumns} />
  </CollaboratorSection>
  
  {/* Industry Information */}
  <IndustrySection>
    <Select value={industryDomain} onChange={...} />
    <Select value={industryCurrency} onChange={...} />
    <InputNumber value={exchangeRate} onChange={...} />
    <InputNumber value={totalContractPrice} onChange={...} />
    <InputNumber value={softwareDevelopmentFee} onChange={...} />
    <InputNumber value={otherFees} onChange={...} />
  </IndustrySection>
  
  {/* KPI Bonus */}
  <KpiBonusSection>
    <InputNumber value={kpiPm} max={maxKpiPm} />
    <InputNumber value={kpiQa} max={maxKpiQa} />
    <InputNumber value={kpiMember} max={maxKpiMember} />
    <div>Total: {total}</div>
  </KpiBonusSection>
  
  {/* Planning Dates */}
  <DatePicker value={planningStartDate} />
  <DatePicker value={planningEndDate} />
</div>
```

---

### 2. BusinessPlanFormSection

**Mục đích**: Form chính với tất cả calculations & formulas của Business Plan

**File**: `BusinessPlanDetail/BusinessPlanFormSection/index.jsx`

**Đây là component phức tạp nhất**, chứa:
- Dynamic table với editable cells
- Formula calculations tự động
- Row/column management
- Comparison với norm values

#### Data Structure

##### Section Structure
```javascript
{
  sectionKey: string,      // MAN_MONTH, REVENUES, COST_PRICE, etc.
  sectionName: string,
  rowLabels: [
    {
      rowKey: string,      // MM_BILL, UNIT_PRICE, etc.
      label: string,       // Row label text
      cellList: [
        {
          columnKey: string,  // TOTAL, SALE_001, DU_001, etc.
          value: number | null,
          editable: boolean,
          formula: string | null,
          normFloor: number | null,
          normCeiling: number | null,
          normPercentage: number | null
        }
      ]
    }
  ]
}
```

#### Sections & Rows

##### 1. **MAN_MONTH Section** (Man-month data)
Rows:
- `MM_BILL`: MM Bill - số effort KH thanh toán
- `UNIT_PRICE`: Đơn giá = Doanh thu / MM Bill
- `MM_PRODUCTION`: MM Effort - số effort sử dụng thực tế
- `MM_BILL_SERVICE`: Phân chia MM bill theo service
- `PRODUCTION_MM_BONUS`: Hệ số thưởng sản xuất

##### 2. **REVENUES Section**
Rows:
- `SOFTWARE_PRODUCTION_REVENUES`: Doanh thu từ phát triển phần mềm
- `ONSITE_FEE`: Phí onsite
- `EQUIPMENT_FEE`: Doanh thu từ thiết bị, server
- `OTHER_FEE`: Doanh thu khác (có thể add nhiều row)

**Công thức tính REVENUES**:
```
REVENUES = SOFTWARE_PRODUCTION_REVENUES + ONSITE_FEE + EQUIPMENT_FEE + Σ(OTHER_FEE)
```

##### 3. **COST_PRICE Section** (Chi phí)
Rows:
- `COST_PRICE_TOTAL`: Tổng chi phí bán hàng
- `COST_OF_DU_SOLD`: Chi phí DU sold (ratecard DU)

##### 4. **DELIVERY_EXPENSES Section**
Rows:
- `DIRECT_LABOR_COST`: Chi phí nhân công trực tiếp
- `OUTSOURCING_COST`: Chi phí thuê ngoài
- `EQUIPMENT_INTERNET_SERVER_COST`: Chi phí thiết bị, internet, server
- `ONSITE_DEVELOPMENT_COST`: Chi phí onsite
- `PROJECT_BONUS`: Thưởng dự án
- `OVERTIME`: Chi phí overtime
- `NON_DEDUCTION_VAT`: VAT không được khấu trừ
- `OTHER_EXPENSES`: Chi phí khác (có thể add nhiều row)

**Công thức**:
```
DELIVERY_EXPENSES = DIRECT_LABOR_COST + OUTSOURCING_COST + ... + Σ(OTHER_EXPENSES)
```

##### 5. **SELLING_EXPENSES Section**
Rows:
- `SELLING_EXPENSES_TOTAL`: Tổng chi phí bán hàng
- `INCENTIVES`: Incentive = Revenue × Incentives Rate
- `AGENCY_EXPENSE`: Chi phí môi giới

**Công thức**:
```
SELLING_EXPENSES_TOTAL = INCENTIVES + AGENCY_EXPENSE
```

##### 6. **TAX Section**
Rows:
- `TAX_TOTAL`: Tổng thuế
- `PIC_CIT`: CIT và VAT (%)

**Công thức**:
```
TAX_TOTAL = REVENUES × PIC_CIT / 100
```

##### 7. **MARGIN Section** (Lợi nhuận)
Rows:
- `DIRECT_MARGIN`: Lợi nhuận trực tiếp
- `DIRECT_MARGIN_RATE`: Tỷ lệ lợi nhuận trực tiếp (%)
- `DIRECT_MARGIN_BONUS`: Direct margin trước incentive & bonus
- `DIRECT_MARGIN_BONUS_RATE`: Tỷ lệ (%)
- `ALLOCATION_OF_POOL_AND_UNBILLABLE`: Phân bổ pool & unbillable
- `INDIRECT_MARGIN`: Lợi nhuận gián tiếp
- `INDIRECT_MARGIN_RATE`: Tỷ lệ (%)

**Công thức**:
```javascript
DIRECT_MARGIN = REVENUES - COST_PRICE_TOTAL - SELLING_EXPENSES_TOTAL 
                - DELIVERY_EXPENSES - TAX_TOTAL - DEDUCTION

DIRECT_MARGIN_RATE = (DIRECT_MARGIN / REVENUES) × 100

DIRECT_MARGIN_BONUS = DIRECT_MARGIN + INCENTIVES + PROJECT_BONUS

DIRECT_MARGIN_BONUS_RATE = (DIRECT_MARGIN_BONUS / REVENUES) × 100

ALLOCATION_OF_POOL_AND_UNBILLABLE = (DIRECT_LABOR_COST / BILL_RATE_NORM) - DIRECT_LABOR_COST

INDIRECT_MARGIN = DIRECT_MARGIN - ALLOCATION_OF_POOL_AND_UNBILLABLE

INDIRECT_MARGIN_RATE = (INDIRECT_MARGIN / REVENUES) × 100
```

##### 8. **REFERENCE Section** (Chỉ số tham khảo)
Rows:
- `BILLABLE_RATE`: Tỷ lệ billable = (MM_BILL / MM_PRODUCTION) × 100
- `BILL_RATE_NORM`: Định mức billable rate (%)
- `INCENTIVES_RATE`: Tỷ lệ incentive (%)
- `DELIVERY_AVERAGE_EXPENSES`: Chi phí delivery trung bình
- `SALARY_AVERAGE_EXPENSES`: Lương trung bình
- `PRODUCTIVITY`: Năng suất
- `EFFICIENCY`: Hiệu quả

#### Columns (Dynamic)

Columns được tạo động dựa trên:
- **TOTAL**: Tổng tất cả
- **SALE + BU columns**: Cột Business Unit (từ General Info)
- **INTERNAL**: Cột internal
- **DU columns**: Các Delivery Unit

Format column key:
```javascript
TOTAL: "TOTAL"
BU: "SALE_001", "SALE_002", ...
DU: "DU_001", "DU_002", ...
INTERNAL: "INTERNAL"
```

#### Formula System

**useFormula hook** xử lý calculations:

```javascript
const { calculateFormula } = useFormula()

// Tính toán khi có thay đổi
useEffect(() => {
  const newItems = calculateFormula(businessPlanItems)
  // Update state
}, [businessPlanItems])
```

**Formula flow**:
1. User nhập giá trị vào editable cell
2. Trigger `setBusinessPlanItem` action
3. useFormula recalculate tất cả formulas
4. Update tất cả dependent cells
5. Re-render table

#### Editable Cells

```javascript
const isEditable = (row, column, status) => {
  // Chỉ edit được khi Draft
  if (status !== 'Draft') return false
  
  // Không edit được TOTAL, INTERNAL (trừ special cases)
  if (column === 'TOTAL' || column === 'INTERNAL') {
    // Có exception: DIRECT_LABOR_COST có thể edit INTERNAL nếu có permission
    if (row.canEditInternal && hasPermission) return true
    return false
  }
  
  // Cell có formula không edit được
  if (cell.formula) return false
  
  // Cell có editable flag
  return cell.editable
}
```

#### Row Management

**Add Row**:
```javascript
const handleAddRow = (sectionKey) => {
  const newRowKey = generateRowKey()  // e.g., "OTHER_FEE_001"
  const newRow = {
    rowKey: newRowKey,
    label: '',  // User sẽ nhập
    cellList: columns.map(col => ({
      columnKey: col.key,
      value: null,
      editable: sectionConfig[sectionKey].newRowEditable(col.key),
      formula: col.key === 'TOTAL' ? 'SUM' : null
    }))
  }
  dispatch(addBusinessPlanRow({ sectionKey, rowKey: newRowKey, row: newRow }))
}
```

**Update Row**:
```javascript
const handleUpdateRow = (sectionKey, rowKey, label) => {
  dispatch(updateBusinessPlanRow({ sectionKey, rowKey, label }))
}
```

**Delete Row**:
```javascript
const handleDeleteRow = (sectionKey, rowKey) => {
  dispatch(deleteBusinessPlanRow({ sectionKey, rowKey }))
}
```

---

### 3. BusinessPlanRevenue

**Mục đích**: Quản lý Revenue Plan theo từng DU

**File**: `BusinessPlanDetail/BusinessPlanRevenue/index.jsx`

#### Features

##### A. DU Selection
```jsx
<BusinessPlanDropdownDu 
  dataDu={dataDu}
  deliveryUnitData={deliveryUnitDataRevenue}
  onChange={(du) => dispatch(setDeliveryUnitDataRevenue(du))}
/>
```

##### B. Tabs trong Revenue Plan

###### Tab 1: Summary
Hiển thị tổng hợp revenue plan:
- Total Revenue
- Revenue by type (Software, Onsite, Equipment, Other)
- Pipeline status impact

###### Tab 2: Software Production Revenue Information
Table editable theo tháng với columns:
- Month (MM-YYYY)
- MM Bill
- Unit Price (đơn giá DU bán cho BU)
- Pipeline Status Ratio (0-100%)
- Revenue = MM Bill × Unit Price × Pipeline Status Ratio / 100

```javascript
// Structure
{
  id: number,
  month: string,           // "01-2024"
  mmBill: number,
  unitPrice: number,
  pipelineStatusRatio: number,
  revenue: number          // Calculated
}
```

###### Tab 3: Other Revenues
Table để nhập các revenue khác:
- Revenue Name
- Revenue Type (Onsite Fee / Equipment / Other)
- Month
- Amount
- Actions (Add/Edit/Delete)

```javascript
{
  id: number,
  revenueName: string,
  revenueType: number,     // 0: Onsite Fee, 1: Equipment, 2: Other
  month: string,
  amount: number
}
```

###### Tab 4: Selling Expenses
Table để nhập chi phí bán hàng (Agency Expense):
- Expense Name
- Expense Type (Agency Expense)
- Month
- Amount

```javascript
{
  id: number,
  expenseName: string,
  expenseType: number,     // 3: Agency Expense
  month: string,
  amount: number
}
```

###### Tab 5: History
Lịch sử thay đổi revenue plan

#### State Management

```javascript
// Local state
const [expandPanel, setExpandPanel] = useState(['Summary'])
const [loadingSave, setLoadingSave] = useState(false)

// Redux state
const {
  isSaveConfirmShowed,           // Có thay đổi chưa save
  updateOtherRevenuesData,       // Data update
  deleteOtherRevenuesData,       // Data delete
  createOtherRevenuesData,       // Data create
  updateSellingExpensesData,
  deleteSellingExpensesData,
  createSellingExpensesData,
  listRevenueInvalid             // Validation errors
} = useSelector(state => state.businessPlanRevenue)
```

#### Key Methods

##### Save Revenue Plan
```javascript
const handleSave = async () => {
  // Validate
  const isValid = validateRevenuePlan()
  if (!isValid) return
  
  // Prepare data
  const params = {
    businessPlanId,
    groupId: [deliveryUnitDataRevenue.groupId],
    otherRevenues: {
      create: createOtherRevenuesData,
      update: updateOtherRevenuesData,
      delete: deleteOtherRevenuesData
    },
    sellingExpenses: {
      create: createSellingExpensesData,
      update: updateSellingExpensesData,
      delete: deleteSellingExpensesData
    }
  }
  
  // Call API
  await dispatch(postBusinessPlanOtherRevenue(params))
  
  // Reload summary
  await dispatch(getSummaryRevenuePlan({ businessPlanId, groupId }))
  
  dispatch(setIsSaveConfirmShowed(false))
}
```

---

### 4. BusinessPlanDelivery

**Mục đích**: Quản lý Delivery Plan (resources & expenses) theo DU

**File**: `BusinessPlanDetail/BusinessPlanDelivery/index.jsx`

#### Features

##### A. Panels

###### Panel 1: Summary
Tổng hợp thông tin:
- Total MM Effort
- Total Direct Labor Cost
- Total Outsourcing Cost
- Total Other Expenses
- Billable Rate

###### Panel 2: Resource Information
**Table phức tạp nhất**, quản lý resources theo tháng:

Columns:
- **Resource Name** (LDAP)
- **Position/Level** (Junior, Senior, PM, etc.)
- **Resource Type** (Internal / Outsourcing)
- **Location**
- **MM per month** (theo từng tháng)
- **Total MM**
- **Unit Price** (đơn giá)
- **Total Cost**

```javascript
{
  id: number,
  resourceId: string,        // LDAP
  resourceName: string,
  position: string,
  level: string,
  resourceType: string,      // INTERNAL / OUTSOURCING
  location: string,
  locationExchangeRate: number,
  monthlyData: {
    "01-2024": number,       // MM value
    "02-2024": number,
    ...
  },
  totalMM: number,           // Calculated
  unitPrice: number,
  totalCost: number          // Calculated = totalMM × unitPrice
}
```

**View Types**:
- `MONTH_VIEW`: Hiển thị theo tháng
- `QUARTER_VIEW`: Hiển thị theo quý
- `YEAR_VIEW`: Hiển thị theo năm

###### Panel 3: Other Expenses
Table quản lý các chi phí khác:
- Expense Name
- Expense Type (Equipment / Onsite / Overtime / VAT / Other)
- Month
- Amount

```javascript
{
  id: number,
  expenseName: string,
  expenseType: number,
  month: string,
  amount: number
}
```

###### Panel 4: Delivery Plan Reference
Hiển thị thông tin tham khảo:
- Total Revenue (from Revenue Plan)
- Direct Margin
- Billable Rate

###### Panel 5: History
Lịch sử thay đổi delivery plan

#### State Management

```javascript
// Redux state
const {
  isSaveShowedDeliveryPlan,
  resourceInfoTableParams: {
    viewType,              // MONTH / QUARTER / YEAR
    data                   // Resource data
  },
  listDUDelivery,
  deliveryUnitDataDelivery,
  dataCreateRequest,       // Resources & expenses to create
  dataUpdateRequest,       // Resources & expenses to update
  dataDeleteRequest,       // Resources & expenses to delete
  errorDataSubmit          // Validation errors
} = useSelector(state => state.businessPlanDelivery)
```

#### Key Methods

##### Add Resource
```javascript
const handleAddResource = () => {
  const newResource = {
    id: null,
    resourceId: '',
    resourceName: '',
    position: '',
    level: '',
    resourceType: 'INTERNAL',
    location: '',
    monthlyData: generateEmptyMonthlyData(startDate, endDate),
    unitPrice: null
  }
  
  dispatch(addResourceToCreateRequest(newResource))
}
```

##### Update Resource
```javascript
const handleUpdateResource = (resourceId, field, value) => {
  // Nếu resource đã tồn tại (có id), add vào updateRequest
  if (resource.id) {
    dispatch(updateResourceInUpdateRequest({ resourceId, field, value }))
  } else {
    // Nếu là resource mới, update trong createRequest
    dispatch(updateResourceInCreateRequest({ resourceId, field, value }))
  }
  
  // Recalculate totals
  if (field.startsWith('month_')) {
    recalculateTotalMM(resourceId)
  }
  recalculateTotalCost(resourceId)
}
```

##### Delete Resource
```javascript
const handleDeleteResource = (resourceId) => {
  const resource = findResource(resourceId)
  
  if (resource.id) {
    // Đã lưu trong DB, add vào deleteRequest
    dispatch(addResourceToDeleteRequest(resource.id))
  } else {
    // Chưa lưu, remove khỏi createRequest
    dispatch(removeResourceFromCreateRequest(resourceId))
  }
}
```

##### Save Delivery Plan
```javascript
const handleSave = async () => {
  // Validate
  const isValid = validateDeliveryPlan()
  if (!isValid) return
  
  const params = {
    businessPlanId,
    groupId: [deliveryUnitDataDelivery.groupId],
    isSubmit: false,
    viewType,
    loadDataFromType: '',
    dataCreateRequest,
    dataUpdateRequest,
    dataDeleteRequest
  }
  
  await dispatch(saveDeliveryPlan(params))
  
  // Reload data
  await dispatch(getResourcesInformationDeliveryPlan({...}))
  await dispatch(getSummaryDeliveryPlan({...}))
  
  // Clear requests
  dispatch(resetSaveDeliveryPlanParams())
  dispatch(setIsSaveShowedDeliveryPlan(false))
}
```

##### Validate
```javascript
const handleValidate = () => {
  const errors = []
  
  // Check resources
  resourceInfoData.forEach(resource => {
    if (!resource.resourceId) {
      errors.push({ id: resource.id, field: 'resourceId', message: 'Required' })
    }
    if (!resource.position) {
      errors.push({ id: resource.id, field: 'position', message: 'Required' })
    }
    if (!resource.unitPrice) {
      errors.push({ id: resource.id, field: 'unitPrice', message: 'Required' })
    }
    
    // Check at least 1 month has value
    const hasMonthData = Object.values(resource.monthlyData).some(v => v > 0)
    if (!hasMonthData) {
      errors.push({ id: resource.id, field: 'monthlyData', message: 'At least 1 month required' })
    }
  })
  
  dispatch(setErrorDataSubmitDeliveryPlan(errors))
  return errors.length === 0
}
```

---

### 5. BusinessPlanVersion

**Mục đích**: Header với version info và action buttons

**File**: `BusinessPlanDetail/BusinessPlanVersion/index.jsx`

#### UI Layout

```jsx
<Header>
  <div>
    <h2>{projectCode} - {version}</h2>
    <Tag color={STATUS_COLOR[status]}>{status}</Tag>
  </div>
  
  <Actions>
    {status === 'Draft' && (
      <>
        <Button onClick={onSubmit} loading={loadingSubmit}>
          Submit for Approval
        </Button>
        <Button onClick={onBaselineRevenuePlan}>
          Baseline Revenue Plan
        </Button>
        <Button onClick={onBaselineDeliveryPlan}>
          Baseline Delivery Plan
        </Button>
      </>
    )}
    
    {status === 'Approved' && (
      <Button onClick={onCreateNewVersion}>
        Create New Version
      </Button>
    )}
    
    <Button onClick={onExport} loading={loadingExport}>
      Export PDF
    </Button>
  </Actions>
</Header>
```

---

### 6. BusinessPlanStep

**Mục đích**: Hiển thị workflow steps

**File**: `BusinessPlanDetail/BusinessPlanStep/index.jsx`

#### Workflow Statuses

```javascript
const WORKFLOW_STEPS = [
  {
    status: 'DRAFT',
    title: 'Draft',
    icon: 'edit',
    description: 'Business plan is being prepared'
  },
  {
    status: 'PEER_REVIEW',
    title: 'Peer Review',
    icon: 'team',
    description: 'Under peer review'
  },
  {
    status: 'VERIFICATION',
    title: 'Verification',
    icon: 'check-circle',
    description: 'Being verified'
  },
  {
    status: 'APPROVED',
    title: 'Approved',
    icon: 'check',
    description: 'Approved and active'
  }
]
```

#### Render

```jsx
<Steps current={currentStep}>
  {WORKFLOW_STEPS.map(step => (
    <Step 
      key={step.status}
      title={step.title}
      description={step.description}
      icon={<Icon type={step.icon} />}
      status={getStepStatus(step)}
    />
  ))}
</Steps>
```

---

### 7. BusinessPlanDocuments

**Mục đích**: Quản lý documents đính kèm

**File**: `BusinessPlanDetail/BusinessPlanDocuments/index.jsx`

#### Features

- Upload files
- Download files
- Delete files
- View file list với metadata

```javascript
{
  id: number,
  fileName: string,
  fileSize: number,
  uploadDate: Date,
  uploadedBy: string,
  fileUrl: string
}
```

---

### 8. BusinessPlanActivity

**Mục đích**: Hiển thị activity log

**File**: `BusinessPlanDetail/BusinessPlanActivity/index.jsx`

#### Activity Types

```javascript
const ACTIVITY_TYPES = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  SUBMIT: 'Submitted',
  APPROVE: 'Approved',
  REJECT: 'Rejected',
  COMMENT: 'Commented'
}
```

#### Structure

```javascript
{
  id: number,
  activityType: string,
  activityKey: string,
  userName: string,
  userFullName: string,
  activityDate: Date,
  description: string,
  metadata: Object
}
```

---

## 🔄 Redux Architecture

### State Slices

#### 1. businessDetails
```javascript
{
  isSaveShowed: boolean,
  businessPlanItems: Object,            // Structured by sections
  columns: Array,                       // Column definitions
  exchangeRate: number,
  totalContractPrice: number,
  softwareDevelopmentFee: number,
  otherFees: number,
  validation: Object,
  projectCode: string,
  version: string,
  status: string,
  originalBusinessPlanItems: Array,     // Raw data from API
  compareBusinessPlanItems: Object,     // For comparison view
  listVersions: Array,
  startDate: string,
  endDate: string,
  versionId: number,
  warningMessage: string,
  activePanel: string
}
```

**Actions**:
- `setIsSaveShowed`
- `setBusinessPlanItem` - Update single cell
- `addBusinessPlanRow` - Add new row
- `updateBusinessPlanRow` - Update row label
- `deleteBusinessPlanRow` - Delete row
- `setContractPriceData` - Update contract pricing
- `setValidation` - Set validation errors

**Async Thunks**:
- `getBusinessPlanDetail(id)` - Load business plan
- `getCompareBusinessPlanDetail(id)` - Load for comparison

---

#### 2. businessGeneralInformation
```javascript
{
  listGeneralInformation: {
    businessPlanName: string,
    customerName: string,
    exchangeRate: number,
    orderType: string,
    recurringNew: string,
    totalContractPrice: number,
    cooperationPeriod: string,
    customerMarket: string
  },
  listDomain: Array,                    // Master data: domains
  listCurrency: Array,                  // Master data: currencies
  loadingCollaborator: boolean,
  listAM: Array,
  listAdviser: Array,
  listPreSale: Array,
  listPreparator: Array,
  listTeamLead: Array,
  listPM: Array,
  industryDomain: string,
  industryCurrency: string,
  businessPlanKpiDTO: {
    kpiPm: number,
    kpiQa: number,
    kpiMember: number
  },
  businessPlanSettingMaxKpiSetting: {
    maxKpiPm: number,
    maxKpiQa: number,
    maxKpiMember: number,
    maxTotal: number
  },
  planningStartDate: Date,
  planningEndDate: Date
}
```

**Actions**:
- `handleChangeInputValueCollaborator` - Update collaborator
- `handleChangeDateGeneralInfo` - Update planning dates
- `setKpiBonusData` - Update KPI bonus

**Async Thunks**:
- `getIndustryCurrency()` - Load currencies
- `getIndustryDomain()` - Load domains
- `getBusinessPlanSettingMaxKPI()` - Load max KPI settings

---

#### 3. businessPlanRevenue
```javascript
{
  isSaveConfirmShowed: boolean,
  listDuRevenue: Array,                 // Available DUs
  deliveryUnitDataRevenue: Object,      // Selected DU
  summaryRevenuePlan: Object,           // Summary data
  otherRevenuesData: Array,
  sellingExpensesData: Array,
  createOtherRevenuesData: Array,
  updateOtherRevenuesData: Array,
  deleteOtherRevenuesData: Array,
  createSellingExpensesData: Array,
  updateSellingExpensesData: Array,
  deleteSellingExpensesData: Array,
  listRevenueInvalid: Array,
  isLoadingOtherRevenues: boolean,
  isLoadingSellingExpenses: boolean
}
```

**Actions**:
- `setIsSaveConfirmShowed`
- `setDeliveryUnitDataRevenue` - Select DU
- `setDuValueRevenue` - Update DU value
- `setListRevenueInvalid` - Validation errors

**Async Thunks**:
- `getListDUByVersionRevenue(params)` - Load DU list
- `getSummaryRevenuePlan(params)` - Load summary
- `getBusinessPlanOtherRevenue(params)` - Load other revenues
- `getBusinessPlanSellingExpenses(params)` - Load selling expenses
- `postBusinessPlanOtherRevenue(params)` - Save changes
- `postSubmitBaselineRevenuePlan(params)` - Submit baseline
- `resetSummaryRevenuePlan()` - Clear summary

---

#### 4. businessPlanDelivery
```javascript
{
  isSaveShowedDeliveryPlan: boolean,
  listDUDelivery: Array,
  deliveryUnitDataDelivery: Object,
  resourceInfoTableParams: {
    viewType: string,                   // MONTH / QUARTER / YEAR
    data: Array
  },
  summaryDeliveryPlan: Object,
  otherExpensesData: Array,
  dataCreateRequest: Array,
  dataUpdateRequest: Array,
  dataDeleteRequest: Array,
  errorDataSubmit: Array,
  loadDataFromValue: string,
  locationExchangeRates: Array
}
```

**Actions**:
- `setIsSaveShowedDeliveryPlan`
- `setDeliveryUnitDataDelivery`
- `setDuValueDelivery`
- `setLoadDataFromValue`
- `setErrorDataSubmitDeliveryPlan`
- `resetSaveDeliveryPlanParams`

**Async Thunks**:
- `getListDUByVersionDelivery(params)`
- `getResourcesInformationDeliveryPlan(params)`
- `getSummaryDeliveryPlan(params)`
- `getOtherExpensesTable(params)`
- `getLocationExchangeRate(params)`
- `saveDeliveryPlan(params)`
- `resetSummaryDeliveryPlan()`

---

#### 5. businessApproval
```javascript
{
  workflowData: Object,
  currentStep: number,
  loadingApproval: boolean,
  approvalHistory: Array
}
```

**Async Thunks**:
- `getBusinessPlanWorkflow(params)` - Load workflow info
- `approveBusinessPlan(params)` - Approve
- `rejectBusinessPlan(params)` - Reject

---

#### 6. businessDocuments
```javascript
{
  listDocuments: Array,
  loadingDocuments: boolean
}
```

**Async Thunks**:
- `getBusinessPlanDocuments(params)`
- `uploadDocument(params)`
- `deleteDocument(params)`

---

#### 7. businessComments
```javascript
{
  listComments: Array,
  loadingComments: boolean
}
```

---

#### 8. bussinessPlanHistory
```javascript
{
  historyData: Array,
  loadingHistory: boolean
}
```

**Async Thunks**:
- `getBusinessPlanHistory(id)`

---

## 🎣 Custom Hooks

### 1. useBusinessPlanDetails

**File**: `hooks/useBusinessPlanDetails.js`

**Purpose**: Main hook quản lý Business Plan Detail logic

**Returns**:
```javascript
{
  // State từ Redux
  isSaveShowed,
  exchangeRate,
  totalContractPrice,
  projectCode,
  version,
  status,
  originalBusinessPlanItems,
  columns,
  validation,
  listVersions,
  id,
  startDate,
  endDate,
  versionId,
  softwareDevelopmentFee,
  otherFees,
  warningMessage,
  errorMessage,
  generalInformationParams,      // Computed từ general information
  
  // Methods
  getBusinessPlanDetail(id),
  updateIsSaveShowed(value),
  saveDraft(params),
  submit(params),
  createNewVersion(id),
  setContractPriceData(value)
}
```

**Key Methods**:

```javascript
// Validate draft (không yêu cầu đầy đủ)
const handleValidateDraft = () => {
  // Chỉ check collaborators có ít nhất 1
  const validation = {
    listAM: !handleCheckAtLeastOneFilled(listAM),
    listTeamLead: !handleCheckAtLeastOneFilled(listTeamLead),
    listPreparator: !handleCheckAtLeastOneFilled(listPreparator),
    listPM: !handleCheckAtLeastOneFilled(listPM)
  }
  
  dispatch(setValidation(validation))
  return !Object.values(validation).some(v => v === true)
}

// Validate đầy đủ khi submit
const handleValidate = () => {
  const itemsValidation = {}
  const generalValidation = {}
  
  // Validate từng cell bắt buộc
  originalBusinessPlanItems.forEach(section => {
    section.rowLabels.forEach(row => {
      const rowKey = row.rowKey
      const rowConfig = getRowConfig()[rowKey]
      
      // Check label
      if (!row.label || !row.label.toString().trim()) {
        itemsValidation[`${rowKey}-label`] = true
      }
      
      // Check required cells
      row.cellList.forEach(cell => {
        if (cell.editable && cell.value === null && rowConfig?.required) {
          itemsValidation[`${rowKey}-${cell.columnKey}`] = true
        }
      })
    })
  })
  
  // Validate general information
  generalValidation.industryCurrency = !industryCurrency
  generalValidation.industryDomain = !industryDomain
  generalValidation.exchangeRate = !exchangeRate
  generalValidation.totalContractPrice = !totalContractPrice
  generalValidation.listAM = !handleCheckAtLeastOneFilled(listAM)
  generalValidation.listTeamLead = !handleCheckAtLeastOneFilled(listTeamLead)
  generalValidation.listPreparator = !handleCheckAtLeastOneFilled(listPreparator)
  generalValidation.listPM = !handleCheckAtLeastOneFilled(listPM)
  
  // Validate KPI Bonus
  const kpiValidation = handleValidateKpiBonus(businessPlanKpiDTO)
  const totalKpiValid = validateTotalKpiBonus(
    businessPlanKpiDTO, 
    businessPlanSettingMaxKpiSetting.maxTotal
  )
  
  const allValidation = {
    ...itemsValidation,
    ...generalValidation,
    ...kpiValidation,
    kpiTotal: !totalKpiValid
  }
  
  dispatch(setValidation(allValidation))
  
  return !Object.values(allValidation).some(v => v === true)
}
```

---

### 2. useBusinessPlanForm

**File**: `hooks/useBusinessPlanForm.js`

**Purpose**: Quản lý form interactions

**Returns**:
```javascript
{
  handleCellChange(sectionKey, rowKey, columnKey, value),
  handleRowAdd(sectionKey),
  handleRowUpdate(sectionKey, rowKey, label),
  handleRowDelete(sectionKey, rowKey)
}
```

---

### 3. useFormula

**File**: `hooks/useFormula.js`

**Purpose**: Tính toán formulas

**Returns**:
```javascript
{
  calculateFormula(businessPlanItems)
}
```

**Logic**:
```javascript
const calculateFormula = (items) => {
  const newItems = cloneDeep(items)
  
  // Calculate theo thứ tự dependencies
  
  // 1. Calculate TOTAL columns (SUM of all other columns)
  calculateTotalColumns(newItems)
  
  // 2. Calculate REVENUES
  calculateRevenues(newItems)
  
  // 3. Calculate DELIVERY_EXPENSES
  calculateDeliveryExpenses(newItems)
  
  // 4. Calculate TAX
  calculateTax(newItems)
  
  // 5. Calculate MARGINS
  calculateMargins(newItems)
  
  // 6. Calculate REFERENCE metrics
  calculateReference(newItems)
  
  return newItems
}

const calculateTotalColumns = (items) => {
  items.forEach(section => {
    section.rowLabels.forEach(row => {
      const totalCell = row.cellList.find(c => c.columnKey === 'TOTAL')
      if (totalCell && totalCell.formula === 'SUM') {
        const sum = row.cellList
          .filter(c => c.columnKey !== 'TOTAL' && c.columnKey !== 'INTERNAL')
          .reduce((acc, c) => acc + (c.value || 0), 0)
        totalCell.value = sum
      }
    })
  })
}

// Tương tự cho các calculations khác...
```

---

### 4. useBusinessPlanRevenue

**File**: `hooks/useBusinessPlanRevenue.js`

**Purpose**: Logic cho Revenue Plan

---

### 5. useBusinessPlanDelivery

**File**: `hooks/useBusinessPlanDelivery.js`

**Purpose**: Logic cho Delivery Plan

---

### 6. useBusinessPlanStep

**File**: `hooks/useBusinessPlanStep.js`

**Purpose**: Workflow step logic

---

### 7. useBusinessPlanUpload

**File**: `hooks/useBusinessPlanUpload.js`

**Purpose**: Document upload logic

---

## 🛠️ Utilities

### File: `utils.js`

#### formatNumber(value, percent)
Format số với dấu phẩy, xử lý số âm
```javascript
formatNumber(1234.567)        // "1,234.567"
formatNumber(-1234.567)       // "(1,234.567)"
formatNumber(12.5, true)      // "12.5%"
```

#### formatNumberCompare(value, percent)
Format số để so sánh (chỉ absolute value)

#### renderColorCompareNorm(data)
Tính màu hiển thị dựa trên so sánh với norm
```javascript
// Trả về màu:
// Red (#FF2121): Dưới norm
// Green (#22A664): Trên norm
// Gray (#525559): Trong khoảng norm
```

#### convertDateTextFormat(dateStr)
```javascript
convertDateTextFormat('01-2023')  // "Jan-2023"
```

#### getMonthsBetweenTimestamps(startDate, endDate)
```javascript
getMonthsBetweenTimestamps(startTs, endTs)
// Returns: ['02-2024', '03-2024', '04-2024', ...]
```

#### formatInputNumber(value) & parseInputNumber(value)
Format/parse số khi input (với dấu phẩy)

---

## 📊 Constants & Configurations

### File: `constants.jsx`

#### STATUS_COLOR
Màu sắc cho các trạng thái:
- VERIFICATION: Blue
- APPROVED: Green
- DRAFT: Gray
- PEER_REVIEW: Orange

#### getRowConfig()
Configuration cho từng row type:
- `canAdd`: Có thể add row không
- `required`: Cell bắt buộc
- `tooltip`: Tooltip hiển thị công thức
- `percent`: Cell hiển thị %
- `negative`: Số âm
- `canEditInternal`: Có thể edit INTERNAL column

#### sectionConfig
Configuration cho từng section:
- `rowClass`: CSS class
- `newRowEditable`: Function check cell nào editable khi add row
- `newRowKey`: Key mặc định cho row mới
- `collapsible`: Có collapse được không
- `titleRowClass`: CSS class cho title
- `canAdd`: Có thể add row không
- `hiddenTitle`: Ẩn title

#### REVENUE_PLAN_TAB
Tên các tab trong Revenue Plan

#### API_TYPE
Types cho API calls

---

## 🔄 Data Flow

### 1. Load Business Plan Detail

```
User navigates to /business-plan/:buId
  ↓
Component mount
  ↓
useEffect triggered
  ↓
dispatch(getBusinessPlanDetail(buId))
  ↓
API call: GET /api/business-plan/{id}
  ↓
Response: {
  generalInformation: {...},
  sectionList: [...],
  columnLabels: [...],
  ...
}
  ↓
Redux reducer processes data:
  - businessDetails slice updated
  - businessGeneralInformation slice updated
  ↓
dispatch(getBusinessPlanWorkflow({...}))
  ↓
API call: GET /api/workflow/{referenceId}
  ↓
Workflow data updated in businessApproval slice
  ↓
Component re-renders với data mới
```

### 2. Edit Business Plan Cell

```
User clicks cell → InputNumber appears
  ↓
User enters value
  ↓
onChange triggered
  ↓
dispatch(setBusinessPlanItem({
  sectionKey,
  rowKey,
  columnKey,
  value
}))
  ↓
Redux reducer updates:
  - businessPlanItems[sectionKey].data[rowKey].data[cellIndex]
  - originalBusinessPlanItems[sectionIndex].rowLabels[rowIndex].cellList[cellIndex]
  ↓
useFormula hook watches businessPlanItems
  ↓
calculateFormula(businessPlanItems)
  ↓
All dependent cells recalculated
  ↓
dispatch(setIsSaveShowed(true))
  ↓
Save bar appears at bottom
  ↓
Component re-renders with new calculated values
```

### 3. Save Business Plan

```
User clicks "Save" button
  ↓
onSaveDraft() called
  ↓
handleValidateDraft()
  ↓
If invalid: Show errors, return
  ↓
If valid:
  ↓
Filter empty rows from sectionList
  ↓
Prepare params: {
  businessPlanVersionId,
  generalInformation: {...},
  sectionList: [...],
  columnLabels: [...]
}
  ↓
API call: POST /api/business-plan/save-draft
  ↓
If success:
  - Show success notification
  - dispatch(setIsSaveShowed(false))
  - dispatch(getBusinessPlanHistory(buId))
  ↓
Save bar hides
```

### 4. Submit for Approval

```
User clicks "Submit for Approval"
  ↓
onSubmit() called
  ↓
handleValidate() - full validation
  ↓
Check all required fields
  ↓
If invalid: Show errors in validation object
  ↓
If valid:
  ↓
API call: POST /api/business-plan/submit
  ↓
If success:
  - Show success notification
  - reload getBusinessPlanDetail(buId)
  - reload getBusinessPlanWorkflow({...})
  - reload getBusinessPlanHistory(buId)
  ↓
Status changes from "Draft" → "Peer Review"
  ↓
UI updates: Submit button disabled, version locked
```

### 5. Revenue Plan Flow

```
User selects DU from dropdown
  ↓
dispatch(setDeliveryUnitDataRevenue(selectedDu))
  ↓
Load revenue data for selected DU:
  - dispatch(getSummaryRevenuePlan({...}))
  - dispatch(getBusinessPlanOtherRevenue({...}))
  - dispatch(getBusinessPlanSellingExpenses({...}))
  ↓
Tables populated with data
  ↓
User edits revenue information
  ↓
Changes tracked in:
  - createOtherRevenuesData
  - updateOtherRevenuesData
  - deleteOtherRevenuesData
  - createSellingExpensesData
  - updateSellingExpensesData
  - deleteSellingExpensesData
  ↓
dispatch(setIsSaveConfirmShowed(true))
  ↓
User clicks "Save"
  ↓
Validate revenue data
  ↓
API call: POST /api/revenue-plan/save
  ↓
Reload summary
  ↓
Clear change tracking arrays
  ↓
dispatch(setIsSaveConfirmShowed(false))
```

### 6. Delivery Plan Flow

```
User selects DU from dropdown
  ↓
dispatch(setDeliveryUnitDataDelivery(selectedDu))
  ↓
Load delivery data:
  - dispatch(getResourcesInformationDeliveryPlan({...}))
  - dispatch(getSummaryDeliveryPlan({...}))
  - dispatch(getOtherExpensesTable({...}))
  ↓
Tables populated
  ↓
User adds/edits/deletes resources
  ↓
Changes tracked in:
  - dataCreateRequest
  - dataUpdateRequest
  - dataDeleteRequest
  ↓
dispatch(setIsSaveShowedDeliveryPlan(true))
  ↓
User clicks "Save"
  ↓
Validate (via ref.current.handleValidate())
  ↓
API call: POST /api/delivery-plan/save
  ↓
Reload resources and summary
  ↓
dispatch(resetSaveDeliveryPlanParams())
  ↓
dispatch(setIsSaveShowedDeliveryPlan(false))
```

---

## 🔐 Permissions & Access Control

### Permission Sources

Sử dụng `checkRolePermission()` từ `@/components/common/checkRolePermission`

```javascript
import { checkRolePermission } from '@/components/common/checkRolePermission'
import { ActivityKeyConstants, SourceConstants } from '@/constants/ActivityKeyConstants'

// Check permission
const canEdit = checkRolePermission(
  SourceConstants.BUSINESS_PLAN_DETAIL,
  ActivityKeyConstants.EDIT_BUSINESS_PLAN
)

const canEditAll = checkRolePermission(
  SourceConstants.BUSINESS_PLAN_DETAIL,
  ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL
)
```

### Permission Rules

#### 1. Edit Draft Status
```javascript
const isEditInputDraft = (
  checkRolePermission(...) ||
  listAM.some(p => p.ldap === currentUser) ||
  listPreparator.some(p => p.ldap === currentUser)
) && status === 'Draft'
```

#### 2. Edit INTERNAL Column
```javascript
const canEditInternal = (cell, rowKey) => {
  const rowConfig = getRowConfig()[rowKey]
  return rowConfig?.canEditInternal && 
         checkRolePermission(..., EDIT_BUSINESS_PLAN_ALL)
}
```

#### 3. Submit Permission
```javascript
const canSubmit = (
  listAM.some(p => p.ldap === currentUser) ||
  listPreparator.some(p => p.ldap === currentUser)
) && status === 'Draft'
```

#### 4. Approve Permission
```javascript
const canApprove = checkRolePermission(
  SourceConstants.BUSINESS_PLAN_DETAIL,
  ActivityKeyConstants.APPROVE_BUSINESS_PLAN
) && status === 'Peer Review'
```

---

## 🚨 Validation System

### Validation Object Structure

```javascript
{
  // General Information
  industryCurrency: boolean,
  industryDomain: boolean,
  exchangeRate: boolean,
  totalContractPrice: boolean,
  listAM: boolean,
  listTeamLead: boolean,
  listPreparator: boolean,
  listPM: boolean,
  kpiPm: boolean,
  kpiQa: boolean,
  kpiMember: boolean,
  kpiTotal: boolean,
  
  // Business Plan Items
  'MM_BILL-label': boolean,
  'MM_BILL-TOTAL': boolean,
  'MM_BILL-SALE_001': boolean,
  'UNIT_PRICE-SALE_001': boolean,
  ...
}
```

### Validation Display

```javascript
// Hiển thị error trên cell
<InputNumber 
  value={cell.value}
  className={validation[`${rowKey}-${columnKey}`] ? 'error' : ''}
/>

// Hiển thị error message
{validation[key] && (
  <div className="error-message">This field is required</div>
)}
```

---

## 📈 Performance Considerations

### 1. Memo Components
Sử dụng React.memo cho các components render nhiều lần:
```javascript
const BusinessPlanCell = React.memo(({ cell, onChange }) => {
  // ...
})
```

### 2. Debounce Input
```javascript
const debouncedOnChange = useMemo(
  () => debounce(onChange, 300),
  [onChange]
)
```

### 3. Virtual Scrolling
Với tables lớn (nhiều months), nên implement virtual scrolling

### 4. Lazy Load Tabs
```javascript
<Tabs destroyInactiveTabPane={false}>
  // Các tab không bị destroy khi chuyển tab
</Tabs>
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Formula không update
**Nguyên nhân**: useFormula không được trigger
**Giải pháp**: Đảm bảo `setBusinessPlanItem` được dispatch đúng

### Issue 2: Save confirmation bar không hiện
**Nguyên nhân**: `isSaveShowed` không được set
**Giải pháp**: Sau mỗi edit, gọi `updateIsSaveShowed(true)`

### Issue 3: Validation errors không clear
**Nguyên nhân**: Validation object không được reset
**Giải pháp**: Sau khi save thành công, dispatch `setValidation({})`

### Issue 4: DU data không load
**Nguyên nhân**: businessPlanVersionId hoặc groupId sai
**Giải pháp**: Check params được truyền vào API calls

### Issue 5: Monthly data calculation sai
**Nguyên nhân**: startDate/endDate không match với months
**Giải pháp**: Sử dụng `getMonthsBetweenTimestamps()` để generate chính xác

---

## 🔮 Future Improvements

### 1. Performance
- Implement virtualization cho large tables
- Optimize formula calculations
- Add memoization cho expensive computations

### 2. UX
- Add loading skeletons
- Improve error messages
- Add undo/redo functionality
- Add keyboard shortcuts

### 3. Features
- Export to Excel
- Import from Excel
- Compare versions side-by-side
- Add comments on specific cells
- Real-time collaboration

### 4. Code Quality
- Add TypeScript
- Improve test coverage
- Refactor complex components
- Add comprehensive documentation

---

## 📚 API Endpoints Reference

### Business Plan Detail
```
GET    /api/business-plan/{id}
POST   /api/business-plan/save-draft
POST   /api/business-plan/submit
POST   /api/business-plan/create-new-version/{id}
```

### General Information
```
GET    /api/industry-domain
GET    /api/industry-currency
GET    /api/business-plan-setting/max-kpi
```

### Revenue Plan
```
GET    /api/business-plan/du-list?type=Revenue&businessPlanVersionId={id}
GET    /api/revenue-plan/summary?businessPlanId={id}&groupId={groupId}
GET    /api/revenue-plan/other-revenues?businessPlanId={id}&groupId={groupId}
GET    /api/revenue-plan/selling-expenses?businessPlanId={id}&groupId={groupId}
POST   /api/revenue-plan/save
POST   /api/revenue-plan/submit-baseline
```

### Delivery Plan
```
GET    /api/business-plan/du-list?type=Delivery&businessPlanVersionId={id}
GET    /api/delivery-plan/resources?businessPlanId={id}&groupId={groupId}
GET    /api/delivery-plan/summary?businessPlanId={id}&groupId={groupId}
GET    /api/delivery-plan/other-expenses?businessPlanId={id}&groupId={groupId}
GET    /api/delivery-plan/location-exchange-rate
POST   /api/delivery-plan/save
```

### Workflow
```
GET    /api/workflow?referenceId={id}&mvv={projectCode}
POST   /api/workflow/approve
POST   /api/workflow/reject
```

### Documents
```
GET    /api/business-plan/{id}/documents
POST   /api/business-plan/{id}/documents
DELETE /api/business-plan/{id}/documents/{documentId}
```

### History
```
GET    /api/business-plan/{id}/history
```

---

## 🎓 Key Takeaways

### Architecture Highlights
1. **Redux Toolkit** cho state management
2. **Custom hooks** tách biệt business logic
3. **Formula system** tự động tính toán
4. **Validation system** comprehensive
5. **Multi-level editing** (Business Plan → Revenue Plan → Delivery Plan)

### Business Logic Complexity
1. **Dynamic columns** dựa trên BU/DU structure
2. **Complex formulas** với nhiều dependencies
3. **Multi-currency** support
4. **Norm comparison** cho performance metrics
5. **Workflow integration** với approval process

### Data Management
1. **Batch operations** (create/update/delete requests)
2. **Optimistic updates** với local state
3. **Change tracking** để hiển thị save confirmation
4. **Validation** ở nhiều levels

---

## 📞 Support & Next Steps

Tài liệu này cung cấp cái nhìn tổng quan về Business Plan Detail component system. Để thay đổi logic:

1. **Hiểu rõ data flow** cho feature cần thay đổi
2. **Identify affected components** và hooks
3. **Check validation rules** và formulas
4. **Test thoroughly** với các scenarios khác nhau
5. **Update documentation** sau khi thay đổi

Nếu cần thêm thông tin chi tiết về bất kỳ phần nào, hãy tham khảo source code trực tiếp hoặc yêu cầu phân tích sâu hơn.

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-23  
**Author**: AI Assistant Analysis  
**Status**: Initial Comprehensive Analysis
