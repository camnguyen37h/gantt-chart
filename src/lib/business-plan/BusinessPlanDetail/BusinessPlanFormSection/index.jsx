import React, { Fragment, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import {
  useBusinessPlanDetails,
  useBusinessPlanForm,
  useFormula,
} from '../../hooks'
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
    updateIsSaveShowed(true)

    if (value === null || value === '') {
      setBusinessPlanItem({
        item: { ...item, value: null },
      })
    } else {
      const formattedValue = Decimal(value)
        .toString()
        .replace(/[^0-9.]/g, '')

      if (
        (formattedValue &&
          formattedValue.split('.')[0] &&
          formattedValue.split('.')[0].length > (hasSuffix ? 3 : 13)) ||
        (formattedValue &&
          formattedValue.split('.')[1] &&
          formattedValue.split('.')[1].length > 2)
      ) {
        return
      }

      setBusinessPlanItem({
        item: {
          ...item,
          value: rowConfig.negative
            ? -parseFloat(formattedValue)
            : parseFloat(formattedValue),
        },
      })
    }
    if (validation[`${item.rowKey}-label`]) {
      setValidation({ [`${item.rowKey}-label`]: false })
    }
    if (validation[`${item.rowKey}-${item.columnKey}`]) {
      setValidation({ [`${item.rowKey}-${item.columnKey}`]: false })
    }
  }

  return (
    <InputNumber
      step={1}
      className={
        validation[`${item.rowKey}-${item.columnKey}`] ? 'input-error' : ''
      }
      value={item.value < 0 ? -item.value : item.value}
      size="small"
      onChange={onChange}
      formatter={value => {
        if (value === null) return value
        if (value === '-') return null
        if (value === '') return value
        const res = value
          .toString()
          .match(
            hasSuffix
              ? /^(\d{1,3}\.\d{0,2}|\d{1,3})/
              : /^(\d{1,13}\.\d{0,2}|\d{1,13})/
          )

        if (rowConfig.negative)
          return res
            ? '(' + res[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix + ')'
            : ''
        return res ? res[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix : ''
      }}
    />
  )
}

function BusinessPlanFormSection({ handleChangeTab, viewMode = 'Total' }) {
  const {
    businessPlanItems,
    columns,
    getMMBillService,
    addBusinessPlanRow,
    updateBusinessPlanRow,
    deleteBusinessPlanRow,
    getCompareBusinessPlanDetail,
    compareBusinessPlanItems,
    clearCompareBusinessPlan,
    setBusinessPlanItem,
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

  // Mock user for demo
  const userPOA = JSON.parse(localStorage.getItem('userPOA')) || {
    userName: 'Demo User',
    userId: 1,
  }
  const { userName } = userPOA

  const { getFormula, isSpecialSectionFormula } = useFormula()
  const [selectedCompareId, setSelectedCompareId] = useState()

  const isDraft = status === statusBusinessPlanDetail.draft
  const isApproved = status === statusBusinessPlanDetail.approved
  const isFin = checkRolePermission(
    SourceConstants.BUSINESS_PLAN_DETAIL,
    ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL
  )

  const isOtherRole =
    checkRolePermission(
      SourceConstants.BUSINESS_PLAN_DETAIL,
      ActivityKeyConstants.EDIT_BUSINESS_PLAN
    ) ||
    listAM.some(p => p.ldap === userName) ||
    listPreparator.some(p => p.ldap === userName)

  useEffect(() => {
    clearCompareBusinessPlan()
    setSelectedCompareId(versionId)
  }, [versionId])

  useEffect(() => {
    if (viewMode && selectedCompareId) {
      onChangeCompareSelect(selectedCompareId)
    }
  }, [viewMode])

  const onChangeCompareSelect = compareVersionId => {
    setSelectedCompareId(compareVersionId)
    if (compareVersionId === versionId) {
      clearCompareBusinessPlan()
      return
    }

    getCompareBusinessPlanDetail(compareVersionId, {
      view: viewMode,
    })
  }

  const [activePanel, setActivePanel] = useState(
    Object.keys(sectionConfig).filter(
      item => sectionConfig[item] && sectionConfig[item].collapsible
    )
  )
  const [mmBillSerice, setMMBillService] = useState([])

  useEffect(() => {
    getMMBillService().then(res => {
      setMMBillService(res || [])
    })
  }, [])

  useEffect(() => {
    if (
      mmBillSerice.length > 0 &&
      businessPlanItems.MAN_MONTH &&
      businessPlanItems &&
      businessPlanItems.MAN_MONTH.data
    ) {
      let serviceConfig = mmBillSerice.reduce((res, item) => {
        if (item.data && item.data.length > 0) {
          return [...res, ...item.data.map(child => child.id)]
        }
        return [...res, item.id]
      }, [])
      const allServices = Object.keys(businessPlanItems.MAN_MONTH.data).filter(
        item => item.match(/MM_BILL_\d+/)
      )
      const exclude = allServices
        .filter(key => businessPlanItems.MAN_MONTH.data[key].title)
        .map(key => +businessPlanItems.MAN_MONTH.data[key].title)
      serviceConfig = serviceConfig.filter(item => {
        return !exclude.includes(item)
      })
      allServices
        .filter(key => !businessPlanItems.MAN_MONTH.data[key].title)
        .forEach((key, index) => {
          const row = cloneDeep(businessPlanItems.MAN_MONTH.data[key])
          updateBusinessPlanRow({
            sectionKey: 'MAN_MONTH',
            rowKey: key,
            row: { ...row, title: serviceConfig[index] },
          })
        })
    }
  }, [mmBillSerice, businessPlanItems])

  if (Object.keys(businessPlanItems).length === 0) return null

  const toggleCollapse = key => {
    if (activePanel.includes(key))
      setActivePanel(activePanel.filter(item => item !== key))
    else setActivePanel([...activePanel, key])
  }

  const addRow = ({ sectionKey, rowKey }) => {
    const regex = `${rowKey}_\\d+`
    const serviceKeys = Object.keys(businessPlanItems[sectionKey].data).filter(
      item => item.match(new RegExp(regex))
    )
    const clone = cloneDeep(
      Object.values(businessPlanItems[sectionKey].data)[0]
    )

    const newRowKey =
      serviceKeys.length > 0
        ? `${rowKey}_${
            +serviceKeys[serviceKeys.length - 1].match(/\d+/)[0] + 1
          }`
        : `${rowKey}_1`

    const newServiceItems = clone.data.map(item => ({
      ...item,
      value: null,
      rowKey: newRowKey,
      editable:
        sectionConfig[sectionKey] &&
        sectionConfig[sectionKey].newRowEditable &&
        sectionConfig[sectionKey].newRowEditable(item.columnKey),
    }))

    const row = {
      title: '',
      data: newServiceItems,
      new: true,
    }

    addBusinessPlanRow({ sectionKey, rowKey: newRowKey, row })
    updateIsSaveShowed(true)
  }

  const renderServiceControl = ({ sectionKey, row, rowKey, readonly }) => {
    const isManMonth = sectionKey === 'MAN_MONTH'
    if (readonly)
      return (
        <Fragment>
          {isManMonth ? renderMMBillServiceTitle({ row }) : row.title}{' '}
        </Fragment>
      )

    const options = mmBillSerice.map(item => ({
      label: item.name,
      value: item.id,
      children: item.data
        ? item.data
            .filter(item => {
              const values = Object.keys(businessPlanItems.MAN_MONTH.data)
                .filter(key => key !== rowKey && key.match(/MM_BILL_\d+/))
                .map(key =>
                  businessPlanItems.MAN_MONTH.data[key].title.toString()
                )
              return !values.includes(item.id.toString())
            })
            .map(item => ({ label: item.name, value: item.id }))
        : [],
    }))

    const onChange = (value, options) => {
      const cloneRow = cloneDeep(row)

      cloneRow.title = value[1] || ''
      if (validation[`${rowKey}-label`]) {
        setValidation({ [`${rowKey}-label`]: false })
      }
      updateIsSaveShowed(true)
      updateBusinessPlanRow({ sectionKey, rowKey, row: cloneRow })
    }

    const onChangeInput = value => {
      const cloneRow = cloneDeep(row)

      cloneRow.title = value
      if (validation[`${rowKey}-label`]) {
        setValidation({ [`${rowKey}-label`]: false })
      }
      updateIsSaveShowed(true)
      updateBusinessPlanRow({ sectionKey, rowKey, row: cloneRow })
    }

    let childIndex = -1
    const parentIndex = mmBillSerice.findIndex(parent => {
      if (parent.id.toString() === row.title.toString()) {
        return true
      }
      childIndex = parent.data.findIndex(item => {
        return item.id.toString() === row.title.toString()
      })
      return childIndex > -1
    })

    const selectedValue =
      parentIndex > -1 && childIndex > -1
        ? [
            mmBillSerice[parentIndex].id,
            mmBillSerice[parentIndex].data[childIndex].id,
          ]
        : []

    return (
      <Fragment>
        <div className="flex-items-center gap-8" id={rowKey}>
          {isManMonth ? (
            <Cascader
              displayRender={label => (
                <Tooltip
                  overlayClassName="full-tooltip"
                  title={label.join(' / ')}
                  placement="topLeft">
                  {label.join(' / ')}
                </Tooltip>
              )}
              className={validation[`${rowKey}-label`] ? 'input-error' : ''}
              value={selectedValue}
              size="small"
              getPopupContainer={() =>
                document.querySelector(`#business-plan-form`)
              }
              style={{ width: '100%' }}
              options={options}
              onChange={onChange}
            />
          ) : (
            <Input
              className={validation[`${rowKey}-label`] ? 'input-error' : ''}
              value={row.title}
              size="small"
              onChange={e => {
                onChangeInput(e.target.value)
              }}
            />
          )}
          {/* <Icon
            type="minus-circle"
            onClick={() => {
              updateIsSaveShowed(true)
              deleteBusinessPlanRow({ sectionKey, rowKey })
            }}
          /> */}
        </div>
        {validation[`${rowKey}-label`] && (
          <div style={{ color: 'var(--error-red)' }}>
            Please input required fields
          </div>
        )}
      </Fragment>
    )
  }
  const renderMMBillServiceTitle = ({ row }) => {
    let childIndex = -1
    const parentIndex = mmBillSerice.findIndex(parent => {
      if (parent.id.toString() === row.title.toString()) {
        return true
      }
      childIndex = parent.data.findIndex(item => {
        return item.id.toString() === row.title.toString()
      })
      return childIndex > -1
    })

    let str = parentIndex > -1 ? mmBillSerice[parentIndex].name : ''
    str =
      childIndex > -1
        ? str + ' / ' + mmBillSerice[parentIndex].data[childIndex].name
        : str
    return str
  }

  const getResultCompare = (current, compare, isCompare) => {
    if (!isCompare) return null
    if (!current && !compare) {
      return null
    }

    if (!compare) {
      return parseFloat(current.toFixed(2))
    }

    if (!current) {
      return -parseFloat(compare.toFixed(2))
    }

    return parseFloat(current.toFixed(2)) - parseFloat(compare.toFixed(2))
  }

  const findValue = (sectionKey, rowKey, columnKey) => {
    const section = businessPlanItems[sectionKey]
    if (section) {
      const row = section.data[rowKey]
      if (row) {
        const item = row.data.find(d => d.columnKey === columnKey)
        return item ? item.value : null
      }
    }
    return null
  }

  const findPercentage = (sectionKey, rowKey, columnKey) => {
    const section = businessPlanItems[sectionKey]
    if (section) {
      const row = section.data[rowKey]
      if (row) {
        const item = row.data.find(d => d.columnKey === columnKey)
        return item ? item.normBusinessPlanConfig : null
      }
    }
    return null
  }

  const findFloor = (sectionKey, rowKey, columnKey) => {
    const section = businessPlanItems[sectionKey]
    if (section) {
      const row = section.data[rowKey]
      if (row) {
        const item = row.data.find(d => d.columnKey === columnKey)
        return item ? item.normUnitPriceFloor : null
      }
    }
    return null
  }

  const findCeiling = (sectionKey, rowKey, columnKey) => {
    const section = businessPlanItems[sectionKey]
    if (section) {
      const row = section.data[rowKey]
      if (row) {
        const item = row.data.find(d => d.columnKey === columnKey)
        return item ? item.normUnitPriceCeiling : null
      }
    }
    return null
  }

  const findNormConfig = (sectionKey, rowKey, columnKey) => {
    const section = businessPlanItems[sectionKey]
    if (section) {
      const row = section.data[rowKey]
      if (row) {
        const item = row.data.find(d => d.columnKey === columnKey)
        return item ? item.normUnitPriceConfig : null
      }
    }
    return null
  }

  const findDataArray = (sectionKey, rowKey) => {
    const section = businessPlanItems[sectionKey]
    if (section) {
      const row = section.data[rowKey]
      if (row) {
        return row.data
      }
    }
    return null
  }

  const unitPriceTotalValue = findValue('MAN_MONTH', 'UNIT_PRICE', 'TOTAL')
  const unitPriceFloor = findFloor('MAN_MONTH', 'UNIT_PRICE', 'TOTAL')
  const unitPriceCeiling = findCeiling('MAN_MONTH', 'UNIT_PRICE', 'TOTAL')
  const unitPriceNormConfig = findNormConfig('MAN_MONTH', 'UNIT_PRICE', 'TOTAL')
  const directMarginTotalValue = findValue(
    'MARGIN',
    'DIRECT_MARGIN_BONUS_RATE',
    'TOTAL'
  )
  const directMarginPercentage = findPercentage(
    'MARGIN',
    'DIRECT_MARGIN_BONUS_RATE',
    'TOTAL'
  )

  const billableRateTotalValue = findValue(
    'REFERENCE',
    'BILLABLE_RATE',
    'TOTAL'
  )
  const billableRatePercentage = findPercentage(
    'REFERENCE',
    'BILLABLE_RATE',
    'TOTAL'
  )

  const unitPriceArray = findDataArray('MAN_MONTH', 'UNIT_PRICE')
  const directMarginArray = findDataArray('MARGIN', 'DIRECT_MARGIN_BONUS_RATE')
  const billableRateArray = findDataArray('REFERENCE', 'BILLABLE_RATE')

  const findValueByColumnKey = (data, columnKey) => {
    const item = data.find(d => d.columnKey === columnKey)
    return item ? item.value : null
  }

  const findFloorByColumnKey = (data, columnKey) => {
    const item = data.find(d => d.columnKey === columnKey)
    return item ? item.normUnitPriceFloor : null
  }

  const findCeilingByColumnKey = (data, columnKey) => {
    const item = data.find(d => d.columnKey === columnKey)
    return item ? item.normUnitPriceCeiling : null
  }

  const findNormConfigByColumnKey = (data, columnKey) => {
    const item = data.find(d => d.columnKey === columnKey)
    return item ? item.normUnitPriceConfig : null
  }

  const findPercentageByColumnKey = (data, columnKey) => {
    const item = data.find(d => d.columnKey === columnKey)
    return item ? item.normBusinessPlanConfig : null
  }

  const renderHyperLinkTitle = title => {
    if (title === 'Unit price & MM Bill') {
      return (
        <a
          href="#"
          onClick={() => handleChangeTab('2')}
          style={{ textDecoration: 'underline' }}>
          Unit price & MM Bill
        </a>
      )
    }
    if (title === 'Revenues') {
      return (
        <a
          href="#"
          onClick={() => handleChangeTab('2')}
          style={{ textDecoration: 'underline' }}>
          Revenues
        </a>
      )
    }
    if (title === 'Delivery expenses') {
      return (
        <a
          href="#"
          onClick={() => handleChangeTab('3')}
          style={{ textDecoration: 'underline' }}>
          Delivery expenses
        </a>
      )
    }
    return title
  }

  const renderTable = () => {
    const sections = Object.keys(businessPlanItems)

    return sections.map(section => {
      const rows = Object.keys(businessPlanItems[section].data)
      const sectionItem = businessPlanItems[section]
      const isMarginSection = section === 'MARGIN'
      const sectionRowData = sectionItem.data[`${section}_TOTAL`]

      const sectionTotalItem = sectionRowData
        ? sectionRowData.data.find(item => item.columnKey === 'TOTAL')
        : null

      const config = sectionConfig[section] || {}
      const { tooltip } = getRowConfig()[`${section}_TOTAL`] || {}

      let sectionTotalItemValue = sectionTotalItem
        ? sectionTotalItem.value
        : null

      sectionTotalItemValue = sectionTotalItem
        ? getFormula({
            item: sectionTotalItem,
            columnKey: 'TOTAL',
            sectionKey: section,
            rowKey: sectionTotalItem.rowKey,
          }) !== undefined &&
          isSpecialSectionFormula(sectionTotalItem.sectionKey)
          ? getFormula({
              item: sectionTotalItem,
              columnKey: 'TOTAL',
              sectionKey: section,
              rowKey: sectionTotalItem.rowKey,
            })
          : sectionTotalItem.value
        : null

      const collapsible = config && config.collapsible
      const activeSection = !collapsible || activePanel.includes(section)

      const isCompare = compareBusinessPlanItems

      const compareRows =
        compareBusinessPlanItems && compareBusinessPlanItems[section]
          ? compareBusinessPlanItems[section].data
          : null
      const compareSectionRowData = compareRows
        ? compareRows[`${section}_TOTAL`]
        : null

      const compareSectionTotalItem = compareSectionRowData
        ? compareSectionRowData.data.find(item => item.columnKey === 'TOTAL')
        : null

      const compareSectionTotalItemValue = compareSectionTotalItem
        ? compareSectionTotalItem.value
        : null

      const resCompareTotalItem = compareSectionTotalItemValue
        ? getResultCompare(
            sectionTotalItemValue,
            compareSectionTotalItemValue,
            isCompare
          )
        : null

      return (
        <Fragment key={section}>
          {!config.hiddenTitle && (
            <tr
              className={
                'total-section ' +
                (config.rowClass || '') +
                ' ' +
                (config.titleRowClass || '')
              }>
              <th
                style={{
                  cursor: collapsible ? 'pointer' : '',
                }}
                onClick={
                  collapsible ? () => toggleCollapse(section) : () => {}
                }>
                <div className="title flex-items-center justify-space-between">
                  <div>
                    {collapsible && (
                      <Icon
                        type="right"
                        style={{
                          fontSize: 11,
                          color: 'rgba(0,0,0,0.85)',
                          marginRight: 10,
                        }}
                        rotate={activePanel.includes(section) ? 90 : 0}
                      />
                    )}
                    {renderHyperLinkTitle(sectionItem.title)}
                    {config &&
                      config.canAdd &&
                      ((isOtherRole && isDraft) || isFin) &&
                      !isApproved && (
                        <Icon
                          onClick={e => {
                            e.stopPropagation()
                            addRow({
                              sectionKey: section,
                              rowKey: config.newRowKey,
                            })
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
                  {tooltip !== undefined && (
                    <Tooltip overlayClassName="full-tooltip" title={tooltip}>
                      <Icon
                        type="question-circle"
                        style={{
                          color: '#8a8a8a',
                          fontSize: 14,
                          cursor: 'pointer',
                        }}
                      />
                    </Tooltip>
                  )}
                </div>
              </th>
              <th>
                <div className="d-flex flex-column 1">
                  {sectionTotalItem && (
                    <Fragment>
                      <div className="total">
                        {formatNumber(sectionTotalItemValue)}
                      </div>
                      <CompareText value={resCompareTotalItem} />
                    </Fragment>
                  )}
                </div>
              </th>
              {sectionRowData
                ? sectionRowData.data
                    .filter(item => item.columnKey !== 'TOTAL')
                    .map(item => {
                      const compareValue = compareSectionRowData
                        ? compareSectionRowData.data.find(
                            compareItem =>
                              compareItem.columnKey === item.columnKey
                          ) &&
                          compareSectionRowData.data.find(
                            compareItem =>
                              compareItem.columnKey === item.columnKey
                          ).value
                        : null

                      const sectionRowDataItemValue =
                        getFormula({
                          item,
                          columnKey: item.columnKey,
                          sectionKey: section,
                          rowKey: item.rowKey,
                        }) !== undefined &&
                        isSpecialSectionFormula(item.sectionKey)
                          ? getFormula({
                              item,
                              columnKey: item.columnKey,
                              sectionKey: section,
                              rowKey: item.rowKey,
                            })
                          : item.value
                      const resCompare = getResultCompare(
                        sectionRowDataItemValue,
                        compareValue,
                        isCompare
                      )
                      return (
                        <td key={item.columnKey}>
                          <div className="d-flex flex-column 3">
                            {item.editable &&
                            ((isDraft && isOtherRole) ||
                              (isFin && !isApproved)) ? (
                              <BusinessPlanInput item={item} />
                            ) : (
                              formatNumber(sectionRowDataItemValue)
                            )}
                            <CompareText value={resCompare} />
                          </div>
                        </td>
                      )
                    })
                : sectionItem.data[rows[0]].data
                    .slice(1)
                    .map((_, index) => <td key={`${section}-${index}`}></td>)}
            </tr>
          )}
          {rows
            .filter(item => item !== `${section}_TOTAL`)
            .map((row, index) => {
              const rowItems = sectionItem.data[row]
              const totalItem = rowItems.data.find(
                item => item.columnKey === 'TOTAL'
              )

              const regex = `${config.newRowKey || section}_\\d+`
              const isService = row.match(new RegExp(regex))
              const { percent, tooltip, canEditInternal } =
                getRowConfig()[
                  isService ? `${config.newRowKey}_SERVICE` : row
                ] || {}

              const totalItemValue =
                getFormula({
                  item: totalItem,
                  columnKey: 'TOTAL',
                  sectionKey: section,
                  rowKey: row,
                  isService,
                }) !== undefined &&
                isSpecialSectionFormula(totalItem.sectionKey)
                  ? getFormula({
                      item: totalItem,
                      columnKey: 'TOTAL',
                      sectionKey: section,
                      rowKey: row,
                      isService,
                    })
                  : totalItem.value

              const formattedValue = formatNumber(totalItemValue, percent)

              const compareRowItems =
                compareRows && compareRows[row] ? compareRows[row].data : null
              const compareTotalItemValue = compareRowItems
                ? compareRowItems.find(item => item.columnKey === 'TOTAL').value
                : null

              const resCompare = getResultCompare(
                totalItemValue,
                compareTotalItemValue,
                isCompare
              )
              return (
                <tr
                  key={row}
                  className={
                    (isMarginSection ? 'margin' : '') +
                    ' ' +
                    (config.rowClass || '')
                  }
                  style={{
                    display: activeSection ? 'table-row' : 'none',
                  }}>
                  <th key={'row-child-1'}>
                    {isMarginSection && index === 0 && (
                      <img
                        src="/img/flag.png"
                        className="flag"
                        width={23}></img>
                    )}
                    {isMarginSection ? (
                      <div className="flex-items-center justify-space-between pr-1">
                        {rowItems.title}
                        {tooltip !== undefined && (
                          <Tooltip
                            overlayClassName="full-tooltip"
                            title={tooltip}>
                            <Icon
                              type="question-circle"
                              style={{
                                color: '#8a8a8a',
                                fontSize: 14,
                                cursor: 'pointer',
                              }}
                            />
                          </Tooltip>
                        )}
                      </div>
                    ) : (
                      <div className="flex-items-center justify-space-between">
                        <div>
                          {isService
                            ? renderServiceControl({
                                row: rowItems,
                                sectionKey: section,
                                rowKey: row,
                                readonly: true,
                              })
                            : rowItems.title}
                          {getRowConfig()[row] &&
                            getRowConfig()[row].canAdd &&
                            isDraft &&
                            isOtherRole && (
                              <Icon
                                onClick={() =>
                                  addRow({
                                    sectionKey: section,
                                    rowKey: config.newRowKey,
                                  })
                                }
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
                        {tooltip !== undefined && (
                          <Tooltip
                            overlayClassName="full-tooltip"
                            title={tooltip}>
                            <Icon
                              type="question-circle"
                              style={{
                                color: '#8a8a8a',
                                fontSize: 14,
                                cursor: 'pointer',
                              }}
                            />
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </th>
                  <th key={'row-child-2'}>
                    <div className="d-flex flex-column 4">
                      {totalItem.editable &&
                      ((isDraft && isOtherRole) || (isFin && !isApproved)) ? (
                        <BusinessPlanInput
                          item={totalItem}
                          suffix={percent ? '%' : ''}></BusinessPlanInput>
                      ) : (
                        <div className="total">{formattedValue}</div>
                      )}
                      <CompareText value={resCompare} />
                    </div>
                  </th>
                  {rowItems.data
                    .filter(item => item.columnKey !== 'TOTAL')
                    .map(item => {
                      const compareItem = compareRowItems
                        ? compareRowItems.find(
                            compareItem =>
                              compareItem.columnKey === item.columnKey
                          )
                        : null
                      const compareValue = compareItem
                        ? compareItem.value
                        : null

                      const valueFormula = getFormula({
                        item,
                        columnKey: item.columnKey,
                        sectionKey: section,
                        rowKey: row,
                        isService,
                      })

                      const value =
                        valueFormula !== undefined &&
                        isSpecialSectionFormula(item.sectionKey)
                          ? valueFormula
                          : item.value
                      const formattedValue = formatNumber(value, percent)
                      const resCompare = getResultCompare(
                        value,
                        compareValue,
                        isCompare
                      )

                      const extraPermission =
                        canEditInternal === undefined ||
                        (canEditInternal && item.columnKey === 'INTERNAL') ||
                        item.columnKey !== 'INTERNAL'

                      return (
                        <td key={item.columnKey}>
                          <div className="d-flex flex-column 6">
                            {item.editable &&
                            extraPermission &&
                            ((isDraft && isOtherRole) ||
                              (isFin && !isApproved)) ? (
                              <BusinessPlanInput
                                item={item}
                                suffix={percent ? '%' : ''}
                              />
                            ) : (
                              formattedValue
                            )}
                            <CompareText value={resCompare} />
                          </div>
                        </td>
                      )
                    })}
                </tr>
              )
            })}
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
            onChange={onChangeCompareSelect}
            style={{ width: '140px' }}>
            {listVersions.map(item => (
              <Select.Option value={item.versionId} key={item.versionId}>
                <Icon component={SwapSVG} /> {item.versionName}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      <StyledWrapper>
        <table id="business-plan-form" style={{ position: 'relative' }}>
          <colgroup>
            <col style={{ width: 'var(--title-size)' }} />
            <col style={{ width: 'var(--column-width)' }} />
            {columns.slice(1).map(item => (
              <col
                key={item.columnKey}
                style={{ width: 'var(--column-width)' }}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                style={{ backgroundColor: !isApproved ? '#fff' : 'unset' }}
                key={'header-info'}>
                {!isApproved && (
                  <div className="business-plan-normal">
                    <div className="text-left text-wrap">Unit price</div>
                    <div className="text-left text-wrap">Billable rate</div>
                    <div className="text-left text-wrap">
                      Direct margin before incentives and project bonus rate
                    </div>
                  </div>
                )}
                <div
                  className="item-label"
                  style={{ borderRight: '1px solid #e1e1e1' }}>
                  Items
                </div>
              </th>
              <th
                style={{ backgroundColor: !isApproved ? '#fff' : 'unset' }}
                key={'compare-norm'}>
                <Fragment>
                  {!isApproved && (
                    <div
                      className="text-center text-wrap h-21"
                      style={{
                        color: !unitPriceNormConfig
                          ? '#525559'
                          : renderColorCompareNorm({
                              value: unitPriceTotalValue,
                              rowKey: 'UNIT_PRICE',
                              normFloor: unitPriceFloor,
                              normCeiling: unitPriceCeiling,
                            }),
                        fontWeight: 500,
                      }}>
                      <Tooltip
                        title={`(Total) Unit price norm = ${
                          unitPriceNormConfig
                            ? formatNumber(unitPriceNormConfig)
                            : ''
                        }`}>
                        {formatNumber(unitPriceTotalValue, false)}
                      </Tooltip>
                    </div>
                  )}

                  {!isApproved && (
                    <div
                      className="text-center text-wrap h-21"
                      style={{
                        color: !billableRatePercentage
                          ? '#525559'
                          : renderColorCompareNorm({
                              value: billableRateTotalValue,
                              rowKey: 'BILLABLE_RATE',
                              normPercentage: billableRatePercentage,
                            }),
                        fontWeight: 500,
                      }}>
                      <Tooltip
                        title={`(Total) Billable rate norm = ${
                          billableRatePercentage
                            ? formatNumber(billableRatePercentage)
                            : ''
                        } %`}>
                        {formatNumber(billableRateTotalValue, true)}
                      </Tooltip>
                    </div>
                  )}

                  {!isApproved && (
                    <div
                      className="text-center text-wrap pb-24 h-42"
                      style={{
                        color: !directMarginPercentage
                          ? '#525559'
                          : renderColorCompareNorm({
                              value: directMarginTotalValue,
                              rowKey: 'DIRECT_MARGIN_BONUS_RATE',
                              normPercentage: directMarginPercentage,
                            }),
                        fontWeight: 500,
                      }}>
                      <Tooltip
                        title={`(Total) Direct margin before incentives and project bonus rate norm = ${
                          directMarginPercentage
                            ? formatNumber(directMarginPercentage)
                            : ''
                        } %`}>
                        {formatNumber(directMarginTotalValue, true)}
                      </Tooltip>
                    </div>
                  )}
                </Fragment>
                <div
                  className="item-label"
                  style={{ borderRight: '1px solid #e1e1e1' }}>
                  Total
                </div>
              </th>
              {columns.slice(1).map(item => (
                <th
                  style={{ backgroundColor: !isApproved ? '#fff' : 'unset' }}
                  key={item.index}>
                  <Fragment>
                    {!isApproved && (
                      <div
                        className="text-center text-wrap h-21"
                        style={{
                          color: !findNormConfigByColumnKey(
                            unitPriceArray,
                            item.columnKey
                          )
                            ? '#525559'
                            : renderColorCompareNorm({
                                value: findValueByColumnKey(
                                  unitPriceArray,
                                  item.columnKey
                                ),
                                rowKey: 'UNIT_PRICE',
                                normFloor: findFloorByColumnKey(
                                  unitPriceArray,
                                  item.columnKey
                                ),
                                normCeiling: findCeilingByColumnKey(
                                  unitPriceArray,
                                  item.columnKey
                                ),
                              }),
                          fontWeight: 500,
                        }}>
                        <Tooltip
                          title={
                            item.columnKey === 'INTERNAL'
                              ? null
                              : `${'(' + item.label + ')'} Unit price norm = ${
                                  findNormConfigByColumnKey(
                                    unitPriceArray,
                                    item.columnKey
                                  )
                                    ? formatNumber(
                                        findNormConfigByColumnKey(
                                          unitPriceArray,
                                          item.columnKey
                                        )
                                      )
                                    : ''
                                }`
                          }>
                          {formatNumber(
                            findValueByColumnKey(
                              unitPriceArray,
                              item.columnKey
                            ),
                            false
                          )}
                        </Tooltip>
                      </div>
                    )}

                    {!isApproved && (
                      <div
                        className="text-center text-wrap h-21"
                        style={{
                          color: !findPercentageByColumnKey(
                            billableRateArray,
                            item.columnKey
                          )
                            ? '#525559'
                            : renderColorCompareNorm({
                                value: findValueByColumnKey(
                                  billableRateArray,
                                  item.columnKey
                                ),
                                rowKey: 'BILLABLE_RATE',
                                normPercentage: findPercentageByColumnKey(
                                  billableRateArray,
                                  item.columnKey
                                ),
                              }),
                          fontWeight: 500,
                        }}>
                        <Tooltip
                          title={
                            item.columnKey === 'INTERNAL'
                              ? null
                              : `${
                                  '(' + item.label + ')'
                                } Billable rate norm = ${
                                  findPercentageByColumnKey(
                                    billableRateArray,
                                    item.columnKey
                                  )
                                    ? formatNumber(
                                        findPercentageByColumnKey(
                                          billableRateArray,
                                          item.columnKey
                                        )
                                      )
                                    : ''
                                } %`
                          }>
                          {formatNumber(
                            findValueByColumnKey(
                              billableRateArray,
                              item.columnKey
                            ),
                            true
                          )}
                        </Tooltip>
                      </div>
                    )}

                    {!isApproved && (
                      <div
                        className="text-center text-wrap pb-24 h-42"
                        style={{
                          color: !findPercentageByColumnKey(
                            directMarginArray,
                            item.columnKey
                          )
                            ? '#525559'
                            : renderColorCompareNorm({
                                value: findValueByColumnKey(
                                  directMarginArray,
                                  item.columnKey
                                ),
                                rowKey: 'DIRECT_MARGIN_BONUS_RATE',
                                normPercentage: findPercentageByColumnKey(
                                  directMarginArray,
                                  item.columnKey
                                ),
                              }),
                          fontWeight: 500,
                        }}>
                        <Tooltip
                          title={
                            item.columnKey === 'INTERNAL'
                              ? null
                              : `${
                                  '(' + item.label + ')'
                                } Direct margin before incentives and project bonus rate norm = ${
                                  findPercentageByColumnKey(
                                    directMarginArray,
                                    item.columnKey
                                  )
                                    ? formatNumber(
                                        findPercentageByColumnKey(
                                          directMarginArray,
                                          item.columnKey
                                        )
                                      )
                                    : ''
                                } %`
                          }>
                          {formatNumber(
                            findValueByColumnKey(
                              directMarginArray,
                              item.columnKey
                            ),
                            true
                          )}
                        </Tooltip>
                      </div>
                    )}
                  </Fragment>
                  <div
                    className="item-label"
                    style={{ borderRight: '1px solid #e1e1e1' }}>
                    <div>{item.label}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderTable()}</tbody>
        </table>
      </StyledWrapper>
    </Fragment>
  )
}

export default BusinessPlanFormSection
