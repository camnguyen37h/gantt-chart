# Business Plan - Investigation & Solution Report

## 📋 Báo cáo Điều tra và Giải pháp - Hệ thống Business Plan

**Ngày tạo:** 04/02/2026  
**Dự án:** CMC Gantt Chart - Business Plan Module  
**Phạm vi:** Thiết kế và triển khai hệ thống Business Plan cho 2 MVV (Onsite + Offshore)

---

## 📖 MỤC LỤC

1. [Tổng quan Yêu cầu](#1-tổng-quan-yêu-cầu)
2. [Kết quả Điều tra](#2-kết-quả-điều-tra)
3. [Challenges và Vấn đề](#3-challenges-và-vấn-đề)
4. [Giải pháp Thiết kế](#4-giải-pháp-thiết-kế)
5. [Architecture Decisions](#5-architecture-decisions)
6. [Workflow và Data Flow](#6-workflow-và-data-flow)
7. [Testing và Validation](#7-testing-và-validation)
8. [Lessons Learned](#8-lessons-learned)

---

## 1. 🎯 TỔNG QUAN YÊU CẦU

### 1.1 Yêu cầu Ban đầu

**Mục tiêu chính:**
Xây dựng hệ thống quản lý Business Plan cho công ty với 2 loại hình công việc:
- **Onsite MVV** (Mã vụ việc Onsite): Dự án làm việc tại chỗ
- **Offshore MVV** (Mã vụ việc Offshore): Dự án làm việc từ xa

**Yêu cầu chức năng:**
- Quản lý 3 loại kế hoạch: Business Plan, Revenue Plan, Delivery Plan
- Hiển thị dữ liệu theo nhiều góc nhìn khác nhau
- Phê duyệt kế hoạch theo quy trình
- Phân quyền truy cập theo vai trò

### 1.2 Yêu cầu được Làm rõ

Sau quá trình trao đổi, yêu cầu được làm rõ như sau:

```
┌─────────────────────────────────────────────────────┐
│           BUSINESS PLAN SYSTEM                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 4 VIEW MODES (Global - áp dụng cho TẤT CẢ tabs)│
│  ┌─────────────────────────────────────────────┐  │
│  │ ○ Total     ○ OB    ○ Onsite   ○ Offshore  │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  📑 3 TABS (Sử dụng chung View Modes)              │
│  ┌─────────────────────────────────────────────┐  │
│  │ [Business Plan] [Revenue Plan] [Delivery Plan]│
│  │                                               │  │
│  │  ↳ Nội dung được filter theo View Mode       │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ✅ APPROVAL (Combined cho cả 2 MVV)               │
│  ┌─────────────────────────────────────────────┐  │
│  │  [Approve All]  [Reject All]                │  │
│  │    ↳ Xử lý ĐỒNG THỜI Onsite + Offshore      │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Điểm quan trọng:**
- ✅ View Modes là GLOBAL filter, không phải tabs riêng
- ✅ 3 tabs đều sử dụng chung View Mode selector
- ✅ Approval/Reject xử lý GỘP cả 2 MVV, không tách riêng
- ✅ Transaction-based: Cả 2 thành công hoặc cả 2 rollback

---

## 2. 🔍 KẾT QUẢ ĐIỀU TRA

### 2.1 Phân tích Requirements

**Phase 1: Hiểu yêu cầu ban đầu**

```
Yêu cầu User           │  Hiểu ban đầu (SAI)        │  Hiểu chính xác (ĐÚNG)
───────────────────────┼────────────────────────────┼──────────────────────────
"Total, OB, Onsite,    │  → 4 tabs riêng biệt       │  → 4 view modes (filters)
 Offshore"             │                            │     Global cho tất cả tabs
                       │                            │
"Step by step for      │  → Xử lý approval riêng    │  → Combined approval
 2 MVV"                │     từng MVV               │     Cả 2 MVV cùng lúc
                       │                            │
"Business Plan,        │  → 3 modules độc lập       │  → 3 tabs trong 1 module
 Revenue Plan,         │                            │     Dùng chung view modes
 Delivery Plan"        │                            │
```

**Phase 2: Làm rõ View Modes**

Điều tra cho thấy View Modes hoạt động như **filters toàn cục**:

```
┌──────────────────────────────────────────────────────────┐
│  View Mode Selector (GLOBAL)                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ( ) Total  ( ) OB  ( ) Onsite  ( ) Offshore       │  │
│  └────────────────────────────────────────────────────┘  │
│                         ↓                                 │
│         Áp dụng cho TẤT CẢ 3 tabs bên dưới              │
│                         ↓                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Tab 1: Business Plan                              │  │
│  │  ├─ Summary (filtered by view mode)                │  │
│  │  ├─ Software Production (filtered)                 │  │
│  │  ├─ Other Revenue (filtered)                       │  │
│  │  └─ Expenses (filtered)                            │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Tab 2: Revenue Plan                               │  │
│  │  └─ Content (filtered by same view mode)           │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Tab 3: Delivery Plan                              │  │
│  │  └─ Content (filtered by same view mode)           │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Kết luận Phase 2:**
- View Modes = Global State
- Switching view mode → All tabs update simultaneously
- Each tab shows filtered data based on selected view mode

**Phase 3: Làm rõ Approval Workflow**

Điều tra quy trình phê duyệt:

```
❌ CÁCH HIỂU SAI (Separated Approval):
┌─────────────────────┐
│  User clicks        │
│  "Approve Onsite"   │
└──────────┬──────────┘
           ↓
   ┌──────────────┐
   │ Onsite MVV   │ → Approved ✓
   └──────────────┘
   
   (Sau đó phải click riêng)
   
┌─────────────────────┐
│  User clicks        │
│  "Approve Offshore" │
└──────────┬──────────┘
           ↓
   ┌──────────────┐
   │ Offshore MVV │ → Approved ✓
   └──────────────┘

⚠️ VẤN ĐỀ: Có thể Onsite approved nhưng Offshore rejected → Không nhất quán


✅ CÁCH HIỂU ĐÚNG (Combined Approval):
┌─────────────────────┐
│  User clicks        │
│  "Approve All"      │
└──────────┬──────────┘
           ↓
   ┌─────────────────────────────┐
   │  Validate BOTH MVV          │
   │  ├─ Onsite data valid?      │
   │  └─ Offshore data valid?    │
   └──────────┬──────────────────┘
              ↓
   ┌─────────────────────────────┐
   │  Send approval ĐỒNG THỜI    │
   │  Promise.all([              │
   │    approveOnsite(),         │
   │    approveOffshore()        │
   │  ])                         │
   └──────────┬──────────────────┘
              ↓
        Both success?
              ↓
   ┌─────────────────────────────┐
   │  YES → Update status ✓      │
   │  NO → Rollback both ✗       │
   └─────────────────────────────┘

✅ ƯU ĐIỂM: Đảm bảo nhất quán, transaction-based
```

### 2.2 Data Structure Investigation

**Điều tra cấu trúc dữ liệu:**

Phân tích cho thấy cần tách biệt data của 2 MVV nhưng vẫn có khả năng merge:

```
Root Data Structure
│
├─ Metadata
│  ├─ id
│  ├─ period (2026-Q1)
│  ├─ status (PENDING/APPROVED/REJECTED)
│  └─ timestamps
│
├─ Onsite MVV Data
│  ├─ softwareProduction[]
│  │  ├─ position
│  │  ├─ unitPrice
│  │  ├─ department
│  │  ├─ mm
│  │  └─ total (calculated)
│  │
│  ├─ otherRevenue[]
│  ├─ expenses[]
│  └─ totals (summary)
│
├─ Offshore MVV Data
│  ├─ softwareProduction[]
│  ├─ otherRevenue[]
│  ├─ expenses[]
│  └─ totals (summary)
│
└─ Aggregated (for Total view)
   ├─ totalRevenue = onsite + offshore
   ├─ totalExpenses = onsite + offshore
   ├─ byDepartment{}
   └─ byMonth{}
```

**Quyết định thiết kế:**
- Lưu trữ RIÊNG BIỆT: onsite và offshore data
- Tính toán AGGREGATED khi cần (Total view)
- Cho phép EDIT độc lập từng MVV
- Đồng bộ APPROVAL cho cả 2 MVV

---

## 3. ⚠️ CHALLENGES VÀ VẤN ĐỀ

### 3.1 Challenge 1: View Mode Filtering

**Vấn đề:**
Làm sao để 1 View Mode selector có thể filter data cho 3 tabs khác nhau?

**Phân tích:**

```
Challenge: View Mode State Management
┌────────────────────────────────────────────┐
│  View Mode = "Total"                       │
│  Active Tab = "Business Plan"              │
│                                            │
│  ❓ Làm sao để:                            │
│     1. Filter Business Plan data?          │
│     2. Switch tab → Filter new tab data?   │
│     3. Switch view mode → Re-filter?       │
└────────────────────────────────────────────┘
```

**Giải pháp:**
Sử dụng **Global State** + **Derived Data Pattern**

```
┌──────────────────────────────────────────────┐
│  Global State (Parent Component)             │
│  ├─ viewMode: "Total"                        │
│  ├─ activeTab: "business-plan"               │
│  └─ rawData: { onsite, offshore }            │
└────────────┬─────────────────────────────────┘
             ↓
   ┌─────────────────────────┐
   │  Filtering Function     │
   │  getViewData(viewMode)  │
   └────────────┬────────────┘
                ↓
   ┌────────────────────────────────┐
   │  Filtered Data (Derived)       │
   │  - Total: merge onsite+offshore│
   │  - OB: balance sheet           │
   │  - Onsite: only onsite         │
   │  - Offshore: only offshore     │
   └────────────┬───────────────────┘
                ↓
   ┌────────────────────────────────┐
   │  Pass to Active Tab            │
   │  <BusinessPlanTab data={...}>  │
   └────────────────────────────────┘
```

### 3.2 Challenge 2: Combined Approval Transaction

**Vấn đề:**
Đảm bảo approval của 2 MVV hoặc cả 2 thành công, hoặc cả 2 fail (transaction)

**Phân tích vấn đề:**

```
Scenario 1: Onsite success, Offshore failed
┌──────────────────────────────────────────┐
│  [Approve All] clicked                   │
│                                          │
│  ├─ Approve Onsite  → ✓ Success         │
│  └─ Approve Offshore → ✗ Failed         │
│                                          │
│  ❓ Kết quả:                             │
│     - Onsite = APPROVED                  │
│     - Offshore = PENDING                 │
│                                          │
│  ⚠️ VẤN ĐỀ: Inconsistent state!         │
└──────────────────────────────────────────┘

Scenario 2: Network error mid-process
┌──────────────────────────────────────────┐
│  [Approve All] clicked                   │
│                                          │
│  ├─ Approve Onsite  → ✓ Success         │
│  ├─ Network timeout                      │
│  └─ Approve Offshore → ? Unknown        │
│                                          │
│  ❓ Kết quả:                             │
│     - Không biết Offshore có success?    │
│     - Cần rollback Onsite?               │
│                                          │
│  ⚠️ VẤN ĐỀ: Unclear state!              │
└──────────────────────────────────────────┘
```

**Giải pháp:**
Sử dụng **Promise.all() + Rollback Pattern**

```
Combined Approval Flow
┌─────────────────────────────────────────────┐
│  Step 1: VALIDATE BOTH                      │
│  ├─ Validate Onsite data                    │
│  └─ Validate Offshore data                  │
│     └─ If ANY fails → STOP, show error     │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  Step 2: APPROVE BOTH (Parallel)            │
│                                             │
│  Promise.all([                              │
│    api.approve('onsite'),                   │
│    api.approve('offshore')                  │
│  ])                                         │
│                                             │
│  Wait for BOTH to complete                  │
└────────────┬────────────────────────────────┘
             ↓
        Both success?
             │
    ┌────────┴────────┐
    │                 │
   YES               NO
    │                 │
    ↓                 ↓
┌────────┐    ┌──────────────┐
│Update  │    │ Step 3:      │
│status  │    │ ROLLBACK     │
│to      │    │              │
│APPROVED│    │ Promise.all([│
└────────┘    │   rollback   │
              │   ('onsite'),│
              │   rollback   │
              │   ('offshore')│
              │ ])           │
              │              │
              │ Return to    │
              │ PENDING      │
              └──────────────┘
```

### 3.3 Challenge 3: Permission Granularity

**Vấn đề:**
Làm sao để kiểm soát quyền truy cập chi tiết theo vai trò và department?

**Phân tích requirements:**

```
User Roles và Access Levels
┌────────────────────────────────────────────────────┐
│  ADMIN                                             │
│  ├─ View: All views, all departments, all data    │
│  ├─ Edit: Full access                             │
│  └─ Actions: Approve, Reject, Delete, Export      │
├────────────────────────────────────────────────────┤
│  MANAGER                                           │
│  ├─ View: All views, all departments, all data    │
│  ├─ Edit: Full access                             │
│  └─ Actions: Approve, Reject, Export              │
│                (No Delete)                         │
├────────────────────────────────────────────────────┤
│  PM                                                │
│  ├─ View: Total, OB, Onsite, Offshore             │
│  ├─ Edit: Can edit (but limited to own dept?)     │
│  └─ Actions: Submit for approval                  │
│                (No Approve/Reject)                 │
├────────────────────────────────────────────────────┤
│  TEAM_LEAD                                         │
│  ├─ View: Own department only                     │
│  ├─ Edit: Limited to delivery plan                │
│  └─ Actions: None                                 │
├────────────────────────────────────────────────────┤
│  DEVELOPER / VIEWER                                │
│  ├─ View: Own department only (some data masked)  │
│  ├─ Edit: No                                      │
│  └─ Actions: None                                 │
└────────────────────────────────────────────────────┘

❓ Challenges:
1. Làm sao check permission cho từng action?
2. Làm sao filter data theo department?
3. Làm sao mask financial data cho user không có quyền?
4. Làm sao disable UI elements cho no-permission users?
```

**Giải pháp:**
Sử dụng **Role-Based Access Control (RBAC) Matrix**

```
Permission Matrix Design
┌───────────────────────────────────────────────────┐
│  Permission ID    │  ADMIN  │  MGR  │  PM  │ TL  │
├───────────────────┼─────────┼───────┼──────┼─────┤
│  VIEW_TOTAL       │   ✓     │   ✓   │  ✓   │  ✓  │
│  VIEW_OB          │   ✓     │   ✓   │  ✓   │  ✗  │
│  VIEW_ONSITE      │   ✓     │   ✓   │  ✓   │  ✓* │
│  VIEW_OFFSHORE    │   ✓     │   ✓   │  ✓   │  ✓* │
│  VIEW_FINANCIAL   │   ✓     │   ✓   │  ✓   │  ✗  │
│  VIEW_ALL_DEPT    │   ✓     │   ✓   │  ✓   │  ✗  │
│  EDIT_BP          │   ✓     │   ✓   │  ✓   │  ✗  │
│  APPROVE          │   ✓     │   ✓   │  ✗   │  ✗  │
│  DELETE           │   ✓     │   ✗   │  ✗   │  ✗  │
└───────────────────┴─────────┴───────┴──────┴─────┘
* = Own department only
```

Sử dụng Permission Guards:
```
UI Element Protection Flow
┌─────────────────────────────────────────────┐
│  User wants to view "Approve All" button    │
└────────────┬────────────────────────────────┘
             ↓
   ┌──────────────────────┐
   │  Check Permission    │
   │  hasPermission(      │
   │    user,             │
   │    'APPROVE_PLAN'    │
   │  )                   │
   └────────┬─────────────┘
            ↓
       Has permission?
            │
    ┌───────┴───────┐
    │               │
   YES             NO
    │               │
    ↓               ↓
┌─────────┐   ┌──────────┐
│ Show    │   │ Hide or  │
│ button  │   │ Disable  │
│ enabled │   │ button   │
└─────────┘   └──────────┘
```

---

## 4. ✅ GIẢI PHÁP THIẾT KẾ

### 4.1 Overall Architecture

**Kiến trúc tổng thể của hệ thống:**

```
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS PLAN SYSTEM                     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  PRESENTATION LAYER                                   │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  View Mode Selector (Global State)              │ │ │
│  │  │  ○ Total  ○ OB  ○ Onsite  ○ Offshore            │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Tab Navigation                                 │ │ │
│  │  │  [Business Plan] [Revenue Plan] [Delivery Plan] │ │ │
│  │  │                                                 │ │ │
│  │  │  ┌─────────────────────────────────────────┐   │ │ │
│  │  │  │  Tab Content (Filtered by View Mode)    │   │ │ │
│  │  │  │  - Summary                              │   │ │ │
│  │  │  │  - Software Production Revenue          │   │ │ │
│  │  │  │  - Other Revenue                        │   │ │ │
│  │  │  │  - Expenses                             │   │ │ │
│  │  │  └─────────────────────────────────────────┘   │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Approval Section                               │ │ │
│  │  │  [Approve All]  [Reject All]                    │ │ │
│  │  │  Status: Onsite (PENDING) | Offshore (PENDING)  │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                            ↕                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  BUSINESS LOGIC LAYER                                 │ │
│  │                                                       │ │
│  │  ┌──────────────────┐  ┌──────────────────┐          │ │
│  │  │ View Mode Filter │  │ Permission Check │          │ │
│  │  │ - Total: Merge   │  │ - hasPermission()│          │ │
│  │  │ - OB: Balance    │  │ - canAccess()    │          │ │
│  │  │ - Onsite: Filter │  │ - maskData()     │          │ │
│  │  │ - Offshore:Filter│  └──────────────────┘          │ │
│  │  └──────────────────┘                                 │ │
│  │                                                       │ │
│  │  ┌──────────────────┐  ┌──────────────────┐          │ │
│  │  │  Calculations    │  │ Approval Logic   │          │ │
│  │  │ - Revenue calc   │  │ - Validate both  │          │ │
│  │  │ - MM Bill calc   │  │ - Promise.all()  │          │ │
│  │  │ - Total calc     │  │ - Rollback       │          │ │
│  │  └──────────────────┘  └──────────────────┘          │ │
│  └───────────────────────────────────────────────────────┘ │
│                            ↕                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  DATA LAYER                                           │ │
│  │                                                       │ │
│  │  ┌─────────────────┐  ┌─────────────────┐            │ │
│  │  │  Onsite MVV     │  │ Offshore MVV    │            │ │
│  │  │  - Positions    │  │ - Positions     │            │ │
│  │  │  - Revenue      │  │ - Revenue       │            │ │
│  │  │  - Expenses     │  │ - Expenses      │            │ │
│  │  │  - Totals       │  │ - Totals        │            │ │
│  │  └─────────────────┘  └─────────────────┘            │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Aggregated Data (Computed)                     │ │ │
│  │  │  - Total Revenue = Onsite + Offshore            │ │ │
│  │  │  - By Department                                │ │ │
│  │  │  - By Month                                     │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 View Mode System Design

**Cách hoạt động của View Modes:**

```
View Mode = "TOTAL"
┌───────────────────────────────────────────────────────┐
│  Raw Data                                             │
│  ┌────────────────┐         ┌────────────────┐       │
│  │  Onsite MVV    │         │ Offshore MVV   │       │
│  │                │         │                │       │
│  │  Positions:    │         │  Positions:    │       │
│  │  - SE02 (DU3)  │         │  - SE02 (TDX)  │       │
│  │  - SE02 (DU1)  │         │  - PM (TDX)    │       │
│  │  - SE02 (BJI)  │         │  - QA (TDX)    │       │
│  │                │         │                │       │
│  │  Revenue: 7.5B │         │  Revenue: 8.3B │       │
│  └────────────────┘         └────────────────┘       │
└───────────────────┬───────────────┬───────────────────┘
                    │               │
                    └───────┬───────┘
                            ↓
                   ┌────────────────────┐
                   │  MERGE Function    │
                   │  Combine both MVV  │
                   └────────┬───────────┘
                            ↓
┌───────────────────────────────────────────────────────┐
│  View Data (Merged)                                   │
│                                                       │
│  All Positions:                                       │
│  - SE02 (DU3) - Onsite                               │
│  - SE02 (DU1) - Onsite                               │
│  - SE02 (BJI) - Onsite                               │
│  - SE02 (TDX) - Offshore                             │
│  - PM (TDX) - Offshore                               │
│  - QA (TDX) - Offshore                               │
│                                                       │
│  Total Revenue: 15.8B (7.5B + 8.3B)                  │
└───────────────────────────────────────────────────────┘

View Mode = "ONSITE"
┌───────────────────────────────────────────────────────┐
│  Raw Data                                             │
│  ┌────────────────┐         ┌────────────────┐       │
│  │  Onsite MVV    │         │ Offshore MVV   │       │
│  │  ✓ Selected    │         │  ✗ Filtered    │       │
│  └────────────────┘         └────────────────┘       │
└───────────────────┬───────────────────────────────────┘
                    ↓
           ┌────────────────────┐
           │  FILTER Function   │
           │  Return Onsite only│
           └────────┬───────────┘
                    ↓
┌───────────────────────────────────────────────────────┐
│  View Data (Onsite Only)                              │
│                                                       │
│  Positions:                                           │
│  - SE02 (DU3)                                        │
│  - SE02 (DU1)                                        │
│  - SE02 (BJI)                                        │
│                                                       │
│  Revenue: 7.5B                                       │
└───────────────────────────────────────────────────────┘

View Mode = "OB" (Balance Sheet)
┌───────────────────────────────────────────────────────┐
│  Raw Data                                             │
│  ┌────────────────┐         ┌────────────────┐       │
│  │  Onsite MVV    │         │ Offshore MVV   │       │
│  │  Revenue: 7.5B │         │  Revenue: 8.3B │       │
│  │  Expense: 7.1B │         │  Expense: 0.03B│       │
│  └────────────────┘         └────────────────┘       │
└───────────────────┬───────────────┬───────────────────┘
                    │               │
                    └───────┬───────┘
                            ↓
                   ┌────────────────────┐
                   │  BALANCE Function  │
                   │  Calculate OB view │
                   └────────┬───────────┘
                            ↓
┌───────────────────────────────────────────────────────┐
│  View Data (Balance Sheet)                            │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  ASSETS (Revenue)                               │ │
│  │  ├─ Onsite Revenue:    7.5B                     │ │
│  │  ├─ Offshore Revenue:  8.3B                     │ │
│  │  └─ Total Assets:      15.8B                    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  LIABILITIES (Expenses)                         │ │
│  │  ├─ Onsite Expenses:   7.1B                     │ │
│  │  ├─ Offshore Expenses: 0.03B                    │ │
│  │  └─ Total Liabilities: 7.13B                    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  EQUITY (Net)                                   │ │
│  │  └─ Total Equity: 8.67B (15.8B - 7.13B)         │ │
│  └─────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

### 4.3 Approval Workflow Design

**Quy trình phê duyệt chi tiết:**

```
USER ACTION: Click "Approve All"
│
├─ STEP 1: Validation Phase
│  │
│  ├─ Validate Onsite MVV
│  │  ├─ Check positions data complete?
│  │  ├─ Check unit prices valid?
│  │  ├─ Check departments assigned?
│  │  ├─ Check revenue > 0?
│  │  └─ Check expenses ≤ revenue?
│  │     │
│  │     ├─ Valid ✓ → Continue
│  │     └─ Invalid ✗ → STOP, show errors
│  │
│  └─ Validate Offshore MVV
│     ├─ Check positions data complete?
│     ├─ Check unit prices valid?
│     ├─ Check departments assigned?
│     ├─ Check revenue > 0?
│     └─ Check expenses ≤ revenue?
│        │
│        ├─ Valid ✓ → Continue to Step 2
│        └─ Invalid ✗ → STOP, show errors
│
├─ STEP 2: Submission Phase
│  │
│  ├─ Prepare Onsite payload
│  │  └─ { mvvType: 'onsite', data: {...} }
│  │
│  ├─ Prepare Offshore payload
│  │  └─ { mvvType: 'offshore', data: {...} }
│  │
│  └─ Submit BOTH simultaneously
│     │
│     Promise.all([
│       api.approve('onsite', onsiteData),
│       api.approve('offshore', offshoreData)
│     ])
│     │
│     └─ Wait for BOTH responses...
│
├─ STEP 3: Response Handling
│  │
│  ├─ Case A: Both Success ✓
│  │  │
│  │  ├─ Response 1: { status: 'success', mvv: 'onsite' }
│  │  ├─ Response 2: { status: 'success', mvv: 'offshore' }
│  │  │
│  │  └─ Update UI
│  │     ├─ Onsite status → APPROVED
│  │     ├─ Offshore status → APPROVED
│  │     ├─ Show success message
│  │     └─ Disable edit mode
│  │
│  ├─ Case B: One Failed ✗
│  │  │
│  │  ├─ Response 1: { status: 'success', mvv: 'onsite' }
│  │  ├─ Response 2: { status: 'error', mvv: 'offshore' }
│  │  │
│  │  └─ ROLLBACK
│  │     ├─ Call rollbackApproval('onsite')
│  │     ├─ Call rollbackApproval('offshore')
│  │     │
│  │     └─ Update UI
│  │        ├─ Both status → PENDING
│  │        ├─ Show error message
│  │        └─ Keep edit mode enabled
│  │
│  └─ Case C: Both Failed ✗
│     │
│     ├─ Response 1: { status: 'error', mvv: 'onsite' }
│     ├─ Response 2: { status: 'error', mvv: 'offshore' }
│     │
│     └─ Update UI
│        ├─ Both status → PENDING
│        ├─ Show combined error messages
│        └─ Keep edit mode enabled
│
└─ STEP 4: Completion
   │
   ├─ Log approval history
   │  └─ { timestamp, user, action, result }
   │
   ├─ Notify stakeholders
   │  └─ Email/Notification to Manager
   │
   └─ Update dashboard
      └─ Refresh statistics
```

### 4.4 Permission System Design

**Hệ thống phân quyền:**

```
Permission Check Flow
┌─────────────────────────────────────────────────┐
│  User logged in                                 │
│  { id: 1, role: 'PM', department: 'DU1' }       │
└────────────┬────────────────────────────────────┘
             ↓
   ┌──────────────────────────┐
   │  Load User Permissions   │
   │  Based on Role           │
   └────────┬─────────────────┘
            ↓
┌────────────────────────────────────────────┐
│  Permission Matrix (for PM role)           │
│  ┌──────────────────────────────────────┐ │
│  │  VIEW_TOTAL: ✓                       │ │
│  │  VIEW_OB: ✓                          │ │
│  │  VIEW_ONSITE: ✓                      │ │
│  │  VIEW_OFFSHORE: ✓                    │ │
│  │  VIEW_FINANCIAL_DATA: ✓              │ │
│  │  EDIT_BUSINESS_PLAN: ✓               │ │
│  │  APPROVE_PLAN: ✗                     │ │
│  │  DELETE_PLAN: ✗                      │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
             ↓
┌────────────────────────────────────────────┐
│  Apply Permissions to UI                   │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  View Mode Selector                  │ │
│  │  ○ Total (✓ enabled)                 │ │
│  │  ○ OB (✓ enabled)                    │ │
│  │  ○ Onsite (✓ enabled)                │ │
│  │  ○ Offshore (✓ enabled)              │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Data Tables                         │ │
│  │  - Editable: ✓ YES                   │ │
│  │  - Financial data: ✓ VISIBLE         │ │
│  │  - All departments: ✓ VISIBLE        │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Action Buttons                      │ │
│  │  [Save] → ✓ Enabled                  │ │
│  │  [Submit] → ✓ Enabled                │ │
│  │  [Approve All] → ✗ Disabled (no perm)│ │
│  │  [Delete] → ✗ Hidden (no perm)       │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘

Data Masking for Limited Users
┌────────────────────────────────────────────┐
│  User: DEVELOPER (limited permissions)     │
└────────────┬───────────────────────────────┘
             ↓
┌────────────────────────────────────────────┐
│  Permission Check                          │
│  VIEW_FINANCIAL_DATA: ✗ NO                 │
└────────────┬───────────────────────────────┘
             ↓
┌────────────────────────────────────────────┐
│  Mask Financial Data in UI                 │
│                                            │
│  Position    Unit Price    Total           │
│  ─────────────────────────────────────     │
│  SE02        ***          ***              │
│  PM          ***          ***              │
│  QA          ***          ***              │
│                                            │
│  Total Revenue: ***                        │
│  Total Expenses: ***                       │
└────────────────────────────────────────────┘
```

---

## 5. 🏛️ ARCHITECTURE DECISIONS

### 5.1 Decision 1: Global View Mode State

**Question:**
Nên đặt View Mode state ở đâu? Component level hay global?

**Options Considered:**

```
Option A: Component-level State
BusinessPlanPage
├─ BusinessPlanTab (own viewMode state)
├─ RevenuePlanTab (own viewMode state)
└─ DeliveryPlanTab (own viewMode state)

❌ VẤN ĐỀ:
- Mỗi tab có state riêng
- Switching tab → View mode reset
- Không consistent across tabs
```

```
Option B: Global State (SELECTED ✓)
BusinessPlanPage (viewMode state here)
├─ ViewModeSelector
│  └─ Updates global viewMode
├─ BusinessPlanTab (receives viewMode as prop)
├─ RevenuePlanTab (receives viewMode as prop)
└─ DeliveryPlanTab (receives viewMode as prop)

✅ ƯU ĐIỂM:
- Single source of truth
- Consistent across all tabs
- Switching tab keeps view mode
- Easier to manage
```

**Decision:** ✅ Option B - Global State

**Rationale:**
- View Mode phải áp dụng cho TẤT CẢ tabs
- Switching tabs không nên thay đổi view mode
- Dễ debug và maintain

### 5.2 Decision 2: Combined vs Separated Approval

**Question:**
Nên approval riêng từng MVV hay gộp cả 2?

**Options Considered:**

```
Option A: Separated Approval
┌──────────────────────┐  ┌──────────────────────┐
│  [Approve Onsite]    │  │ [Approve Offshore]   │
└──────────────────────┘  └──────────────────────┘

❌ VẤN ĐỀ:
- Có thể inconsistent state
- User phải click 2 lần
- Có thể quên approve 1 trong 2
- Khó rollback khi có lỗi
```

```
Option B: Combined Approval (SELECTED ✓)
┌──────────────────────────────────────┐
│  [Approve All (Onsite + Offshore)]   │
└──────────────────────────────────────┘

✅ ƯU ĐIỂM:
- Đảm bảo consistency
- Transaction-based (all or nothing)
- User chỉ click 1 lần
- Dễ rollback khi fail
- Clear intent
```

**Decision:** ✅ Option B - Combined Approval

**Rationale:**
- Business logic yêu cầu cả 2 MVV phải đồng bộ
- Tránh trạng thái không nhất quán
- Better user experience
- Easier error handling

### 5.3 Decision 3: Data Storage Structure

**Question:**
Nên lưu data như thế nào? Merged hay separated?

**Options Considered:**

```
Option A: Merged Storage
{
  allPositions: [
    { id: 1, position: 'SE02', mvv: 'onsite', ... },
    { id: 2, position: 'SE02', mvv: 'offshore', ... }
  ]
}

❌ VẤN ĐỀ:
- Khó filter theo MVV
- Khó validate riêng từng MVV
- Approval logic phức tạp
```

```
Option B: Separated Storage (SELECTED ✓)
{
  onsite: {
    softwareProduction: [...],
    otherRevenue: [...],
    expenses: [...],
    totals: {...}
  },
  offshore: {
    softwareProduction: [...],
    otherRevenue: [...],
    expenses: [...],
    totals: {...}
  },
  aggregated: {
    // Computed on-demand
  }
}

✅ ƯU ĐIỂM:
- Clear separation
- Easy to filter
- Easy to validate separately
- Easy to approve separately then combine
- Aggregated data computed when needed
```

**Decision:** ✅ Option B - Separated Storage

**Rationale:**
- Dễ quản lý từng MVV độc lập
- Dễ validate và approve
- Performance tốt hơn (không phải filter liên tục)
- Aggregated data chỉ compute khi cần

---

## 6. 🔄 WORKFLOW VÀ DATA FLOW

### 6.1 Complete User Workflow

**Workflow từ đầu đến cuối:**

```
START: User opens Business Plan page
│
├─ STEP 1: Load Data
│  │
│  ├─ Show loading spinner
│  ├─ Fetch data from API
│  │  └─ GET /api/business-plan/current
│  │     └─ Returns: { onsite: {...}, offshore: {...} }
│  │
│  ├─ Store in state
│  └─ Hide loading spinner
│
├─ STEP 2: View Data
│  │
│  ├─ Default view: Total (merged data)
│  ├─ Default tab: Business Plan
│  │
│  ├─ User can:
│  │  ├─ Switch view mode
│  │  │  └─ Data re-filtered automatically
│  │  │
│  │  ├─ Switch tab
│  │  │  └─ View mode maintained
│  │  │
│  │  └─ View details
│  │     ├─ Summary
│  │     ├─ Positions
│  │     ├─ Revenue
│  │     └─ Expenses
│  │
│  └─ Permission check
│     ├─ Can view financial data?
│     └─ Can see all departments?
│
├─ STEP 3: Edit Data (if has permission)
│  │
│  ├─ Click "Edit" button
│  ├─ Enable edit mode
│  │
│  ├─ User can:
│  │  ├─ Add position
│  │  ├─ Edit position
│  │  ├─ Delete position
│  │  ├─ Add revenue item
│  │  ├─ Edit revenue item
│  │  ├─ Add expense item
│  │  └─ Edit expense item
│  │
│  ├─ Auto-calculate totals on change
│  │  ├─ Revenue total
│  │  ├─ Expense total
│  │  └─ Net revenue
│  │
│  └─ Click "Save"
│     ├─ Validate data
│     ├─ PUT /api/business-plan
│     ├─ Show success/error
│     └─ Reload data
│
├─ STEP 4: Submit for Approval
│  │
│  ├─ Click "Submit for Approval"
│  ├─ Validate BOTH MVV
│  │  ├─ Onsite valid?
│  │  └─ Offshore valid?
│  │
│  ├─ Show confirmation dialog
│  │  └─ "Submit both Onsite and Offshore for approval?"
│  │
│  ├─ User confirms
│  │
│  └─ POST /api/business-plan/submit
│     ├─ Status → SUBMITTED
│     └─ Notify Manager
│
├─ STEP 5: Manager Approval (if has permission)
│  │
│  ├─ Manager reviews data
│  │  ├─ Check all tabs
│  │  ├─ Check all view modes
│  │  └─ Verify calculations
│  │
│  ├─ Decision:
│  │  │
│  │  ├─ Option A: Approve All
│  │  │  ├─ Click "Approve All"
│  │  │  ├─ Validate BOTH MVV
│  │  │  ├─ Send approval for BOTH
│  │  │  │  └─ Promise.all([...])
│  │  │  ├─ Both success?
│  │  │  │  ├─ YES → Status = APPROVED
│  │  │  │  └─ NO → Rollback both
│  │  │  └─ Show result
│  │  │
│  │  └─ Option B: Reject All
│  │     ├─ Click "Reject All"
│  │     ├─ Enter reason
│  │     ├─ Send rejection for BOTH
│  │     ├─ Status → REJECTED
│  │     └─ Notify PM
│  │
│  └─ Log approval history
│
└─ END: Process complete
   │
   └─ Approved → Lock edit
      Rejected → PM can edit again
```

### 6.2 Data Transformation Flow

**Từ raw data → view data:**

```
RAW DATA (from API)
│
│  {
│    onsite: {
│      softwareProduction: [
│        { position: 'SE02', dept: 'DU3', unitPrice: 20M, mm: 1.5 },
│        { position: 'SE02', dept: 'DU1', unitPrice: 20M, mm: 2 },
│        { position: 'SE02', dept: 'BJI', unitPrice: 20M, mm: 1.5 }
│      ],
│      totals: { revenue: 7.5B, expenses: 7.1B }
│    },
│    offshore: {
│      softwareProduction: [
│        { position: 'SE02', dept: 'TDX', unitPrice: 26M, mm: 1 },
│        { position: 'PM', dept: 'TDX', unitPrice: 35M, mm: 1 },
│        { position: 'QA', dept: 'TDX', unitPrice: 22M, mm: 1 }
│      ],
│      totals: { revenue: 8.3B, expenses: 0.03B }
│    }
│  }
│
├─ IF viewMode = "TOTAL"
│  │
│  └─> TRANSFORMATION: Merge
│      │
│      └─> VIEW DATA
│          {
│            softwareProduction: [
│              ...onsite (with mvv tag),
│              ...offshore (with mvv tag)
│            ],
│            totals: {
│              revenue: 15.8B (7.5B + 8.3B),
│              expenses: 7.13B (7.1B + 0.03B),
│              net: 8.67B
│            }
│          }
│
├─ IF viewMode = "OB"
│  │
│  └─> TRANSFORMATION: Calculate Balance
│      │
│      └─> VIEW DATA
│          {
│            assets: {
│              onsite: 7.5B,
│              offshore: 8.3B,
│              total: 15.8B
│            },
│            liabilities: {
│              onsite: 7.1B,
│              offshore: 0.03B,
│              total: 7.13B
│            },
│            equity: {
│              total: 8.67B
│            }
│          }
│
├─ IF viewMode = "ONSITE"
│  │
│  └─> TRANSFORMATION: Filter Onsite
│      │
│      └─> VIEW DATA
│          {
│            softwareProduction: [
│              { position: 'SE02', dept: 'DU3', ... },
│              { position: 'SE02', dept: 'DU1', ... },
│              { position: 'SE02', dept: 'BJI', ... }
│            ],
│            totals: {
│              revenue: 7.5B,
│              expenses: 7.1B,
│              net: 0.4B
│            }
│          }
│
└─ IF viewMode = "OFFSHORE"
   │
   └─> TRANSFORMATION: Filter Offshore
       │
       └─> VIEW DATA
           {
             softwareProduction: [
               { position: 'SE02', dept: 'TDX', ... },
               { position: 'PM', dept: 'TDX', ... },
               { position: 'QA', dept: 'TDX', ... }
             ],
             totals: {
               revenue: 8.3B,
               expenses: 0.03B,
               net: 8.27B
             }
           }
```

---

## 7. ✔️ TESTING VÀ VALIDATION

### 7.1 Test Scenarios

**Scenarios cần test:**

```
TEST SUITE 1: View Mode Switching
┌─────────────────────────────────────────────┐
│  Test Case 1.1: Switch from Total to OB    │
│  Steps:                                     │
│  1. Load page (default: Total view)         │
│  2. Click OB view mode                      │
│  Expected:                                  │
│  - Data transforms to balance sheet         │
│  - All tabs show OB view                    │
│  - View mode persists when switching tabs   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Test Case 1.2: View mode persistence      │
│  Steps:                                     │
│  1. Select "Onsite" view                    │
│  2. Switch to Revenue Plan tab              │
│  3. Switch to Delivery Plan tab             │
│  4. Switch back to Business Plan tab        │
│  Expected:                                  │
│  - "Onsite" view maintained across all tabs │
│  - No unexpected view mode changes          │
└─────────────────────────────────────────────┘

TEST SUITE 2: Approval Workflow
┌─────────────────────────────────────────────┐
│  Test Case 2.1: Both MVV approved           │
│  Steps:                                     │
│  1. Fill valid data for both MVV            │
│  2. Click "Approve All"                     │
│  Mock Response:                             │
│  - Onsite: { status: 'success' }            │
│  - Offshore: { status: 'success' }          │
│  Expected:                                  │
│  - Both MVV status = APPROVED               │
│  - Success message shown                    │
│  - Edit mode disabled                       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Test Case 2.2: One MVV failed (rollback)  │
│  Steps:                                     │
│  1. Fill data (Offshore has validation err) │
│  2. Click "Approve All"                     │
│  Mock Response:                             │
│  - Onsite: { status: 'success' }            │
│  - Offshore: { status: 'error' }            │
│  Expected:                                  │
│  - Rollback called for both                 │
│  - Both MVV status = PENDING                │
│  - Error message shown                      │
│  - Edit mode still enabled                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Test Case 2.3: Validation before approval │
│  Steps:                                     │
│  1. Fill invalid data (revenue < 0)         │
│  2. Click "Approve All"                     │
│  Expected:                                  │
│  - Validation errors shown                  │
│  - No API call made                         │
│  - Status remains PENDING                   │
└─────────────────────────────────────────────┘

TEST SUITE 3: Permissions
┌─────────────────────────────────────────────┐
│  Test Case 3.1: PM user (can edit, no approve)│
│  User:                                      │
│  { role: 'PM', dept: 'DU1' }                │
│  Expected:                                  │
│  - Can view all view modes ✓                │
│  - Can edit data ✓                          │
│  - Can see financial data ✓                 │
│  - Cannot see "Approve All" button ✗        │
│  - Cannot delete ✗                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Test Case 3.2: Developer (view only)      │
│  User:                                      │
│  { role: 'DEVELOPER', dept: 'DU3' }         │
│  Expected:                                  │
│  - Can view Total view ✓                    │
│  - Can view own dept data only ✓            │
│  - Financial data masked (***) ✓            │
│  - Cannot edit ✗                            │
│  - Cannot approve ✗                         │
└─────────────────────────────────────────────┘

TEST SUITE 4: Calculations
┌─────────────────────────────────────────────┐
│  Test Case 4.1: Position revenue calc      │
│  Input:                                     │
│  - Unit Price: 20,000,000                   │
│  - Exchange Rate: 1                         │
│  - Pipeline Ratio: 100%                     │
│  - MM: 1.5                                  │
│  Expected Result:                           │
│  - Total = 30,000,000 VND                   │
│  Formula: 20M × 1 × 1.0 × 1.5 = 30M         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Test Case 4.2: Total revenue (merged)     │
│  Input:                                     │
│  - Onsite revenue: 7,500,000,000            │
│  - Offshore revenue: 8,300,000,000          │
│  Expected Result:                           │
│  - Total = 15,800,000,000 VND               │
│  Formula: 7.5B + 8.3B = 15.8B               │
└─────────────────────────────────────────────┘
```

### 7.2 Validation Rules

**Validation rules chi tiết:**

```
VALIDATION LEVEL 1: Field-level
┌─────────────────────────────────────────────┐
│  Position Field Validation                  │
│  ├─ position: Required, non-empty           │
│  ├─ unitPrice: Required, > 0                │
│  ├─ department: Required, valid dept code   │
│  ├─ exchangeRate: Required, > 0             │
│  ├─ pipelineRatio: Required, 0-100          │
│  └─ mm: Required, > 0                       │
└─────────────────────────────────────────────┘

VALIDATION LEVEL 2: MVV-level
┌─────────────────────────────────────────────┐
│  MVV Data Validation                        │
│  ├─ At least 1 position required            │
│  ├─ Total revenue > 0                       │
│  ├─ Expenses ≤ Revenue                      │
│  ├─ All departments must exist              │
│  └─ Monthly distribution sum = total MM     │
└─────────────────────────────────────────────┘

VALIDATION LEVEL 3: Business Rules
┌─────────────────────────────────────────────┐
│  Business Logic Validation                  │
│  ├─ Net revenue should be positive          │
│  ├─ Department distribution < 100%          │
│  ├─ Pipeline ratio reasonable (<100%)       │
│  ├─ Unit prices within expected range       │
│  └─ MM effort realistic                     │
└─────────────────────────────────────────────┘
```

---

## 8. 📚 LESSONS LEARNED

### 8.1 Key Takeaways

**1. Requirements Clarification is Critical**

```
❌ TRƯỚC KHI LÀM RÕ:
"Total, OB, Onsite, Offshore"
→ Hiểu thành 4 tabs riêng biệt
→ Thiết kế sai architecture
→ Phải redesign lại

✅ SAU KHI LÀM RÕ:
"Total, OB, Onsite, Offshore"
→ 4 view modes (global filters)
→ Áp dụng cho tất cả 3 tabs
→ Architecture đúng ngay từ đầu

💡 BÀI HỌC:
- Luôn confirm lại requirements với diagrams
- Đừng assume, hãy hỏi rõ ràng
- Vẽ wireframe để visualize trước khi code
```

**2. Transaction Pattern for Critical Operations**

```
❌ SAI LẦM BAN ĐẦU:
Approval riêng từng MVV
→ Có thể inconsistent
→ Khó quản lý state
→ Khó rollback

✅ GIẢI PHÁP TỐT:
Combined approval với Promise.all()
→ All or nothing
→ Đảm bảo consistency
→ Dễ rollback

💡 BÀI HỌC:
- Dùng transaction pattern cho critical operations
- Promise.all() phù hợp cho parallel operations cần consistency
- Luôn có rollback strategy
```

**3. Global State for Cross-Component Features**

```
❌ SAI LẦM:
View mode state ở mỗi tab
→ Không sync được
→ Reset khi switch tab
→ Bad UX

✅ GIẢI PHÁP:
View mode ở parent component
→ Single source of truth
→ Pass down as props
→ Consistent across tabs

💡 BÀI HỌC:
- Global state cho features affecting multiple components
- Avoid duplication of state
- Lift state up when needed
```

**4. Permission System Should Be Granular**

```
❌ SIMPLE PERMISSION:
if (role === 'ADMIN') { ... }
→ Không flexible
→ Khó mở rộng
→ Hard-coded logic

✅ RBAC SYSTEM:
hasPermission(user, 'APPROVE_PLAN')
→ Flexible
→ Dễ mở rộng
→ Declarative

💡 BÀI HỌC:
- Use RBAC cho complex permission requirements
- Tách permission logic ra khỏi UI components
- Permission matrix dễ maintain hơn if-else chains
```

**5. Validation at Multiple Levels**

```
Validation Strategy:
├─ Level 1: Field-level (immediate feedback)
├─ Level 2: Form-level (before save)
├─ Level 3: Business rules (before submit)
└─ Level 4: Server-side (final check)

💡 BÀI HỌC:
- Multi-layer validation catches errors early
- Better UX with immediate feedback
- Server validation is mandatory (client can be bypassed)
```

### 8.2 Best Practices Applied

**✅ What Worked Well:**

1. **Separation of Concerns**
   - Data layer riêng (onsite/offshore separated)
   - View layer riêng (filtering logic)
   - Business logic riêng (calculations, validations)

2. **Component Composition**
   - Reusable components (tables, forms, buttons)
   - Permission guards
   - Filtered data passed as props

3. **Error Handling**
   - Validation errors shown immediately
   - Rollback on transaction failure
   - Clear error messages

4. **Documentation**
   - Diagrams cho architecture
   - Flowcharts cho workflows
   - Clear explanation with examples

**⚠️ What Could Be Improved:**

1. **Real-time Collaboration**
   - Chưa xử lý concurrent editing
   - Cần implement locking mechanism

2. **Offline Support**
   - Chưa có offline mode
   - Cần implement local storage backup

3. **Performance Optimization**
   - Calculation có thể optimize với memoization
   - Large dataset cần pagination

4. **Audit Trail**
   - Chi tiết hơn về history changes
   - Who changed what, when

### 8.3 Recommendations for Future

**Để triển khai Business Plan system tốt hơn:**

```
PHASE 1: Foundation (Week 1-2)
├─ Setup project structure
├─ Implement data models
├─ Create base components
└─ Setup routing

PHASE 2: Core Features (Week 3-4)
├─ Implement view modes
├─ Build 3 tabs
├─ Add calculations
└─ Basic validation

PHASE 3: Approval Workflow (Week 5)
├─ Validation logic
├─ Combined approval
├─ Rollback mechanism
└─ Status management

PHASE 4: Permissions (Week 6)
├─ RBAC implementation
├─ Permission guards
├─ Data masking
└─ UI restrictions

PHASE 5: Testing (Week 7)
├─ Unit tests
├─ Integration tests
├─ E2E tests
└─ User acceptance testing

PHASE 6: Polish & Deploy (Week 8)
├─ Performance optimization
├─ Error handling
├─ Documentation
└─ Production deployment
```

---

## 🎯 KẾT LUẬN

### Tóm tắt Investigation

**Vấn đề ban đầu:**
- Yêu cầu không rõ ràng về view modes và approval workflow
- Cần thiết kế hệ thống Business Plan cho 2 MVV

**Kết quả điều tra:**
- ✅ Làm rõ View Modes = Global filters (không phải tabs)
- ✅ Làm rõ Approval = Combined cho cả 2 MVV (transaction-based)
- ✅ Xác định data structure: Separated storage, computed aggregation
- ✅ Thiết kế permission system: RBAC với granular control

**Giải pháp thiết kế:**
- ✅ Architecture 3-layer: Presentation, Business Logic, Data
- ✅ View Mode system với filtering functions
- ✅ Combined approval với Promise.all() + rollback
- ✅ RBAC permission system với guards
- ✅ Multi-level validation

**Challenges đã giải quyết:**
- ✅ View mode filtering across tabs
- ✅ Transaction-based approval
- ✅ Granular permissions
- ✅ Data consistency
- ✅ Error handling và rollback

**Bài học quan trọng:**
1. Requirements clarification là bước quan trọng nhất
2. Transaction pattern cho critical operations
3. Global state cho cross-component features
4. RBAC tốt hơn simple role checks
5. Multi-layer validation catches errors early

---

## 📎 PHỤ LỤC

### Related Documents
- [BUSINESS_PLAN_SUMMARY.md](./BUSINESS_PLAN_SUMMARY.md) - Technical specifications
- [TIMELINE_TAB_SWITCHING_INVESTIGATION.md](./TIMELINE_TAB_SWITCHING_INVESTIGATION.md) - Similar investigation for Timeline

### Diagrams Source
Tất cả diagrams trong document này được vẽ bằng ASCII art để dễ đọc trong markdown. Có thể convert sang:
- Draw.io / Lucidchart cho presentation
- Mermaid diagrams cho documentation site
- PlantUML cho technical docs

### Glossary
- **MVV**: Mã vụ việc (Work Type Code)
- **OB**: On-Balance (Cân đối số)
- **RBAC**: Role-Based Access Control
- **MM**: Man-Month (Người-tháng effort)
- **Pipeline Ratio**: Tỷ lệ pipeline (% khả năng thành công)

---

**Document Version:** 1.0  
**Last Updated:** 04/02/2026  
**Author:** GitHub Copilot  
**Status:** ✅ Complete
