/**
 * Performance Bonus Setting - Mock API Usage Examples
 * 
 * This file contains practical examples of how to use the mock API.
 * You can use these patterns in your components.
 */

import {
  Request,
  resetMockData,
  getMockData,
  updateMockConfig,
} from './performanceBonusApiConfig'

// ============================================================================
// Example 1: Fetch Roles with Pagination
// ============================================================================

export const exampleFetchRoles = async () => {
  try {
    const response = await Request(
      { url: '/ranking/get-all-roles', method: 'get' },
      { pageNum: 1, pageSize: 10 }
    )

    if (response.status === 200) {
      console.log('✅ Roles fetched:', response.data.roles)
      console.log('📊 Total roles:', response.data.total)
      return response.data
    } else {
      console.error('❌ Error:', response.message)
      return null
    }
  } catch (error) {
    console.error('❌ Network error:', error.message)
    return null
  }
}

// ============================================================================
// Example 2: Fetch Score Levels for a Role
// ============================================================================

export const exampleFetchScoreLevels = async (roleId) => {
  try {
    const response = await Request(
      { url: '/ranking/get-score-level-by-role', method: 'get' },
      { roleId }
    )

    if (response.status === 200) {
      console.log(`✅ Score levels for role ${roleId}:`, response.data)
      return response.data
    } else {
      console.error('❌ Error:', response.message)
      return []
    }
  } catch (error) {
    console.error('❌ Network error:', error.message)
    return []
  }
}

// ============================================================================
// Example 3: Complete Save Workflow (Create, Update, Delete)
// ============================================================================

export const exampleSaveScoreConfiguration = async (roleId) => {
  try {
    // Prepare data
    const configData = {
      roleId,
      
      // Create new score levels
      requestCreateData: [
        {
          projectRoleId: roleId,
          level: 'S',
          baseScore: 100,
          status: true,
          description: 'Supreme performance',
        },
      ],
      
      // Update existing score levels
      requestUpdateData: [
        {
          scoreId: 101,
          projectRoleId: roleId,
          level: 'A+',
          baseScore: 98,
          status: true,
          description: 'Outstanding - updated',
        },
      ],
      
      // Delete score levels
      requestDeleteData: [
        {
          scoreId: 108,
          projectRoleId: roleId,
        },
      ],
    }

    const response = await Request(
      { url: '/ranking/save-criteria-by-role', method: 'post' },
      configData
    )

    if (response.status === 200) {
      console.log('✅ Configuration saved successfully!')
      console.log('📝 Created:', response.data.totalCreated)
      console.log('📝 Updated:', response.data.totalUpdated)
      console.log('📝 Deleted:', response.data.totalDeleted)
      return response.data
    } else {
      console.error('❌ Error:', response.message)
      return null
    }
  } catch (error) {
    console.error('❌ Network error:', error.message)
    return null
  }
}

// ============================================================================
// Example 4: Test with Error Simulation
// ============================================================================

export const exampleTestErrorHandling = async () => {
  console.log('🧪 Testing error handling...')

  // Enable 50% error rate for testing
  updateMockConfig({ ERROR_RATE: 0.5 })

  const attempts = 5
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < attempts; i++) {
    try {
      const response = await Request(
        { url: '/ranking/get-all-roles', method: 'get' },
        { pageNum: 1, pageSize: 10 }
      )

      if (response.status === 200) {
        successCount++
        console.log(`✅ Attempt ${i + 1}: Success`)
      }
    } catch (error) {
      errorCount++
      console.log(`❌ Attempt ${i + 1}: Error - ${error.message}`)
    }
  }

  console.log(`📊 Results: ${successCount} success, ${errorCount} errors`)

  // Reset error rate
  updateMockConfig({ ERROR_RATE: 0 })
}

// ============================================================================
// Example 5: Disable Network Delay for Fast Testing
// ============================================================================

export const exampleFastTesting = async () => {
  console.log('⚡ Fast mode enabled...')

  // Disable delay
  updateMockConfig({ SIMULATE_DELAY: false })

  const startTime = Date.now()
  
  await Request(
    { url: '/ranking/get-all-roles', method: 'get' },
    { pageNum: 1, pageSize: 10 }
  )
  
  const duration = Date.now() - startTime
  console.log(`⏱️ Request took ${duration}ms (should be ~0ms)`)

  // Re-enable delay
  updateMockConfig({ SIMULATE_DELAY: true, MIN_DELAY: 300, MAX_DELAY: 800 })
}

// ============================================================================
// Example 6: Reset and View Mock Data
// ============================================================================

export const exampleResetAndViewData = () => {
  console.log('🔄 Resetting mock data...')
  
  resetMockData()
  
  const data = getMockData()
  console.log('📊 Current mock data:')
  console.log('   Roles:', data.roles.length)
  console.log('   Score levels by role:', Object.keys(data.scoreLevels).length)
  
  return data
}

// ============================================================================
// Example 7: Component Usage Pattern
// ============================================================================

/**
 * Example React component using mock API
 */
export const ExampleComponent = () => {
  // This is just a demonstration, not a full component
  
  const fetchData = async () => {
    try {
      // Fetch roles
      const rolesResponse = await Request(
        { url: '/ranking/get-all-roles', method: 'get' },
        { pageNum: 1, pageSize: 10 }
      )

      if (rolesResponse.status !== 200) {
        throw new Error(rolesResponse.message)
      }

      const roles = rolesResponse.data.roles

      // Fetch score levels for first role
      if (roles.length > 0) {
        const scoreResponse = await Request(
          { url: '/ranking/get-score-level-by-role', method: 'get' },
          { roleId: roles[0].id }
        )

        if (scoreResponse.status === 200) {
          console.log('Score levels:', scoreResponse.data)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return { fetchData }
}

// ============================================================================
// Example 8: Pagination Helper
// ============================================================================

export const examplePaginationWorkflow = async () => {
  console.log('📄 Testing pagination...')

  const pageSize = 5
  let pageNum = 1
  let hasMore = true
  let allRoles = []

  while (hasMore) {
    const response = await Request(
      { url: '/ranking/get-all-roles', method: 'get' },
      { pageNum, pageSize }
    )

    if (response.status === 200) {
      const { roles, total } = response.data
      allRoles = allRoles.concat(roles)
      
      console.log(`📄 Page ${pageNum}: ${roles.length} roles`)
      
      hasMore = allRoles.length < total
      pageNum++
    } else {
      hasMore = false
    }
  }

  console.log(`✅ Fetched all ${allRoles.length} roles`)
  return allRoles
}

// ============================================================================
// Example 9: Build Diff Payload (for save operations)
// ============================================================================

export const exampleBuildDiffPayload = () => {
  // Example showing how to build diff payload structure
  // In real usage, you would compare baseline (server data) with current (form data)
  
  /* Example baseline data (from server):
  const baseline = [
    { scoreId: 101, level: 'A', baseScore: 90, status: true, description: 'Excellent' },
    { scoreId: 102, level: 'B', baseScore: 80, status: true, description: 'Good' },
    { scoreId: 103, level: 'C', baseScore: 70, status: true, description: 'Average' },
  ]

  Example current data (from form):
  const current = [
    { scoreId: 101, level: 'A+', baseScore: 95, status: true, description: 'Outstanding' }, // Modified
    { scoreId: 102, level: 'B', baseScore: 80, status: true, description: 'Good' }, // No change
    // 103 removed
    { scoreId: 'tmp-1', level: 'D', baseScore: 60, status: false, description: 'Poor' }, // New
  ]
  */

  const diff = {
    roleId: 1,
    requestCreateData: [
      { projectRoleId: 1, level: 'D', baseScore: 60, status: false, description: 'Poor' },
    ],
    requestUpdateData: [
      { scoreId: 101, projectRoleId: 1, level: 'A+', baseScore: 95, status: true, description: 'Outstanding' },
    ],
    requestDeleteData: [
      { scoreId: 103, projectRoleId: 1 },
    ],
  }

  console.log('📝 Diff payload:', diff)
  return diff
}

// ============================================================================
// Run All Examples (for testing)
// ============================================================================

export const runAllExamples = async () => {
  console.log('🚀 Running all mock API examples...\n')

  console.log('--- Example 1: Fetch Roles ---')
  await exampleFetchRoles()
  console.log('\n')

  console.log('--- Example 2: Fetch Score Levels ---')
  await exampleFetchScoreLevels(1)
  console.log('\n')

  console.log('--- Example 3: Save Configuration ---')
  await exampleSaveScoreConfiguration(1)
  console.log('\n')

  console.log('--- Example 6: Reset and View Data ---')
  exampleResetAndViewData()
  console.log('\n')

  console.log('--- Example 8: Pagination Workflow ---')
  await examplePaginationWorkflow()
  console.log('\n')

  console.log('✅ All examples completed!')
}

// ============================================================================
// Export for use in browser console
// ============================================================================

if (typeof window !== 'undefined') {
  window.mockApiExamples = {
    exampleFetchRoles,
    exampleFetchScoreLevels,
    exampleSaveScoreConfiguration,
    exampleTestErrorHandling,
    exampleFastTesting,
    exampleResetAndViewData,
    examplePaginationWorkflow,
    exampleBuildDiffPayload,
    runAllExamples,
  }
  
  console.log('💡 Mock API examples available at: window.mockApiExamples')
  console.log('   - Try: window.mockApiExamples.runAllExamples()')
}
