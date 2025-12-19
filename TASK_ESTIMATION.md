# Task Breakdown & Estimation - TDX Stamp Project

## Tổng quan
Estimation cho Middle Developer để implement các features theo UI mockup:
- Schedule/Milestone Gantt Chart
- Workforce Planning Charts
- Data Integration
- UI/UX Polish

---

## Phase 1: Schedule / Milestone (Gantt Chart)
**Timeline: 5-7 ngày | 40-56 giờ**

### 1.1 Setup cơ bản Gantt Chart Component
**Estimate: 1 ngày (8 giờ)**

**Tasks:**
- Tạo component structure cho GanttChart
- Setup state management cho timeline data
- Cấu hình zoom in/out functionality
- Implement horizontal scroll
- Setup date range calculations

**Deliverables:**
- Component khung cơ bản
- State hooks cho timeline
- Scroll container working

---

### 1.2 Implement Timeline Rendering
**Estimate: 1.5 ngày (12 giờ)**

**Tasks:**
- Render trục thời gian (months/quarters)
- Render các phase bars với màu sắc theo type:
  - Planning/Initial Phase (cyan)
  - Delivery-phase Phase (purple)
  - Delivery-1 (orange)
  - Delivery-2 (yellow/gold)
  - Delivery-phase-1 (green)
  - Delivery-3 (blue)
  - Stage-non-Gde (gray)
- Calculate vị trí và width của bars dựa trên dates
- Implement overlapping bars logic
- Position bars vertically để tránh overlap

**Deliverables:**
- Timeline axis với date labels
- Colored bars rendering correctly
- Bars positioned based on date ranges

---

### 1.3 Implement Delivery Cards/Tooltips
**Estimate: 1 ngày (8 giờ)**

**Tasks:**
- Tạo popup cards component
- Display delivery details:
  - Start date
  - End date (Baseline)
  - Planning dates
  - Actual dates
  - Late/Early indicators với colors (red/green)
- Calculate Late/Early days
- Style cards với borders và shadows
- Positioning logic để cards không bị cắt

**Deliverables:**
- Delivery detail cards
- Date calculations working
- Status indicators (Late/Early)

---

### 1.4 Interactive Features
**Estimate: 1 ngày (8 giờ)**

**Tasks:**
- Click on bars để show/hide delivery details
- Hover effects trên bars
- Display multiple delivery cards simultaneously
- Close cards functionality
- Smooth transitions

**Deliverables:**
- Click interactions working
- Multiple cards can be open
- Smooth UX

---

### 1.5 Legend và Filters
**Estimate: 0.5 ngày (4 giờ)**

**Tasks:**
- Implement color legend component
- Show all phase types với colors
- Phase type indicators
- Optional: Filter by phase type

**Deliverables:**
- Legend component
- Color mapping clear

---

## Phase 2: Workforce Planning Charts
**Timeline: 3-4 ngày | 24-32 giờ**

### 2.1 Setup Chart Library Integration
**Estimate: 0.5 ngày (4 giờ)**

**Tasks:**
- Choose chart library (Chart.js, Recharts, hoặc D3)
- Install và configure
- Setup basic chart configuration
- Test với sample data

**Deliverables:**
- Chart library installed
- Basic chart rendering

---

### 2.2 Implement Planning vs Actual Bar Chart
**Estimate: 1.5 ngày (12 giờ)**

**Tasks:**
- Create dual bar chart component
- Map data cho Planning values (green bars)
- Map data cho Actual values (blue bars)
- X-axis với month labels
- Y-axis với numeric values
- Grouped bar layout
- Responsive width/height

**Deliverables:**
- Dual bar chart working
- Planning vs Actual visualization
- Proper axis labels

---

### 2.3 Implement Head Count / Idle Hours Toggle
**Estimate: 0.5 ngày (4 giờ)**

**Tasks:**
- Create toggle buttons component
- Handle "Head Count" vs "Idle Hours" state
- Switch data source based on selection
- Update chart dynamically
- Style active/inactive buttons

**Deliverables:**
- Toggle buttons working
- Data switching correctly

---

### 2.4 Chart Interactions
**Estimate: 1 ngày (8 giờ)**

**Tasks:**
- Tooltips on hover showing exact values
- Responsive design cho different screen sizes
- Legend integration
- Grid lines và styling
- Animation on data change

**Deliverables:**
- Interactive tooltips
- Responsive charts
- Professional styling

---

## Phase 3: Data Integration & API
**Timeline: 2-3 ngày | 16-24 giờ**

### 3.1 Mock Data Structure
**Estimate: 0.5 ngày (4 giờ)**

**Tasks:**
- Tạo comprehensive mock data trong `mockData.js`
- Schedule/Milestone data model:
  ```javascript
  {
    id, name, phase, startDate, endDate,
    planningStart, planningEnd,
    actualStart, actualEnd,
    deliveries: []
  }
  ```
- Workforce planning data model:
  ```javascript
  {
    month, planning, actual, type: 'headcount'|'idleHours'
  }
  ```
- Project overview metrics

**Deliverables:**
- Complete mock data structure
- Sample data for all features

---

### 3.2 Data Processing Utilities
**Estimate: 1 ngày (8 giờ)**

**Tasks:**
- Date calculations (helpers.js):
  - calculateDuration
  - isDateInRange
  - formatDate
  - calculateLateDays
  - calculateEarlyDays
- Status calculations:
  - getDeliveryStatus
  - calculateProgress
- Data transformation functions:
  - transformGanttData
  - transformWorkforceData
- Timeline position calculations:
  - calculateBarPosition
  - calculateBarWidth

**Deliverables:**
- Utility functions tested
- Helper functions reusable

---

### 3.3 State Management
**Estimate: 1 ngày (8 giờ)**

**Tasks:**
- Setup Context API hoặc Redux
- Global state cho:
  - Selected date range
  - Filter settings
  - Selected deliveries
  - Chart view mode
- Actions và reducers
- Connect components to state

**Deliverables:**
- Centralized state management
- Components using global state

---

## Phase 4: UI/UX Polish & Responsive
**Timeline: 2 ngày | 16 giờ**

### 4.1 Styling & Theme
**Estimate: 0.5 ngày (4 giờ)**

**Tasks:**
- Consistent color scheme across all components
- Typography standards
- Spacing và alignment
- CSS variables for theming
- Professional look matching mockup

**Deliverables:**
- Polished UI
- Consistent styling

---

### 4.2 Responsive Design
**Estimate: 1 ngày (8 giờ)**

**Tasks:**
- Mobile view adaptation (< 768px)
- Tablet view (768px - 1024px)
- Desktop view (> 1024px)
- Chart responsiveness
- Touch interactions for mobile
- Gantt chart horizontal scroll on mobile

**Deliverables:**
- Fully responsive across devices
- Touch-friendly interactions

---

### 4.3 Performance Optimization
**Estimate: 0.5 ngày (4 giờ)**

**Tasks:**
- Optimize rendering với React.memo
- Lazy loading for heavy components
- Memoization cho expensive calculations
- Virtual scrolling nếu có large dataset
- Debounce/throttle for scroll events

**Deliverables:**
- Improved performance
- Smooth interactions

---

## Phase 5: Testing & Bug Fixes
**Timeline: 2 ngày | 16 giờ**

### 5.1 Unit Testing
**Estimate: 0.5 ngày (4 giờ)**

**Tasks:**
- Test utility functions (helpers.js)
- Test data calculations
- Test date transformations
- Test status calculations

**Deliverables:**
- Unit tests cho core logic
- Coverage > 70%

---

### 5.2 Integration Testing
**Estimate: 0.5 ngày (4 giờ)**

**Tasks:**
- Test component interactions
- Test state updates
- Test data flow
- Test user interactions

**Deliverables:**
- Integration tests
- Critical paths covered

---

### 5.3 Bug Fixes & Edge Cases
**Estimate: 1 ngày (8 giờ)**

**Tasks:**
- Handle edge cases:
  - Empty data
  - Date ranges spanning years
  - Overlapping deliveries
  - Extremely long/short phases
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Fix discovered bugs
- Performance issues
- UI glitches

**Deliverables:**
- Bug-free application
- Edge cases handled

---

## TỔNG KẾT ESTIMATE

| Phase | Description | Days | Hours |
|-------|-------------|------|-------|
| **Phase 1** | Schedule / Milestone (Gantt Chart) | 5-7 | 40-56 |
| **Phase 2** | Workforce Planning Charts | 3-4 | 24-32 |
| **Phase 3** | Data Integration & API | 2-3 | 16-24 |
| **Phase 4** | UI/UX Polish & Responsive | 2 | 16 |
| **Phase 5** | Testing & Bug Fixes | 2 | 16 |
| **TOTAL** | | **14-18 ngày** | **112-144 giờ** |

---

## ASSUMPTIONS (Giả định)

1. **Developer Level:** Middle Developer với:
   - 2-3 năm kinh nghiệm React
   - Biết sử dụng chart libraries
   - Có kinh nghiệm với date handling
   - Familiar với responsive design

2. **Working Hours:**
   - 8 giờ làm việc/ngày
   - Full-time focus trên project này

3. **Technical Stack:**
   - React 18+
   - Chart library (Chart.js/Recharts)
   - CSS Modules hoặc Styled Components
   - No major blockers

4. **Available Resources:**
   - Clear UI mockup có sẵn
   - Mock data structure defined
   - No dependencies on backend API initially

---

## RISK FACTORS (Rủi ro)

### ⚠️ High Risk
- **Complex Gantt Chart Logic:** Timeline positioning và overlap handling có thể phức tạp hơn expected
  - **Mitigation:** Research existing libraries (react-gantt, dhtmlx-gantt)
  - **Buffer:** +2-3 ngày

### ⚠️ Medium Risk
- **Date Calculations:** Timezone handling, edge cases với date ranges
  - **Mitigation:** Use date-fns hoặc dayjs library
  - **Buffer:** +1 ngày

- **Performance với Large Datasets:** Nếu có hàng trăm deliveries
  - **Mitigation:** Implement virtualization sớm
  - **Buffer:** +1-2 ngày

### ⚠️ Low Risk
- **Cross-browser Compatibility:** CSS differences
  - **Mitigation:** Test sớm và thường xuyên
  - **Buffer:** +0.5 ngày

---

## RECOMMENDATIONS (Đề xuất)

### 🎯 Development Approach
1. **Start Simple → Add Complexity:**
   - Build basic Gantt chart first với static data
   - Add interactions sau
   - Polish UI cuối cùng

2. **Use Existing Libraries:**
   - Google Charts (react-google-charts)
   - Recharts cho workforce planning
   - date-fns cho date operations
   - → Save 3-5 ngày development time

3. **Incremental Development:**
   - Complete Phase 1 trước khi move to Phase 2
   - Get feedback sớm
   - Adjust estimates based on actual progress

### 📋 Priority Order
1. **Must Have (P0):**
   - Basic Gantt chart rendering
   - Delivery cards với basic info
   - Workforce planning dual bar chart

2. **Should Have (P1):**
   - Interactive features (click, hover)
   - Responsive design
   - Toggle functionality

3. **Nice to Have (P2):**
   - Advanced filtering
   - Export features
   - Animations

### 🔧 Technical Recommendations
- **State Management:** Start với Context API, migrate to Redux nếu cần
- **Styling:** CSS Modules cho scoping tốt hơn
- **Charts:** Recharts (simpler API) hoặc Chart.js (more features)
- **Date Library:** date-fns (smaller bundle size vs moment.js)

---

## MILESTONE CHECKPOINTS

### Week 1 Checkpoint (Day 5)
- [ ] Basic Gantt chart rendering
- [ ] Timeline axis working
- [ ] Phase bars displaying correctly
- [ ] Mock data integrated

### Week 2 Checkpoint (Day 10)
- [ ] Gantt chart fully interactive
- [ ] Delivery cards working
- [ ] Workforce charts implemented
- [ ] Toggle functionality working

### Week 3 Checkpoint (Day 15)
- [ ] Responsive design complete
- [ ] All features integrated
- [ ] Testing in progress
- [ ] Bug fixes ongoing

### Final Delivery (Day 18)
- [ ] All features complete
- [ ] Tests passing
- [ ] Cross-browser tested
- [ ] Documentation complete
- [ ] Ready for deployment

---

## NOTES

- Estimates bao gồm cả code review và documentation time
- Buffer time đã được tính vào ranges (14-18 ngày)
- Daily standups và progress tracking recommended
- Early feedback loops sẽ giúp adjust estimates accurately

---

**Document Version:** 1.0  
**Created:** December 19, 2025  
**For:** TDX Stamp Project - Middle Developer Estimate
