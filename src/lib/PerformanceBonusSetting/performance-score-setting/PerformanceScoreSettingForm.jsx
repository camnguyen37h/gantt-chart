import {
  Checkbox,
  Form,
  Input
} from 'antd'
import PropTypes from 'prop-types'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react'
import {
  MESSAGES,
  UI,
  VALIDATION,
} from './constants'
import {
  buildFieldName,
  generateTempId,
  isNAScore,
} from './helpers'
import {
  MinusIcon,
  PlusIcon,
  ScoreHeader,
  StyledInputNumber,
  StyledTable,
} from './PerformanceScoreSetting.styled'

/**
 * Performance Score Setting Form Component
 * 
 * Manages dynamic form with score levels, including:
 * - Add/remove score rows
 * - Validate unique score names
 * - Handle N/A score (immutable, always at top)
 * - Form validation and data collection
 * 
 * @component
 */
const PerformanceScoreSettingForm = Form.create()(forwardRef(({
  form,
  roleId,
  initialData,
}, ref) => {
  const { getFieldDecorator, validateFields, getFieldValue } = form
  const [rows, setRows] = useState([])

  // Initialize rows from initialData, ensuring N/A score is always first
  useEffect(() => {
    const normalizedData = (initialData || []).map((record, index) => ({
      scoreId: record.scoreId || `${roleId}-${index}-${Date.now()}`,
      level: record.level != null ? String(record.level) : record.score || '',
      baseScore: Number(record.baseScore != null ? record.baseScore : record.base_score || 0),
      status: !!record.status,
      description: record.description || '',
    }))
    
    const naScore = normalizedData.find(isNAScore)
    const otherScores = normalizedData.filter(score => !isNAScore(score))
    
    setRows(naScore ? [naScore, ...otherScores] : otherScores)
  }, [initialData, roleId])

  /**
   * Add a new score row
   * New rows are inserted after N/A score (if exists) but before other scores
   */
  const addRow = useCallback(() => {
    const newRow = {
      scoreId: generateTempId(),
      projectRoleId: roleId,
      level: '',
      baseScore: null,
      status: false,
      description: '',
    }
    
    setRows(previousRows => {
      const hasNAScore = previousRows.length && isNAScore(previousRows[0])
      const naScoreRow = hasNAScore ? [previousRows[0]] : []
      const regularRows = hasNAScore ? previousRows.slice(1) : previousRows
      
      return [...naScoreRow, ...regularRows, newRow]
    })
  }, [roleId])

  /**
   * Remove a score row by ID
   * N/A score rows cannot be removed
   */
  const removeById = useCallback(scoreId => {
    setRows(previousRows => {
      const targetRow = previousRows.find(row => row.scoreId === scoreId)
      
      // Prevent deletion if row doesn't exist or is N/A score
      if (!targetRow || isNAScore(targetRow)) {
        return previousRows
      }
      
      return previousRows.filter(row => row.scoreId !== scoreId)
    })
  }, [])

  /**
   * Validate that score level is unique within the role
   * @param {string|number} selfId - The ID of the row being validated
   * @returns {Function} Validator function for Ant Design Form
   */
  const uniqueLevelValidator = useCallback(
    selfId => (rule, value, callback) => {
      const trimmedValue = (value || '').trim()
      if (!trimmedValue) return callback()
      
      if (trimmedValue.toUpperCase() === 'N/A') {
        return callback(MESSAGES.ERROR.NA_NOT_ALLOWED)
      }
      
      const existingLevels = rows.map(row => ({
        id: row.scoreId,
        value:
          (getFieldValue(buildFieldName(row.scoreId, 'level')) !== undefined
            ? getFieldValue(buildFieldName(row.scoreId, 'level'))
            : row.level) || '',
      }))
      
      const isDuplicate = existingLevels.some(
        item => item.id !== selfId && item.value === trimmedValue
      )
      
      return isDuplicate ? callback(MESSAGES.ERROR.DUPLICATE_SCORE) : callback()
    },
    [rows, getFieldValue]
  )

  /**
   * Expose validate method to parent component via ref
   * Validates all fields and returns cleaned data
   */
  useImperativeHandle(
    ref,
    () => ({
      validate: callback => {
        validateFields(error => {
          if (error) return callback(error)
          
          const cleanedRows = rows.map(row => ({
            scoreId: row.scoreId,
            projectRoleId: roleId,
            level: getFieldValue(buildFieldName(row.scoreId, 'level')),
            baseScore:
              Number(getFieldValue(buildFieldName(row.scoreId, 'baseScore'))) || 0,
            status: !!getFieldValue(buildFieldName(row.scoreId, 'status')),
            description:
              getFieldValue(buildFieldName(row.scoreId, 'description')) || '',
          }))
          
          callback(null, { roleId, rows: cleanedRows })
        })
      },
    }),
    [rows, roleId, getFieldValue, validateFields]
  )

  /**
   * Handle keyboard input for numeric fields
   * Only allows numbers, dots, and navigation keys
   */
  const handleNumericKeyDown = useCallback((event) => {
    const isNumberOrDot = /[0-9.]/.test(event.key)
    const isAllowedKey = UI.ALLOWED_KEYS.includes(event.key)
    
    if (!isNumberOrDot && !isAllowedKey) {
      event.preventDefault()
    }
  }, [])

  /**
   * Define table columns with inline editing capabilities
   */
  const columns = useMemo(
    () => [
      {
        title: (
          <ScoreHeader>
            <PlusIcon onClick={addRow} />
            <span>Score</span>
          </ScoreHeader>
        ),
        dataIndex: 'level',
        key: 'level',
        width: UI.COLUMN_WIDTH.SCORE,
        render: (text, row) => {
          const isNA = isNAScore(row)
          const fieldName = buildFieldName(row.scoreId, 'level')
          return (
            <div style={UI.SCORE_ROW_STYLE}>
              <MinusIcon
                disabled={isNA}
                onClick={() => !isNA && removeById(row.scoreId)}
                title={isNA ? MESSAGES.TOOLTIP.DELETE_NA : MESSAGES.TOOLTIP.DELETE}
              />
              <Form.Item style={UI.FORM_ITEM_FLEX_STYLE}>
                {getFieldDecorator(fieldName, {
                  initialValue: row.level,
                  validateFirst: true,
                  rules: isNA
                    ? []
                    : [
                        {
                          required: true,
                          message: MESSAGES.ERROR.REQUIRED_SCORE,
                        },
                        {
                          pattern: VALIDATION.SCORE_PATTERN,
                          message: MESSAGES.ERROR.INVALID_SCORE,
                        },
                        {
                          max: VALIDATION.MAX_LENGTH,
                          message: MESSAGES.ERROR.MAX_LENGTH_SCORE,
                        },
                        { validator: uniqueLevelValidator(row.scoreId) },
                      ],
                })(<Input disabled={isNA} placeholder={UI.PLACEHOLDER.SCORE} />)}
              </Form.Item>
            </div>
          )
        },
      },
      {
        title: 'Base Score',
        dataIndex: 'baseScore',
        key: 'baseScore',
        width: UI.COLUMN_WIDTH.BASE_SCORE,
        align: 'center',
        render: (text, row) => {
          const fieldName = buildFieldName(row.scoreId, 'baseScore')
          return (
            <Form.Item style={UI.FORM_ITEM_STYLE}>
              {getFieldDecorator(fieldName, {
                initialValue: row.baseScore,
                rules: [
                  { type: 'number', message: MESSAGES.ERROR.NUMERIC_SCORE },
                ],
              })(
                <StyledInputNumber
                  style={{ width: UI.INPUT_WIDTH.BASE_SCORE }}
                  min={0}
                  precision={2}
                  onKeyDown={handleNumericKeyDown}
                />
              )}
            </Form.Item>
          )
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: UI.COLUMN_WIDTH.STATUS,
        align: 'center',
        render: (text, row) => {
          const fieldName = buildFieldName(row.scoreId, 'status')
          return getFieldDecorator(fieldName, {
            valuePropName: 'checked',
            initialValue: row.status,
          })(<Checkbox />)
        },
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        render: (text, row) => {
          const fieldName = buildFieldName(row.scoreId, 'description')
          return (
            <Form.Item style={UI.FORM_ITEM_STYLE}>
              {getFieldDecorator(fieldName, {
                initialValue: row.description,
                rules: [
                  {
                    max: VALIDATION.MAX_LENGTH,
                    message: MESSAGES.ERROR.MAX_LENGTH_DESC,
                  },
                ],
              })(<Input placeholder={UI.PLACEHOLDER.DESCRIPTION} />)}
            </Form.Item>
          )
        },
      },
    ],
    [addRow, removeById, uniqueLevelValidator, handleNumericKeyDown, getFieldDecorator]
  )

  return (
    <StyledTable
      size="small"
      dataSource={rows}
      columns={columns}
      rowKey="scoreId"
      pagination={false}
      style={UI.TABLE_STYLE}
      scroll={{ y: UI.TABLE_SCROLL_HEIGHT, x: 'max-content' }}
    />
  )
}))

PerformanceScoreSettingForm.displayName = 'PerformanceScoreSettingForm'

PerformanceScoreSettingForm.propTypes = {
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func.isRequired,
    validateFields: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  roleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialData: PropTypes.arrayOf(
    PropTypes.shape({
      scoreId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      level: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      baseScore: PropTypes.number,
      base_score: PropTypes.number,
      status: PropTypes.bool,
      description: PropTypes.string,
    })
  ),
}

PerformanceScoreSettingForm.defaultProps = {
  initialData: [],
}

export default PerformanceScoreSettingForm
