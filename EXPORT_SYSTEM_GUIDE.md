# Export System Documentation

## Overview

A robust, production-ready export system with polling mechanism, retry logic, offline support, and persistent state management for large file exports in React applications.

## 🎯 Features

### Core Features
- ✅ **Polling Mechanism** - Automatic status checking every 3 seconds
- ✅ **Retry Logic** - Up to 6 retry attempts with timeout handling
- ✅ **Progress Tracking** - Real-time progress bar and status updates
- ✅ **Automatic Download** - File downloads automatically when ready
- ✅ **Error Handling** - Comprehensive error messages and user feedback

### Advanced Features
- ✅ **Offline Support** - Detects network loss and resumes when reconnected
- ✅ **Persistent State** - Saves export state in localStorage
- ✅ **Tab Close Protection** - Warning when closing tab during export
- ✅ **Resume on Refresh** - Automatically resumes export after page reload
- ✅ **Browser Event Handling** - Handles beforeunload, online/offline events

## 📁 File Structure

```
src/
├── utils/
│   └── mockExportApi.js          # Mock API service (4 endpoints)
├── hooks/
│   └── useExportFile.js          # Custom hook for export logic
├── components/
│   └── ExportModal/
│       ├── ExportModal.jsx       # Modal component
│       ├── ExportModal.css       # Modal styles
│       └── index.js              # Barrel export
└── pages/
    ├── ExportDemoPage.jsx        # Demo page
    └── ExportDemoPage.css        # Page styles
```

## 🔧 API Endpoints

### 1. Create Export Job
```javascript
createExportJob(params)
```
- **Purpose**: Initiates export process
- **Returns**: `{ exportId, message }`
- **Simulation**: 2-5 seconds processing time, 10% failure rate

### 2. Check Export Status
```javascript
checkExportStatus(exportId)
```
- **Purpose**: Polls export job status
- **Returns**: `{ status, progress, fileUrl, fileName, ... }`
- **Status Values**: `PROCESSING`, `SUCCESS`, `FAILED`, `CANCELLED`

### 3. Download Export File
```javascript
downloadExportFile(exportId)
```
- **Purpose**: Downloads completed file
- **Returns**: `{ blob, fileName, fileSize }`
- **Triggers**: Automatic browser download

### 4. Cancel Export Job
```javascript
cancelExportJob(exportId)
```
- **Purpose**: Cancels and deletes export job
- **Returns**: `{ success, message }`
- **Cleanup**: Auto-deletes after 1 minute

## 🎣 Custom Hook Usage

### Basic Usage

```javascript
import { useExportFile } from '../hooks/useExportFile'

const MyComponent = () => {
  const {
    isExporting,      // Boolean: Export in progress
    exportId,         // String: Current export ID
    status,           // String: PROCESSING | SUCCESS | FAILED | CANCELLED
    progress,         // Number: 0-100
    error,            // String: Error message
    retryCount,       // Number: Current retry count (0-6)
    fileName,         // String: Downloaded file name
    isOnline,         // Boolean: Network status
    startExport,      // Function: Start export
    cancelExport,     // Function: Cancel export
    resumeExport      // Function: Resume from storage
  } = useExportFile()

  // Start export
  const handleExport = async () => {
    const params = {
      dateRange: ['2024-01-01', '2024-12-31'],
      department: 'sales',
      exportType: 'detailed'
    }
    
    await startExport(params)
  }

  return (
    <button onClick={handleExport} disabled={isExporting}>
      {isExporting ? 'Exporting...' : 'Export'}
    </button>
  )
}
```

### Advanced Usage with Modal

```javascript
import { useExportFile } from '../hooks/useExportFile'
import ExportModal from '../components/ExportModal'
import { EXPORT_STATUS } from '../utils/mockExportApi'

const ExportComponent = () => {
  const exportHook = useExportFile()

  return (
    <>
      <button onClick={() => exportHook.startExport({ type: 'report' })}>
        Export Data
      </button>

      <ExportModal
        visible={
          exportHook.isExporting || 
          exportHook.status === EXPORT_STATUS.SUCCESS ||
          exportHook.status === EXPORT_STATUS.FAILED
        }
        {...exportHook}
        onCancel={() => {
          if (exportHook.status === EXPORT_STATUS.PROCESSING) {
            exportHook.cancelExport()
          }
        }}
      />
    </>
  )
}
```

## 🎨 Modal Component

### Props

```typescript
interface ExportModalProps {
  visible: boolean           // Show/hide modal
  isExporting: boolean      // Export in progress
  status: string            // Current status
  progress: number          // Progress percentage (0-100)
  error: string | null      // Error message
  retryCount: number        // Current retry count
  fileName: string | null   // Downloaded file name
  isOnline: boolean         // Network status
  onCancel: () => void      // Cancel/close handler
  maxRetries?: number       // Max retry attempts (default: 6)
}
```

### Features
- 📊 Real-time progress bar
- 🎨 Status-based icons and colors
- ⚠️ Error and warning alerts
- 📡 Network status indicator
- 🔔 Retry count display

## 🔄 Workflow

### Normal Export Flow

```
1. User clicks "Export" button
   ↓
2. startExport() called → createExportJob() API
   ↓
3. Modal shows "Processing..."
   ↓
4. Poll checkExportStatus() every 3 seconds
   ↓
5. Status = SUCCESS
   ↓
6. downloadExportFile() → Auto download
   ↓
7. Modal shows "Completed!"
   ↓
8. User closes modal
```

### Error/Timeout Flow

```
1. Processing starts
   ↓
2. Status checks (Retry 1, 2, 3...)
   ↓
3. Retry count > 6
   ↓
4. cancelExportJob() called
   ↓
5. Modal shows error: "Export timeout"
   ↓
6. User can retry or close
```

### Offline/Resume Flow

```
1. Export in progress
   ↓
2. User closes tab/browser
   ↓
3. State saved to localStorage
   ↓
4. User returns and refreshes page
   ↓
5. resumeExport() auto-called
   ↓
6. Polling continues from last state
```

## 🛠️ Configuration

### Polling Interval
```javascript
// In useExportFile.js
const POLL_INTERVAL = 3000 // 3 seconds
```

### Max Retries
```javascript
// In useExportFile.js
const MAX_RETRY_COUNT = 6
```

### LocalStorage Key
```javascript
// In useExportFile.js
const STORAGE_KEY = 'export_jobs'
```

### Mock API Timing
```javascript
// In mockExportApi.js
const processingTime = 2000 + Math.random() * 3000 // 2-5 seconds
const failureRate = 0.1 // 10% chance of failure
```

## 🧪 Testing Scenarios

### 1. Normal Export
- Configure export settings
- Click "Export to Excel"
- Wait for completion
- File downloads automatically

### 2. Tab Close During Export
- Start export
- Close browser tab
- Reopen tab
- Export resumes automatically

### 3. Network Disconnection
- Start export
- Disable network (DevTools → Network → Offline)
- Modal shows "Connection Lost"
- Re-enable network
- Export resumes automatically

### 4. Timeout Test
- Start export
- Wait for 6 polling attempts
- System auto-cancels export
- Error message displayed

### 5. Export Failure
- Start export
- ~10% chance of random failure
- Error modal displayed
- Can retry export

## 📊 State Management

### Export State Structure
```javascript
{
  isExporting: boolean,      // Is currently exporting
  exportId: string | null,   // Current export job ID
  status: string | null,     // PROCESSING | SUCCESS | FAILED | CANCELLED
  progress: number,          // 0-100
  error: string | null,      // Error message
  retryCount: number,        // Current retry attempt (0-6)
  fileName: string | null,   // Downloaded file name
  isOnline: boolean          // Network status
}
```

### LocalStorage Structure
```javascript
{
  "export_jobs": {
    "export_123": {
      exportId: "export_123",
      status: "PROCESSING",
      progress: 45,
      retryCount: 2,
      lastUpdated: 1234567890000
    }
  }
}
```

## 🎯 Best Practices

### 1. Error Handling
```javascript
try {
  await startExport(params)
} catch (error) {
  console.error('Export failed:', error)
  // Handle error appropriately
}
```

### 2. Cleanup on Unmount
```javascript
useEffect(() => {
  return () => {
    // Hook automatically cleans up polling interval
  }
}, [])
```

### 3. User Feedback
```javascript
// Always show modal during export
<ExportModal
  visible={isExporting || status === EXPORT_STATUS.SUCCESS}
  // ... other props
/>
```

### 4. Network Status
```javascript
// Disable export button when offline
<Button
  onClick={handleExport}
  disabled={!isOnline || isExporting}
>
  Export
</Button>
```

## 🚀 Performance Optimizations

1. **Debounced Polling** - 3-second intervals prevent server overload
2. **Conditional Rendering** - Modal only renders when needed
3. **Memory Cleanup** - Intervals cleared on unmount
4. **LocalStorage Cleanup** - Old exports auto-deleted after 30 minutes
5. **Blob Management** - URLs revoked after download

## 🔐 Security Considerations

1. **API Authentication** - Add bearer tokens in production
2. **File Validation** - Verify file types before download
3. **Rate Limiting** - Implement server-side rate limiting
4. **XSS Protection** - Sanitize file names and error messages
5. **CORS** - Configure proper CORS headers

## 🐛 Troubleshooting

### Export stuck at 0%
- Check network tab for API errors
- Verify exportId is valid
- Check console for errors

### File not downloading
- Check browser download settings
- Verify popup blocker settings
- Check downloadExportFile response

### State not persisting
- Check localStorage quota
- Verify STORAGE_KEY is correct
- Check browser privacy settings

### Retry count not incrementing
- Verify polling interval is running
- Check checkExportStatus response
- Look for JavaScript errors

## 📦 Dependencies

- React 16.8+
- Ant Design 4.x
- moment.js
- react-router-dom

## 🎓 Usage Example

Visit `/export-demo` route to see the complete implementation with:
- Export configuration form
- Real-time status panel
- Interactive demo
- Test scenario guides

## 📝 License

This is a demo/educational implementation. Adapt as needed for your production use case.

---

**Created for**: CMC ReactJs Gantt-Chart Project  
**Purpose**: Demonstrate enterprise-grade export functionality  
**Last Updated**: February 26, 2026
