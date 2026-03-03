/**
 * Performance Score Setting Component
 * Main component for managing score settings with collapsible panels per role
 */

import React, { useCallback, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, Collapse, Pagination, Spin, message } from 'antd'
import PerformanceScoreSettingForm from './PerformanceScoreSettingForm'
import { useScoreData, useCollapseState, useSaveScoreConfiguration } from './hooks'
import { PAGINATION } from './constants'
import { PanelHeader, PanelHeaderTitle, Wrapper } from './PerformanceScoreSetting.styled'

const { Panel } = Collapse

const PerformanceScoreSetting = ({
  dataSource,
  pagination,
  onPageChange,
}) => {
  const formRefs = useRef({})
  const { scoreData, loadingMap, fetchScoreForRole } = useScoreData()
  const { saveLoadingMap, handleSave: saveConfiguration } = useSaveScoreConfiguration()
  
  const handlePanelOpen = useCallback((roleId) => {
    if (!scoreData[roleId]) {
      fetchScoreForRole(roleId)
    }
  }, [scoreData, fetchScoreForRole])

  const { activeKeys, handleCollapseChange } = useCollapseState(handlePanelOpen)

  const handleSave = useCallback(async (e, roleId) => {
    e.stopPropagation()
    
    const formRef = formRefs.current[roleId]
    if (!formRef) {
      message.error('Form reference not found')
      return
    }
    
    formRef.validate(async (error, validatedData) => {
      if (error) {
        message.error('Please fix validation errors before saving')
        return
      }
      
      const result = await saveConfiguration(roleId, validatedData)
      if (result.success) {
        // Optionally refresh score data after save
        fetchScoreForRole(roleId)
      }
    })
  }, [saveConfiguration, fetchScoreForRole])

  // Memoized panel renderer
  const renderPanel = useCallback((role) => {
    const isSaving = !!saveLoadingMap[role.id]
    const isLoading = !!loadingMap[role.id]

    return (
      <Panel
        key={role.id}
        header={
          <PanelHeader>
            <PanelHeaderTitle>{role.name}</PanelHeaderTitle>
            <Button
              type="primary"
              size="small"
              loading={isSaving}
              disabled={isSaving}
              onClick={(e) => handleSave(e, role.id)}
            >
              Save
            </Button>
          </PanelHeader>
        }
      >
        <Spin spinning={isLoading} tip="Loading scores...">
          <PerformanceScoreSettingForm
            wrappedComponentRef={ref => {
              if (ref) {
                formRefs.current[role.id] = ref
              }
            }}
            roleId={role.id}
            initialData={scoreData[role.id] || []}
          />
        </Spin>
      </Panel>
    )
  }, [saveLoadingMap, loadingMap, scoreData, handleSave])

  // Memoized panels list
  const panels = useMemo(() => {
    return dataSource.map(renderPanel)
  }, [dataSource, renderPanel])

  return (
    <Wrapper>
      <Collapse
        activeKey={activeKeys}
        onChange={handleCollapseChange}
        destroyInactivePanel
      >
        {panels}
      </Collapse>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Pagination
          current={pagination.pageNum}
          pageSize={PAGINATION.DEFAULT_PAGE_SIZE}
          total={pagination.total}
          onChange={onPageChange}
          hideOnSinglePage={!pagination.total}
          showSizeChanger={false}
          showQuickJumper={pagination.total > 50}
        />
      </div>
    </Wrapper>
  )
}

PerformanceScoreSetting.propTypes = {
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      code: PropTypes.string,
      description: PropTypes.string,
    })
  ).isRequired,
  pagination: PropTypes.shape({
    pageNum: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
  onPageChange: PropTypes.func.isRequired,
}

export default React.memo(PerformanceScoreSetting)
