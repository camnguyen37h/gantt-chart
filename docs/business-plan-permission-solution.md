# Business Plan — Permission System: Solution Tổng Hợp

> **Mục tiêu**: Migrate từ role-string hardcoded sang Activity-Key system, xử lý đúng trường hợp user được assign làm AM/Preparator trong BP.

---

## 1. Vấn đề cốt lõi cần giải quyết

### 1.1 Hai hệ thống song song hiện tại (cần hợp nhất)

| Hệ thống | File | Vấn đề |
|---|---|---|
| **System A** – `checkRolePermission` | `checkRolePermission.js` | Đọc `localStorage.permissions`, chỉ dùng cho Submit/Export/CreateVersion |
| **System B** – `PERMISSION_MATRIX` | `policyMatrix.js` + `useBusinessPlanPermission.js` | Hardcode `return ['DB-ADMIN']` → mọi user đều full access |

### 1.2 Vấn đề mới: Collaborator-based Permission

User được assign vào BP với vai trò **AM** hoặc **Preparator** phải có quyền tương đương SALE hoặc DUL tương ứng — nhưng hệ thống hiện tại không có cơ chế map `memberType` → activity keys.

**Ví dụ cụ thể:**
- User `ttlam1` có system role `DB-DUL-Onsite`
- Nhưng trong BP này, `ttlam1` được assign vào `listAM` của MVV Onsite
- → `ttlam1` phải có thêm quyền của `DB-Sale-Onsite` trong BP này

---

## 2. Kiến trúc Solution: 3 Tầng

```
Tầng 1 (Production)   →  Backend trả về userRoles đã resolve đầy đủ
         ↓ fallback
Tầng 2 (Dev/Fallback) →  Frontend resolve từ userRoles qua ROLE_ACTIVITIES map
         ↓ augment
Tầng 3 (Collaborator) →  Frontend tự detect user trong listAM/listPreparator
                          và thêm derived role vào effective role set
```

---

## 3. Tầng 1 — Backend Resolve (Recommended)

### Cơ chế

Khi user gọi `GET /business-plan/{id}/user-role`, backend:
1. Lấy system roles của user từ IAM/AD
2. Kiểm tra user có trong `listAM`, `listPM`, `listPreparator`, `listTeamLead` của BP này không
3. Merge tất cả → trả về `userRoles` đã bao gồm cả derived roles

**API Response (ví dụ):**
```json
{
  "userRoles": ["DB-DUL-Onsite", "DB-Sale-Onsite"]
}
```

Frontend chỉ cần tiêu thụ `userRoles` bình thường, **không cần biết** user có phải AM hay không.

### Ưu điểm
- Permission logic tập trung ở server → audit dễ hơn
- Frontend không cần phụ thuộc vào dữ liệu collaborator để tính quyền
- Bảo mật hơn (không thể giả mạo bằng cách sửa localStorage)

### Điều kiện cần
- Backend cần implement logic merge roles trước khi trả về
- Cần confirm với team Backend về timeline

---

## 4. Tầng 2 — Frontend ROLE_ACTIVITIES Map

### File mới: `activityPolicy.js`

```js
// src/lib/business-plan/permissions/activityPolicy.js

export const BP_ACTIVITY = {
  // View
  VIEW_DETAIL:                     'BP_VIEW_DETAIL',
  VIEW_TOTAL_TAB:                  'BP_VIEW_TOTAL_TAB',
  VIEW_TOTAL_COL_DU_ONSITE:        'BP_VIEW_TOTAL_COL_DU_ONSITE',
  VIEW_TOTAL_COL_DU_OFFSHORE:      'BP_VIEW_TOTAL_COL_DU_OFFSHORE',
  VIEW_TOTAL_MARGIN_OFFSHORE:      'BP_VIEW_TOTAL_SECTION_MARGIN_OFFSHORE',
  VIEW_GENERAL:                    'BP_VIEW_GENERAL',
  VIEW_GENERAL_FINANCIAL:          'BP_VIEW_GENERAL_FINANCIAL',
  // General - Edit
  EDIT_GENERAL_FINANCIAL_ONSITE:   'BP_EDIT_GENERAL_FINANCIAL_ONSITE',
  EDIT_GENERAL_FINANCIAL_OFFSHORE: 'BP_EDIT_GENERAL_FINANCIAL_OFFSHORE',
  EDIT_GENERAL_KPI_ONSITE:         'BP_EDIT_GENERAL_KPI_ONSITE',
  EDIT_GENERAL_KPI_OFFSHORE:       'BP_EDIT_GENERAL_KPI_OFFSHORE',
  EDIT_COLLABORATORS:              'BP_EDIT_COLLABORATORS',
  // Revenue
  VIEW_REVENUE_ONSITE:             'BP_VIEW_REVENUE_ONSITE',
  VIEW_REVENUE_OFFSHORE:           'BP_VIEW_REVENUE_OFFSHORE',
  EDIT_REVENUE_ONSITE:             'BP_EDIT_REVENUE_ONSITE',
  EDIT_REVENUE_OFFSHORE:           'BP_EDIT_REVENUE_OFFSHORE',
  // Delivery
  VIEW_DELIVERY_ONSITE:            'BP_VIEW_DELIVERY_ONSITE',
  VIEW_DELIVERY_OFFSHORE:          'BP_VIEW_DELIVERY_OFFSHORE',
  EDIT_DELIVERY_ONSITE:            'BP_EDIT_DELIVERY_ONSITE',
  EDIT_DELIVERY_OFFSHORE:          'BP_EDIT_DELIVERY_OFFSHORE',
  // Business Plan Tab
  VIEW_PLAN_ONSITE:                'BP_VIEW_PLAN_ONSITE',
  VIEW_PLAN_OFFSHORE:              'BP_VIEW_PLAN_OFFSHORE',
  VIEW_PLAN_INTERNAL_COL:          'BP_VIEW_PLAN_INTERNAL_COL',
  EDIT_PLAN_ONSITE:                'BP_EDIT_PLAN_ONSITE',
  EDIT_PLAN_OFFSHORE:              'BP_EDIT_PLAN_OFFSHORE',
  EDIT_PLAN_ALL:                   'BP_EDIT_PLAN_ALL',
  // Actions
  SAVE_DRAFT:                      'BP_SAVE_DRAFT',
  SUBMIT:                          'BP_SUBMIT',
  CREATE_VERSION:                  'BP_CREATE_VERSION',
  EXPORT:                          'BP_EXPORT',
}

export const ROLE_ACTIVITIES = {
  'DB-ADMIN': Object.values(BP_ACTIVITY),

  'DB-BOM': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_TOTAL_COL_DU_ONSITE,
    BP_ACTIVITY.VIEW_TOTAL_COL_DU_OFFSHORE,
    BP_ACTIVITY.VIEW_TOTAL_MARGIN_OFFSHORE,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE,
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE,
    BP_ACTIVITY.VIEW_DELIVERY_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE,
    BP_ACTIVITY.VIEW_PLAN_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_INTERNAL_COL,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-FCL': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_TOTAL_COL_DU_ONSITE,
    BP_ACTIVITY.VIEW_TOTAL_COL_DU_OFFSHORE,
    BP_ACTIVITY.VIEW_TOTAL_MARGIN_OFFSHORE,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_ONSITE,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_OFFSHORE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_ONSITE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_OFFSHORE,
    BP_ACTIVITY.EDIT_COLLABORATORS,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE,
    BP_ACTIVITY.EDIT_REVENUE_ONSITE,
    BP_ACTIVITY.EDIT_REVENUE_OFFSHORE,
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE,
    BP_ACTIVITY.VIEW_DELIVERY_OFFSHORE,
    BP_ACTIVITY.EDIT_DELIVERY_ONSITE,
    BP_ACTIVITY.EDIT_DELIVERY_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE,
    BP_ACTIVITY.VIEW_PLAN_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_INTERNAL_COL,
    BP_ACTIVITY.EDIT_PLAN_ONSITE,
    BP_ACTIVITY.EDIT_PLAN_OFFSHORE,
    BP_ACTIVITY.EDIT_PLAN_ALL,
    BP_ACTIVITY.SAVE_DRAFT,
    BP_ACTIVITY.SUBMIT,
    BP_ACTIVITY.CREATE_VERSION,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-FC': [
    // Giống FCL nhưng không có SUBMIT, CREATE_VERSION
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_TOTAL_COL_DU_ONSITE,
    BP_ACTIVITY.VIEW_TOTAL_COL_DU_OFFSHORE,
    BP_ACTIVITY.VIEW_TOTAL_MARGIN_OFFSHORE,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_ONSITE,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_OFFSHORE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_ONSITE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_OFFSHORE,
    BP_ACTIVITY.EDIT_COLLABORATORS,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE,
    BP_ACTIVITY.EDIT_REVENUE_ONSITE,
    BP_ACTIVITY.EDIT_REVENUE_OFFSHORE,
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE,
    BP_ACTIVITY.VIEW_DELIVERY_OFFSHORE,
    BP_ACTIVITY.EDIT_DELIVERY_ONSITE,
    BP_ACTIVITY.EDIT_DELIVERY_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE,
    BP_ACTIVITY.VIEW_PLAN_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_INTERNAL_COL,
    BP_ACTIVITY.EDIT_PLAN_ONSITE,
    BP_ACTIVITY.EDIT_PLAN_OFFSHORE,
    BP_ACTIVITY.EDIT_PLAN_ALL,
    BP_ACTIVITY.SAVE_DRAFT,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-Sale-Onsite': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_ONSITE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_ONSITE,
    BP_ACTIVITY.EDIT_COLLABORATORS,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE, // summaryOnly — xem riêng trong hook
    BP_ACTIVITY.EDIT_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE,
    BP_ACTIVITY.EDIT_DELIVERY_ONSITE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE,
    BP_ACTIVITY.EDIT_PLAN_ONSITE,
    BP_ACTIVITY.SAVE_DRAFT,
    BP_ACTIVITY.SUBMIT,
    BP_ACTIVITY.CREATE_VERSION,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-Sale-Offshore': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
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
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
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

  'DB-DUL-Offshore': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
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

  'DB-BUL-Onsite': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-BUL-Offshore': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE, // summaryOnly
    BP_ACTIVITY.VIEW_PLAN_OFFSHORE,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-GLEAD-OB-SALE': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE, // summaryOnly
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-GLEAD-Onsite': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE, // summaryOnly
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE,
    BP_ACTIVITY.EXPORT,
  ],

  'DB-GLEAD-Offshore': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE,
    BP_ACTIVITY.VIEW_DELIVERY_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_OFFSHORE,
    BP_ACTIVITY.EXPORT,
  ],

  // --- Roles dành riêng cho collaborator được assign (không có SUBMIT) ---
  // Dùng khi backend chưa resolve, frontend tự derive (Tầng 3)

  'DB-Sale-Onsite-Collaborator': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_ONSITE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_ONSITE,
    BP_ACTIVITY.EDIT_COLLABORATORS,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE, // summaryOnly
    BP_ACTIVITY.EDIT_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE,
    BP_ACTIVITY.EDIT_DELIVERY_ONSITE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE,
    BP_ACTIVITY.EDIT_PLAN_ONSITE,
    BP_ACTIVITY.SAVE_DRAFT,
    // ❌ Không có SUBMIT, CREATE_VERSION
    BP_ACTIVITY.EXPORT,
  ],

  'DB-Sale-Offshore-Collaborator': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
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

  'DB-DUL-Onsite-Collaborator': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_TOTAL_TAB,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_ONSITE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_ONSITE,
    BP_ACTIVITY.VIEW_REVENUE_ONSITE,
    BP_ACTIVITY.EDIT_REVENUE_ONSITE,
    BP_ACTIVITY.VIEW_DELIVERY_ONSITE,
    BP_ACTIVITY.EDIT_DELIVERY_ONSITE,
    BP_ACTIVITY.VIEW_PLAN_ONSITE,
    BP_ACTIVITY.EDIT_PLAN_ONSITE,
    BP_ACTIVITY.SAVE_DRAFT,
    // ❌ Không có EDIT_COLLABORATORS (DUL-Collaborator không tự sửa danh sách team)
    BP_ACTIVITY.EXPORT,
  ],

  'DB-DUL-Offshore-Collaborator': [
    BP_ACTIVITY.VIEW_DETAIL,
    BP_ACTIVITY.VIEW_GENERAL,
    BP_ACTIVITY.VIEW_GENERAL_FINANCIAL,
    BP_ACTIVITY.EDIT_GENERAL_FINANCIAL_OFFSHORE,
    BP_ACTIVITY.EDIT_GENERAL_KPI_OFFSHORE,
    BP_ACTIVITY.VIEW_REVENUE_OFFSHORE,
    BP_ACTIVITY.EDIT_REVENUE_OFFSHORE,
    BP_ACTIVITY.VIEW_DELIVERY_OFFSHORE,
    BP_ACTIVITY.EDIT_DELIVERY_OFFSHORE,
    BP_ACTIVITY.VIEW_PLAN_OFFSHORE,
    BP_ACTIVITY.EDIT_PLAN_OFFSHORE,
    BP_ACTIVITY.SAVE_DRAFT,
    BP_ACTIVITY.EXPORT,
  ],
}
```

---

## 5. Tầng 3 — Collaborator-to-Role Mapping (Frontend Derive)

### Bảng mapping `memberType` → Derived Role

```js
// Trong activityPolicy.js

/**
 * Khi user được assign là collaborator trong BP,
 * họ được cấp thêm activities của derived role tương ứng.
 *
 * Key: memberType từ API (AM | PREPARATOR | PM | TEAM_LEAD)
 * Value: role string theo locationType của MVV họ được assign
 *
 * ⚠️ Dùng variant "-Collaborator" (không có SUBMIT)
 *    Nếu muốn collaborator có thể submit → dùng role chính thức
 */
export const COLLABORATOR_ROLE_MAP = {
  AM: {
    Onsite:   'DB-Sale-Onsite-Collaborator',
    Offshore: 'DB-Sale-Offshore-Collaborator',
  },
  PREPARATOR: {
    Onsite:   'DB-DUL-Onsite-Collaborator',
    Offshore: 'DB-DUL-Offshore-Collaborator',
  },
  PM: {
    Onsite:   'DB-DUL-Onsite-Collaborator',
    Offshore: 'DB-DUL-Offshore-Collaborator',
  },
  TEAM_LEAD: {
    Onsite:   'DB-GLEAD-Onsite',
    Offshore: 'DB-GLEAD-Offshore',
  },
  // PRE_SALE, ADVISER → chỉ view, không có edit
  PRE_SALE: {
    Onsite:   'DB-BUL-Onsite',
    Offshore: 'DB-BUL-Offshore',
  },
  ADVISER: {
    Onsite:   'DB-BUL-Onsite',
    Offshore: 'DB-BUL-Offshore',
  },
}
```

### Logic trong hook `useBusinessPlanPermission`

```js
// src/lib/business-plan/hooks/useBusinessPlanPermission.js

import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  BP_ACTIVITY,
  ROLE_ACTIVITIES,
  COLLABORATOR_ROLE_MAP,
} from '../permissions/activityPolicy'

const getCurrentUserLdap = () => {
  try {
    const userPOA = JSON.parse(localStorage.getItem('userPOA')) || {}
    return userPOA.ldap || null
  } catch {
    return null
  }
}

const resolveActivityKeys = (userRoles, generalInfos, currentUserLdap) => {
  // --- Tier 1: Backend inject BP activity keys trực tiếp ---
  try {
    const permissions = JSON.parse(localStorage.getItem('permissions')) || []
    const bpKeys = permissions
      .filter(p => p.key === 'BUSINESS_PLAN_DETAIL')
      .flatMap(p => p.activities || [])
      .map(a => a.name)
      .filter(n => n.startsWith('BP_'))
    if (bpKeys.length > 0) return new Set(bpKeys)
  } catch (_) {}

  // --- Tier 2: Resolve từ system roles ---
  const effectiveRoles = new Set(
    Array.isArray(userRoles) ? userRoles : []
  )

  // --- Tier 3: Augment từ collaborator assignment ---
  if (currentUserLdap && Array.isArray(generalInfos)) {
    for (const info of generalInfos) {
      const locationType = info.mvvLocationType // 'Onsite' | 'Offshore'
      if (!locationType) continue

      const collaboratorFields = {
        AM:        info.listAM        || [],
        PREPARATOR: info.listPreparator || [],
        PM:        info.listPM        || [],
        TEAM_LEAD: info.listTeamLead  || [],
        PRE_SALE:  info.listPreSale   || [],
        ADVISER:   info.listAdviser   || [],
      }

      for (const [memberType, list] of Object.entries(collaboratorFields)) {
        if (list.some(m => m.ldap === currentUserLdap)) {
          const derivedRole = COLLABORATOR_ROLE_MAP[memberType]?.[locationType]
          if (derivedRole) effectiveRoles.add(derivedRole)
        }
      }
    }
  }

  // --- Expand roles → activity keys (union) ---
  const keys = new Set()
  for (const role of effectiveRoles) {
    const activities = ROLE_ACTIVITIES[role] || []
    activities.forEach(k => keys.add(k))
  }
  return keys
}

const useBusinessPlanPermission = () => {
  const { userRoles, generalInfos } = useSelector(
    s => s.businessGeneralInformation
  )

  const currentUserLdap = useMemo(() => getCurrentUserLdap(), [])

  const activityKeys = useMemo(
    () => resolveActivityKeys(userRoles, generalInfos, currentUserLdap),
    [userRoles, generalInfos, currentUserLdap]
  )

  // summaryOnly roles (xem revenue offshore nhưng chỉ dòng tổng)
  const summaryOnlyRoles = new Set([
    'DB-Sale-Onsite',
    'DB-Sale-Onsite-Collaborator',
    'DB-BUL-Offshore',
    'DB-GLEAD-OB-SALE',
    'DB-GLEAD-Onsite',
  ])

  return useMemo(() => ({
    /**
     * Check xem user có activity không.
     * @param {string} activity - BP_ACTIVITY constant
     * @param {string} [locationType] - 'Onsite' | 'Offshore'
     * Khi truyền locationType, tự resolve sang scoped key:
     *   can('BP_EDIT_REVENUE', 'Onsite') → check 'BP_EDIT_REVENUE_ONSITE'
     */
    can(activity, locationType) {
      if (locationType) {
        const scoped = `${activity}_${locationType.toUpperCase()}`
        if (activityKeys.has(scoped)) return true
        // Fallback: check key không có suffix (dành cho activity ALL-scope)
      }
      return activityKeys.has(activity)
    },

    /**
     * Check xem user chỉ được xem summary của Revenue Offshore hay không
     */
    isRevenueSummaryOnly(locationType) {
      if (locationType !== 'Offshore') return false
      if (!activityKeys.has(BP_ACTIVITY.VIEW_REVENUE_OFFSHORE)) return false
      // Nếu có EDIT thì không phải summaryOnly
      if (activityKeys.has(BP_ACTIVITY.EDIT_REVENUE_OFFSHORE)) return false
      return true // Chỉ VIEW, không EDIT → summaryOnly
    },

    activityKeys, // expose cho debug
  }), [activityKeys])
}

export default useBusinessPlanPermission
```

---

## 6. Cách dùng trong Component

### Trước đây (scope-based, hardcoded):
```jsx
const onsitePerms = useBusinessPlanPermission('general_onsite')
const canEditOnsite = onsitePerms.canEditScope
```

### Sau (activity-based):
```jsx
const perms = useBusinessPlanPermission()

// General Information
const canEditFinancial = perms.can(BP_ACTIVITY.EDIT_GENERAL_FINANCIAL, mvvLocationType)
const canEditKpi       = perms.can(BP_ACTIVITY.EDIT_GENERAL_KPI, mvvLocationType)
const canEditCollab    = perms.can(BP_ACTIVITY.EDIT_COLLABORATORS)

// Revenue
const canViewRevenue   = perms.can(BP_ACTIVITY.VIEW_REVENUE, mvvLocationType)
const canEditRevenue   = perms.can(BP_ACTIVITY.EDIT_REVENUE, mvvLocationType)
const isSummaryOnly    = perms.isRevenueSummaryOnly(mvvLocationType)

// Actions
const canSaveDraft     = perms.can(BP_ACTIVITY.SAVE_DRAFT)
const canSubmit        = perms.can(BP_ACTIVITY.SUBMIT)
const canExport        = perms.can(BP_ACTIVITY.EXPORT)
```

---

## 7. Câu hỏi cần xác nhận với Nghiệp vụ

> Các câu trả lời ảnh hưởng trực tiếp đến `COLLABORATOR_ROLE_MAP` và `ROLE_ACTIVITIES`.

| # | Câu hỏi | Ảnh hưởng |
|---|---|---|
| **Q1** | AM được assign có được **submit** BP không? | Dùng `DB-Sale-*` hay `DB-Sale-*-Collaborator` |
| **Q2** | Preparator/PM được assign có quyền **sửa danh sách collaborator** không? | `EDIT_COLLABORATORS` trong DUL-Collaborator |
| **Q3** | User vừa có system role `SALE_ONSITE`, vừa được assign là AM trong Offshore MVV → có cả 2 set activities không? | Union logic (hiện tại đã union) |
| **Q4** | Nếu BP chỉ có Offshore, user là AM của Offshore → họ có thấy tab Total không? | `VIEW_TOTAL_TAB` trong Sale-Offshore-Collaborator |
| **Q5** | Backend có thể handle resolve collaborator roles server-side không? | Quyết định có cần implement Tầng 3 không |
| **Q6** | `SALE_OFFSHORE` có được submit BP không? (Hiện matrix không có SUBMIT) | `BP_SUBMIT` trong `DB-Sale-Offshore` |

---

## 8. Plan Migrate Từng Bước

### Phase 1 — Foundation (không breaking change)
- [ ] Tạo `activityPolicy.js` với `BP_ACTIVITY`, `ROLE_ACTIVITIES`, `COLLABORATOR_ROLE_MAP`
- [ ] Refactor `useBusinessPlanPermission` thêm API mới `can(activity, locationType)` song song API cũ
- [ ] Giữ nguyên `PERMISSION_MATRIX` + scope-based logic — chạy song song

### Phase 2 — Migrate General Information
- [ ] Thay `onsiteGeneralPerms.canEditScope` → `perms.can(BP_ACTIVITY.EDIT_GENERAL_FINANCIAL, 'Onsite')`
- [ ] Fix `handleValidate` và `handleValidateDraft` dùng activity-based check
- [ ] Fix stale validation state khi switch MVV (reset field-level về `false` nếu `canEdit = false`)
- [ ] Remove `onsiteGeneralPerms`, `offshoreGeneralPerms` khỏi `useBusinessPlanDetails`

### Phase 3 — Migrate Revenue + Delivery
- [ ] Thay scope string → `perms.can(BP_ACTIVITY.VIEW_REVENUE, viewMode)`
- [ ] Handle `summaryOnly` bằng `perms.isRevenueSummaryOnly(viewMode)`

### Phase 4 — Migrate Business Plan Tab + Total View
- [ ] Column visibility → `perms.can(BP_ACTIVITY.VIEW_TOTAL_COL_DU_ONSITE)`
- [ ] Edit → `perms.can(BP_ACTIVITY.EDIT_PLAN, viewMode)` và `EDIT_PLAN_ALL`

### Phase 5 — Kết nối Backend
- [ ] Backend inject BP activity keys vào `localStorage.permissions` (Tier 1 tự kích hoạt)
- [ ] Hoặc: Backend trả `userRoles` đã resolve collaborator (Tier 3 không cần chạy)
- [ ] Xóa `PERMISSION_MATRIX`, `SCOPE`, `COL_CAT` (deprecated)

### Phase 6 — Cleanup
- [ ] Remove `canViewColumn` / `canViewSection` từ `viewPermissions.js` nếu không dùng
- [ ] Audit `checkRolePermission(SourceConstants.BUSINESS_PLAN_DETAIL, ...)` → merge vào `perms.can(...)`

---

## 9. Sơ đồ Flow Tổng Thể

```
User mở BP Detail
      │
      ▼
API trả về userRoles + generalInfos
      │
      ▼
resolveActivityKeys(userRoles, generalInfos, currentUserLdap)
      │
      ├─ [Tier 1] localStorage.permissions có BP keys? → dùng ngay
      │
      ├─ [Tier 2] Expand userRoles → activity keys qua ROLE_ACTIVITIES
      │
      └─ [Tier 3] Scan generalInfos[].list{AM,PM,Preparator,...}
                  User có trong list nào? → add derived role → expand thêm keys
                        │
                        ▼
              activityKeys: Set<string>  (union của tất cả)
                        │
                        ▼
              perms.can(BP_ACTIVITY.XXX, locationType)
              → true | false
```
