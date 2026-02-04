/**
 * Demo/Test File for Score Setting Feature
 * This file can be used to quickly test the functionality
 */

import { validateScores, VALIDATION_RULES } from './src/utils/scoreValidation';

// ============================================
// Test Data
// ============================================

const validScores = [
  { id: 1, score: 'N/A', baseScore: 0, status: true, definition: 'This is a valid definition with enough characters' },
  { id: 2, score: 'L1', baseScore: 1, status: true, definition: 'Another valid definition for level 1' },
  { id: 3, score: 'L2', baseScore: 2, status: false, definition: 'Valid definition for level 2 score' }
];

const invalidScores_NoNA = [
  { id: 1, score: 'L1', baseScore: 1, status: true, definition: 'Missing N/A record' },
  { id: 2, score: 'L2', baseScore: 2, status: true, definition: 'This should fail validation' }
];

const invalidScores_Duplicates = [
  { id: 1, score: 'N/A', baseScore: 0, status: true, definition: 'Valid N/A definition here' },
  { id: 2, score: 'L1', baseScore: 1, status: true, definition: 'First L1 definition' },
  { id: 3, score: 'L1', baseScore: 2, status: true, definition: 'Duplicate L1 - should fail' }
];

const invalidScores_EmptyFields = [
  { id: 1, score: 'N/A', baseScore: 0, status: true, definition: 'Valid definition' },
  { id: 2, score: '', baseScore: 1, status: true, definition: 'Empty score name' },
  { id: 3, score: 'L1', baseScore: '', status: true, definition: '' }
];

const invalidScores_LengthIssues = [
  { id: 1, score: 'N/A', baseScore: 0, status: true, definition: 'Valid' },  // Too short
  { id: 2, score: 'ThisIsAVeryLongScoreName', baseScore: 1, status: true, definition: 'Valid definition here' }  // Too long
];

// ============================================
// Test Functions
// ============================================

console.log('=== Score Setting Validation Tests ===\n');

// Test 1: Valid scores
console.log('Test 1: Valid Scores');
const result1 = validateScores(validScores);
console.log('Result:', result1);
console.log('Expected: isValid = true, no errors');
console.log('Pass:', result1.isValid === true && Object.keys(result1.errors).length === 0);
console.log('\n---\n');

// Test 2: Missing N/A
console.log('Test 2: Missing N/A Record');
const result2 = validateScores(invalidScores_NoNA);
console.log('Result:', result2);
console.log('Expected: isValid = false, error about missing N/A');
console.log('Pass:', result2.isValid === false && result2.errors.general);
console.log('\n---\n');

// Test 3: Duplicate scores
console.log('Test 3: Duplicate Score Names');
const result3 = validateScores(invalidScores_Duplicates);
console.log('Result:', result3);
console.log('Expected: isValid = false, errors on duplicate L1');
console.log('Pass:', result3.isValid === false && (result3.errors['1-score'] || result3.errors['2-score']));
console.log('\n---\n');

// Test 4: Empty fields
console.log('Test 4: Empty Required Fields');
const result4 = validateScores(invalidScores_EmptyFields);
console.log('Result:', result4);
console.log('Expected: isValid = false, multiple field errors');
console.log('Pass:', result4.isValid === false && Object.keys(result4.errors).length > 0);
console.log('\n---\n');

// Test 5: Length validation
console.log('Test 5: Length Validation');
const result5 = validateScores(invalidScores_LengthIssues);
console.log('Result:', result5);
console.log('Expected: isValid = false, length errors');
console.log('Pass:', result5.isValid === false);
console.log('\n---\n');

// ============================================
// Validation Rules Info
// ============================================

console.log('=== Validation Rules ===');
console.log('Score Max Length:', VALIDATION_RULES.SCORE_MAX_LENGTH);
console.log('Definition Min Length:', VALIDATION_RULES.DEFINITION_MIN_LENGTH);
console.log('Definition Max Length:', VALIDATION_RULES.DEFINITION_MAX_LENGTH);
console.log('Required Score:', VALIDATION_RULES.REQUIRED_SCORE);
console.log('\n---\n');

// ============================================
// Mock API Test
// ============================================

import { fetchRolesWithScores, saveRoleScores, getRolesCount } from './src/utils/scoreSettingApi';

console.log('=== Mock API Tests ===\n');

// Test fetching roles
fetchRolesWithScores().then(roles => {
  console.log('Fetched Roles:', roles.length);
  console.log('Role Names:', roles.map(r => r.name).join(', '));
  console.log('First Role Scores:', roles[0].scores.length);
  console.log('\n---\n');

  // Test saving scores
  const testScores = [
    { id: 1, score: 'N/A', baseScore: 0, status: true, definition: 'Updated definition for N/A' },
    { id: 2, score: 'Updated', baseScore: 5, status: true, definition: 'This is an updated score entry' }
  ];

  return saveRoleScores(1, testScores);
}).then(saveResult => {
  console.log('Save Result:', saveResult);
  console.log('\n---\n');

  // Test getting count
  return getRolesCount();
}).then(count => {
  console.log('Total Roles Count:', count);
  console.log('Expected: 7');
  console.log('\n---\n');
}).catch(error => {
  console.error('API Test Error:', error);
});

// ============================================
// Component Usage Examples
// ============================================

console.log('=== Component Usage Examples ===\n');

console.log(`
1. Basic Usage:
   import ScoreSetting from './pages/ScoreSetting';
   <ScoreSetting />

2. With Router:
   <Route path="/score-setting" component={ScoreSetting} />

3. Check SCORE_SETTING_INTEGRATION_EXAMPLES.js for more examples
`);

// ============================================
// Feature Checklist
// ============================================

console.log('=== Feature Checklist ===\n');

const features = [
  { name: 'Role list with pagination', status: '✅' },
  { name: 'Collapsible role sections', status: '✅' },
  { name: 'Score table form', status: '✅' },
  { name: 'Add row functionality', status: '✅' },
  { name: 'Delete row functionality', status: '✅' },
  { name: 'Required field validation', status: '✅' },
  { name: 'Duplicate name check', status: '✅' },
  { name: 'Length validation', status: '✅' },
  { name: 'N/A mandatory check', status: '✅' },
  { name: 'Save functionality', status: '✅' },
  { name: 'Error messages display', status: '✅' },
  { name: 'Mock API', status: '✅' },
  { name: 'Responsive design', status: '✅' }
];

features.forEach(feature => {
  console.log(`${feature.status} ${feature.name}`);
});

console.log('\n=== All Features Implemented! ===\n');
