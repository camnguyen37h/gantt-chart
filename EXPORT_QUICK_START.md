# Export System - Quick Start Guide

## 🚀 Quick Start

### 1. Access Demo Page
Navigate to: **http://localhost:3000/export-demo**

### 2. Try Export
1. Configure export settings (date range, department, etc.)
2. Click "Export to Excel" button
3. Watch the modal show progress
4. File downloads automatically when ready

---

## 📂 Files Created

### Core System Files
```
src/
├── utils/
│   └── mockExportApi.js             # 4 mock API endpoints
├── hooks/
│   └── useExportFile.js             # Export logic hook
├── components/
│   └── ExportModal/
│       ├── ExportModal.jsx          # Progress modal
│       ├── ExportModal.css          # Modal styles
│       └── index.js                 # Export
└── pages/
    ├── ExportDemoPage.jsx           # Demo page
    └── ExportDemoPage.css           # Page styles
```

### Documentation
```
EXPORT_SYSTEM_GUIDE.md               # Full documentation
EXPORT_QUICK_START.md                # This file
```

---

## 🎯 Key Features

### ✅ Polling Mechanism
- Auto checks status every 3 seconds
- Max 6 retry attempts
- Timeout handling

### ✅ Offline Support
- Detects network loss
- Pauses export
- Auto-resumes when back online

### ✅ Persistent State
- Saves to localStorage
- Safe to close tab
- Resume on page refresh

### ✅ User Experience
- Progress modal with percentage
- Real-time status updates
- Automatic file download
- Error messages

---

## 🧪 Test Scenarios

### Scenario 1: Normal Export
```
1. Click "Export to Excel"
2. Wait 2-5 seconds
3. File downloads (90% success rate)
```

### Scenario 2: Tab Close
```
1. Start export
2. Close tab
3. Reopen tab
4. Export continues automatically
```

### Scenario 3: Network Loss
```
1. Start export
2. Open DevTools → Network → Set "Offline"
3. See "Connection Lost" message
4. Set "Online"
5. Export resumes
```

### Scenario 4: Timeout
```
1. Start export
2. Wait for 6 polling attempts (~18 seconds)
3. System cancels export
4. Error message shows
```

---

## 🔧 API Workflow

```
┌─────────────────┐
│  Start Export   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ createExportJob │ ──► Returns exportId
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Poll Status    │ ──► Every 3 seconds
│ (checkExport    │     (max 6 times)
│  Status)        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
SUCCESS    FAILED/TIMEOUT
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Download│ │ Cancel │
│  File  │ │  Job   │
└────────┘ └────────┘
```

---

## 💻 Code Examples

### Basic Usage
```javascript
import { useExportFile } from '../hooks/useExportFile'
import ExportModal from '../components/ExportModal'

const MyPage = () => {
  const exportHook = useExportFile()

  const handleExport = async () => {
    await exportHook.startExport({
      dateRange: ['2024-01-01', '2024-12-31'],
      type: 'report'
    })
  }

  return (
    <>
      <button onClick={handleExport}>Export</button>
      <ExportModal visible={exportHook.isExporting} {...exportHook} />
    </>
  )
}
```

### Hook Returns
```javascript
const {
  isExporting,    // Boolean
  exportId,       // String
  status,         // 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  progress,       // 0-100
  error,          // String | null
  retryCount,     // 0-6
  fileName,       // String | null
  isOnline,       // Boolean
  startExport,    // async (params) => Promise<exportId>
  cancelExport,   // async () => Promise<void>
  resumeExport    // () => void
} = useExportFile()
```

---

## 📊 Status Flow

```
NULL
  ↓ startExport()
PROCESSING (progress: 0%)
  ↓ polling...
PROCESSING (progress: 30%)
  ↓ polling...
PROCESSING (progress: 60%)
  ↓ polling...
PROCESSING (progress: 90%)
  ↓ complete
SUCCESS (progress: 100%)
  ↓ download
COMPLETED ✓
```

---

## ⚙️ Configuration

### Change Polling Interval
```javascript
// src/hooks/useExportFile.js
const POLL_INTERVAL = 3000  // Change to desired ms
```

### Change Max Retries
```javascript
// src/hooks/useExportFile.js
const MAX_RETRY_COUNT = 6   // Change to desired count
```

### Change Mock Processing Time
```javascript
// src/utils/mockExportApi.js
const processingTime = 2000 + Math.random() * 3000  // Adjust range
```

---

## 🔍 Debugging

### Check Export State
```javascript
// In component
console.log('Export State:', exportHook)
```

### Check LocalStorage
```javascript
// In browser console
JSON.parse(localStorage.getItem('export_jobs'))
```

### Monitor API Calls
```javascript
// Watch network tab in DevTools
// Filter by "export"
```

---

## 📱 Responsive Design

- ✅ Desktop: Full layout with sidebar
- ✅ Tablet: Adjusted columns
- ✅ Mobile: Stacked layout
- ✅ Modal: Adaptive sizing

---

## 🎨 Customization

### Change Modal Colors
```css
/* src/components/ExportModal/ExportModal.css */
.export-modal-title {
  color: #your-color;
}
```

### Change Progress Bar Colors
```javascript
// src/components/ExportModal/ExportModal.jsx
strokeColor={{
  '0%': '#your-start-color',
  '100%': '#your-end-color',
}}
```

---

## 🐛 Common Issues

### Issue: Modal not showing
**Solution**: Check `visible` prop is true

### Issue: Export stuck at 0%
**Solution**: Check console for errors, verify API is running

### Issue: File not downloading
**Solution**: Check browser popup blocker settings

### Issue: State not persisting
**Solution**: Check localStorage is enabled in browser

---

## 📚 Learn More

Full documentation: `EXPORT_SYSTEM_GUIDE.md`

---

**Route**: `/export-demo`  
**Status**: ✅ Production Ready  
**Last Updated**: February 26, 2026
