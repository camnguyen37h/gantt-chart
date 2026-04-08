# Business Plan — Permission System Redesign

> **Mục tiêu**: Thay thế cơ chế phân quyền gắn chặt vào role-string bằng hệ thống Activity Key, đảm bảo mở rộng dễ dàng, không xung đột view/save/submit, và tôn trọng bối cảnh Onsite/Offshore của từng MVV.

---

## 1. Phân tích hiện trạng

### 1.1 Hai hệ thống song song đang tồn tại

| Hệ thống | File | Nguồn dữ liệu | Dùng cho |
|---|---|---|---|
| **System A** – `checkRolePermission` | `checkRolePermission.js` + `ActivityKeyConstants.js` | `localStorage.permissions` (BE trả về) | Submit, Export, Create Version, Edit coarse-grained |
| **System B** – `PERMISSION_MATRIX` | `policyMatrix.js` + `viewPermissions.js` + `useBusinessPlanPermission.js` | **Hardcoded** `allRoles = ['DB-ADMIN']` | Column visibility, Edit per scope, summaryOnly |

> ⚠️ **System B hiện tại bị bypass hoàn toàn** — `useBusinessPlanPermission.js` line 28 hardcode `return ['DB-ADMIN']`, nghĩa là mọi user đều có full access. System A đang là gating thực tế duy nhất.

### 1.2 Các vấn đề cụ thể

#### Vấn đề 1 — Stale validation state sau khi switch MVV
Khi user chuyển từ Offshore sang Onsite MVV mà `canEditSelectedGeneral = false`, hàm `handleValidate` không emit `false` cho các financial fields → `setValidation` merge để lại `true` cũ → field highlight đỏ sai.

**Root cause**: Permission được check theo scope map với `mvvLocationType` của MVV *đang hiển thị*, nhưng validation state là global Redux — không được reset khi scope context thay đổi.

#### Vấn đề 2 — Non-selected MVV dùng stale API data
`allMvvInfosFromGI` là snapshot từ lần load đầu. Khi user chỉnh sửa Offshore rồi chuyển sang Onsite thì submit, các edit ở Offshore bị kiểm tra bằng dữ liệu cũ → có thể pass validation sai hoặc bị reject sai.

#### Vấn đề 3 — Column visibility và Edit permission bị trộn lẫn
Trong `PERMISSION_MATRIX`, policy `{ columns, edit, summaryOnly }` gộp *cái gì được thấy* với *có được sửa không*. Hai concern này độc lập nhau nhưng bị forced vào cùng object, gây khó maintain.

#### Vấn đề 4 — SCOPE bị overload ngữ nghĩa
`SCOPE.GENERAL_ONSITE` vừa có nghĩa là "tab General Information của mã Onsite", vừa kiêm "có được edit financial fields không", vừa kiêm "column nào visible". Thêm một loại quyền mới (ví dụ: có view nhưng không view số tiền) đòi hỏi sửa toàn bộ `PERMISSION_MATRIX`.

#### Vấn đề 5 — Role mới = copy-paste một block lớn
Thêm role `DB-DUL-OB-SALE` phải viết đầy đủ tất cả scope từ đầu. Không có khái niệm "kế thừa từ role khác" hay "tổ hợp từ các activity nhỏ hơn".

#### Vấn đề 6 — Submit permission dùng cả hai hệ thống không nhất quán
`canSubmit` trong System B check `SCOPE.SUBMIT` trong matrix. `isSubmit` trong `BusinessPlanVersion` check `ActivityKeyConstants.SUBMIT_BUSINESS_PLAN` (System A). Cả hai chạy song song không có single source of truth.

#### Vấn đề 7 — Draft save không tôn trọng permission
`handleValidateDraft` không đọc `useBusinessPlanPermission` — nó luôn validate financial fields cho mọi user, kể cả user không có quyền edit.

#### Vấn đề 8 — BP chỉ có 1 phía (chỉ Onsite hoặc chỉ Offshore)
Khi `mvvLocationTypeIdMap` chỉ có `Onsite`, role `DUL_OFFSHORE` vẫn tồn tại trong matrix nhưng không có MVV để áp dụng. Hiện tại không có cơ chế tường minh để nói "scope này không applicable cho BP này".

---

## 2. Thiết kế mới — Activity-Key Permission

### 2.1 Triết lý cốt lõi

```
Role  →  [Activity Keys]  →  Policy per Activity
```

- **Activity Key** = một hành động/quyền cụ thể, atomic, có tên ngữ nghĩa rõ ràng
- **Role** chỉ là tập hợp Activity Keys — không chứa logic policy
- **Policy** gắn với Activity (column visibility, edit flag) — không gắn với role
- **MVV context** (Onsite/Offshore) là tham số runtime, không bake-in vào key tên

### 2.2 Taxonomy Activity Keys cho Business Plan

#### Nhóm A — View Detail Page
| Activity Key | Mô tả |
|---|---|
| `BP_VIEW_DETAIL` | Vào được trang Detail của một Business Plan |
| `BP_VIEW_TOTAL_TAB` | Xem tab Total/OB consolidated |
| `BP_VIEW_TOTAL_COL_DU_ONSITE` | Thấy cột DU Onsite trong Total view |
| `BP_VIEW_TOTAL_COL_DU_OFFSHORE` | Thấy cột DU Offshore trong Total view |
| `BP_VIEW_TOTAL_SECTION_MARGIN_OFFSHORE` | Thấy section Margin của Offshore trong Total |

#### Nhóm B — General Information
| Activity Key | Scope MVV | Mô tả |
|---|---|---|
| `BP_VIEW_GENERAL` | `*` | Xem tab General Information |
| `BP_VIEW_GENERAL_FINANCIAL` | `*` | Xem các trường tài chính (Currency, Exchange Rate, Fees) |
| `BP_EDIT_GENERAL_FINANCIAL` | Onsite / Offshore | Sửa được các trường tài chính |
| `BP_EDIT_GENERAL_KPI` | Onsite / Offshore | Sửa % KPI Bonus (PM/QA/Member) |
| `BP_EDIT_COLLABORATORS` | `*` | Sửa được danh sách AM/PM/TeamLead/Preparator |

> **Lý do tách `FINANCIAL` và `KPI` và `COLLABORATORS`**: Hiện tại BUL_ONSITE có thể view General nhưng không edit gì; SALE_ONSITE có thể edit financial nhưng role DB-BOM thì chỉ view. Tách nhỏ giúp kết hợp linh hoạt.

#### Nhóm C — Revenue Tab
| Activity Key | Scope MVV | Mô tả |
|---|---|---|
| `BP_VIEW_REVENUE` | Onsite / Offshore | Xem tab Revenue |
| `BP_VIEW_REVENUE_SUMMARY_ONLY` | Offshore | Chỉ xem dòng summary của Revenue Offshore (không thấy breakdown) |
| `BP_EDIT_REVENUE` | Onsite / Offshore | Sửa dữ liệu Revenue |

#### Nhóm D — Delivery Plan Tab
| Activity Key | Scope MVV | Mô tả |
|---|---|---|
| `BP_VIEW_DELIVERY` | Onsite / Offshore | Xem tab Delivery Plan |
| `BP_EDIT_DELIVERY` | Onsite / Offshore | Sửa dữ liệu Delivery Plan |

#### Nhóm E — Business Plan Tab (cost model)
| Activity Key | Scope MVV | Mô tả |
|---|---|---|
| `BP_VIEW_PLAN` | Onsite / Offshore | Xem tab Business Plan |
| `BP_VIEW_PLAN_INTERNAL_COL` | `*` | Thấy cột Internal trong Business Plan |
| `BP_EDIT_PLAN` | Onsite / Offshore | Sửa cells trong Business Plan tab |
| `BP_EDIT_PLAN_ALL` | `*` | Sửa kể cả cột Internal (Finance role) |

#### Nhóm F — Actions
| Activity Key | Mô tả |
|---|---|
| `BP_SAVE_DRAFT` | Lưu nháp |
| `BP_SUBMIT` | Submit cho approval |
| `BP_CREATE_VERSION` | Tạo version mới |
| `BP_EXPORT` | Export file |

> **Lưu ý**: Các key thuộc Nhóm F đã tồn tại trong `ActivityKeyConstants.js` (System A). Chỉ cần giữ nguyên và bridge vào hệ thống mới.

### 2.3 MVV Context — Quy tắc áp dụng

Mỗi activity nhóm B/C/D/E cần biết "đang áp dụng cho MVV Onsite hay Offshore?". Thay vì bake-in vào key tên (như `SCOPE.GENERAL_ONSITE`), context được truyền vào lúc check:

```js
// Cách dùng mới
const perms = useBusinessPlanPermission()

// Ví dụ: user đang xem MVV có locationType = 'Offshore'
const canView = perms.can('BP_VIEW_REVENUE', { locationType: 'Offshore' })
const canEdit = perms.can('BP_EDIT_REVENUE', { locationType: 'Offshore' })
```

Và trong activity policy:
```js
BP_EDIT_REVENUE: {
  Onsite: true,    // user có activity này → có thể edit Onsite
  Offshore: true,  // user có activity này → có thể edit Offshore
}
```

Với các role chỉ edit được một phía, activity key sẽ khác nhau:
```js
// SALE_ONSITE chỉ có BP_EDIT_REVENUE_ONSITE, không có BP_EDIT_REVENUE_OFFSHORE
```

→ **Thực ra cách đơn giản nhất**: giữ suffix `_ONSITE` / `_OFFSHORE` trong key tên cho các nhóm B/C/D/E, nhưng lúc check trong component thì tự động resolve theo `locationType` của MVV hiện tại:

```js
// Trong useBusinessPlanPermission hook
can(baseActivity, locationType) {
  if (locationType) {
    const scoped = `${baseActivity}_${locationType.toUpperCase()}` // BP_EDIT_REVENUE_OFFSHORE
    if (userActivityKeys.includes(scoped)) return true
    // Fallback: activity không phân biệt side
    return userActivityKeys.includes(baseActivity)
  }
  return userActivityKeys.includes(baseActivity)
}
```

**Kết quả**: Component không cần biết cụ thể key nào, chỉ cần gọi `can('BP_EDIT_REVENUE', mvvLocationType)`.

### 2.4 Mapping Role → Activity Keys

Đây là bảng full mapping. Ký hiệu: ✅ = có activity này | ✅(S) = summaryOnly | — = không có

| Activity | DB_ADMIN | DB_BOM | DB_FCL | DB_FC | SALE_ONSITE | SALE_OFFSHORE | BUL_ONSITE | BUL_OFFSHORE | DUL_ONSITE | DUL_OFFSHORE | G_LEAD_OB | G_LEAD_ONSITE | G_LEAD_OFFSHORE |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **VIEW TAB** | | | | | | | | | | | | | |
| `BP_VIEW_DETAIL` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `BP_VIEW_TOTAL_TAB` | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | ✅ | — | ✅ | ✅ | — |
| `BP_VIEW_TOTAL_COL_DU_ONSITE` | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| `BP_VIEW_TOTAL_COL_DU_OFFSHORE` | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| `BP_VIEW_TOTAL_SECTION_MARGIN_OFFSHORE` | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| **GENERAL INFO** | | | | | | | | | | | | | |
| `BP_VIEW_GENERAL` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `BP_VIEW_GENERAL_FINANCIAL` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `BP_EDIT_GENERAL_FINANCIAL_ONSITE` | ✅ | — | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | — |
| `BP_EDIT_GENERAL_FINANCIAL_OFFSHORE` | ✅ | — | ✅ | ✅ | — | ✅ | — | — | — | ✅ | — | — | — |
| `BP_EDIT_GENERAL_KPI_ONSITE` | ✅ | — | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | — |
| `BP_EDIT_GENERAL_KPI_OFFSHORE` | ✅ | — | ✅ | ✅ | — | ✅ | — | — | — | ✅ | — | — | — |
| `BP_EDIT_COLLABORATORS` | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | — | — | — |
| **REVENUE** | | | | | | | | | | | | | |
| `BP_VIEW_REVENUE_ONSITE` | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | ✅ | — | ✅ | ✅ | — |
| `BP_VIEW_REVENUE_OFFSHORE` | ✅ | ✅ | ✅ | ✅ | ✅(S) | ✅ | — | ✅(S) | — | ✅ | ✅(S) | ✅(S) | ✅ |
| `BP_EDIT_REVENUE_ONSITE` | ✅ | — | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | — |
| `BP_EDIT_REVENUE_OFFSHORE` | ✅ | — | ✅ | ✅ | — | ✅ | — | — | — | ✅ | — | — | — |
| **DELIVERY** | | | | | | | | | | | | | |
| `BP_VIEW_DELIVERY_ONSITE` | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | ✅ | — | ✅ | ✅ | — |
| `BP_VIEW_DELIVERY_OFFSHORE` | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | — | — | ✅ | — | — | ✅ |
| `BP_EDIT_DELIVERY_ONSITE` | ✅ | — | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | — |
| `BP_EDIT_DELIVERY_OFFSHORE` | ✅ | — | ✅ | ✅ | — | ✅ | — | — | — | ✅ | — | — | — |
| **BUSINESS PLAN TAB** | | | | | | | | | | | | | |
| `BP_VIEW_PLAN_ONSITE` | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | ✅ | — | ✅ | ✅ | — |
| `BP_VIEW_PLAN_OFFSHORE` | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | — | — | ✅ | — | — | ✅ |
| `BP_VIEW_PLAN_INTERNAL_COL` | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| `BP_EDIT_PLAN_ONSITE` | ✅ | — | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | — |
| `BP_EDIT_PLAN_OFFSHORE` | ✅ | — | ✅ | ✅ | — | ✅ | — | — | — | ✅ | — | — | — |
| `BP_EDIT_PLAN_ALL` | ✅ | — | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| **ACTIONS** | | | | | | | | | | | | | |
| `BP_SAVE_DRAFT` | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | — | — | — |
| `BP_SUBMIT` | ✅ | — | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — |
| `BP_CREATE_VERSION` | ✅ | — | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — |
| `BP_EXPORT` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> **Ghi chú SALE_ONSITE**: được xem Revenue Offshore nhưng `summaryOnly: true` — thấy dòng tổng nhưng không thấy breakdown từng BU/DU.

> **Ghi chú G_LEAD_OB_SALE**: Nhóm G_LEAD thường là view-only (không edit). Cần confirm lại với nghiệp vụ.

---

## 3. Thiết kế kỹ thuật

### 3.1 File `activityPolicy.js` (mới, thay thế `policyMatrix.js`)

```js
// src/lib/business-plan/permissions/activityPolicy.js

export const BP_ACTIVITY = {
  // View
  VIEW_DETAIL:                    'BP_VIEW_DETAIL',
  VIEW_TOTAL_TAB:                 'BP_VIEW_TOTAL_TAB',
  VIEW_TOTAL_COL_DU_ONSITE:       'BP_VIEW_TOTAL_COL_DU_ONSITE',
  VIEW_TOTAL_COL_DU_OFFSHORE:     'BP_VIEW_TOTAL_COL_DU_OFFSHORE',
  VIEW_TOTAL_MARGIN_OFFSHORE:     'BP_VIEW_TOTAL_SECTION_MARGIN_OFFSHORE',
  VIEW_GENERAL:                   'BP_VIEW_GENERAL',
  VIEW_GENERAL_FINANCIAL:         'BP_VIEW_GENERAL_FINANCIAL',
  EDIT_GENERAL_FINANCIAL_ONSITE:  'BP_EDIT_GENERAL_FINANCIAL_ONSITE',
  EDIT_GENERAL_FINANCIAL_OFFSHORE:'BP_EDIT_GENERAL_FINANCIAL_OFFSHORE',
  EDIT_GENERAL_KPI_ONSITE:        'BP_EDIT_GENERAL_KPI_ONSITE',
  EDIT_GENERAL_KPI_OFFSHORE:      'BP_EDIT_GENERAL_KPI_OFFSHORE',
  EDIT_COLLABORATORS:             'BP_EDIT_COLLABORATORS',
  VIEW_REVENUE_ONSITE:            'BP_VIEW_REVENUE_ONSITE',
  VIEW_REVENUE_OFFSHORE:          'BP_VIEW_REVENUE_OFFSHORE',
  VIEW_REVENUE_OFFSHORE_SUMMARY:  'BP_VIEW_REVENUE_OFFSHORE_SUMMARY',
  EDIT_REVENUE_ONSITE:            'BP_EDIT_REVENUE_ONSITE',
  EDIT_REVENUE_OFFSHORE:          'BP_EDIT_REVENUE_OFFSHORE',
  VIEW_DELIVERY_ONSITE:           'BP_VIEW_DELIVERY_ONSITE',
  VIEW_DELIVERY_OFFSHORE:         'BP_VIEW_DELIVERY_OFFSHORE',
  EDIT_DELIVERY_ONSITE:           'BP_EDIT_DELIVERY_ONSITE',
  EDIT_DELIVERY_OFFSHORE:         'BP_EDIT_DELIVERY_OFFSHORE',
  VIEW_PLAN_ONSITE:               'BP_VIEW_PLAN_ONSITE',
  VIEW_PLAN_OFFSHORE:             'BP_VIEW_PLAN_OFFSHORE',
  VIEW_PLAN_INTERNAL_COL:         'BP_VIEW_PLAN_INTERNAL_COL',
  EDIT_PLAN_ONSITE:               'BP_EDIT_PLAN_ONSITE',
  EDIT_PLAN_OFFSHORE:             'BP_EDIT_PLAN_OFFSHORE',
  EDIT_PLAN_ALL:                  'BP_EDIT_PLAN_ALL',
  // Actions
  SAVE_DRAFT:                     'BP_SAVE_DRAFT',
  SUBMIT:                         'BP_SUBMIT',
  CREATE_VERSION:                 'BP_CREATE_VERSION',
  EXPORT:                         'BP_EXPORT',
}

// Role → Activity Key mapping
// Đây là fallback/default khi backend không trả về roleActivities
// Production: backend inject trực tiếp vào localStorage.permissions
export const ROLE_ACTIVITIES = {
  'DB-ADMIN': Object.values(BP_ACTIVITY),

  'DB-BOM': [
    BP_ACTIVITY.VIEW_DETAIL, BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_TOTAL_COL_DU_ONSITE, BP_ACTIVITY.VIEW_TOTAL_COL_DU_OFFSHORE,
    BP_ACTIVITY.VIEW_TOTAL_MARGIN_OFFSHORE,
    BP_ACTIVITY.VIEW_GENERAL, BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE, BP_ACTIVITY.VIEW_REVENUE_OFFSHORE,
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE, BP_ACTIVITY.VIEW_DELIVERY_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE, BP_ACTIVITY.VIEW_PLAN_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_INTERNAL_COL,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-FCL': [
    .../* tương tự DB-FC, thêm BP_SUBMIT */
  ],

  'DB-FC': [
    BP_ACTIVITY.VIEW_DETAIL, BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_TOTAL_COL_DU_ONSITE, BP_ACTIVITY.VIEW_TOTAL_COL_DU_OFFSHORE,
    BP_ACTIVITY.VIEW_TOTAL_MARGIN_OFFSHORE,
    BP_ACTIVITY.VIEW_GENERAL, BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_ONSITE, BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_OFFSHORE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_ONSITE, BP_ACTIVITY.EDIT_GENERAL_KPI_OFFSHORE,
    BP_ACTIVITY.EDIT_COLLABORATORS,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE, BP_ACTIVITY.VIEW_REVENUE_OFFSHORE,
    BP_ACTIVITY.EDIT_REVENUE_ONSITE, BP_ACTIVITY.EDIT_REVENUE_OFFSHORE,
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE, BP_ACTIVITY.VIEW_DELIVERY_OFFSHORE,
    BP_ACTIVITY.EDIT_DELIVERY_ONSITE, BP_ACTIVITY.EDIT_DELIVERY_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE, BP_ACTIVITY.VIEW_PLAN_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_INTERNAL_COL,
    BP_ACTIVITY.EDIT_PLAN_ONSITE, BP_ACTIVITY.EDIT_PLAN_OFFSHORE,
    BP_ACTIVITY.EDIT_PLAN_ALL,
    BP_ACTIVITY.SAVE_DRAFT, BP_ACTIVITY.SUBMIT, BP_ACTIVITY.CREATE_VERSION,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-Sale-Onsite': [
    BP_ACTIVITY.VIEW_DETAIL, BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_GENERAL, BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_ONSITE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_ONSITE,
    BP_ACTIVITY.EDIT_COLLABORATORS,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE_SUMMARY, // summary only
    BP_ACTIVITY.EDIT_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE,
    BP_ACTIVITY.EDIT_DELIVERY_ONSITE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE,
    BP_ACTIVITY.EDIT_PLAN_ONSITE,
    BP_ACTIVITY.SAVE_DRAFT, BP_ACTIVITY.SUBMIT, BP_ACTIVITY.CREATE_VERSION,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-Sale-Offshore': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_GENERAL, BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_OFFSHORE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_OFFSHORE,
    BP_ACTIVITY.EDIT_COLLABORATORS,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE,
    BP_ACTIVITY.EDIT_REVENUE_OFFSHORE,
    BP_ACTIVITY.VIEW_DELIVERY_OFFSHORE,
    BP_ACTIVITY.EDIT_DELIVERY_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_OFFSHORE,
    BP_ACTIVITY.EDIT_PLAN_OFFSHORE,
    BP_ACTIVITY.SAVE_DRAFT,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-DUL-Onsite': [
    BP_ACTIVITY.VIEW_DETAIL, BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_GENERAL, BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_ONSITE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_ONSITE,
    BP_ACTIVITY.EDIT_COLLABORATORS,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE,
    BP_ACTIVITY.EDIT_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE,
    BP_ACTIVITY.EDIT_DELIVERY_ONSITE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE,
    BP_ACTIVITY.EDIT_PLAN_ONSITE,
    BP_ACTIVITY.SAVE_DRAFT,
    BP_ACTIVITY.EXPORT,
  ],

  // ... các role còn lại tương tự
}
```

### 3.2 Hook `useBusinessPlanPermission` mới

```js
// src/lib/business-plan/hooks/useBusinessPlanPermission.js (refactored)

import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ROLE_ACTIVITIES } from '../permissions/activityPolicy'

const getUserActivityKeys = (userRoles) => {
  // Ưu tiên 1: backend inject trực tiếp BP activity keys vào permissions
  try {
    const permissions = JSON.parse(localStorage.getItem('permissions')) || []
    const bpSource = permissions.find(p => p.key === 'BUSINESS_PLAN_DETAIL')
    if (bpSource && bpSource.activities) {
      const keys = bpSource.activities.map(a => a.name).filter(n => n.startsWith('BP_'))
      if (keys.length > 0) return new Set(keys)
    }
  } catch (_) {}

  // Fallback: resolve từ roles qua ROLE_ACTIVITIES map
  const keys = new Set()
  for (const role of userRoles) {
    const activities = ROLE_ACTIVITIES[role] || []
    activities.forEach(k => keys.add(k))
  }
  return keys
}

const useBusinessPlanPermission = () => {
  const { userRoles } = useSelector(s => s.businessGeneralInformation)

  const activityKeys = useMemo(
    () => getUserActivityKeys(Array.isArray(userRoles) ? userRoles : []),
    [userRoles]
  )

  return useMemo(() => ({
    /**
     * @param {string} activity - BP_ACTIVITY constant
     * @param {string} [locationType] - 'Onsite' | 'Offshore' (optional, for scoped activities)
     */
    can(activity, locationType) {
      if (locationType) {
        // Check scoped variant first: BP_EDIT_REVENUE_ONSITE
        const scoped = `${activity}_${locationType.toUpperCase()}`
        if (activityKeys.has(scoped)) return true
      }
      // Check base activity (covers non-scoped like BP_EXPORT)
      return activityKeys.has(activity)
    },

    /**
     * Check revenue summary-only: user có BP_VIEW_REVENUE_OFFSHORE_SUMMARY
     * nhưng không có BP_VIEW_REVENUE_OFFSHORE → summaryOnly mode
     */
    isRevenueSummaryOnly(locationType) {
      if (locationType !== 'Offshore') return false
      return (
        activityKeys.has('BP_VIEW_REVENUE_OFFSHORE_SUMMARY') &&
        !activityKeys.has('BP_VIEW_REVENUE_OFFSHORE')
      )
    },

    activityKeys, // expose for debugging
  }), [activityKeys])
}

export default useBusinessPlanPermission
```

### 3.3 Cách dùng trong component

**Trước đây (scope-based):**
```jsx
// Mỗi component phải biết scope string cứng
const generalScope = mvvLocationType === 'Offshore'
  ? SCOPE.GENERAL_OFFSHORE
  : SCOPE.GENERAL_ONSITE
const generalPerms = useBusinessPlanPermission(generalScope)
const canEditGeneral = generalPerms.canEditScope
```

**Sau (activity-based):**
```jsx
// Hook không cần scope, context truyền vào lúc check
const perms = useBusinessPlanPermission()
const canViewGeneral = perms.can(BP_ACTIVITY.VIEW_GENERAL)
const canEditFinancial = perms.can(BP_ACTIVITY.EDIT_GENERAL_FINANCIAL, mvvLocationType)
const canEditKpi = perms.can(BP_ACTIVITY.EDIT_GENERAL_KPI, mvvLocationType)
const canEditCollaborators = perms.can(BP_ACTIVITY.EDIT_COLLABORATORS)
```

**Revenue với summaryOnly:**
```jsx
const perms = useBusinessPlanPermission()
const canViewRevenue = perms.can(BP_ACTIVITY.VIEW_REVENUE, viewMode) ||
                       perms.isRevenueSummaryOnly(viewMode)
const isSummaryOnly = perms.isRevenueSummaryOnly(viewMode)
```

### 3.4 Validation trong `handleValidate` (fix đầy đủ)

```js
// Thay vì dùng onsiteGeneralPerms / offshoreGeneralPerms riêng:
const perms = useBusinessPlanPermission()

// Selected MVV
const canEditFinancial = perms.can(BP_ACTIVITY.EDIT_GENERAL_FINANCIAL, selectedMvvLocationType)
const canEditKpi = perms.can(BP_ACTIVITY.EDIT_GENERAL_KPI, selectedMvvLocationType)

const generalInformationResult = {
  industryCurrency:        canEditFinancial ? !industryCurrency : false,
  exchangeRate:            canEditFinancial ? isEmptyCheck(exchangeRate) : false,
  softwareDevelopmentFee:  canEditFinancial ? isEmptyCheck(softwareDevelopmentFee) : false,
  otherFees:               canEditFinancial ? isEmptyCheck(otherFees) : false,
  industryDomain:          canEditFinancial ? !industryDomain : false,
  // KPI tách riêng vì quyền độc lập
  ...handleValidateKpiBonus(canEditKpi ? businessPlanKpiDTO : null),
  // Collaborators: luôn validate vì mọi editor đều phải nhập
  listAM: listAM.length < 1 || !handleCheckAtLeastOneFilled(listAM),
  listTeamLead: ...,
  listPreparator: ...,
  listPM: ...,
}

// All MVVs forEach
allMvvInfos.forEach(info => {
  const canEditFin = perms.can(BP_ACTIVITY.EDIT_GENERAL_FINANCIAL, info.mvvLocationType)
  const canEditKpiThis = perms.can(BP_ACTIVITY.EDIT_GENERAL_KPI, info.mvvLocationType)
  const canEditCollab = perms.can(BP_ACTIVITY.EDIT_COLLABORATORS)

  const isFinancialInvalid = canEditFin && (!info.currency || ...)
  const isKpiInvalid = canEditKpiThis && Object.values(handleValidateKpiBonus(info.businessPlanKpiDTO)).some(Boolean)
  const isCollabInvalid = canEditCollab && (listAM.length < 1 || ...)

  if (isFinancialInvalid || isCollabInvalid) { invalidGeneralMvvCodes.push(...); return }
  if (isKpiInvalid) { invalidKpiBonusMvvCodes.push(...); return }
  if (!canEditKpiThis) return
  if (!validateTotalKpiBonus(...)) { invalidKpiTotalMvvCodes.push(...) }
})
```

---

## 4. Xử lý case BP chỉ có một phía

Khi BP chỉ có Onsite (không có Offshore MVV), các activity `*_OFFSHORE` vẫn có thể tồn tại trong user's activity set — nhưng không có MVV Offshore nào để render nên chúng tự nhiên không được invoke.

**Cơ chế bảo vệ thêm** ở component level:

```jsx
// BusinessPlanDetail/index.jsx
const availableModes = useMemo(() => {
  const modes = []
  if (mvvLocationTypeIdMap['Onsite']) modes.push('Onsite')
  if (mvvLocationTypeIdMap['Offshore']) modes.push('Offshore')
  return modes
}, [mvvLocationTypeIdMap])

// Tab chỉ render nếu mode available VÀ user có quyền view
const tabs = availableModes.filter(mode =>
  perms.can(BP_ACTIVITY.VIEW_PLAN, mode) ||
  perms.can(BP_ACTIVITY.VIEW_REVENUE, mode) ||
  perms.can(BP_ACTIVITY.VIEW_DELIVERY, mode)
)
```

**Quy tắc**: Nếu `availableModes` không có `'Offshore'`, không bao giờ render tab Offshore dù user có bao nhiêu `*_OFFSHORE` activities. Permission chỉ bảo vệ thêm, không override business data.

---

## 5. Plan migrate từng bước

### Phase 1 — Foundation (không breaking change)
1. Tạo `activityPolicy.js` với `BP_ACTIVITY` constants và `ROLE_ACTIVITIES` map
2. Refactor `useBusinessPlanPermission` để expose `can(activity, locationType)` API bên cạnh API cũ
3. Giữ nguyên `PERMISSION_MATRIX` + toàn bộ scope-based logic — chạy song song

### Phase 2 — Migrate General Information
4. Thay `onsiteGeneralPerms.canEditScope` / `offshoreGeneralPerms.canEditScope` → `perms.can(BP_ACTIVITY.EDIT_GENERAL_FINANCIAL, locationType)`
5. Fix `handleValidate` và `handleValidateDraft` dùng activity-based check
6. Remove `onsiteGeneralPerms`, `offshoreGeneralPerms` khỏi `useBusinessPlanDetails`

### Phase 3 — Migrate Revenue + Delivery
7. Thay `revenueScope`, `deliveryScope` → `perms.can(BP_ACTIVITY.VIEW_REVENUE, viewMode)`
8. Handle `summaryOnly` bằng `perms.isRevenueSummaryOnly(viewMode)`

### Phase 4 — Migrate Business Plan Tab + Total View
9. Column visibility trong Total view dùng `perms.can(BP_ACTIVITY.VIEW_TOTAL_COL_DU_ONSITE)`
10. Edit permission dùng `perms.can(BP_ACTIVITY.EDIT_PLAN, viewMode)` và `BP_EDIT_PLAN_ALL`

### Phase 5 — Kết nối với backend (Production)
11. Backend inject BP activity keys trực tiếp vào `permissions` array trong `localStorage`
12. `getUserActivityKeys` tự động đọc từ đây — `ROLE_ACTIVITIES` map chỉ còn là fallback/dev mode
13. Xóa `PERMISSION_MATRIX`, `SCOPE`, `COL_CAT` (deprecated)
14. Uncomment và cập nhật `getSystemRoles` logic

### Phase 6 — Cleanup
15. Remove `canViewColumn`/`canViewSection` từ `viewPermissions.js` nếu không còn dùng trực tiếp
16. Audit toàn bộ `checkRolePermission(SourceConstants.BUSINESS_PLAN_DETAIL, ...)` — merge vào `perms.can(...)` nếu tiện

---

## 6. Các điểm cần xác nhận với nghiệp vụ

| # | Câu hỏi | Ảnh hưởng đến |
|---|---|---|
| 1 | `SALE_ONSITE` có được submit BP chỉ Offshore (không có mã Onsite) không? | `BP_SUBMIT` scope |
| 2 | `DUL_ONSITE` có được lưu draft không, hay chỉ edit? | `BP_SAVE_DRAFT` |
| 3 | `G_LEAD_OB_SALE` khác `G_LEAD_ONSITE` ở điểm nào ngoài column OB? | Total tab cols |
| 4 | `DB_SPECIAL_VIEW_*` roles — đây là add-on hay standalone? User có thể có `SALE_ONSITE` + `SPECIAL_VIEW_DU_OFFSHORE`? | merging activities |
| 5 | `BP_EDIT_COLLABORATORS` (AM/PM/TeamLead) — `SALE_OFFSHORE` có được sửa collaborator chung với `SALE_ONSITE` không? | Validation blocking |
| 6 | Khi BP có cả Onsite lẫn Offshore, `DB-BOM` (view-only) có thấy tab Offshore không nếu không có key `BP_VIEW_PLAN_OFFSHORE`? | Offshore tab visibility |

---

## 7. Tóm tắt lợi ích

| Vấn đề hiện tại | Giải pháp |
|---|---|
| Role mới = copy-paste block lớn | Role mới = liệt kê activity keys |
| Stale validation state | `handleValidate` chỉ emit field-level true/false dựa trên activity, không bao giờ bỏ sót key |
| Non-selected MVV dùng data cũ | Overlay `ratesByLocationType` đã làm, giữ nguyên — không liên quan permission |
| Submit và Draft không nhất quán | Cả hai đều check `perms.can(BP_ACTIVITY.SAVE_DRAFT)` / `BP_SUBMIT` |
| Column visibility + edit bị trộn | Tách thành `VIEW_*` và `EDIT_*` activities riêng biệt |
| Hai hệ thống song song | Merge vào một hook duy nhất `useBusinessPlanPermission` |
| Hardcoded `DB-ADMIN` | `getUserActivityKeys` đọc từ `localStorage.permissions` (BE) hoặc `ROLE_ACTIVITIES` (fallback) |
