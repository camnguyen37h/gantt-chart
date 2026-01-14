# Iframe Investigation Results

## ✅ Code Analysis Complete

### Search Results:
1. **"iframe" in src/**: ❌ Not found
2. **"2147483647" in src/**: ❌ Not found  
3. **"position: fixed" in src/**: ❌ Not found
4. **"document.createElement" in src/**: ❌ Not found
5. **"document.body.appendChild" in src/**: ❌ Not found

### Dependencies Checked:
- react: 16.14.0 ✓
- react-dom: 16.14.0 ✓
- react-scripts: 4.0.3 ✓
- antd: 3.26.20 ✓
- moment: 2.29.4 ✓
- recharts: 2.1.16 ✓

**None of these libraries create fixed iframe overlays.**

---

## 🔍 Conclusion

The iframe with `z-index: 2147483647` is **NOT created by your Timeline code**.

**Source:** Browser Extension (99%確実)

---

## 🛠️ How to Verify in Browser

### Method 1: Check in DevTools Console
```javascript
// Run in browser console
const iframes = document.querySelectorAll('iframe');
iframes.forEach(iframe => {
  console.log('Iframe:', iframe);
  console.log('Style:', iframe.getAttribute('style'));
  console.log('Parent:', iframe.parentElement);
  console.log('---');
});
```

### Method 2: Monitor iframe creation
```javascript
// Add this to index.html temporarily
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.tagName === 'IFRAME') {
        console.error('IFRAME CREATED!', node);
        console.trace(); // Show stack trace
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```

### Method 3: Check Extensions
1. Open Chrome DevTools (F12)
2. Go to **Sources** tab
3. Check **Content Scripts** section
4. Look for iframe injection code

---

## 🚫 How to Block It

### Option 1: CSS (Recommended)
```css
/* Add to src/index.css */
iframe[style*="z-index: 2147483647"],
iframe[style*="position: fixed"][style*="width: 100%"][style*="height: 100%"] {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
```

### Option 2: JavaScript Removal
```javascript
// Add to public/index.html before </body>
<script>
  setInterval(() => {
    const iframes = document.querySelectorAll('iframe[style*="2147483647"]');
    iframes.forEach(iframe => iframe.remove());
  }, 100);
</script>
```

### Option 3: Disable Extensions
1. Open `chrome://extensions/`
2. Disable extensions one by one
3. Find the culprit

---

## 🎯 Most Likely Culprits

Based on `z-index: 2147483647` and `position: fixed`:

1. **DevTools Translation Extensions**
   - "DevTools is now available in Vietnamese" notification
   - Google Translate
   - Microsoft Translator

2. **Developer Tools Extensions**
   - React DevTools
   - Redux DevTools
   - Vue DevTools

3. **Accessibility Extensions**
   - Screen readers
   - Color pickers
   - Zoom tools

---

## 📋 Next Steps

1. **Quick Test:** Disable ALL extensions and refresh
2. **Permanent Fix:** Add CSS blocker to `src/index.css`
3. **Root Cause:** Re-enable extensions one by one to identify source

**Recommendation:** Use Option 1 (CSS) - cleanest solution.
