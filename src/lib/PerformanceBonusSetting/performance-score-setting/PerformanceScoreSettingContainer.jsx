/**
 * Performance Score Setting Container
 * Manages data fetching and state for the performance score setting module
 */

import { memo } from 'react'
import { Spin } from 'antd'
import PerformanceScoreSetting from './PerformanceScoreSetting'
import { useRolesPagination } from './hooks'
import { UI } from './constants'

const PerformanceScoreSettingContainer = () => {
  const {
    roles,
    pagination,
    loading,
    handlePageChange,
  } = useRolesPagination()

  return (
    <Spin spinning={loading} tip="Loading roles...">
      <div style={{ minHeight: loading ? UI.MIN_SPIN_HEIGHT : 0 }}>
        {!loading && (
          <PerformanceScoreSetting
            dataSource={roles}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </Spin>
  )
}

export default memo(PerformanceScoreSettingContainer)
