# Project Estimation - Score Setting & Business Plan

## 📊 Tổng quan Estimation

| Task | Estimated Effort | Complexity | Priority |
|------|-----------------|------------|----------|
| **Score Setting** | **5-7 MD** | Medium | High |
| **Business Plan** | **10-14 MD** | High | High |
| **Total** | **15-21 MD** | - | - |

**MD = Man-Days (8 hours/day)**

---

## 🎯 Task 1: Score Setting Feature

### Tổng effort: **5-7 MD**

### Breakdown chi tiết:

#### 1.1. Analysis & Design (0.5 MD)
- [ ] Phân tích requirements từ UI mockup
- [ ] Thiết kế component structure
- [ ] Xác định validation rules
- [ ] Design data model

**Estimate:** 4 hours

---

#### 1.2. Main Component Development (1 MD)
**Files:** `ScoreSetting.jsx`, `ScoreSetting.css`

**Tasks:**
- [ ] Create main page component
- [ ] Implement role list rendering
- [ ] Implement pagination logic (5 items/page)
- [ ] Add collapse/expand functionality
- [ ] State management for expanded roles
- [ ] Integration with ScoreForm

**Estimate:** 8 hours

**Breakdown:**
- Component setup: 1h
- Role list & pagination: 3h
- Collapse/expand logic: 2h
- State management: 1h
- Styling: 1h

---

#### 1.3. Score Form Component (1.5 MD)
**Files:** `ScoreForm.jsx`, `ScoreForm.css`

**Tasks:**
- [ ] Create table form component
- [ ] Implement input handling (score, baseScore, status, definition)
- [ ] Add/Delete row functionality
- [ ] Validation integration
- [ ] Error display (inline)
- [ ] Save functionality

**Estimate:** 12 hours

**Breakdown:**
- Table structure: 2h
- Input handling: 3h
- Add/Delete rows: 2h
- Validation integration: 3h
- Error display: 1h
- Save & callbacks: 1h

---

#### 1.4. Validation Utilities (1 MD)
**Files:** `scoreValidation.js`

**Tasks:**
- [ ] Implement `validateScores()` function
- [ ] Required field validation
- [ ] Duplicate name check (case-insensitive)
- [ ] Length validation (Score: max 20, Definition: 10-500)
- [ ] N/A mandatory check
- [ ] Error message generation
- [ ] Helper functions

**Estimate:** 8 hours

**Breakdown:**
- Core validation logic: 4h
- Duplicate check algorithm: 2h
- Error message system: 1h
- Testing & edge cases: 1h

---

#### 1.5. Mock Data & API (0.5 MD)
**Files:** `scoreSettingApi.js`

**Tasks:**
- [ ] Create mock database (7 roles)
- [ ] Implement `fetchRolesWithScores()`
- [ ] Implement `saveRoleScores()`
- [ ] Additional helper functions
- [ ] Delay simulation for realistic UX

**Estimate:** 4 hours

**Breakdown:**
- Mock data creation: 2h
- API functions: 2h

---

#### 1.6. Testing & Bug Fixes (1 MD)
**Tasks:**
- [ ] Unit testing validation logic
- [ ] Integration testing
- [ ] Test all validation rules
- [ ] Test add/delete functionality
- [ ] Test pagination
- [ ] Test edge cases
- [ ] Bug fixes

**Estimate:** 8 hours

---

#### 1.7. Documentation (0.5 MD)
**Files:** README, INTEGRATION_EXAMPLES, DEMO, SUMMARY

**Tasks:**
- [ ] Write comprehensive README
- [ ] Create integration examples
- [ ] Write quick start guide
- [ ] Create demo/test file

**Estimate:** 4 hours

---

### Score Setting - Effort Summary:

| Phase | Effort | Percentage |
|-------|--------|------------|
| Analysis & Design | 0.5 MD | 8% |
| Main Component | 1 MD | 17% |
| Score Form | 1.5 MD | 25% |
| Validation | 1 MD | 17% |
| Mock Data/API | 0.5 MD | 8% |
| Testing | 1 MD | 17% |
| Documentation | 0.5 MD | 8% |
| **Total** | **6 MD** | **100%** |

**Risk buffer:** +1 MD → **Total: 5-7 MD**

---

## 💼 Task 2: Business Plan Feature

### Tổng effort: **10-14 MD**

### Breakdown chi tiết:

#### 2.1. Analysis & Design (1 MD)
**Tasks:**
- [ ] Phân tích requirements phức tạp
- [ ] Thiết kế component architecture
- [ ] Design data flow (Onsite/Offshore)
- [ ] Design permission system
- [ ] Plan calculation formulas (20+)
- [ ] Design tab structure

**Estimate:** 8 hours

**Breakdown:**
- Requirements analysis: 3h
- Architecture design: 3h
- Formula planning: 2h

---

#### 2.2. Main Component Development (1.5 MD)
**Files:** `BusinessPlan.jsx`, `BusinessPlan.css`

**Tasks:**
- [ ] Create main page component
- [ ] Implement tab navigation (3 tabs)
- [ ] Work type switcher (Onsite/Offshore)
- [ ] View mode switcher (Total/OB)
- [ ] State management for tabs, workType, viewMode
- [ ] Permission integration
- [ ] Data loading logic

**Estimate:** 12 hours

**Breakdown:**
- Component setup: 2h
- Tab navigation: 2h
- Switchers & controls: 3h
- State management: 2h
- Permission integration: 2h
- Styling: 1h

---

#### 2.3. Business Plan Sections (3.5 MD)

##### 2.3.1. Summary Section (0.5 MD)
**Files:** `BusinessPlanSummary.jsx`
- [ ] Summary grid layout
- [ ] 8 metrics display
- [ ] Info tooltips
- [ ] Permission-based masking
- [ ] Comparison views

**Estimate:** 4 hours

##### 2.3.2. Software Production Revenue (1.5 MD)
**Files:** `SoftwareProductionRevenue.jsx`
- [ ] Position table with 7 columns
- [ ] Add/Delete position functionality
- [ ] Inline editing
- [ ] Department filter
- [ ] Auto-calculation of totals
- [ ] Monthly MM distribution
- [ ] Link to billing plan

**Estimate:** 12 hours

**Breakdown:**
- Table structure: 3h
- CRUD operations: 4h
- Calculations: 3h
- Filters & extras: 2h

##### 2.3.3. Other Revenue (0.75 MD)
**Files:** `OtherRevenue.jsx`
- [ ] Revenue table
- [ ] Add/Delete revenue items
- [ ] Monthly breakdown toggle
- [ ] Auto-sum calculations

**Estimate:** 6 hours

##### 2.3.4. Selling Expenses (0.75 MD)
**Files:** `SellingExpenses.jsx`
- [ ] Expense table
- [ ] Add/Delete expense items
- [ ] Monthly breakdown toggle
- [ ] Total calculation

**Estimate:** 6 hours

---

#### 2.4. Calculation Utilities (1.5 MD)
**Files:** `businessPlanCalculations.js`

**Tasks:**
- [ ] Implement 20+ formulas
- [ ] Currency formatting
- [ ] Number formatting
- [ ] Revenue calculations
- [ ] Deduction calculations
- [ ] Department breakdown
- [ ] Monthly distribution
- [ ] Validation helpers
- [ ] Testing all formulas

**Estimate:** 12 hours

**Breakdown:**
- Core formulas (10): 5h
- Advanced formulas (10): 4h
- Formatting functions: 1h
- Testing & validation: 2h

---

#### 2.5. Permission System (1.5 MD)
**Files:** `permissionUtils.js`

**Tasks:**
- [ ] Define permission constants
- [ ] Define role structures (5 roles)
- [ ] Implement `checkPermission()`
- [ ] Implement permission helpers (15+ functions)
- [ ] Department access control
- [ ] Work type access control
- [ ] View mode access control
- [ ] Data masking functions
- [ ] Create permission flags generator
- [ ] Action validation

**Estimate:** 12 hours

**Breakdown:**
- Permission constants & roles: 2h
- Core check functions: 3h
- Access control helpers: 4h
- Testing permissions: 3h

---

#### 2.6. Mock Data & API (1 MD)
**Files:** `businessPlanApi.js`

**Tasks:**
- [ ] Create Onsite mock data
- [ ] Create Offshore mock data
- [ ] Implement fetch functions
- [ ] Implement save functions
- [ ] Department breakdown API
- [ ] Monthly revenue API
- [ ] Export function
- [ ] Data merge logic

**Estimate:** 8 hours

**Breakdown:**
- Mock data (2 types): 3h
- API functions: 3h
- Advanced functions: 2h

---

#### 2.7. Styling (1 MD)
**Files:** `BusinessPlan.css`, `BusinessPlanComponents.css`

**Tasks:**
- [ ] Main page styling
- [ ] Tab navigation styling
- [ ] Control buttons styling
- [ ] Summary grid layout
- [ ] Table responsive styling
- [ ] Permission states styling
- [ ] Mobile responsive
- [ ] Hover effects & transitions

**Estimate:** 8 hours

---

#### 2.8. Testing & Bug Fixes (1.5 MD)
**Tasks:**
- [ ] Unit test calculations
- [ ] Test permission system
- [ ] Test Onsite/Offshore switch
- [ ] Test Total/OB views
- [ ] Test all CRUD operations
- [ ] Test with different user roles
- [ ] Integration testing
- [ ] Edge cases testing
- [ ] Bug fixes

**Estimate:** 12 hours

**Breakdown:**
- Formula testing: 3h
- Permission testing: 3h
- Component testing: 4h
- Bug fixes: 2h

---

#### 2.9. Documentation (1 MD)
**Files:** SUMMARY, QUICK_START, FORMULAS

**Tasks:**
- [ ] Write comprehensive summary
- [ ] Create quick start guide
- [ ] Document all formulas
- [ ] Create integration examples
- [ ] Write API documentation
- [ ] Permission guide

**Estimate:** 8 hours

---

### Business Plan - Effort Summary:

| Phase | Effort | Percentage |
|-------|--------|------------|
| Analysis & Design | 1 MD | 8% |
| Main Component | 1.5 MD | 13% |
| Summary Section | 0.5 MD | 4% |
| Software Production | 1.5 MD | 13% |
| Other Revenue | 0.75 MD | 6% |
| Selling Expenses | 0.75 MD | 6% |
| Calculations (20+ formulas) | 1.5 MD | 13% |
| Permission System | 1.5 MD | 13% |
| Mock Data/API | 1 MD | 8% |
| Styling | 1 MD | 8% |
| Testing | 1.5 MD | 13% |
| Documentation | 1 MD | 8% |
| **Total** | **12 MD** | **100%** |

**Risk buffer:** +2 MD → **Total: 10-14 MD**

---

## 📊 Tổng hợp Estimation

### Chi phí theo phase:

| Phase | Score Setting | Business Plan | Total |
|-------|--------------|---------------|-------|
| **Analysis & Design** | 0.5 MD | 1 MD | 1.5 MD |
| **Component Development** | 2.5 MD | 6 MD | 8.5 MD |
| **Utilities (Validation/Calc)** | 1 MD | 1.5 MD | 2.5 MD |
| **Permission System** | - | 1.5 MD | 1.5 MD |
| **Mock Data/API** | 0.5 MD | 1 MD | 1.5 MD |
| **Styling** | included | 1 MD | 1 MD |
| **Testing** | 1 MD | 1.5 MD | 2.5 MD |
| **Documentation** | 0.5 MD | 1 MD | 1.5 MD |
| **Total (without buffer)** | **6 MD** | **12 MD** | **18 MD** |
| **Risk Buffer (15-20%)** | +1 MD | +2 MD | +3 MD |
| **Total (with buffer)** | **5-7 MD** | **10-14 MD** | **15-21 MD** |

---

## 🎯 Complexity Analysis

### Score Setting - Medium Complexity

**Simple aspects:**
- ✅ Single entity (Roles with Scores)
- ✅ Basic CRUD operations
- ✅ Straightforward pagination
- ✅ Simple validation rules

**Complex aspects:**
- ⚠️ Duplicate name checking
- ⚠️ N/A mandatory validation
- ⚠️ Multiple validation rules combination

**Complexity Score:** 5/10

---

### Business Plan - High Complexity

**Complex aspects:**
- 🔴 Multiple data entities (4 sections)
- 🔴 20+ calculation formulas
- 🔴 Comprehensive permission system (5 roles, 12+ permissions)
- 🔴 Multiple view modes (Total/OB)
- 🔴 Multiple work types (Onsite/Offshore)
- 🔴 Department-level access control
- 🔴 Monthly distribution logic
- 🔴 Data masking based on permissions

**Simple aspects:**
- ✅ Mock data structure clear
- ✅ UI components reusable

**Complexity Score:** 8/10

---

## ⚠️ Risk Factors

### Common Risks:

| Risk | Probability | Impact | Mitigation | Buffer |
|------|-------------|--------|------------|--------|
| **Requirement changes** | Medium | High | Clear requirements documentation | +1-2 MD |
| **Design iterations** | High | Medium | Quick feedback loops | +0.5 MD |
| **Integration issues** | Low | Medium | Proper interfaces & contracts | +0.5 MD |
| **Browser compatibility** | Low | Low | Use standard React patterns | +0.5 MD |
| **Performance issues** | Low | Medium | Optimize early | +0.5 MD |

### Score Setting Specific:

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Validation edge cases | Medium | Medium | Comprehensive test cases |
| Pagination bugs | Low | Low | Use proven library patterns |

### Business Plan Specific:

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Formula errors | Medium | High | Unit test all formulas |
| Permission logic bugs | High | High | Test with all role types |
| Onsite/Offshore merge complexity | Medium | High | Plan merge strategy early |
| View mode switching issues | Low | Medium | Clear state management |

---

## 👥 Resource Requirements

### Skill Requirements:

**For Score Setting:**
- ✅ React (intermediate)
- ✅ JavaScript ES6+
- ✅ CSS/Styling
- ✅ Form validation
- ⭐ 1 Frontend Developer (Mid-level)

**For Business Plan:**
- ✅ React (advanced)
- ✅ JavaScript ES6+
- ✅ Complex state management
- ✅ Permission systems
- ✅ Financial calculations
- ✅ CSS/Advanced layouts
- ⭐ 1 Frontend Developer (Senior-level) hoặc
- ⭐ 1 Frontend Developer (Mid) + 1 Senior Review

---

## 📅 Timeline Estimates

### Score Setting Timeline:

**Option 1: 1 Developer (Mid-level)**
- Week 1: Main components + Validation (3 MD)
- Week 2: Testing + Documentation + Polish (3 MD)
- **Total:** 2 weeks (~6 MD)

**Option 2: 1 Developer (Senior)**
- Week 1: Complete implementation (5 MD)
- **Total:** 1 week (~5 MD)

---

### Business Plan Timeline:

**Option 1: 1 Senior Developer**
- Week 1: Analysis + Main components (2.5 MD)
- Week 2: Sections + Calculations (4.5 MD)
- Week 3: Permissions + Testing (3 MD)
- Week 4: Documentation + Polish (2 MD)
- **Total:** 4 weeks (~12 MD)

**Option 2: 2 Developers (1 Senior + 1 Mid)**
- Week 1: Senior (Main + Permissions 3MD), Mid (Sections 3MD)
- Week 2: Senior (Calculations 3MD), Mid (Styling + API 3MD)
- Week 3: Both (Testing + Documentation 3MD each)
- **Total:** 3 weeks (~12 MD total, 6 MD parallel)

---

## 💰 Cost Estimation

### Assumptions:
- Mid-level Developer: $300/MD
- Senior Developer: $500/MD

### Score Setting Cost:

| Scenario | Resource | Effort | Cost |
|----------|----------|--------|------|
| **Option 1** | 1 Mid-level Dev | 6 MD | $1,800 |
| **Option 2** | 1 Senior Dev | 5 MD | $2,500 |

**Recommended:** Option 1 (sufficient complexity)

---

### Business Plan Cost:

| Scenario | Resource | Effort | Cost |
|----------|----------|--------|------|
| **Option 1** | 1 Senior Dev | 12 MD | $6,000 |
| **Option 2** | 1 Senior + 1 Mid | 6+6 MD | $4,800 |

**Recommended:** Option 2 (faster delivery)

---

### Total Project Cost:

| Scenario | Total Effort | Total Cost | Duration |
|----------|--------------|------------|----------|
| **Sequential (1 Dev)** | 18 MD | $7,800-$8,500 | 6-7 weeks |
| **Parallel (2 Devs)** | 18 MD | $6,600-$7,300 | 4-5 weeks |

---

## 🎯 Recommendations

### For Score Setting:
1. ✅ **Assign to:** 1 Mid-level Developer
2. ✅ **Timeline:** 2 weeks (6 MD)
3. ✅ **Focus areas:** Validation logic, user experience
4. ✅ **Review:** Code review by Senior after week 1

### For Business Plan:
1. ✅ **Assign to:** 1 Senior + 1 Mid Developer
2. ✅ **Timeline:** 3 weeks (parallel work)
3. ✅ **Split work:**
   - Senior: Main component, Permission system, Calculations
   - Mid: Sections, Styling, Mock data
4. ✅ **Review:** Daily sync, peer reviews
5. ✅ **Testing:** Dedicated testing phase in week 3

### Sequential vs Parallel:

**Sequential (Same developer):**
- ✅ Consistency in code style
- ✅ Knowledge transfer automatic
- ❌ Longer timeline (6-7 weeks)

**Parallel (2 developers):**
- ✅ Faster delivery (4-5 weeks)
- ✅ Can start Business Plan while Score Setting is being reviewed
- ⚠️ Need good coordination
- ⚠️ Code review & integration important

---

## 📋 Acceptance Criteria

### Score Setting:
- [ ] Role list loads with pagination (5 items/page)
- [ ] Collapse/expand works for each role
- [ ] Add/delete row functionality works
- [ ] All validation rules implemented and working
- [ ] N/A mandatory check enforced
- [ ] Duplicate name detection works (case-insensitive)
- [ ] Save functionality works
- [ ] Error messages display inline
- [ ] Responsive design works on mobile
- [ ] Documentation complete

### Business Plan:
- [ ] Switch between Onsite/Offshore works
- [ ] Switch between Total/OB views works
- [ ] All 4 sections render correctly
- [ ] All 20+ formulas calculate correctly
- [ ] Permission system works for all 5 roles
- [ ] Financial data masks for unauthorized users
- [ ] Add/delete operations work in all sections
- [ ] Monthly breakdown toggle works
- [ ] All CRUD operations work
- [ ] Responsive design
- [ ] Documentation complete

---

## 📊 Effort Distribution Chart

```
Score Setting (6 MD):
████░░░░░░ Component Development (33%)
███░░░░░░░ Validation Logic (17%)
███░░░░░░░ Testing (17%)
██░░░░░░░░ Main Component (17%)
██░░░░░░░░ Documentation (8%)
█░░░░░░░░░ Mock Data/API (8%)

Business Plan (12 MD):
█████░░░░░ Sections Development (27%)
███░░░░░░░ Calculations (13%)
███░░░░░░░ Permissions (13%)
███░░░░░░░ Main Component (13%)
███░░░░░░░ Testing (13%)
██░░░░░░░░ Mock Data/API (8%)
██░░░░░░░░ Styling (8%)
██░░░░░░░░ Documentation (8%)
```

---

## ✅ Summary

| Metric | Score Setting | Business Plan | Total |
|--------|--------------|---------------|-------|
| **Estimated Effort** | 5-7 MD | 10-14 MD | 15-21 MD |
| **Complexity** | Medium (5/10) | High (8/10) | - |
| **Timeline (1 Dev)** | 2 weeks | 4 weeks | 6 weeks |
| **Timeline (2 Devs)** | 2 weeks | 3 weeks | 4-5 weeks |
| **Estimated Cost** | $1,800-$2,500 | $4,800-$6,000 | $6,600-$8,500 |
| **Risk Level** | Low-Medium | Medium-High | - |
| **Recommended Team** | 1 Mid-level | 1 Senior + 1 Mid | 2 Devs |

**Total Project Budget:** $6,600 - $8,500  
**Total Project Timeline:** 4-6 weeks (depending on parallel vs sequential)

---

**Notes:**
- Estimates include buffer for risks (15-20%)
- Assumes clear requirements and no major scope changes
- Includes documentation and testing
- Based on experienced developers familiar with React
- Does not include backend API development
- Does not include deployment/DevOps effort
