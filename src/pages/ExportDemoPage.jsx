/**
 * ExportDemoPage
 * Demonstrates export functionality with polling, retries, and status handling
 * Compatible with Ant Design v3
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Card,
  Button,
  Form,
  DatePicker,
  Select,
  Row,
  Col,
  Divider,
  Tag,
  Typography,
  Alert,
  Statistic,
  Badge,
  Icon
} from 'antd'
import moment from 'moment'
import { useExportFile } from '../hooks/useExportFile'
import ExportModal from '../components/ExportModal'
import { EXPORT_STATUS } from '../utils/mockExportApi'
import './ExportDemoPage.css'

const { RangePicker } = DatePicker
const { Option } = Select
const { Title, Text, Paragraph } = Typography

/**
 * ExportDemoPage Component
 */
const ExportDemoPage = ({ form }) => {
  const [showModal, setShowModal] = useState(false)
  const autoCloseTimerRef = useRef(null)
  const prevStatusRef = useRef(null)
  const prevIsExportingRef = useRef(false)
  
  const exportHook = useExportFile()
  const { getFieldDecorator } = form
  const {
    isExporting,
    exportId,
    status,
    progress,
    error,
    retryCount,
    fileName,
    isOnline
  } = exportHook

  /**
   * Show modal on mount if export is active
   */
  useEffect(() => {
    if (isExporting || status) {
      setShowModal(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  /**
   * Watch for export status changes
   */
  useEffect(() => {
    const prevStatus = prevStatusRef.current
    const prevIsExporting = prevIsExportingRef.current

    // Show modal when export starts
    if (isExporting && !prevIsExporting) {
      setShowModal(true)
    }

    // Show modal for FAILED or CANCELLED status
    if (
      (status === EXPORT_STATUS.FAILED || status === EXPORT_STATUS.CANCELLED) &&
      prevStatus !== status
    ) {
      setShowModal(true)
    }
    
    // Show modal for SUCCESS status
    if (status === EXPORT_STATUS.SUCCESS && prevStatus !== EXPORT_STATUS.SUCCESS) {
      setShowModal(true)
    }

    // Update refs
    prevStatusRef.current = status
    prevIsExportingRef.current = isExporting
  }, [isExporting, status])

  /**
   * Cleanup timer on unmount
   */
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
    }
  }, [])

  /**
   * Handle export form submit
   */
  const handleExport = () => {
    form.validateFields(async (err, values) => {
      if (!err) {
        const params = {
          dateRange: values.dateRange
            ? [
                values.dateRange[0].format('YYYY-MM-DD'),
                values.dateRange[1].format('YYYY-MM-DD')
              ]
            : null,
          department: values.department,
          status: values.status,
          exportType: values.exportType
        }

        await exportHook.startExport(params)
      }
    })
  }

  /**
   * Handle modal close/cancel
   */
  const handleModalClose = () => {
    // Clear auto-close timer if exists
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current)
      autoCloseTimerRef.current = null
    }

    // If currently processing, cancel the export
    if (isExporting && status === EXPORT_STATUS.PROCESSING) {
      exportHook.cancelExport()
    }
    
    // Close the modal for all statuses
    setShowModal(false)
  }

  /**
   * Get status color for Tag display
   */
  const getStatusColor = () => {
    switch (status) {
      case EXPORT_STATUS.PROCESSING:
        return 'blue'
      case EXPORT_STATUS.SUCCESS:
        return 'green'
      case EXPORT_STATUS.FAILED:
        return 'red'
      case EXPORT_STATUS.CANCELLED:
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <div className="export-demo-page">
      <div className="export-demo-header">
        <Title level={2}>
          <Icon type="file-excel" /> Export Data Demo
        </Title>
        <Paragraph type="secondary">
          This page demonstrates a robust export system with polling, retry mechanism,
          and offline support. Configure your export settings below and click export.
        </Paragraph>
      </div>

      <Row gutter={24}>
        {/* Export Form */}
        <Col xs={24} lg={16}>
          <Card
            title="Export Configuration"
            extra={
              <Badge status={isOnline ? 'success' : 'error'} text={isOnline ? 'Online' : 'Offline'} />
            }
          >
            <Form layout="vertical">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Date Range">
                    {getFieldDecorator('dateRange', {
                      initialValue: [moment().subtract(30, 'days'), moment()],
                      rules: [{ required: true, message: 'Please select date range' }]
                    })(
                      <RangePicker style={{ width: '100%' }} />
                    )}
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Department">
                    {getFieldDecorator('department', {
                      initialValue: 'all',
                      rules: [{ required: true, message: 'Please select department' }]
                    })(
                      <Select>
                        <Option value="all">All Departments</Option>
                        <Option value="sales">Sales</Option>
                        <Option value="marketing">Marketing</Option>
                        <Option value="engineering">Engineering</Option>
                        <Option value="hr">Human Resources</Option>
                      </Select>
                    )}
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Status Filter">
                    {getFieldDecorator('status', {
                      initialValue: 'all',
                      rules: [{ required: true, message: 'Please select status' }]
                    })(
                      <Select>
                        <Option value="all">All Status</Option>
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                        <Option value="pending">Pending</Option>
                      </Select>
                    )}
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Export Type">
                    {getFieldDecorator('exportType', {
                      initialValue: 'detailed',
                      rules: [{ required: true, message: 'Please select export type' }]
                    })(
                      <Select>
                        <Option value="summary">Summary Report</Option>
                        <Option value="detailed">Detailed Report</Option>
                        <Option value="raw">Raw Data</Option>
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Form.Item>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    type="primary"
                    size="large"
                    icon="download"
                    onClick={handleExport}
                    loading={isExporting && status === EXPORT_STATUS.PROCESSING}
                    disabled={!isOnline || isExporting}
                  >
                    {isExporting ? 'Exporting...' : 'Export to Excel'}
                  </Button>

                  <Button
                    icon="reload"
                    onClick={() => form.resetFields()}
                  >
                    Reset
                  </Button>
                </div>
              </Form.Item>
            </Form>

            {/* Information Alert */}
            <Alert
              message="How it works"
              description={
                <div>
                  <p>1. Click "Export to Excel" to start the export process</p>
                  <p>2. A modal will show the export progress</p>
                  <p>3. The system polls the server every 3 seconds (max 6 attempts)</p>
                  <p>4. File automatically downloads when ready</p>
                  <p>5. Old incomplete exports are cleaned up on page reload</p>
                </div>
              }
              type="info"
              icon={<Icon type="info-circle" />}
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>

        {/* Status Panel */}
        <Col xs={24} lg={8}>
          <Card title="Export Status" className="status-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Current Status */}
              <div>
                <Text type="secondary">Current Status</Text>
                <div style={{ marginTop: 8 }}>
                  {status ? (
                    <Tag color={getStatusColor()} style={{ fontSize: 14, padding: '4px 12px' }}>
                      {status}
                    </Tag>
                  ) : (
                    <Tag>No active export</Tag>
                  )}
                </div>
              </div>

              {/* Export ID */}
              {exportId && (
                <div>
                  <Text type="secondary">Export ID</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text code style={{ fontSize: 12 }}>
                      {exportId}
                    </Text>
                  </div>
                </div>
              )}

              <Divider style={{ margin: 0 }} />

              {/* Statistics */}
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Progress"
                    value={progress}
                    suffix="%"
                    valueStyle={{ color: progress === 100 ? '#3f8600' : '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Retries"
                    value={retryCount}
                    suffix="/ 6"
                    valueStyle={{ color: retryCount > 3 ? '#cf1322' : '#1890ff' }}
                  />
                </Col>
              </Row>

              {/* File Name */}
              {fileName && (
                <>
                  <Divider style={{ margin: 0 }} />
                  <div>
                    <Text type="secondary">Downloaded File</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text strong style={{ fontSize: 12 }}>
                        {fileName}
                      </Text>
                    </div>
                  </div>
                </>
              )}

              {/* Error Message */}
              {error && status !== EXPORT_STATUS.SUCCESS && (
                <>
                  <Divider style={{ margin: 0 }} />
                  <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ fontSize: 12 }}
                  />
                </>
              )}

              {/* Network Status */}
              <Divider style={{ margin: 0 }} />
              <div>
                <Text type="secondary">Network Status</Text>
                <div style={{ marginTop: 8 }}>
                  <Badge
                    status={isOnline ? 'success' : 'error'}
                    text={isOnline ? 'Connected' : 'Disconnected'}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Test Scenarios */}
          <Card title="Test Scenarios" style={{ marginTop: 16 }} size="small">
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Try these scenarios:
              </Text>
              <ul style={{ fontSize: 12, margin: '8px 0', paddingLeft: 20 }}>
                <li>Normal export (90% success rate)</li>
                <li>Reload page during export (old jobs cleaned up)</li>
                <li>Disable network to test offline mode</li>
                <li>Wait for timeout (after 6 retries)</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Export Modal */}
      <ExportModal
        visible={showModal}
        isExporting={isExporting}
        status={status}
        progress={progress}
        error={error}
        retryCount={retryCount}
        fileName={fileName}
        isOnline={isOnline}
        onCancel={handleModalClose}
      />
    </div>
  )
}

export default Form.create()(ExportDemoPage)
