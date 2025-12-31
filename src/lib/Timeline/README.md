# Timeline Library

A powerful, reusable, and highly customizable timeline component library for React applications.

## Features

✨ **Clean Architecture**
- Separation of concerns (components, hooks, utils)
- Modular and maintainable code structure
- Easy to extend and customize

🎯 **Core Capabilities**
- Multiple view modes (Days, Weeks, Months, Quarters, Years)
- Auto-layout algorithm to prevent overlapping
- Current date indicator with auto-scroll
- Search and filter functionality
- Zoom controls
- Responsive design

🎨 **Customizable**
- Custom item rendering
- Configurable colors and styling
- Flexible toolbar and controls
- Theme support

⚡ **Performance Optimized**
- Memoized calculations
- Efficient rendering
- Smooth animations and transitions

## Installation

The library is already included in your project under `src/lib/Timeline/`.

## Quick Start

### Basic Usage

```jsx
import { Timeline } from '../lib/Timeline';

const MyComponent = () => {
  const items = [
    {
      id: 1,
      name: 'Project Phase 1',
      startDate: '2025-01-15',
      endDate: '2025-03-30',
      color: '#5559df'
    },
    {
      id: 2,
      name: 'Project Phase 2',
      startDate: '2025-03-01',
      endDate: '2025-06-15',
      color: '#9b59d0'
    }
  ];

  return <Timeline items={items} />;
};
```

### With Configuration

```jsx
<Timeline 
  items={items}
  config={{
    viewMode: 'months',
    rowHeight: 50,
    enableAutoScroll: true,
    enableCurrentDate: true,
    enableGrid: true
  }}
  toolbarProps={{
    showNewButton: true,
    showSearch: true,
    showFilters: true
  }}
  onItemClick={(item) => console.log('Clicked:', item)}
/>
```

## API Reference

### Timeline Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array<Item>` | `[]` | Timeline items to display |
| `config` | `Object` | See below | Configuration options |
| `showToolbar` | `boolean` | `true` | Show/hide toolbar |
| `showViewSelector` | `boolean` | `true` | Show/hide view mode selector |
| `onItemClick` | `Function` | - | Callback when item is clicked |
| `onItemDoubleClick` | `Function` | - | Callback when item is double-clicked |
| `onItemHover` | `Function` | - | Callback when item is hovered |
| `renderItem` | `Function` | - | Custom item renderer |

### Item Object

```typescript
{
  id: string | number;          // Unique identifier
  name: string;                 // Display name
  startDate: string;            // ISO date string (YYYY-MM-DD)
  endDate: string;              // ISO date string (YYYY-MM-DD)
  color?: string;               // Hex color code
  resource?: string;            // Resource/person assigned
  status?: string;              // Status label
  // ... any custom properties
}
```

### Config Object

```javascript
{
  viewMode: 'months',           // 'days' | 'weeks' | 'months' | 'quarters' | 'years'
  rowHeight: 50,                // Height of each row in pixels
  itemHeight: 34,               // Height of each item bar
  itemPadding: 8,               // Padding around items
  enableAutoScroll: true,       // Auto-scroll to current date on mount
  enableCurrentDate: true,      // Show current date indicator
  enableGrid: true,             // Show grid lines
  enableTooltip: true,          // Enable tooltips (future feature)
  minZoomLevel: 0.5,           // Minimum zoom level
  maxZoomLevel: 3              // Maximum zoom level
}
```

## Advanced Usage

### Custom Item Rendering

```jsx
<Timeline 
  items={items}
  renderItem={(item, style) => (
    <div 
      className="custom-timeline-item" 
      style={{
        ...style,
        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`
      }}
    >
      <strong>{item.name}</strong>
      <span>{item.progress}%</span>
    </div>
  )}
/>
```

### Using the Hook Directly

```jsx
import { useTimeline } from '../lib/Timeline';

const MyCustomTimeline = ({ items }) => {
  const {
    viewMode,
    setViewMode,
    timelineData,
    layoutItems,
    getItemStyle,
    scrollToToday
  } = useTimeline(items, {
    viewMode: 'months',
    enableAutoScroll: true
  });

  // Build your custom UI using the timeline data
  return (
    <div>
      {/* Your custom implementation */}
    </div>
  );
};
```

### Utility Functions

```jsx
import { 
  formatDate, 
  getDuration,
  calculatePosition,
  filterItems,
  searchItems 
} from '../lib/Timeline';

// Format dates
const formatted = formatDate('2025-01-15', 'DD MMM YYYY'); // "15 Jan 2025"

// Get duration
const duration = getDuration('2025-01-15', '2025-03-30'); // "2 months"

// Filter items
const filtered = filterItems(items, { status: 'active' });

// Search items
const results = searchItems(items, 'project', ['name', 'description']);
```

## Architecture

```
lib/Timeline/
├── components/          # React components
│   ├── Timeline.jsx        # Main component
│   ├── TimelineGrid.jsx    # Grid and items renderer
│   ├── TimelineToolbar.jsx # Toolbar controls
│   └── ViewModeSelector.jsx # View mode switcher
├── hooks/              # Custom hooks
│   └── useTimeline.js      # Core timeline logic
├── utils/              # Utility functions
│   ├── dateUtils.js        # Date calculations
│   └── layoutUtils.js      # Layout algorithms
├── constants.js        # Constants and configurations
└── index.js           # Main export
```

## Styling

All components use CSS modules and can be customized by:

1. **Overriding CSS classes**:
```css
.timeline-item {
  border-radius: 8px !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
}
```

2. **Using className prop**:
```jsx
<Timeline className="my-custom-timeline" />
```

3. **Custom theme** (modify `constants.js`):
```javascript
export const COLORS = {
  primary: '#your-color',
  // ... other colors
};
```

## Performance Tips

1. **Memoize items**: Use `useMemo` for large datasets
2. **Limit items**: For very large datasets (1000+ items), consider pagination or virtualization
3. **Optimize renders**: Use `React.memo` for custom item renderers
4. **Debounce search**: Add debouncing for search input

```jsx
const items = useMemo(() => generateItems(), [dependencies]);
```

## Examples

See the refactored pages for complete examples:
- `src/pages/TimelineView.jsx` - Marketing timeline example
- `src/pages/ProjectOverview.jsx` - Project management example

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

To add new features:

1. Add utilities to `utils/` if needed
2. Create new components in `components/`
3. Update constants in `constants.js`
4. Export from `index.js`
5. Update this README

## License

Internal use - Part of CMC Gantt Chart project
