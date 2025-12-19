# Project Management Dashboard - STAMP

Hệ thống quản lý dự án được xây dựng với React, Ant Design v3, và Recharts.

## 🚀 Tính năng

### 3 Pages chính:

1. **Project Overview** - Tổng quan dự án với Gantt Chart
   - Hiển thị timeline dự án
   - Các milestone quan trọng
   - 8 KPI metrics cards

2. **Project Schedule** - Lịch trình dự án chi tiết
   - Gantt chart tương tác
   - Tab IN MONTH / ACCUMULATED
   - Các metrics theo tháng

3. **Workforce Planning** - Kế hoạch nhân lực
   - Bar chart so sánh Planning vs Actual
   - Toggle giữa Headcount và MM-Months
   - Phân tích chi tiết theo tháng

## 📦 Cài đặt

```bash
# Cài đặt dependencies
npm install
```

## 🛠 Chạy dự án

```bash
# Chạy development server
npm start
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

## 📁 Cấu trúc thư mục

```
src/
├── components/
│   ├── Layout/
│   │   ├── AppHeader.jsx       # Header component
│   │   ├── AppHeader.css
│   │   ├── Sidebar.jsx         # Sidebar navigation
│   │   └── Sidebar.css
│   ├── MetricCard/
│   │   ├── MetricCard.jsx      # Reusable metric card
│   │   └── MetricCard.css
│   └── GanttChart/
│       ├── GanttChart.jsx      # Gantt chart component
│       └── GanttChart.css
├── pages/
│   ├── ProjectOverview.jsx     # Page 1: Overview với Gantt
│   ├── ProjectSchedule.jsx     # Page 2: Schedule timeline
│   └── WorkforcePlanning.jsx   # Page 3: Workforce với bar chart
├── utils/
│   ├── mockData.js            # Mock data
│   └── helpers.js             # Helper functions
├── App.js                     # Main app component
├── App.css
├── index.js                   # Entry point
└── index.css                  # Global styles
```

## 🎨 Tech Stack

- **React 16.14** - Function Components với Hooks
- **Ant Design 3.26.20** - UI Framework
- **Recharts 2.x** - Chart library cho bar charts
- **React Router 5.x** - Routing
- **Moment.js** - Date manipulation

## 💡 Code Highlights

### Performance Optimizations:

1. **useMemo** - Cache expensive calculations
2. **useCallback** - Memoize callback functions
3. **React.memo** - Prevent unnecessary re-renders
4. **Code splitting** - Import only what you need

### Best Practices:

- ✅ Function components only
- ✅ React Hooks (useState, useCallback, useMemo)
- ✅ PropTypes for type checking
- ✅ CSS modules cho styling
- ✅ Responsive design
- ✅ Clean code với comments
- ✅ Reusable components

## 🔧 Build cho Production

```bash
npm run build
```

Build files sẽ được tạo trong thư mục `build/`

## 📊 Components chính

### MetricCard
Component hiển thị các KPI metrics với nhiều variants màu sắc.

### GanttChart
Component Gantt chart tự code, responsive với milestones.

### Bar Chart (Recharts)
Bar chart so sánh Planning vs Actual trong Workforce Planning.

## 🎯 Routes

- `/` - Redirect to Project Overview
- `/project-overview` - Project Overview page
- `/project-schedule` - Project Schedule page
- `/workforce-planning` - Workforce Planning page

## 🐛 Troubleshooting

Nếu gặp lỗi khi install:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notes

- Project sử dụng Ant Design v3 (legacy version) theo yêu cầu
- Tất cả components được viết dưới dạng function components
- Performance được tối ưu với React hooks
- Code được tổ chức theo module pattern dễ maintain

## 👨‍💻 Development

Project được xây dựng với focus vào:
- Clean code
- Performance optimization
- Maintainability
- Responsive design
- User experience
