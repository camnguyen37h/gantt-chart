# Code Review Checklist - Timeline Library

## Pre-Commit Checklist

### ✅ Code Quality
- [ ] No `console.log` statements (use proper logging in dev mode only)
- [ ] No commented-out code
- [ ] No TODO comments without ticket references
- [ ] No hard-coded values (use constants)
- [ ] No magic numbers (explain with constants)
- [ ] Consistent code formatting
- [ ] Meaningful variable/function names
- [ ] No unused imports or variables

### ✅ React Best Practices
- [ ] Components wrapped in `React.memo` where appropriate
- [ ] Expensive calculations use `useMemo`
- [ ] Event handlers use `useCallback`
- [ ] Props have PropTypes defined
- [ ] No inline object/array creation in render
- [ ] Keys provided for all list items
- [ ] No array index as key (unless truly static)
- [ ] Proper dependency arrays in hooks

### ✅ Performance
- [ ] No unnecessary re-renders (check with React DevTools)
- [ ] Large lists virtualized if needed
- [ ] Images optimized and lazy-loaded
- [ ] Debounced search/filter inputs
- [ ] Memoized filter/sort operations
- [ ] No memory leaks (cleanup in useEffect)

### ✅ Data Structure
- [ ] Items use consistent structure
- [ ] Milestones use `status: 'No Plan'` pattern
- [ ] Milestone dates properly wrapped (±1 day)
- [ ] No redundant flags (isMilestone, color, resource)
- [ ] Status field always present
- [ ] Required fields validated

### ✅ Error Handling
- [ ] Input validation in place
- [ ] Null/undefined checks
- [ ] Try-catch for async operations
- [ ] User-friendly error messages
- [ ] Graceful degradation
- [ ] Console warnings for dev

### ✅ Accessibility
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation supported
- [ ] Focus indicators visible
- [ ] Color contrast ratios met (WCAG AA)
- [ ] Screen reader tested
- [ ] Semantic HTML used

### ✅ CSS/Styling
- [ ] BEM naming convention
- [ ] No inline styles (except dynamic)
- [ ] Responsive breakpoints tested
- [ ] Mobile-friendly
- [ ] Print styles if applicable
- [ ] CSS variables for theming
- [ ] No hardcoded colors

### ✅ Documentation
- [ ] README updated
- [ ] PropTypes documented
- [ ] Complex logic commented
- [ ] API changes documented
- [ ] Migration guide if breaking changes
- [ ] Examples provided

### ✅ Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Edge cases covered
- [ ] Performance benchmarked
- [ ] Cross-browser tested

## SonarLint Compliance

### Critical Issues (Must Fix)
- [ ] No security vulnerabilities
- [ ] No null pointer exceptions
- [ ] No resource leaks
- [ ] No SQL injection risks
- [ ] No XSS vulnerabilities

### Major Issues (Should Fix)
- [ ] No code duplication > 5 lines
- [ ] No functions > 50 lines
- [ ] No files > 500 lines
- [ ] Cyclomatic complexity < 10
- [ ] No deeply nested blocks (< 4 levels)

### Minor Issues (Nice to Fix)
- [ ] No empty catch blocks
- [ ] No unused parameters
- [ ] No unnecessary else
- [ ] Consistent naming conventions
- [ ] No abbreviations in names

## Timeline-Specific Checks

### Item Type Detection
- [ ] Uses `getItemType()` function
- [ ] Checks `status === 'No Plan'` for milestones
- [ ] No hardcoded type checks scattered
- [ ] Consistent across all components

### Color Management
- [ ] Colors derived from status
- [ ] Uses `getDefaultItemColor()` utility
- [ ] No color properties in data
- [ ] Status colors in constants/legend

### Milestone Rendering
- [ ] 20px circle size
- [ ] Centered with `translateX(-10px)`
- [ ] Inner dot 6px
- [ ] Border 3px white
- [ ] Label positioned correctly

### Filter Chain
- [ ] Resource filter applied first
- [ ] Legend visibility filter second
- [ ] All filters memoized
- [ ] Filter state managed correctly

### Performance Benchmarks
For 100 items:
- [ ] Initial render < 200ms
- [ ] Filter change < 50ms
- [ ] Scroll at 60 FPS
- [ ] Search response < 100ms

## Review Levels

### 🔴 Level 1: Self Review (Required)
Before creating PR:
- Run through entire checklist
- Fix all critical issues
- Test manually
- Update documentation

### 🟡 Level 2: Peer Review (Required)
Another developer checks:
- Code quality and style
- Logic correctness
- Performance considerations
- Test coverage

### 🟢 Level 3: Senior Review (For Major Changes)
Senior developer checks:
- Architecture decisions
- Breaking changes
- API design
- Long-term maintainability

## Common Issues Found in Reviews

### 1. Missing Memoization
```javascript
// ❌ Bad
<Timeline config={{ viewMode: 'months' }} />

// ✅ Good
const config = useMemo(() => ({ viewMode: 'months' }), []);
<Timeline config={config} />
```

### 2. Inline Functions
```javascript
// ❌ Bad
<button onClick={() => handleClick(item)}>Click</button>

// ✅ Good
const onClick = useCallback(() => handleClick(item), [item]);
<button onClick={onClick}>Click</button>
```

### 3. Missing PropTypes
```javascript
// ❌ Bad
const MyComponent = ({ item, onClick }) => { ... };

// ✅ Good
MyComponent.propTypes = {
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func
};
```

### 4. Incorrect Dependency Arrays
```javascript
// ❌ Bad
useEffect(() => {
  fetchData(itemId);
}, []); // Missing itemId

// ✅ Good
useEffect(() => {
  fetchData(itemId);
}, [itemId]);
```

### 5. Mutating State
```javascript
// ❌ Bad
const handleToggle = (status) => {
  visibleStatuses[status] = !visibleStatuses[status];
  setVisibleStatuses(visibleStatuses);
};

// ✅ Good
const handleToggle = (status) => {
  setVisibleStatuses(prev => ({
    ...prev,
    [status]: !prev[status]
  }));
};
```

## Approval Criteria

### Must Have (Blocking)
- ✅ No SonarLint critical/major issues
- ✅ All tests passing
- ✅ Manual testing completed
- ✅ PropTypes defined
- ✅ No console.log in production

### Should Have (Non-blocking but noted)
- ✅ Documentation updated
- ✅ Performance benchmarked
- ✅ Accessibility tested
- ✅ Mobile responsive

### Nice to Have
- ✅ Unit test coverage > 80%
- ✅ Integration tests added
- ✅ Examples in Storybook
- ✅ Performance profiled

## Post-Merge Checklist

- [ ] PR merged to main
- [ ] CI/CD pipeline passed
- [ ] Deployed to staging
- [ ] QA sign-off
- [ ] Documentation published
- [ ] Team notified of changes
- [ ] Monitoring dashboards checked

## Emergency Hotfix Checklist

For production issues:
- [ ] Issue identified and isolated
- [ ] Fix implemented and tested
- [ ] Minimal change scope
- [ ] Rollback plan ready
- [ ] Fast-track review (2 approvers minimum)
- [ ] Deploy to staging first
- [ ] Monitor logs after deploy
- [ ] Create follow-up ticket for proper fix

## Tools

### Recommended Tools
- ESLint + Prettier
- SonarLint (VS Code extension)
- React DevTools
- Chrome DevTools Performance
- Lighthouse (accessibility)
- Bundle analyzer

### Commands
```bash
# Lint check
npm run lint

# Format code
npm run format

# Run tests
npm test

# Build production
npm run build

# Analyze bundle
npm run analyze
```

## Sign-Off

### Reviewer
- Name: _________________
- Date: _________________
- Approval: ☐ Approved ☐ Changes Requested ☐ Rejected

### Comments
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

**Version:** 2.0.0  
**Last Updated:** January 2026  
**Maintained By:** CMC Development Team
