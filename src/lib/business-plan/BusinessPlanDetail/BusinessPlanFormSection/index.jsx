import React, { Fragment, useEffect, useMemo, useState, memo } from 'react'
import styled from 'styled-components'
import {
  useBusinessPlanDetails,
  useBusinessPlanForm,
  useFormula,
  useBusinessPlanPermission,
} from '../../hooks'
import { SCOPE } from '../../permissions/viewPermissions'
import { Cascader, Icon, Input, InputNumber, Select, Tooltip } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import { SwapSVG } from '../SVGIcon'
import { getRowConfig, sectionConfig } from '../../constants'
import { checkRolePermission } from '../../../../components/common/checkRolePermission'
import {
  ActivityKeyConstants,
  SourceConstants,
} from '../../../constants/ActivityKeyConstants'
import {
  formatNumber,
  formatNumberCompare,
  renderColorCompareNorm,
} from '../../utils'
import { statusBusinessPlanDetail } from '../constant'
import Decimal from 'decimal.js'
import { StyledWrapper } from './index.styled'
import {
  getCellValue,
  getCellFloor,
  getCellCeiling,
  getCellNormConfig,
  getCellPercentage,
  findCellIn,
  resolveValue,
  getResultCompare,
  makeCellKey,
  getMergedColumns,
} from './helpers'
import { useSelector } from 'react-redux'

const CompareText = ({ value }) => {
  if (value === 0 || value === null) return null
  return (
    <div className={value > 0 ? 'green' : 'red'}>
      <Icon type={value > 0 ? 'arrow-up' : 'arrow-down'} />
      {formatNumberCompare(value)}
    </div>
  )
}

const BusinessPlanInput = ({ item, suffix }) => {
  const { setBusinessPlanItem } = useBusinessPlanForm()
  const { updateIsSaveShowed, setValidation, validation } =
    useBusinessPlanDetails()

  const rowConfig = getRowConfig()[item.rowKey] || {}
  const hasSuffix = typeof suffix !== 'undefined' && suffix !== ''

  const onChange = value => {
    updateIsSaveShowed({ businessPlan: true })

    if (value === null || value === '') {
      setBusinessPlanItem({ item: { ...item, value: null } })
    } else {
      const raw = Decimal(value)
        .toString()
        .replace(/[^0-9.]/g, '')

      const intPart = raw.split('.')[0]
      const decPart = raw.split('.')[1]
      const intLimit = hasSuffix ? 3 : 13

      if (
        (intPart && intPart.length > intLimit) ||
        (decPart && decPart.length > 2)
      ) {
        return
      }

      setBusinessPlanItem({
        item: {
          ...item,
          value: rowConfig.negative ? -parseFloat(raw) : parseFloat(raw),
        },
      })
    }

    if (validation[item.rowKey + '-label']) {
      setValidation({ [item.rowKey + '-label']: false })
    }
    if (validation[item.rowKey + '-' + item.columnKey]) {
      setValidation({ [item.rowKey + '-' + item.columnKey]: false })
    }
  }

  const pattern = hasSuffix
    ? /^(\d{1,3}\.\d{0,2}|\d{1,3})/
    : /^(\d{1,13}\.\d{0,2}|\d{1,13})/

  return (
    <InputNumber
      step={1}
      className={
        validation[item.rowKey + '-' + item.columnKey] ? 'input-error' : ''
      }
      value={item.value < 0 ? -item.value : item.value}
      size="small"
      onChange={onChange}
      formatter={value => {
        if (value === null) return value
        if (value === '-') return null
        if (value === '') return value
        var res = value.toString().match(pattern)
        if (rowConfig.negative) {
          return res
            ? '(' + res[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix + ')'
            : ''
        }
        return res ? res[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix : ''
      }}
    />
  )
}

const TooltipIcon = ({ tooltip }) => {
  if (tooltip === undefined) return null
  return (
    <Tooltip overlayClassName="full-tooltip" title={tooltip}>
      <Icon
        type="question-circle"
        style={{ color: '#8a8a8a', fontSize: 14, cursor: 'pointer' }}
      />
    </Tooltip>
  )
}

const ServiceControl = ({
  sectionKey,
  row,
  rowKey,
  readonly,
  mmBillService,
  businessPlanItems,
  validation,
  setValidation,
  updateIsSaveShowed,
  updateBusinessPlanRow,
}) => {
  const isManMonth = sectionKey === 'MAN_MONTH'

  const resolveMMBillTitle = () => {
    var childIndex = -1
    var parentIndex = mmBillService.findIndex(function (parent) {
      if (parent.id.toString() === row.title.toString()) return true
      childIndex = parent.data.findIndex(function (item) {
        return item.id.toString() === row.title.toString()
      })
      return childIndex > -1
    })
    var str = parentIndex > -1 ? mmBillService[parentIndex].name : ''
    if (childIndex > -1) {
      str = str + ' / ' + mmBillService[parentIndex].data[childIndex].name
    }
    return str
  }

  if (readonly) {
    return <Fragment>{isManMonth ? resolveMMBillTitle() : row.title} </Fragment>
  }

  var options = mmBillService.map(function (item) {
    var children = item.data
      ? item.data
          .filter(function (child) {
            var usedTitles = Object.keys(businessPlanItems.MAN_MONTH.data)
              .filter(function (k) {
                return k !== rowKey && k.match(/MM_BILL_\d+/)
              })
              .map(function (k) {
                return businessPlanItems.MAN_MONTH.data[k].title.toString()
              })
            return !usedTitles.includes(child.id.toString())
          })
          .map(function (child) {
            return { label: child.name, value: child.id }
          })
      : []
    return { label: item.name, value: item.id, children: children }
  })

  var childIndex = -1
  var parentIndex = mmBillService.findIndex(function (parent) {
    if (parent.id.toString() === row.title.toString()) return true
    childIndex = parent.data.findIndex(function (item) {
      return item.id.toString() === row.title.toString()
    })
    return childIndex > -1
  })
  var selectedValue =
    parentIndex > -1 && childIndex > -1
      ? [
          mmBillService[parentIndex].id,
          mmBillService[parentIndex].data[childIndex].id,
        ]
      : []

  var labelKey = rowKey + '-label'
  var hasError = !!validation[labelKey]

  var onChangeCascader = function (value) {
    var cloneRow = cloneDeep(row)
    cloneRow.title = value[1] || ''
    if (validation[labelKey]) setValidation({ [labelKey]: false })
    updateIsSaveShowed({ businessPlan: true })
    updateBusinessPlanRow({ sectionKey, rowKey, row: cloneRow })
  }

  var onChangeInput = function (value) {
    var cloneRow = cloneDeep(row)
    cloneRow.title = value
    if (validation[labelKey]) setValidation({ [labelKey]: false })
    updateIsSaveShowed({ businessPlan: true })
    updateBusinessPlanRow({ sectionKey, rowKey, row: cloneRow })
  }

  return (
    <Fragment>
      <div className="flex-items-center gap-8" id={rowKey}>
        {isManMonth ? (
          <Cascader
            displayRender={function (label) {
              return (
                <Tooltip
                  overlayClassName="full-tooltip"
                  title={label.join(' / ')}
                  placement="topLeft">
                  {label.join(' / ')}
                </Tooltip>
              )
            }}
            className={hasError ? 'input-error' : ''}
            value={selectedValue}
            size="small"
            getPopupContainer={function () {
              return document.querySelector('#business-plan-form')
            }}
            style={{ width: '100%' }}
            options={options}
            onChange={onChangeCascader}
          />
        ) : (
          <Input
            className={hasError ? 'input-error' : ''}
            value={row.title}
            size="small"
            onChange={function (e) {
              onChangeInput(e.target.value)
            }}
          />
        )}
      </div>
      {hasError && (
        <div style={{ color: 'var(--error-red)' }}>
          Please input required fields
        </div>
      )}
    </Fragment>
  )
}

const MetricHeaderRow = ({
  label,
  rowKey,
  totalValue,
  normConfig,
  normFloor,
  normCeiling,
  normPercentage,
  isPercent,
  tooltipLabel,
  dataArray,
  mergedColumns,
}) => {
  var useFloorCeiling = normFloor !== undefined && normFloor !== null

  var buildNormProps = function (value, floor, ceiling, percentage) {
    return useFloorCeiling
      ? { value: value, rowKey: rowKey, normFloor: floor, normCeiling: ceiling }
      : { value: value, rowKey: rowKey, normPercentage: percentage }
  }

  var totalColor = !normConfig
    ? '#525559'
    : renderColorCompareNorm(
        buildNormProps(totalValue, normFloor, normCeiling, normPercentage)
      )

  var totalTooltip =
    '(Total) ' +
    tooltipLabel +
    ' norm = ' +
    (normConfig ? formatNumber(normConfig) || '' : '') +
    (isPercent ? ' %' : '')

  return (
    <tr>
      <th style={{ backgroundColor: '#fff' }}>
        <span className="text-left text-wrap">{label}</span>
      </th>
      <th style={{ backgroundColor: '#fff' }}>
        <span
          className="text-center text-wrap"
          style={{ color: totalColor, fontWeight: 500 }}>
          <Tooltip title={totalTooltip}>
            {formatNumber(totalValue, isPercent)}
          </Tooltip>
        </span>
      </th>
      {(mergedColumns || []).slice(1).map(function (col) {
        var colKey =
          'metric-' +
          rowKey +
          '-' +
          col.index +
          (col.isCompareOnly ? '-cmp' : '')
        if (col.isCompareOnly) {
          return <th key={colKey} style={{ backgroundColor: '#fff' }} />
        }

        var colValue = getCellValue(dataArray, col.columnKey)
        var colFloor = getCellFloor(dataArray, col.columnKey)
        var colCeiling = getCellCeiling(dataArray, col.columnKey)
        var colNormConfig = getCellNormConfig(dataArray, col.columnKey)
        var colPercentage = getCellPercentage(dataArray, col.columnKey)
        var colNorm = useFloorCeiling ? colNormConfig : colPercentage

        var colColor = !colNorm
          ? '#525559'
          : renderColorCompareNorm(
              buildNormProps(colValue, colFloor, colCeiling, colPercentage)
            )

        var colTooltip =
          col.columnKey === 'INTERNAL'
            ? null
            : '(' +
              col.label +
              ') ' +
              tooltipLabel +
              ' norm = ' +
              (colNorm ? formatNumber(colNorm) || '' : '') +
              (isPercent ? ' %' : '')

        return (
          <th key={colKey} style={{ backgroundColor: '#fff' }}>
            <span
              className="text-center text-wrap"
              style={{ color: colColor, fontWeight: 500 }}>
              <Tooltip title={colTooltip}>
                {formatNumber(colValue, isPercent)}
              </Tooltip>
            </span>
          </th>
        )
      })}
    </tr>
  )
}

const ColumnHeaderRow = ({ mergedColumns, isApproved }) => {
  var bg = isApproved ? 'unset' : '#fff'
  return (
    <tr>
      <th style={{ backgroundColor: bg }}>
        <div
          className="item-label"
          style={{ borderRight: '1px solid #e1e1e1' }}>
          Items
        </div>
      </th>
      <th style={{ backgroundColor: bg }}>
        <div
          className="item-label"
          style={{ borderRight: '1px solid #e1e1e1' }}>
          Total
        </div>
      </th>
      {mergedColumns.slice(1).map(function (col) {
        return (
          <th key={makeCellKey(col)} style={{ backgroundColor: bg }}>
            <div
              className="item-label"
              style={{ borderRight: '1px solid #e1e1e1' }}>
              <div>{col.label}</div>
            </div>
          </th>
        )
      })}
    </tr>
  )
}

function BusinessPlanFormSection({
  handleChangeTab,
  activeTab,
  viewMode = 'Total',
}) {
  const {
    businessPlanItems,
    columns,
    getMMBillService,
    addBusinessPlanRow,
    updateBusinessPlanRow,
    getCompareBusinessPlanDetail,
    compareBusinessPlanItems,
    compareColumnLabels,
    clearCompareBusinessPlan,
  } = useBusinessPlanForm()

  const {
    updateIsSaveShowed,
    listVersions,
    versionId,
    status,
    validation,
    setValidation,
    listAM,
    listPreparator,
  } = useBusinessPlanDetails()

  const { getFormula, isSpecialSectionFormula } = useFormula()

  var userPOA = JSON.parse(localStorage.getItem('userPOA')) || {
    userName: 'Demo User',
    userId: 1,
  }
  var userName = userPOA.userName

  var isDraft = status === statusBusinessPlanDetail.draft
  var isApproved = status === statusBusinessPlanDetail.approved

  var isFin = checkRolePermission(
    SourceConstants.BUSINESS_PLAN_DETAIL,
    ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL
  )

  var isOtherRole =
    checkRolePermission(
      SourceConstants.BUSINESS_PLAN_DETAIL,
      ActivityKeyConstants.EDIT_BUSINESS_PLAN
    ) ||
    listAM.some(function (p) {
      return p.ldap === userName
    }) ||
    listPreparator.some(function (p) {
      return p.ldap === userName
    })

  var isEditableViewMode = viewMode === 'Onsite' || viewMode === 'Offshore'
  var canEdit = isEditableViewMode && ((isDraft && isOtherRole) || (isFin && !isApproved))

  const perms = useBusinessPlanPermission(SCOPE.TOTAL)

  const [selectedCompareId, setSelectedCompareId] = useState()
  const [activePanel, setActivePanel] = useState(
    Object.keys(sectionConfig).filter(function (key) {
      return sectionConfig[key] && sectionConfig[key].collapsible
    })
  )
  const [mmBillService, setMMBillService] = useState([])

  useEffect(
    function () {
      clearCompareBusinessPlan()
      setSelectedCompareId(versionId)
    },
    [versionId]
  )

  useEffect(
    function () {
      if (viewMode && selectedCompareId) {
        loadCompareVersion(selectedCompareId)
      }
    },
    [viewMode]
  )

  useEffect(function () {
    getMMBillService().then(function (res) {
      setMMBillService(res || [])
    })
  }, [])

  useEffect(
    function () {
      var manMonth = businessPlanItems.MAN_MONTH
      if (!mmBillService.length || !manMonth || !manMonth.data) return

      var allServiceIds = mmBillService.reduce(function (acc, item) {
        if (item.data && item.data.length > 0) {
          return acc.concat(
            item.data.map(function (c) {
              return c.id
            })
          )
        }
        return acc.concat([item.id])
      }, [])

      var allServiceKeys = Object.keys(manMonth.data).filter(function (k) {
        return k.match(/MM_BILL_\d+/)
      })

      var usedIds = allServiceKeys
        .filter(function (k) {
          return manMonth.data[k].title
        })
        .map(function (k) {
          return +manMonth.data[k].title
        })

      var availableIds = allServiceIds.filter(function (id) {
        return !usedIds.includes(id)
      })

      allServiceKeys
        .filter(function (k) {
          return !manMonth.data[k].title
        })
        .forEach(function (k, i) {
          var row = cloneDeep(manMonth.data[k])
          updateBusinessPlanRow({
            sectionKey: 'MAN_MONTH',
            rowKey: k,
            row: { ...row, title: availableIds[i] },
          })
        })
    },
    [mmBillService, businessPlanItems]
  )

  if (Object.keys(businessPlanItems).length === 0) return null

  function loadCompareVersion(compareVersionId) {
    setSelectedCompareId(compareVersionId)
    if (compareVersionId === versionId) {
      clearCompareBusinessPlan()
      return
    }
    getCompareBusinessPlanDetail(compareVersionId, { view: viewMode })
  }

  function toggleCollapse(key) {
    if (activePanel.includes(key)) {
      setActivePanel(
        activePanel.filter(function (k) {
          return k !== key
        })
      )
    } else {
      setActivePanel(activePanel.concat([key]))
    }
  }

  function addRow(sectionKey, newRowKey) {
    var regex = newRowKey + '_\\d+'
    var sectionData = businessPlanItems[sectionKey].data
    var serviceKeys = Object.keys(sectionData).filter(function (k) {
      return k.match(new RegExp(regex))
    })
    var clone = cloneDeep(Object.values(sectionData)[0])

    var generatedKey =
      serviceKeys.length > 0
        ? newRowKey +
          '_' +
          (+serviceKeys[serviceKeys.length - 1].match(/\d+/)[0] + 1)
        : newRowKey + '_1'

    var newItems = clone.data.map(function (item) {
      return {
        ...item,
        value: null,
        rowKey: generatedKey,
        editable:
          sectionConfig[sectionKey] &&
          sectionConfig[sectionKey].newRowEditable &&
          sectionConfig[sectionKey].newRowEditable(item.columnKey),
      }
    })

    addBusinessPlanRow({
      sectionKey,
      rowKey: generatedKey,
      row: { title: '', data: newItems, new: true },
    })
    updateIsSaveShowed({ businessPlan: true })
  }

  function getCellDisplayValue(item, sectionKey, rowKey, isService) {
    if (!item) return null
    var formula = getFormula({
      item,
      columnKey: item.columnKey,
      sectionKey,
      rowKey,
      isService,
    })
    return resolveValue(item, formula, isSpecialSectionFormula)
  }

  function getSectionTotalValue(sectionTotalItem, sectionKey) {
    if (!sectionTotalItem) return null
    var formula = getFormula({
      item: sectionTotalItem,
      columnKey: 'TOTAL',
      sectionKey: sectionKey,
      rowKey: sectionTotalItem.rowKey,
    })
    return resolveValue(sectionTotalItem, formula, isSpecialSectionFormula)
  }

  function renderSectionTitle(title) {
    var tabMap = {
      'Unit price & MM Bill': '2',
      Revenues: '2',
      'Delivery expenses': '3',
    }
    if (tabMap[title]) {
      return (
        <a
          href="#section"
          onClick={function (e) {
            e.preventDefault()
            handleChangeTab(tabMap[title])
          }}
          style={{ textDecoration: 'underline' }}>
          {title}
        </a>
      )
    }
    return title
  }

  var mergedColumns = getMergedColumns(
    columns,
    compareColumnLabels,
    compareBusinessPlanItems
  )
  var isCompare = !!compareBusinessPlanItems

  var unitPriceCell = findCellIn(
    businessPlanItems,
    'MAN_MONTH',
    'UNIT_PRICE',
    'TOTAL'
  )
  var billableRateCell = findCellIn(
    businessPlanItems,
    'REFERENCE',
    'BILLABLE_RATE',
    'TOTAL'
  )
  var directMarginCell = findCellIn(
    businessPlanItems,
    'MARGIN',
    'DIRECT_MARGIN_BONUS_RATE',
    'TOTAL'
  )

  var unitPriceArray =
    businessPlanItems.MAN_MONTH && businessPlanItems.MAN_MONTH.data.UNIT_PRICE
      ? businessPlanItems.MAN_MONTH.data.UNIT_PRICE.data
      : null

  var billableRateArray =
    businessPlanItems.REFERENCE &&
    businessPlanItems.REFERENCE.data.BILLABLE_RATE
      ? businessPlanItems.REFERENCE.data.BILLABLE_RATE.data
      : null

  var directMarginArray =
    businessPlanItems.MARGIN &&
    businessPlanItems.MARGIN.data.DIRECT_MARGIN_BONUS_RATE
      ? businessPlanItems.MARGIN.data.DIRECT_MARGIN_BONUS_RATE.data
      : null

  function renderTableBody() {
    return Object.keys(businessPlanItems).map(function (sectionKey) {
      const sectionItem = businessPlanItems[sectionKey]
      const config = sectionConfig[sectionKey] || {}
      const isMarginSection = sectionKey === 'MARGIN'
      const collapsible = !!config.collapsible
      const isExpanded = !collapsible || activePanel.includes(sectionKey)

      const sectionTotalRowData = sectionItem.data[sectionKey + '_TOTAL']
      const sectionTotalCell = sectionTotalRowData
        ? sectionTotalRowData.data.find(function (d) {
            return d.columnKey === 'TOTAL'
          })
        : null
      const sectionTotalValue = getSectionTotalValue(
        sectionTotalCell,
        sectionKey
      )
      const sectionTitleTooltip = (getRowConfig()[sectionKey + '_TOTAL'] || {})
        .tooltip

      const compareSection =
        compareBusinessPlanItems && compareBusinessPlanItems[sectionKey]
          ? compareBusinessPlanItems[sectionKey].data
          : null
      const compareSectionTotalRow = compareSection
        ? compareSection[sectionKey + '_TOTAL']
        : null
      const compareSectionTotalCell = compareSectionTotalRow
        ? compareSectionTotalRow.data.find(function (d) {
            return d.columnKey === 'TOTAL'
          })
        : null
      const compareSectionTotalValue = compareSectionTotalCell
        ? compareSectionTotalCell.value
        : null

      const resCompareSectionTotal = getResultCompare(
        sectionTotalValue,
        compareSectionTotalValue,
        isCompare
      )

      const sectionHeaderRow = config.hiddenTitle ? null : (
        <tr
          key={sectionKey + '-header'}
          className={
            'total-section ' +
            (config.rowClass || '') +
            ' ' +
            (config.titleRowClass || '')
          }>
          <th
            style={{ cursor: collapsible ? 'pointer' : '' }}
            onClick={function () {
              if (collapsible) toggleCollapse(sectionKey)
            }}>
            <div className="title flex-items-center justify-space-between">
              <div>
                <Icon
                  type="right"
                  style={{
                    fontSize: '12px',
                    cursor: 'pointer',
                    transform: activePanel.includes(sectionKey)
                      ? 'rotate(90deg)'
                      : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    marginRight: 10,
                  }}
                />
                {renderSectionTitle(sectionItem.title)}
                {config.canAdd && canEdit && (
                  <Icon
                    onClick={function (e) {
                      e.stopPropagation()
                      addRow(sectionKey, config.newRowKey)
                    }}
                    type="plus-circle"
                    style={{
                      color: 'var(--primary-blue)',
                      fontSize: 16,
                      marginLeft: 10,
                      cursor: 'pointer',
                    }}
                  />
                )}
              </div>
              <TooltipIcon tooltip={sectionTitleTooltip} />
            </div>
          </th>

          <th>
            <div className="d-flex flex-column">
              {sectionTotalCell && (
                <Fragment>
                  <div className="total">
                    {perms.renderColumn('TOTAL', sectionTotalValue, false, true)}
                  </div>
                  <CompareText value={resCompareSectionTotal} />
                </Fragment>
              )}
            </div>
          </th>

          {mergedColumns
            .filter(function (c) {
              return c.columnKey !== 'TOTAL'
            })
            .map(function (mergedCol) {
              let currentCell = null
              if (!mergedCol.isCompareOnly && sectionTotalRowData) {
                for (let i = 0; i < sectionTotalRowData.data.length; i++) {
                  if (
                    sectionTotalRowData.data[i].columnKey ===
                    mergedCol.currentColumnKey
                  ) {
                    currentCell = sectionTotalRowData.data[i]
                    break
                  }
                }
              }

              let compareCellValue = null
              if (!mergedCol.isCurrentOnly && compareSectionTotalRow) {
                for (let j = 0; j < compareSectionTotalRow.data.length; j++) {
                  if (
                    compareSectionTotalRow.data[j].columnKey ===
                    mergedCol.compareColumnKey
                  ) {
                    compareCellValue = compareSectionTotalRow.data[j].value
                    break
                  }
                }
              }

              let displayValue
              if (mergedCol.isCompareOnly) {
                displayValue = compareCellValue
              } else if (currentCell) {
                const f = getFormula({
                  item: currentCell,
                  columnKey: currentCell.columnKey,
                  sectionKey: sectionKey,
                  rowKey: currentCell.rowKey,
                })
                displayValue = resolveValue(
                  currentCell,
                  f,
                  isSpecialSectionFormula
                )
              } else {
                displayValue = null
              }

              const compareForDiff = mergedCol.isCompareOnly
                ? null
                : compareCellValue
              const resCompare = getResultCompare(
                displayValue,
                compareForDiff,
                isCompare
              )

              return (
                <td key={makeCellKey(mergedCol)}>
                  <div className="d-flex flex-column">
                    {currentCell &&
                    !mergedCol.isCompareOnly &&
                    currentCell.editable &&
                    canEdit ? (
                      <BusinessPlanInput item={currentCell} />
                    ) : (
                      perms.renderCell(currentCell, mergedCol.currentColumnKey, displayValue, false, true)
                    )}
                    <CompareText value={resCompare} />
                  </div>
                </td>
              )
            })}
        </tr>
      )

      const dataRows = Object.keys(sectionItem.data)
        .filter(function (rowKey) {
          return rowKey !== sectionKey + '_TOTAL'
        })
        .map(function (rowKey, index) {
          const rowData = sectionItem.data[rowKey]
          const totalItem = rowData.data.find(function (d) {
            return d.columnKey === 'TOTAL'
          })

          const newRowKeyRegex = (config.newRowKey || sectionKey) + '_\\d+'
          const isService = !!rowKey.match(new RegExp(newRowKeyRegex))
          const rowConfigKey = isService
            ? config.newRowKey + '_SERVICE'
            : rowKey
          const rowCfg = getRowConfig()[rowConfigKey] || {}
          const percent = rowCfg.percent
          const rowTooltip = rowCfg.tooltip
          const canEditInternal = rowCfg.canEditInternal

          const totalItemValue = getCellDisplayValue(
            totalItem,
            sectionKey,
            rowKey,
            isService
          )

          const compareRowData =
            compareSection && compareSection[rowKey]
              ? compareSection[rowKey].data
              : null
          const compareTotalItem = compareRowData
            ? compareRowData.find(function (d) {
                return d.columnKey === 'TOTAL'
              })
            : null
          const compareTotalValue = compareTotalItem
            ? compareTotalItem.value
            : null

          const resCompareTotalRow = getResultCompare(
            totalItemValue,
            compareTotalValue,
            isCompare
          )

          return (
            <tr
              key={rowKey}
              className={
                (isMarginSection ? 'margin' : '') +
                ' ' +
                (config.rowClass || '')
              }
              style={{ display: isExpanded ? 'table-row' : 'none' }}>
              <th>
                {isMarginSection && index === 0 && (
                  <img src="/img/flag.png" className="flag" width={23} alt="" />
                )}
                {isMarginSection ? (
                  <div className="flex-items-center justify-space-between pr-1">
                    {rowData.title}
                    <TooltipIcon tooltip={rowTooltip} />
                  </div>
                ) : (
                  <div className="flex-items-center justify-space-between">
                    <div>
                      {isService ? (
                        <ServiceControl
                          sectionKey={sectionKey}
                          row={rowData}
                          rowKey={rowKey}
                          readonly={true}
                          mmBillService={mmBillService}
                          businessPlanItems={businessPlanItems}
                          validation={validation}
                          setValidation={setValidation}
                          updateIsSaveShowed={updateIsSaveShowed}
                          updateBusinessPlanRow={updateBusinessPlanRow}
                        />
                      ) : (
                        rowData.title
                      )}
                      {getRowConfig()[rowKey] &&
                        getRowConfig()[rowKey].canAdd &&
                        isDraft &&
                        isOtherRole && (
                          <Icon
                            onClick={function () {
                              addRow(sectionKey, config.newRowKey)
                            }}
                            type="plus-circle"
                            style={{
                              color: 'var(--primary-blue)',
                              fontSize: 16,
                              marginLeft: 4,
                              cursor: 'pointer',
                            }}
                          />
                        )}
                    </div>
                    <TooltipIcon tooltip={rowTooltip} />
                  </div>
                )}
              </th>

              <th>
                <div className="d-flex flex-column">
                  {totalItem.editable && canEdit ? (
                    <BusinessPlanInput
                      item={totalItem}
                      suffix={percent ? '%' : ''}
                    />
                  ) : (
                    <div className="total">
                      {perms.renderCell(totalItem, 'TOTAL', totalItemValue, percent, false)}
                    </div>
                  )}
                  <CompareText value={resCompareTotalRow} />
                </div>
              </th>

              {mergedColumns
                .filter(function (c) {
                  return c.columnKey !== 'TOTAL'
                })
                .map(function (mergedCol) {
                  let currentItem = null
                  if (!mergedCol.isCompareOnly) {
                    for (let ri = 0; ri < rowData.data.length; ri++) {
                      if (
                        rowData.data[ri].columnKey ===
                        mergedCol.currentColumnKey
                      ) {
                        currentItem = rowData.data[ri]
                        break
                      }
                    }
                  }

                  let compareItem = null
                  if (!mergedCol.isCurrentOnly && compareRowData) {
                    for (let ci = 0; ci < compareRowData.length; ci++) {
                      if (
                        compareRowData[ci].columnKey ===
                        mergedCol.compareColumnKey
                      ) {
                        compareItem = compareRowData[ci]
                        break
                      }
                    }
                  }

                  const compareValue = compareItem ? compareItem.value : null
                  const cellFormula = currentItem
                    ? getFormula({
                        item: currentItem,
                        columnKey: currentItem.columnKey,
                        sectionKey,
                        rowKey,
                        isService,
                      })
                    : undefined
                  let cellValue
                  if (mergedCol.isCompareOnly) {
                    cellValue = compareValue
                  } else if (currentItem) {
                    cellValue = resolveValue(
                      currentItem,
                      cellFormula,
                      isSpecialSectionFormula
                    )
                  } else {
                    cellValue = null
                  }

                  const compareForDiff = mergedCol.isCompareOnly
                    ? null
                    : compareValue
                  const resCompareCell = getResultCompare(
                    cellValue,
                    compareForDiff,
                    isCompare
                  )

                  const internalAllowed =
                    !currentItem ||
                    canEditInternal === undefined ||
                    (canEditInternal && currentItem.columnKey === 'INTERNAL') ||
                    currentItem.columnKey !== 'INTERNAL'

                  return (
                    <td key={makeCellKey(mergedCol)}>
                      <div className="d-flex flex-column">
                        {currentItem &&
                        !mergedCol.isCompareOnly &&
                        currentItem.editable &&
                        internalAllowed &&
                        canEdit ? (
                          <BusinessPlanInput
                            item={currentItem}
                            suffix={percent ? '%' : ''}
                          />
                        ) : (
                          perms.renderCell(currentItem, mergedCol.currentColumnKey, cellValue, percent, false)
                        )}
                        <CompareText value={resCompareCell} />
                      </div>
                    </td>
                  )
                })}
            </tr>
          )
        })

      return (
        <Fragment key={sectionKey}>
          {sectionHeaderRow}
          {dataRows}
        </Fragment>
      )
    })
  }

  return (
    <Fragment>
      <div className="flex-items-center justify-space-between mb-3">
        <div className="font-16 font-weight-500">Currency: VND</div>
        <div className="flex-items-center gap-8">
          <div>Compared Version:</div>
          <Select
            value={selectedCompareId}
            onChange={loadCompareVersion}
            style={{ width: '140px' }}>
            {listVersions.map(function (item) {
              return (
                <Select.Option value={item.versionId} key={item.versionId}>
                  <Icon component={SwapSVG} /> {item.versionName}
                </Select.Option>
              )
            })}
          </Select>
        </div>
      </div>

      <StyledWrapper>
        <table id="business-plan-form" style={{ position: 'relative' }}>
          <colgroup>
            <col style={{ width: 'var(--title-size)' }} />
            <col style={{ width: 'var(--column-width)' }} />
            {mergedColumns.slice(1).map(function (col) {
              return (
                <col
                  key={makeCellKey(col)}
                  style={{ width: 'var(--column-width)' }}
                />
              )
            })}
          </colgroup>

          <thead>
            {!isApproved && (
              <Fragment>
                <MetricHeaderRow
                  label="Unit price"
                  rowKey="UNIT_PRICE"
                  totalValue={unitPriceCell ? unitPriceCell.value : null}
                  normConfig={
                    unitPriceCell ? unitPriceCell.normUnitPriceConfig : null
                  }
                  normFloor={
                    unitPriceCell ? unitPriceCell.normUnitPriceFloor : null
                  }
                  normCeiling={
                    unitPriceCell ? unitPriceCell.normUnitPriceCeiling : null
                  }
                  normPercentage={null}
                  isPercent={false}
                  tooltipLabel="Unit price"
                  dataArray={unitPriceArray}
                  mergedColumns={mergedColumns}
                />
                <MetricHeaderRow
                  label="Billable rate"
                  rowKey="BILLABLE_RATE"
                  totalValue={billableRateCell ? billableRateCell.value : null}
                  normConfig={
                    billableRateCell
                      ? billableRateCell.normBusinessPlanConfig
                      : null
                  }
                  normFloor={null}
                  normCeiling={null}
                  normPercentage={
                    billableRateCell
                      ? billableRateCell.normBusinessPlanConfig
                      : null
                  }
                  isPercent={true}
                  tooltipLabel="Billable rate"
                  dataArray={billableRateArray}
                  mergedColumns={mergedColumns}
                />
                <MetricHeaderRow
                  label="Direct margin before incentives and project bonus rate"
                  rowKey="DIRECT_MARGIN_BONUS_RATE"
                  totalValue={directMarginCell ? directMarginCell.value : null}
                  normConfig={
                    directMarginCell
                      ? directMarginCell.normBusinessPlanConfig
                      : null
                  }
                  normFloor={null}
                  normCeiling={null}
                  normPercentage={
                    directMarginCell
                      ? directMarginCell.normBusinessPlanConfig
                      : null
                  }
                  isPercent={true}
                  tooltipLabel="Direct margin before incentives and project bonus rate"
                  dataArray={directMarginArray}
                  mergedColumns={mergedColumns}
                />
              </Fragment>
            )}
            <ColumnHeaderRow
              mergedColumns={mergedColumns}
              isApproved={isApproved}
            />
          </thead>

          <tbody>{renderTableBody()}</tbody>
        </table>
      </StyledWrapper>
    </Fragment>
  )
}

export default BusinessPlanFormSection
