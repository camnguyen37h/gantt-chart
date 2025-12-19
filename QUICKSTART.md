# 🚀 Quick Start Guide

## Cài đặt và chạy project

### Bước 1: Cài đặt dependencies
```bash
cd "d:\SourceCode\CMC\ReactJs\TDX\Stamp"
npm install
```

### Bước 2: Chạy development server
```bash
npm start
```

Ứng dụng sẽ tự động mở tại: **http://localhost:3000**

## 📱 3 Pages đã được xây dựng:

1. **Project Overview** (`/project-overview`)
   - Gantt chart timeline
   - Payment milestones
   - 8 KPI metric cards
   
2. **Project Schedule** (`/project-schedule`)
   - Chi tiết lịch trình dự án
   - Tab IN MONTH / ACCUMULATED
   - Gantt chart tương tác
   
3. **Workforce Planning** (`/workforce-planning`)
   - Bar chart so sánh Planning vs Actual
   - Toggle Headcount / MM-Months
   - Monthly comparison

## 🎨 Tech Stack

- React 16.14 (Function Components + Hooks)
- Ant Design v3.26.20
- Recharts 2.x (Bar Charts)
- React Router 5.x
- Moment.js

## ⚡ Performance Features

- ✅ `useMemo` cho expensive calculations
- ✅ `useCallback` cho event handlers
- ✅ `React.memo` cho components
- ✅ Lazy loading ready
- ✅ Optimized re-renders

## 📂 Cấu trúc quan trọng

```
src/
├── components/
│   ├── Layout/          # Header, Sidebar
│   ├── MetricCard/      # KPI cards
│   └── GanttChart/      # Gantt timeline
├── pages/               # 3 main pages
├── utils/               # Helpers & mock data
└── App.js              # Main app với routing
```

## 🔧 Build Production

```bash
npm run build
```

## 💡 Tips

- Tất cả components dùng **Function Components**
- Code được tối ưu với **React Hooks**
- Responsive design hoàn chỉnh
- Clean code, dễ maintain
- Mock data có sẵn trong `utils/mockData.js`

---

**Enjoy coding! 🎉**
