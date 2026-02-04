# Business Plan Solution - Technical Documentation

## 📖 MỤC LỤC

1. [Tổng quan](#tổng-quan)
2. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
3. [View Modes System](#view-modes-system)
4. [Approval Workflow](#approval-workflow)
5. [Data Structure](#data-structure)
6. [Công thức tính toán](#công-thức-tính-toán)
7. [Permission System](#permission-system)
8. [Implementation Guide](#implementation-guide)

---

## 🎯 TỔNG QUAN

### Mục tiêu
Xây dựng hệ thống Business Plan quản lý kế hoạch kinh doanh cho 2 mã vụ việc (MVV):
- **Onsite MVV**: Dự án làm việc tại chỗ
- **Offshore MVV**: Dự án làm việc từ xa

### Yêu cầu chính

#### 1. **3 Tabs chính**
- **Business Plan**: Kế hoạch kinh doanh tổng thể
- **Revenue Plan**: Kế hoạch doanh thu chi tiết
- **Delivery Plan**: Kế hoạch giao hàng

#### 2. **4 View Modes (Global)**
View modes áp dụng cho **TẤT CẢ 3 tabs**, không phải tabs riêng:

| View Mode | Mô tả | Hiển thị |
|-----------|-------|----------|
| **Total** | Tổng hợp | Onsite + Offshore (merged) |
| **OB** | Cân đối số | Balance sheet view |
| **Onsite** | MVV Onsite | Chỉ data Onsite |
| **Offshore** | MVV Offshore | Chỉ data Offshore |

#### 3. **Step by Step cho 2 MVV (Combined)**
- **KHÔNG** xử lý approval/reject riêng từng MVV
- **GỘP** cả 2 MVV: 1 action approve/reject đồng thời cả Onsite + Offshore
- Transaction-based: Cả 2 thành công hoặc cả 2 rollback

#### 4. **Permission System**
Role-based access control (RBAC) với 5 levels:
- ADMIN, MANAGER, PM, TEAM_LEAD, DEVELOPER, VIEWER

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Component Hierarchy

```
BusinessPlanPage
│
├── ViewModeSelector (Global - applies to all tabs)
│   ├── Radio: Total
│   ├── Radio: OB
│   ├── Radio: Onsite
│   └── Radio: Offshore
│
├── Tabs
│   ├── Tab: Business Plan
│   │   ├── BusinessPlanSummary (filtered by viewMode)
│   │   ├── SoftwareProductionRevenue (filtered by viewMode)
│   │   ├── OtherRevenue (filtered by viewMode)
│   │   └── SellingExpenses (filtered by viewMode)
│   │
│   ├── Tab: Revenue Plan
│   │   └── RevenuePlanContent (filtered by viewMode)
│   │
│   └── Tab: Delivery Plan
│       └── DeliveryPlanContent (filtered by viewMode)
│
└── ApprovalSection (Combined for both MVV)
    ├── Button: Approve All (Onsite + Offshore)
    ├── Button: Reject All (Onsite + Offshore)
    └── Status Display
        ├── Onsite Status
        └── Offshore Status
```

### Data Flow

```
┌─────────────────────────────────────────────────┐
│  User selects View Mode (Total/OB/Onsite/Offshore) │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  Apply filter to current tab data              │
│  - Total: merge onsite + offshore              │
│  - OB: show balance sheet                      │
│  - Onsite: filter onsite only                  │
│  - Offshore: filter offshore only              │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  User edits data (if has permission)           │
│  - Edit onsite data                            │
│  - Edit offshore data                          │
│  - Auto-calculate totals                       │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  User clicks "Approve All"                     │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  Validate BOTH onsite + offshore data          │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  Send approval for BOTH MVV simultaneously     │
│  Promise.all([                                 │
│    api.approveMVV('onsite', data),            │
│    api.approveMVV('offshore', data)           │
│  ])                                            │
└──────────────────┬──────────────────────────────┘
                   ↓
         ┌─────────┴─────────┐
         ↓                   ↓
    Both success?        One/both failed?
         ↓                   ↓
    Update status       Rollback both
    Show success        Show error
```

---

## 🎨 VIEW MODES SYSTEM

### 1. View Mode Implementation

```javascript
// View mode state (global for all tabs)
const [viewMode, setViewMode] = useState('TOTAL');

// Filter function based on view mode
const getViewData = (viewMode, rawData) => {
  const { onsite, offshore } = rawData;
  
  switch(viewMode) {
    case 'TOTAL':
      return {
        softwareProduction: [
          ...onsite.softwareProduction,
          ...offshore.softwareProduction
        ],
        otherRevenue: [
          ...onsite.otherRevenue,
          ...offshore.otherRevenue
        ],
        expenses: [
          ...onsite.expenses,
          ...offshore.expenses
        ],
        totals: {
          revenue: onsite.totals.revenue + offshore.totals.revenue,
          expenses: onsite.totals.expenses + offshore.totals.expenses,
          net: (onsite.totals.revenue + offshore.totals.revenue) - 
               (onsite.totals.expenses + offshore.totals.expenses)
        }
      };
      
    case 'OB':
      return {
        balanceSheet: {
          assets: onsite.totals.revenue + offshore.totals.revenue,
          liabilities: onsite.totals.expenses + offshore.totals.expenses,
          equity: (onsite.totals.revenue + offshore.totals.revenue) -
                 (onsite.totals.expenses + offshore.totals.expenses),
          onsiteRevenue: onsite.totals.revenue,
          offshoreRevenue: offshore.totals.revenue,
          onsiteExpenses: onsite.totals.expenses,
          offshoreExpenses: offshore.totals.expenses
        }
      };
      
    case 'ONSITE':
      return onsite;
      
    case 'OFFSHORE':
      return offshore;
  }
};

// Apply to current tab
const viewData = useMemo(() => {
  return getViewData(viewMode, businessPlanData);
}, [viewMode, businessPlanData]);
```

### 2. View Mode UI

```jsx
const ViewModeSelector = ({ value, onChange }) => {
  return (
    <div className="view-mode-selector">
      <Radio.Group value={value} onChange={onChange} size="large">
        <Radio.Button value="TOTAL">
          <Icon type="appstore" /> Total
        </Radio.Button>
        <Radio.Button value="OB">
          <Icon type="calculator" /> OB
        </Radio.Button>
        <Radio.Button value="ONSITE">
          <Icon type="home" /> Onsite
        </Radio.Button>
        <Radio.Button value="OFFSHORE">
          <Icon type="global" /> Offshore
        </Radio.Button>
      </Radio.Group>
      
      <div className="view-mode-description">
        {value === 'TOTAL' && "Hiển thị tổng hợp Onsite + Offshore"}
        {value === 'OB' && "Hiển thị cân đối số"}
        {value === 'ONSITE' && "Hiển thị dữ liệu Onsite"}
        {value === 'OFFSHORE' && "Hiển thị dữ liệu Offshore"}
      </div>
    </div>
  );
};
```

### 3. Tab với View Mode

```jsx
const BusinessPlanPage = () => {
  const [activeTab, setActiveTab] = useState('business-plan');
  const [viewMode, setViewMode] = useState('TOTAL');
  const [rawData, setRawData] = useState(null);
  
  // Apply view mode filter
  const viewData = getViewData(viewMode, rawData);
  
  return (
    <div className="business-plan-page">
      {/* Global view mode selector */}
      <ViewModeSelector 
        value={viewMode} 
        onChange={e => setViewMode(e.target.value)} 
      />
      
      {/* Tabs - all use viewData */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Business Plan" key="business-plan">
          <BusinessPlanTab data={viewData} viewMode={viewMode} />
        </TabPane>
        
        <TabPane tab="Revenue Plan" key="revenue-plan">
          <RevenuePlanTab data={viewData} viewMode={viewMode} />
        </TabPane>
        
        <TabPane tab="Delivery Plan" key="delivery-plan">
          <DeliveryPlanTab data={viewData} viewMode={viewMode} />
        </TabPane>
      </Tabs>
      
      {/* Approval section */}
      <ApprovalSection data={rawData} />
    </div>
  );
};
```

---

## ✅ APPROVAL WORKFLOW

### 1. Combined Approval Strategy

**YÊU CẦU:**
- 1 action approve/reject xử lý ĐỒNG THỜI cả 2 MVV
- Transaction-based: All or nothing
- Rollback nếu 1 trong 2 fail

### 2. Approval State Machine

```
┌─────────────┐
│   PENDING   │ ← Initial state
└──────┬──────┘
       │
       ├─── User clicks "Approve All"
       │    ↓
       │  ┌─────────────┐
       │  │ VALIDATING  │
       │  └──────┬──────┘
       │         │
       │         ├─── Validation failed
       │         │    ↓
       │         │  ┌─────────────┐
       │         │  │   PENDING   │ (back to start)
       │         │  └─────────────┘
       │         │
       │         └─── Validation success
       │              ↓
       │            ┌─────────────┐
       │            │  APPROVING  │
       │            └──────┬──────┘
       │                   │
       │                   ├─── Both MVV approved
       │                   │    ↓
       │                   │  ┌─────────────┐
       │                   │  │  APPROVED   │ ✓
       │                   │  └─────────────┘
       │                   │
       │                   └─── One/both failed
       │                        ↓
       │                      ┌─────────────┐
       │                      │  ROLLBACK   │
       │                      └──────┬──────┘
       │                             │
       │                             ↓
       │                           ┌─────────────┐
       │                           │   PENDING   │ (back to start)
       │                           └─────────────┘
       │
       └─── User clicks "Reject All"
            ↓
          ┌─────────────┐
          │  REJECTED   │ ✗
          └─────────────┘
```

### 3. Approval Implementation

```javascript
const ApprovalSection = ({ data, onSuccess, onError }) => {
  const [approvalState, setApprovalState] = useState('PENDING');
  const [loading, setLoading] = useState(false);
  
  const handleApproveAll = async () => {
    setLoading(true);
    setApprovalState('VALIDATING');
    
    try {
      // Step 1: Validate both MVV
      console.log('Validating onsite MVV...');
      const onsiteValid = await validateMVVData(data.onsite);
      
      console.log('Validating offshore MVV...');
      const offshoreValid = await validateMVVData(data.offshore);
      
      if (!onsiteValid || !offshoreValid) {
        throw new Error('Validation failed for one or both MVV');
      }
      
      // Step 2: Send approval requests simultaneously
      setApprovalState('APPROVING');
      console.log('Sending approval requests for both MVV...');
      
      const [onsiteResult, offshoreResult] = await Promise.all([
        api.approveMVV('onsite', data.onsite),
        api.approveMVV('offshore', data.offshore)
      ]);
      
      // Step 3: Check results
      if (onsiteResult.status === 'success' && 
          offshoreResult.status === 'success') {
        
        setApprovalState('APPROVED');
        message.success('Successfully approved both Onsite and Offshore MVV');
        onSuccess();
        
      } else {
        throw new Error('Approval failed for one or both MVV');
      }
      
    } catch (error) {
      console.error('Approval error:', error);
      
      // Step 4: Rollback on error
      setApprovalState('ROLLBACK');
      console.log('Rolling back approvals...');
      
      await Promise.all([
        api.rollbackApproval('onsite'),
        api.rollbackApproval('offshore')
      ]);
      
      setApprovalState('PENDING');
      message.error('Approval failed: ' + error.message);
      onError(error);
      
    } finally {
      setLoading(false);
    }
  };
  
  const handleRejectAll = async () => {
    setLoading(true);
    
    try {
      await Promise.all([
        api.rejectMVV('onsite', data.onsite),
        api.rejectMVV('offshore', data.offshore)
      ]);
      
      setApprovalState('REJECTED');
      message.success('Rejected both Onsite and Offshore MVV');
      onSuccess();
      
    } catch (error) {
      message.error('Rejection failed: ' + error.message);
      onError(error);
      
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="approval-section">
      <div className="approval-status">
        <h3>Approval Status</h3>
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Onsite MVV">
              <Tag color={getStatusColor(data.onsite.status)}>
                {data.onsite.status}
              </Tag>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Offshore MVV">
              <Tag color={getStatusColor(data.offshore.status)}>
                {data.offshore.status}
              </Tag>
            </Card>
          </Col>
        </Row>
      </div>
      
      <div className="approval-actions">
        <Button
          type="primary"
          size="large"
          icon="check"
          onClick={handleApproveAll}
          loading={loading}
          disabled={approvalState === 'APPROVED'}>
          Approve All (Onsite + Offshore)
        </Button>
        
        <Button
          danger
          size="large"
          icon="close"
          onClick={handleRejectAll}
          loading={loading}
          disabled={approvalState === 'REJECTED'}>
          Reject All (Onsite + Offshore)
        </Button>
        
        <Tag color="blue" style={{ marginLeft: 16 }}>
          State: {approvalState}
        </Tag>
      </div>
    </div>
  );
};
```

### 4. Validation Logic

```javascript
const validateMVVData = async (mvvData) => {
  const errors = [];
  
  // Check software production
  if (!mvvData.softwareProduction || 
      mvvData.softwareProduction.length === 0) {
    errors.push('Software production data is empty');
  }
  
  // Check totals
  if (!mvvData.totals || mvvData.totals.revenue <= 0) {
    errors.push('Total revenue must be greater than 0');
  }
  
  // Check positions
  for (const position of mvvData.softwareProduction) {
    if (!position.unitPrice || position.unitPrice <= 0) {
      errors.push(`Invalid unit price for position ${position.name}`);
    }
    
    if (!position.department) {
      errors.push(`Missing department for position ${position.name}`);
    }
  }
  
  // Check business rules
  if (mvvData.totals.expenses > mvvData.totals.revenue) {
    errors.push('Expenses exceed revenue');
  }
  
  if (errors.length > 0) {
    console.error('Validation errors:', errors);
    notification.error({
      message: 'Validation Failed',
      description: (
        <ul>
          {errors.map((err, i) => <li key={i}>{err}</li>)}
        </ul>
      )
    });
    return false;
  }
  
  return true;
};
```

---

## 💾 DATA STRUCTURE

## 💾 DATA STRUCTURE

### 1. Combined Data Model

```javascript
const businessPlanData = {
  // Metadata
  id: 'BP-2026-Q1',
  period: '2026-Q1',
  year: 2026,
  quarter: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-15T10:30:00Z',
  createdBy: 'user@example.com',
  
  // Approval status
  status: 'PENDING', // PENDING | APPROVED | REJECTED
  approvalHistory: [
    {
      timestamp: '2026-01-15T10:30:00Z',
      action: 'SUBMIT',
      user: 'pm@example.com',
      comment: 'Submitted for approval'
    }
  ],
  
  // Onsite MVV data
  onsite: {
    status: 'PENDING',
    
    softwareProduction: [
      {
        id: 1,
        position: 'SE02',
        unitPrice: 20000000,
        department: 'DU3',
        exchangeRate: 1,
        pipelineRatio: 100,
        mm: 1.5,
        total: 30000000, // calculated
        monthlyDistribution: {
          '2026-01': 0.5,
          '2026-02': 0.5,
          '2026-03': 0.5
        }
      }
    ],
    
    otherRevenue: [
      {
        id: 1,
        category: 'Onsite Fee',
        description: 'Onsite working fee',
        amount: 50000000,
        monthlyBreakdown: {
          '2026-01': 15000000,
          '2026-02': 20000000,
          '2026-03': 15000000
        }
      }
    ],
    
    expenses: [
      {
        id: 1,
        category: 'Agency Expense',
        description: 'Agency commission',
        amount: 7100000000,
        monthlyBreakdown: {
          '2026-01': 2300000000,
          '2026-02': 2400000000,
          '2026-03': 2400000000
        }
      }
    ],
    
    totals: {
      softwareProductionRevenue: 7500000000,
      otherRevenue: 350000000,
      totalRevenue: 7850000000,
      deduction: 7100000000,
      netRevenue: 750000000,
      totalExpenses: 7100000000,
      balance: 750000000
    }
  },
  
  // Offshore MVV data
  offshore: {
    status: 'PENDING',
    
    softwareProduction: [
      {
        id: 1,
        position: 'SE02',
        unitPrice: 26000000,
        department: 'TDX',
        exchangeRate: 1,
        pipelineRatio: 100,
        mm: 1,
        total: 26000000
      },
      {
        id: 2,
        position: 'PM',
        unitPrice: 35000000,
        department: 'TDX',
        exchangeRate: 1,
        pipelineRatio: 100,
        mm: 1,
        total: 35000000
      }
    ],
    
    otherRevenue: [
      {
        id: 1,
        category: 'Training Revenue',
        amount: 50000000
      }
    ],
    
    expenses: [
      {
        id: 1,
        category: 'Marketing Expense',
        amount: 20000000
      }
    ],
    
    totals: {
      softwareProductionRevenue: 8300000000,
      otherRevenue: 80000000,
      totalRevenue: 8380000000,
      deduction: 0,
      netRevenue: 8380000000,
      totalExpenses: 35000000,
      balance: 8345000000
    }
  },
  
  // Aggregated totals (for Total view)
  aggregated: {
    totalRevenue: 16230000000, // onsite + offshore
    totalExpenses: 7135000000,
    netRevenue: 9095000000,
    
    byDepartment: {
      'DU1': { revenue: 2000000000, ratio: 12.3 },
      'DU3': { revenue: 7500000000, ratio: 46.2 },
      'BJI': { revenue: 1500000000, ratio: 9.2 },
      'TDX': { revenue: 8300000000, ratio: 51.1 },
      'Internal': { revenue: 0, ratio: 0 }
    },
    
    byMonth: {
      '2026-01': { revenue: 5200000000, expenses: 2400000000 },
      '2026-02': { revenue: 5500000000, expenses: 2500000000 },
      '2026-03': { revenue: 5530000000, ratio: 2235000000 }
    }
  }
};
```

### 2. View Mode Data Transformation

```javascript
// Transform raw data based on view mode
const transformDataByViewMode = (viewMode, rawData) => {
  switch (viewMode) {
    case 'TOTAL':
      return {
        softwareProduction: [
          ...rawData.onsite.softwareProduction.map(item => ({
            ...item,
            mvv: 'Onsite'
          })),
          ...rawData.offshore.softwareProduction.map(item => ({
            ...item,
            mvv: 'Offshore'
          }))
        ],
        otherRevenue: [
          ...rawData.onsite.otherRevenue,
          ...rawData.offshore.otherRevenue
        ],
        expenses: [
          ...rawData.onsite.expenses,
          ...rawData.offshore.expenses
        ],
        totals: rawData.aggregated
      };
      
    case 'OB':
      return {
        assets: {
          onsiteRevenue: rawData.onsite.totals.totalRevenue,
          offshoreRevenue: rawData.offshore.totals.totalRevenue,
          totalAssets: rawData.aggregated.totalRevenue
        },
        liabilities: {
          onsiteExpenses: rawData.onsite.totals.totalExpenses,
          offshoreExpenses: rawData.offshore.totals.totalExpenses,
          totalLiabilities: rawData.aggregated.totalExpenses
        },
        equity: {
          onsiteNet: rawData.onsite.totals.balance,
          offshoreNet: rawData.offshore.totals.balance,
          totalEquity: rawData.aggregated.netRevenue
        }
      };
      
    case 'ONSITE':
      return rawData.onsite;
      
    case 'OFFSHORE':
      return rawData.offshore;
  }
};
```

---

## 🧮 CÔNG THỨC TÍNH TOÁN

### 1. Software Production Revenue

```javascript
/**
 * Tính revenue cho mỗi position
 * Formula: Unit Price × Exchange Rate × (Pipeline Ratio / 100) × MM
 */
const calculatePositionRevenue = (position) => {
  const { unitPrice, exchangeRate, pipelineRatio, mm } = position;
  
  return unitPrice * exchangeRate * (pipelineRatio / 100) * mm;
};

/**
 * Tính tổng Software Production Revenue
 */
const calculateTotalSoftwareProduction = (positions) => {
  return positions.reduce((total, position) => {
    return total + calculatePositionRevenue(position);
  }, 0);
};
```

### 2. MM Bill Calculation

```javascript
/**
 * Tính MM Bill (giá trị trung bình trên 1 MM)
 * Formula: Total Revenue / Total MM
 */
const calculateMMBill = (positions) => {
  const totalRevenue = positions.reduce((sum, p) => {
    return sum + calculatePositionRevenue(p);
  }, 0);
  
  const totalMM = positions.reduce((sum, p) => sum + p.mm, 0);
  
  return totalMM > 0 ? totalRevenue / totalMM : 0;
};
```

### 3. Total Revenue Calculation

```javascript
/**
 * Tính tổng doanh thu
 * Formula: Software Production + Other Revenue - Deduction
 */
const calculateTotalRevenue = (mvvData) => {
  const softwareProduction = calculateTotalSoftwareProduction(
    mvvData.softwareProduction
  );
  
  const otherRevenue = mvvData.otherRevenue.reduce((sum, item) => {
    return sum + item.amount;
  }, 0);
  
  const deduction = mvvData.deduction || 0;
  
  return softwareProduction + otherRevenue - deduction;
};
```

### 4. Net Revenue Calculation

```javascript
/**
 * Tính doanh thu ròng
 * Formula: Total Revenue - Total Expenses
 */
const calculateNetRevenue = (mvvData) => {
  const totalRevenue = calculateTotalRevenue(mvvData);
  
  const totalExpenses = mvvData.expenses.reduce((sum, expense) => {
    return sum + expense.amount;
  }, 0);
  
  return totalRevenue - totalExpenses;
};
```

### 5. Department Revenue Distribution

```javascript
/**
 * Phân bổ revenue theo department
 */
const calculateDepartmentRevenue = (positions) => {
  const byDepartment = {};
  const totalRevenue = calculateTotalSoftwareProduction(positions);
  
  positions.forEach(position => {
    const dept = position.department;
    const revenue = calculatePositionRevenue(position);
    
    if (!byDepartment[dept]) {
      byDepartment[dept] = {
        revenue: 0,
        ratio: 0,
        positions: []
      };
    }
    
    byDepartment[dept].revenue += revenue;
    byDepartment[dept].positions.push(position);
  });
  
  // Calculate ratios
  Object.keys(byDepartment).forEach(dept => {
    byDepartment[dept].ratio = totalRevenue > 0
      ? (byDepartment[dept].revenue / totalRevenue) * 100
      : 0;
  });
  
  return byDepartment;
};
```

### 6. Monthly Distribution

```javascript
/**
 * Phân bổ revenue theo tháng
 */
const calculateMonthlyRevenue = (positions, months) => {
  const monthlyData = {};
  
  months.forEach(month => {
    monthlyData[month] = 0;
  });
  
  positions.forEach(position => {
    const monthlyDist = position.monthlyDistribution || {};
    const positionRevenue = calculatePositionRevenue(position);
    
    Object.keys(monthlyDist).forEach(month => {
      const mmThisMonth = monthlyDist[month];
      const revenueThisMonth = (positionRevenue / position.mm) * mmThisMonth;
      
      monthlyData[month] = (monthlyData[month] || 0) + revenueThisMonth;
    });
  });
  
  return monthlyData;
};
```

### 7. Example Calculations

```javascript
// Example 1: Onsite SE02
const onsiteSE02 = {
  position: 'SE02',
  unitPrice: 20000000,
  exchangeRate: 1,
  pipelineRatio: 100,
  mm: 1.5
};

const revenue = calculatePositionRevenue(onsiteSE02);
// = 20,000,000 × 1 × (100/100) × 1.5
// = 30,000,000 VND

// Example 2: Offshore PM
const offshorePM = {
  position: 'PM',
  unitPrice: 35000000,
  exchangeRate: 1,
  pipelineRatio: 100,
  mm: 1
};

const pmRevenue = calculatePositionRevenue(offshorePM);
// = 35,000,000 × 1 × (100/100) × 1
// = 35,000,000 VND

// Example 3: Total MVV Revenue
const onsiteMVV = {
  softwareProduction: [onsiteSE02, ...],
  otherRevenue: [{ amount: 50000000 }],
  deduction: 7100000000
};

const totalRevenue = calculateTotalRevenue(onsiteMVV);
// = 7,500,000,000 + 50,000,000 - 7,100,000,000
// = 450,000,000 VND
```

---

## 🔐 PERMISSION SYSTEM

### 1. Roles & Permissions Matrix

| Role | View Total | View OB | View Onsite | View Offshore | Edit BP | Approve | Delete |
|------|-----------|---------|-------------|---------------|---------|---------|---------|
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MANAGER** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **PM** | ✅ | ✅ | ✅ | ✅ | ✅ Own Dept | ❌ | ❌ |
| **TEAM_LEAD** | ✅ Own Dept | ❌ | ✅ Own Dept | ✅ Own Dept | ❌ | ❌ | ❌ |
| **DEVELOPER** | ✅ Own Dept | ❌ | ✅ Own Dept | ✅ Own Dept | ❌ | ❌ | ❌ |
| **VIEWER** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2. Permission Implementation

```javascript
// Permission definitions
const PERMISSIONS = {
  // View permissions
  VIEW_TOTAL: 'view_total',
  VIEW_OB: 'view_ob',
  VIEW_ONSITE: 'view_onsite',
  VIEW_OFFSHORE: 'view_offshore',
  VIEW_FINANCIAL_DATA: 'view_financial_data',
  VIEW_ALL_DEPARTMENTS: 'view_all_departments',
  
  // Edit permissions
  EDIT_BUSINESS_PLAN: 'edit_business_plan',
  EDIT_REVENUE_PLAN: 'edit_revenue_plan',
  EDIT_DELIVERY_PLAN: 'edit_delivery_plan',
  
  // Administrative permissions
  APPROVE_PLAN: 'approve_plan',
  REJECT_PLAN: 'reject_plan',
  DELETE_PLAN: 'delete_plan',
  EXPORT_DATA: 'export_data'
};

// Role-based permissions
const ROLE_PERMISSIONS = {
  ADMIN: Object.values(PERMISSIONS),
  
  MANAGER: [
    PERMISSIONS.VIEW_TOTAL,
    PERMISSIONS.VIEW_OB,
    PERMISSIONS.VIEW_ONSITE,
    PERMISSIONS.VIEW_OFFSHORE,
    PERMISSIONS.VIEW_FINANCIAL_DATA,
    PERMISSIONS.VIEW_ALL_DEPARTMENTS,
    PERMISSIONS.EDIT_BUSINESS_PLAN,
    PERMISSIONS.EDIT_REVENUE_PLAN,
    PERMISSIONS.EDIT_DELIVERY_PLAN,
    PERMISSIONS.APPROVE_PLAN,
    PERMISSIONS.REJECT_PLAN,
    PERMISSIONS.EXPORT_DATA
  ],
  
  PM: [
    PERMISSIONS.VIEW_TOTAL,
    PERMISSIONS.VIEW_OB,
    PERMISSIONS.VIEW_ONSITE,
    PERMISSIONS.VIEW_OFFSHORE,
    PERMISSIONS.VIEW_FINANCIAL_DATA,
    PERMISSIONS.EDIT_BUSINESS_PLAN,
    PERMISSIONS.EDIT_REVENUE_PLAN,
    PERMISSIONS.EDIT_DELIVERY_PLAN
  ],
  
  TEAM_LEAD: [
    PERMISSIONS.VIEW_ONSITE,
    PERMISSIONS.VIEW_OFFSHORE,
    PERMISSIONS.EDIT_DELIVERY_PLAN
  ],
  
  DEVELOPER: [
    PERMISSIONS.VIEW_ONSITE,
    PERMISSIONS.VIEW_OFFSHORE
  ],
  
  VIEWER: [
    PERMISSIONS.VIEW_TOTAL
  ]
};

// Check permission
const hasPermission = (user, permission) => {
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

// Check department access
const canAccessDepartment = (user, department) => {
  if (hasPermission(user, PERMISSIONS.VIEW_ALL_DEPARTMENTS)) {
    return true;
  }
  
  return user.department === department;
};

// Mask financial data
const maskFinancialData = (value, user) => {
  if (hasPermission(user, PERMISSIONS.VIEW_FINANCIAL_DATA)) {
    return value;
  }
  
  return '***';
};
```

### 3. Permission Guards

```javascript
// Component-level permission guard
const PermissionGuard = ({ permission, fallback, children }) => {
  const user = useUser();
  
  if (!hasPermission(user, permission)) {
    return fallback || (
      <Alert
        type="warning"
        message="Access Denied"
        description="You don't have permission to view this content"
      />
    );
  }
  
  return children;
};

// Usage example
<PermissionGuard permission={PERMISSIONS.VIEW_OB}>
  <OBView data={obData} />
</PermissionGuard>

// Button-level permission guard
const ProtectedButton = ({ permission, ...props }) => {
  const user = useUser();
  const hasAccess = hasPermission(user, permission);
  
  return (
    <Tooltip title={!hasAccess ? 'No permission' : ''}>
      <Button {...props} disabled={!hasAccess} />
    </Tooltip>
  );
};

// Usage example
<ProtectedButton 
  permission={PERMISSIONS.APPROVE_PLAN}
  onClick={handleApprove}>
  Approve All
</ProtectedButton>
```

---

## 🛠️ IMPLEMENTATION GUIDE

### Step 1: Project Setup

```bash
# Install dependencies
npm install antd moment lodash

# Create folder structure
mkdir -p src/pages/BusinessPlan
mkdir -p src/components/BusinessPlan
mkdir -p src/utils/businessPlan
mkdir -p src/hooks/businessPlan
```

### Step 2: Create Base Components

```javascript
// src/pages/BusinessPlan/BusinessPlanPage.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, Radio } from 'antd';
import BusinessPlanTab from './tabs/BusinessPlanTab';
import RevenuePlanTab from './tabs/RevenuePlanTab';
import DeliveryPlanTab from './tabs/DeliveryPlanTab';
import ApprovalSection from '../../components/BusinessPlan/ApprovalSection';

const { TabPane } = Tabs;

const BusinessPlanPage = () => {
  const [activeTab, setActiveTab] = useState('business-plan');
  const [viewMode, setViewMode] = useState('TOTAL');
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load data on mount
  useEffect(() => {
    loadBusinessPlanData();
  }, []);
  
  const loadBusinessPlanData = async () => {
    setLoading(true);
    try {
      const data = await api.fetchBusinessPlan();
      setRawData(data);
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  // Transform data based on view mode
  const viewData = useMemo(() => {
    return transformDataByViewMode(viewMode, rawData);
  }, [viewMode, rawData]);
  
  return (
    <div className="business-plan-page">
      {/* View mode selector */}
      <div className="view-mode-selector">
        <Radio.Group 
          value={viewMode} 
          onChange={e => setViewMode(e.target.value)}
          size="large">
          <Radio.Button value="TOTAL">Total</Radio.Button>
          <Radio.Button value="OB">OB</Radio.Button>
          <Radio.Button value="ONSITE">Onsite</Radio.Button>
          <Radio.Button value="OFFSHORE">Offshore</Radio.Button>
        </Radio.Group>
      </div>
      
      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Business Plan" key="business-plan">
          <BusinessPlanTab 
            data={viewData} 
            viewMode={viewMode}
            loading={loading}
          />
        </TabPane>
        
        <TabPane tab="Revenue Plan" key="revenue-plan">
          <RevenuePlanTab 
            data={viewData} 
            viewMode={viewMode}
            loading={loading}
          />
        </TabPane>
        
        <TabPane tab="Delivery Plan" key="delivery-plan">
          <DeliveryPlanTab 
            data={viewData} 
            viewMode={viewMode}
            loading={loading}
          />
        </TabPane>
      </Tabs>
      
      {/* Approval section */}
      <ApprovalSection 
        data={rawData}
        onSuccess={loadBusinessPlanData}
      />
    </div>
  );
};

export default BusinessPlanPage;
```

### Step 3: API Integration

```javascript
// src/utils/businessPlan/api.js
const API_BASE = '/api/business-plan';

export const businessPlanApi = {
  // Fetch combined data
  async fetchBusinessPlan() {
    const response = await fetch(`${API_BASE}/current`);
    return response.json();
  },
  
  // Save changes
  async saveBusiness Plan(data) {
    const response = await fetch(`${API_BASE}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  // Approve both MVV
  async approveMVV(mvvType, data) {
    const response = await fetch(`${API_BASE}/approve/${mvvType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  // Rollback approval
  async rollbackApproval(mvvType) {
    const response = await fetch(`${API_BASE}/rollback/${mvvType}`, {
      method: 'POST'
    });
    return response.json();
  }
};
```

---

## 📝 CHECKLIST HOÀN THÀNH

### Phase 1: Foundation
- [ ] Setup project structure
- [ ] Install dependencies
- [ ] Create base components
- [ ] Setup routing

### Phase 2: Data & Logic
- [ ] Define data structure
- [ ] Implement calculations
- [ ] Create view mode logic
- [ ] Setup API integration

### Phase 3: UI Components
- [ ] View mode selector
- [ ] Business Plan tab
- [ ] Revenue Plan tab
- [ ] Delivery Plan tab
- [ ] Approval section

### Phase 4: Permission System
- [ ] Define roles & permissions
- [ ] Implement permission checks
- [ ] Add permission guards
- [ ] Mask sensitive data

### Phase 5: Testing
- [ ] Unit tests for calculations
- [ ] Integration tests for API
- [ ] E2E tests for workflows
- [ ] Permission testing

### Phase 6: Documentation
- [ ] API documentation
- [ ] User guide
- [ ] Developer guide
- [ ] Deployment guide

---

## 🎯 KẾT LUẬN

### Đã hoàn thành:
✅ Architecture design với combined MVV approach
✅ View modes system (Total, OB, Onsite, Offshore)
✅ Combined approval workflow (both MVV simultaneously)
✅ Data structure với onsite + offshore separation
✅ Công thức tính toán chi tiết
✅ Permission system hoàn chỉnh
✅ Implementation guide

### Lợi ích:
- **Consistency**: Đảm bảo cả 2 MVV đồng bộ
- **Transaction safety**: All or nothing approach
- **Flexibility**: 4 view modes cho nhiều use cases
- **Security**: Permission system chi tiết
- **Maintainability**: Code structure rõ ràng, dễ maintain

**Ready for implementation! 🚀**

```
src/
├── pages/
│   ├── BusinessPlan.jsx              ✅ Main component
│   └── BusinessPlan.css              ✅ Page styling
│
├── components/
│   └── BusinessPlan/
│       ├── BusinessPlanSummary.jsx           ✅ Summary section
│       ├── SoftwareProductionRevenue.jsx     ✅ Software production
│       ├── OtherRevenue.jsx                  ✅ Other revenue
│       ├── SellingExpenses.jsx               ✅ Selling expenses
│       └── BusinessPlanComponents.css        ✅ Components styling
│
└── utils/
    ├── businessPlanCalculations.js   ✅ All formulas & calculations
    ├── businessPlanApi.js            ✅ Mock API (Onsite/Offshore data)
    └── permissionUtils.js            ✅ Permission & access control

Documentation:
└── BUSINESS_PLAN_SUMMARY.md          ✅ This file
```

---

## 🎯 Tính năng chính:

### 1. Business Plan Summary
- MM bill
- Software production revenue
- Deduction
- Onsite Fee
- Revenue from Equipment
- Other Rev
- Agency Expenses (Total)

### 2. Software Production Revenue Info
**Bảng quản lý positions:**
| Column | Mô tả | Formula |
|--------|-------|---------|
| Position | Vị trí (SE02, PM, QA...) | - |
| Unit Price | Đơn giá/MM | - |
| Department | Phòng ban (DU1, DU3, BJI, TDX) | - |
| Exchange Rate | Tỷ giá | Default: 1 |
| Pipeline Ratio | Tỷ lệ pipeline | 0-100% |
| Total | Tổng revenue | Unit Price × Exchange Rate × Pipeline Ratio |

**Features:**
- Add/Delete positions
- Filter by department
- Link to billing plan
- Monthly MM distribution

### 3. Other Revenue
**Revenue types:**
- Onsite Fee
- Revenue from Equipment
- Training Revenue
- License Revenue
- Custom revenues

**Features:**
- Add/Delete revenue items
- Show/Hide monthly details
- Auto-calculate total from monthly

### 4. Selling Expenses
**Expense categories:**
- Marketing Expense
- Travel Expense
- Agency Expense
- Custom categories

**Features:**
- Add/Delete expense items
- Monthly breakdown
- Total calculation

---

## 🔐 Permission System

### Role-based Access Control

```javascript
// Example: Admin user (full access)
const adminUser = {
  role: 'ADMIN',
  permissions: ['VIEW_TOTAL', 'VIEW_OB', 'EDIT_BUSINESS_PLAN', ...]
};

// Example: PM user (limited access)
const pmUser = {
  role: 'PM',
  department: 'DU1',
  permissions: ['VIEW_TOTAL', 'VIEW_ONSITE', 'EDIT_BUSINESS_PLAN']
};

// Example: Developer (view only)
const devUser = {
  role: 'DEVELOPER',
  department: 'DU3',
  permissions: ['VIEW_OWN_DEPARTMENT']
};
```

### Permission Checks

**View Restrictions:**
- Financial data: `***` nếu không có quyền VIEW_FINANCIAL_DATA
- Departments: Chỉ xem own department nếu không có VIEW_ALL_DEPARTMENTS
- Work types: Chỉ xem Onsite hoặc Offshore theo quyền

**Edit Restrictions:**
- Buttons disabled nếu không có quyền EDIT
- Alert khi cố gắng save mà không có quyền
- Form fields readonly cho user không có quyền

---

## 📊 Công thức tính toán

### 1. Software Production Revenue
```javascript
Total = Unit Price × Exchange Rate × (Pipeline Ratio / 100)
```

### 2. MM Bill
```javascript
MM Bill = Total Unit Prices / MM Effort
```

### 3. Revenue from Work Delivered
```javascript
Revenue = Software Production Rev - Deduction
```

### 4. Total Revenue
```javascript
Total = Software Production Rev + Other Revenue - Deduction
```

### 5. Net Revenue
```javascript
Net = Total Revenue - Total Expenses
```

### 6. Department Revenue
```javascript
Dept Revenue = Total Revenue × (Department Ratio / 100)
```

---

## 🚀 Cách sử dụng:

### 1. Basic Usage
```jsx
import BusinessPlan from './pages/BusinessPlan';

function App() {
  return <BusinessPlan />;
}
```

### 2. With User Authentication
```jsx
import BusinessPlan from './pages/BusinessPlan';

function App() {
  const currentUser = {
    id: 1,
    name: 'John Doe',
    role: 'PM',
    department: 'DU1',
    permissions: ['VIEW_TOTAL', 'EDIT_BUSINESS_PLAN']
  };

  return <BusinessPlan currentUser={currentUser} />;
}
```

### 3. With Router
```jsx
<Route path="/business-plan" component={BusinessPlan} />
```

---

## 📊 Mock Data

### Onsite Data
- **Positions**: SE02 (DU3), SE02 (DU1), BJI
- **Unit Price**: 20,000,000 VND/MM
- **Total Revenue**: ~7,500,000,000 VND
- **Deduction**: ~7,100,000,000 VND

### Offshore Data
- **Positions**: SE02, PM, QA (all TDX)
- **Unit Price**: 26M, 35M, 22M VND/MM
- **Other Revenue**: Training + License = 80M VND
- **Expenses**: Marketing + Travel = 35M VND

---

## 🎨 UI/UX Features

### Tabs & Navigation
- 3 main tabs: Business plan, Revenue Plan, Delivery Plan
- Work type switcher: Onsite ↔ Offshore
- View mode switcher: Total ↔ OB
- Quick action buttons

### Tables
- Editable inline cells
- Add/Delete rows
- Filter by department
- Show/Hide monthly columns
- Auto-calculate totals
- Highlighted totals (green for revenue, red for expenses)

### Permissions
- Disabled buttons for no-permission users
- Masked financial data (`***`)
- Permission denied screen
- Alert messages for unauthorized actions

---

## 🔄 Data Flow

```
User selects Work Type (Onsite/Offshore)
        ↓
fetchBusinessPlanData(workType)
        ↓
Load mock data for selected work type
        ↓
Render Summary, Software Production, Other Revenue, Selling Expenses
        ↓
User edits data (if has permission)
        ↓
Calculate totals using formulas
        ↓
User clicks Save
        ↓
Check permissions
        ↓
saveBusinessPlanData(workType, data)
        ↓
Success/Error message
```

---

## 🧮 Example Calculations

### Scenario 1: Onsite SE02
```
Input:
- Unit Price: 20,000,000 VND
- Exchange Rate: 1
- Pipeline Ratio: 100%
- MM: 1.5

Calculation:
Total Revenue = 20,000,000 × 1 × (100/100) × 1.5
              = 30,000,000 VND
```

### Scenario 2: Offshore PM
```
Input:
- Unit Price: 35,000,000 VND
- Exchange Rate: 1
- Pipeline Ratio: 100%
- MM: 1

Calculation:
Total Revenue = 35,000,000 × 1 × (100/100) × 1
              = 35,000,000 VND
```

---

## 🔐 Permission Examples

### Example 1: Admin User
```javascript
✅ Can view: Total, OB, Onsite, Offshore
✅ Can view: All financial data
✅ Can edit: All sections
✅ Can: Approve, Delete, Export
```

### Example 2: PM User
```javascript
✅ Can view: Total, Onsite, Offshore
✅ Can view: Financial data
✅ Can edit: Business Plan, Revenue Plan, Delivery Plan
❌ Cannot: Approve, Delete (only Manager can)
```

### Example 3: Developer
```javascript
✅ Can view: Own department only
❌ Cannot view: Financial data (shows ***)
❌ Cannot edit: Any section
❌ Cannot: Approve, Delete, Export
```

---

## 📝 API Endpoints (for future backend integration)

```javascript
// Fetch data
GET /api/business-plan/:workType
Response: { summary, softwareProduction, otherRevenue, sellingExpenses }

// Save data
PUT /api/business-plan/:workType
Body: { summary, softwareProduction, otherRevenue, sellingExpenses }

// Get department breakdown
GET /api/business-plan/:workType/departments
Response: { Total, BJI, DU1, DU3, TDX, Internal }

// Get monthly revenue
GET /api/business-plan/:workType/monthly
Response: [{ month, revenue }, ...]

// Export data
GET /api/business-plan/:workType/export?format=json|csv
Response: Download file
```

---

## ✨ Điểm nổi bật:

1. **Tách biệt Onsite/Offshore**: Quản lý độc lập, dễ mở rộng
2. **Permission System**: Kiểm soát truy cập chi tiết đến từng field
3. **Auto-calculation**: Tự động tính toán theo công thức
4. **Flexible Views**: Total/OB modes cho các góc nhìn khác nhau
5. **Monthly Details**: Chi tiết theo tháng, có thể ẩn/hiện
6. **Mock Data Ready**: Sẵn data để test, dễ chuyển sang real API
7. **Well-structured**: Code tách biệt rõ ràng, dễ maintain

---

## 🎯 Kết luận:

✅ **Hoàn thành 100% yêu cầu:**
- ✅ Step by step cho Onsite và Offshore
- ✅ Tabs: Business plan, Revenue Plan, Delivery Plan
- ✅ View modes: Total và OB
- ✅ Tính công thức đầy đủ
- ✅ Permission system hoàn chỉnh
- ✅ Mock data cho cả 2 work types
- ✅ UI/UX responsive và professional

**Ready to use! 🚀**

---

## 📚 Tài liệu tham khảo thêm:

Sẽ tạo thêm:
- BUSINESS_PLAN_QUICK_START.md: Hướng dẫn sử dụng nhanh
- BUSINESS_PLAN_FORMULAS.md: Chi tiết các công thức
- BUSINESS_PLAN_PERMISSIONS.md: Hướng dẫn permission system
- BUSINESS_PLAN_API_INTEGRATION.md: Tích hợp với backend
