/**
 * ExportModal Component
 * Displays export progress with status, progress bar, and actions
 * Compatible with Ant Design v3
 */

import React from 'react'
import { Modal, Progress, Button, Alert, Spin, Icon } from 'antd'
import { EXPORT_STATUS } from '../../utils/mockExportApi'
import './ExportModal.css'

const ExportModal = ({
  visible,
  isExporting,
  status,
  progress,
  error,
  retryCount,
  fileName,
  isOnline,
  onCancel,
  maxRetries = 6
}) => {
  /**
   * Get status icon
   */
  const getStatusIcon = () => {
    if (!isOnline) {
      return <Icon type="wifi" style={{ fontSize: 48, color: '#faad14' }} />
    }

    switch (status) {
      case EXPORT_STATUS.PROCESSING:
        return <Spin indicator={<Icon type="loading" style={{ fontSize: 48 }} spin />} />
      case EXPORT_STATUS.SUCCESS:
        return <Icon type="check-circle" theme="filled" style={{ fontSize: 48, color: '#52c41a' }} />
      case EXPORT_STATUS.FAILED:
      case EXPORT_STATUS.CANCELLED:
        return <Icon type="close-circle" theme="filled" style={{ fontSize: 48, color: '#ff4d4f' }} />
      default:
        return <Icon type="loading" style={{ fontSize: 48 }} />
    }
  }

  /**
   * Get status title
   */
  const getStatusTitle = () => {
    if (!isOnline) {
      return 'Connection Lost'
    }

    switch (status) {
      case EXPORT_STATUS.PROCESSING:
        return 'Exporting Data...'
      case EXPORT_STATUS.SUCCESS:
        return 'Export Completed!'
      case EXPORT_STATUS.FAILED:
        return 'Export Failed'
      case EXPORT_STATUS.CANCELLED:
        return 'Export Cancelled'
      default:
        return 'Preparing Export...'
    }
  }

  /**
   * Get status description
   */
  const getStatusDescription = () => {
    if (!isOnline) {
      return 'Network connection lost. Export will resume when connection is restored.'
    }

    switch (status) {
      case EXPORT_STATUS.PROCESSING:
        return `Processing your export request. This may take a few moments... (Attempt ${retryCount}/${maxRetries})`
      case EXPORT_STATUS.SUCCESS:
        return fileName 
          ? `File "${fileName}" has been downloaded successfully.`
          : 'Your export file has been downloaded successfully.'
      case EXPORT_STATUS.FAILED:
        return error || 'An error occurred during export. Please try again.'
      case EXPORT_STATUS.CANCELLED:
        return 'The export operation was cancelled.'
      default:
        return 'Initialiing export...'
    }
  }

  /**
   * Get progress status
   */
  const getProgressStatus = () => {
    if (!isOnline) {
      return 'exception'
    }

    switch (status) {
      case EXPORT_STATUS.SUCCESS:
        return 'success'
      case EXPORT_STATUS.FAILED:
      case EXPORT_STATUS.CANCELLED:
        return 'exception'
      default:
        return 'active'
    }
  }

  /**
   * Show cancel button
   */
  const showCancelButton = () => {
    return isExporting && status === EXPORT_STATUS.PROCESSING && isOnline
  }

  /**
   * Show close button
   */
  const showCloseButton = () => {
    return (
      status === EXPORT_STATUS.SUCCESS ||
      status === EXPORT_STATUS.FAILED ||
      status === EXPORT_STATUS.CANCELLED ||
      !isOnline
    )
  }

  return (
    <Modal
      visible={visible}
      title={null}
      footer={null}
      closable={status !== EXPORT_STATUS.PROCESSING}
      onCancel={onCancel}
      maskClosable={false}
      centered
      width={500}
      className="export-modal"
    >
      <div className="export-modal-content">
        {/* Status Icon */}
        <div className="export-modal-icon">
          {getStatusIcon()}
        </div>

        {/* Status Title */}
        <h2 className="export-modal-title">
          {getStatusTitle()}
        </h2>

        {/* Status Description */}
        <p className="export-modal-description">
          {getStatusDescription()}
        </p>

        {/* Progress Bar */}
        {(isExporting || status === EXPORT_STATUS.PROCESSING) && (
          <div className="export-modal-progress">
            <Progress
              percent={progress}
              status={getProgressStatus()}
            />
          </div>
        )}

        {/* Error Alert */}
        {error && status !== EXPORT_STATUS.SUCCESS && (
          <Alert
            message="Error Details"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {/* Network Status Alert */}
        {!isOnline && (
          <Alert
            message="Offline Mode"
            description="The export will automatically resume when your internet connection is restored."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {/* Retry Warning */}
        {retryCount > 3 && status === EXPORT_STATUS.PROCESSING && isOnline && (
          <Alert
            message="Taking longer than expected"
            description={`This export is taking longer than usual. Will retry ${maxRetries - retryCount} more time(s).`}
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {/* Action Buttons */}
        <div className="export-modal-actions">
          {showCancelButton() && (
            <Button
              type="default"
              size="large"
              onClick={onCancel}
            >
              Cancel Export
            </Button>
          )}

          {showCloseButton() && (
            <Button
              type="primary"
              size="large"
              onClick={onCancel}
              icon={status === EXPORT_STATUS.SUCCESS ? 'check' : undefined}
            >
              {status === EXPORT_STATUS.SUCCESS ? 'Close' : 'Close'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ExportModal
