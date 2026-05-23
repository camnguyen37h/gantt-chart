import PropTypes from 'prop-types'
import {
  Button,
  Checkbox,
  Col,
  Menu,
  Popover,
  Radio,
  Row,
  Select,
  Tooltip,
} from 'antd'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeadCountTable from './ResourcesInformation/HeadCountTable'
import LaborCostTable from './ResourcesInformation/LaborCostTable'
import FilterBusinessPlan from '../FilterBusinessPlan/FilterBusinessPlan'
import {
  getVisibleColumns,
  checkboxItems,
  loadDataFromList,
  mainColumns,
} from './utils'
import {
  setFiltersResourcesInformation,
  getListResource,
  getResourcesInformationDeliveryPlan,
  setResourceInfoTableParams,
  setLoadDataFromValue,
  setIsSaveShowedDeliveryPlan,
  getEmployeePosition,
  getEmployeeRole,
  getEmployeeType,
  getListResourceType,
  getLocation,
  resetPayloadSaveDelivery,
  setDataResourcesInformation,
} from '../../redux'
import { debounce, isEqual } from 'lodash'
import {
  ACTION_NOT_AVAILABLE_MESSAGE,
  RESOURCE_INFORMATION_TYPE,
  REVIEWING_WARNING_MESSAGE,
} from './constants'
import { ALL_OPTION_VALUE } from '../../constants'
import { useBusinessPlanDetails } from '../../hooks'
const { Option } = Select

const buildFilterSelectConfig = (name, options, title) => {
  const mappedOptions = options
    ? options.map(item =>
        name === 'location'
          ? { ...item, text: item.name, value: item.name }
          : { ...item, text: item.value }
      )
    : []
  return {
    name,
    type: 'select',
    options: mappedOptions,
    title,
    mode: 'single',
    controlProps: {
      showSearch: true,
      optionFilterProp: 'value',
      filterOption: (input, option) =>
        option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0,
      maxTagCount: 1,
    },
  }
}

const ResourcesInformation = forwardRef((props, ref) => {
  const {
    canEdit,
    canView,
    buId,
    deliveryUnitDataDelivery,
    isExpandPanel,
    isSaveShowed,
    mvv,
  } = props

  const dispatch = useDispatch()
  const filterRef = useRef()
  const headCountTableRef = useRef()
  const prevBuIdRef = useRef(buId)

  const {
    listResource,
    listResourceType,
    listLocation,
    listPosition,
    loadingListPosition,
    listRole,
    listEmployeeType,
    loadingListResource,
    resourceInfoTableParams,
    loadDataFromValue,
    duValueDelivery,
  } = useSelector(state => state.businessPlanDelivery)

  const { status } = useBusinessPlanDetails()

  const filters = useSelector(
    state => state.businessPlanDelivery.filtersResourcesInfo,
    isEqual
  )

  const [valueRadio, setValueRadio] = useState(1)
  const [checkedItems, setCheckedItems] = useState(
    checkboxItems.reduce((acc, item) => {
      acc[item.value] = item.checked
      return acc
    }, {})
  )
  const [listResourceFilter, setListResourceFilter] = useState([])

  useEffect(() => {
    if (canEdit) {
      dispatch(getListResourceType())
      dispatch(getLocation())
      dispatch(getEmployeeType())
      dispatch(getEmployeePosition({ mvv }))
      dispatch(getEmployeeRole())
    }
  }, [canEdit, mvv, dispatch])

  const handleSearchResource = useMemo(
    () => debounce(
      value => dispatch(getListResource({ name: value.toString().trim() })),
      1000
    ),
    [dispatch]
  )

  const handleSearchPosition = useMemo(
    () => debounce(
      value =>
        dispatch(getEmployeePosition({ name: value.toString().trim(), mvv })),
      600
    ),
    [dispatch, mvv]
  )

  const handlePositionDropdownClose = useMemo(
    () => debounce(open => {
      if (!open) dispatch(getEmployeePosition({ mvv }))
    }, 300),
    [dispatch, mvv]
  )

  const filterConfig = useMemo(
    () => [
      {
        name: 'resource',
        type: 'select',
        options: listResourceFilter,
        title: 'Resource',
        mode: 'single',
        controlProps: {
          showSearch: true,
          allowClear: true,
          filterOption: false,
          maxTagCount: 1,
          loading: loadingListResource,
          onFocus: () => dispatch(getListResource()),
          onSearch: handleSearchResource,
        },
      },
      buildFilterSelectConfig(
        'resourceType',
        listResourceType,
        'Resource Type'
      ),
      buildFilterSelectConfig('location', listLocation, 'Location'),
      buildFilterSelectConfig(
        'employeeType',
        listEmployeeType,
        'Employee Type'
      ),
      {
        name: 'position',
        type: 'select',
        options: listPosition
          ? listPosition.map(item => ({ ...item, text: item.value }))
          : [],
        title: 'Position',
        mode: 'single',
        controlProps: {
          showSearch: true,
          allowClear: true,
          filterOption: false,
          maxTagCount: 1,
          loading: loadingListPosition,
          onSearch: handleSearchPosition,
          onDropdownVisibleChange: handlePositionDropdownClose,
        },
      },
      buildFilterSelectConfig('role', listRole, 'Role'),
    ],
    [
      listResourceFilter,
      listResourceType,
      listLocation,
      listEmployeeType,
      listPosition,
      listRole,
      loadingListResource,
      loadingListPosition,
      handleSearchResource,
      handleSearchPosition,
      handlePositionDropdownClose,
      dispatch,
    ]
  )

  useEffect(() => {
    if (listResource) {
      setListResourceFilter(
        listResource.map(item => ({
          ...item,
          text: item.name,
          value: item.name,
        }))
      )
    }
  }, [listResource])

  const handleSearchFilters = useCallback(
    value => dispatch(setFiltersResourcesInformation(value)),
    [dispatch]
  )

  const handleCheckboxChange = useCallback(e => {
    setCheckedItems(prev => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }))
  }, [])

  const settingsMenuContent = useMemo(
    () => (
      <Menu>
        {checkboxItems.map(item => (
          <Menu.Item key={item.value}>
            <Checkbox
              name={item.value}
              checked={checkedItems[item.value]}
              onChange={handleCheckboxChange}>
              {item.label}
            </Checkbox>
          </Menu.Item>
        ))}
      </Menu>
    ),
    [checkedItems, handleCheckboxChange]
  )

  const updateIsSaveConfirmShowed = useCallback(
    value => {
      return dispatch(setIsSaveShowedDeliveryPlan(value))
    },
    [dispatch]
  )

  const onChangeRadio = useCallback(({ target: { value } }) => {
    setValueRadio(value)
  }, [])

  const onChangeLoadData = useCallback(
    value => {
      dispatch(setLoadDataFromValue(value))
      dispatch(resetPayloadSaveDelivery())
      if (
        value &&
        canEdit &&
        valueRadio === RESOURCE_INFORMATION_TYPE.HEAD_COUNT
      ) {
        updateIsSaveConfirmShowed(true)
      }
    },
    [dispatch, canEdit, valueRadio, updateIsSaveConfirmShowed]
  )

  useEffect(() => {
    const isVersionChanged = prevBuIdRef.current !== buId
    prevBuIdRef.current = buId

    if (!canView) {
      dispatch(
        setDataResourcesInformation({
          listLabelMonth: [],
          listBudgetMMForEachMonth: {},
          deliveryPlanByHeadCountList: [],
          totalRecord: 0,
        })
      )
      return
    }
    if (!isExpandPanel || !buId) return
    if (!deliveryUnitDataDelivery) return
    if (
      isVersionChanged &&
      deliveryUnitDataDelivery.groupName !== ALL_OPTION_VALUE
    )
      return

    const params = {
      ...resourceInfoTableParams,
      businessPlanVersionId: Number(buId),
      loadDataFromType: loadDataFromValue || '',
      deliveryUnit:
        deliveryUnitDataDelivery.groupName === ALL_OPTION_VALUE
          ? null
          : deliveryUnitDataDelivery.groupName,
      viewType: valueRadio,
      resource: filters['resource'] ? [filters['resource']] : [],
      resourceType: filters['resourceType'] ? filters['resourceType'] : '',
      location: filters['location'] ? [filters['location']] : [],
      employeeType: filters['employeeType'] ? [filters['employeeType']] : [],
      position: filters['position'] ? [filters['position']] : [],
      role: filters['role'] ? [filters['role']] : [],
    }
    dispatch(getResourcesInformationDeliveryPlan(params))
    dispatch(setResourceInfoTableParams(params))
  }, [
    filters,
    loadDataFromValue,
    isExpandPanel,
    valueRadio,
    deliveryUnitDataDelivery,
    buId,
    canView,
    dispatch,
  ])

  useImperativeHandle(
    ref,
    () => ({
      validate: () => {
        return valueRadio === RESOURCE_INFORMATION_TYPE.LABOR_COST
          ? true
          : headCountTableRef.current.validate()
      },
    }),
    [valueRadio]
  )

  const loadDataSelect = (
    <Select
      style={{ width: '200px' }}
      placeholder="Load data from"
      value={loadDataFromValue}
      onChange={onChangeLoadData}
      defaultActiveFirstOption={false}
      filterOption={false}
      disabled={!canEdit}>
      {loadDataFromList.map(option => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  )

  return (
    <div>
      <Row gutter={32} style={{ marginBottom: 20 }}>
        <Col
          span={12}
          style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <FilterBusinessPlan
            ref={filterRef}
            filterConfig={filterConfig}
            skipFetch
            onSearch={handleSearchFilters}
          />
          <Popover
            placement="bottomLeft"
            content={settingsMenuContent}
            trigger="click"
            className="delivery-setting-table">
            <Button icon="setting" size="default" />
          </Popover>
        </Col>
        <Col
          span={12}
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}>
          {canEdit ? (
            loadDataSelect
          ) : (
            <Tooltip
              title={
                duValueDelivery === 'All' || status === 'Draft'
                  ? REVIEWING_WARNING_MESSAGE
                  : ACTION_NOT_AVAILABLE_MESSAGE
              }>
              {loadDataSelect}
            </Tooltip>
          )}
          <Radio.Group
            style={{ minWidth: '200px' }}
            onChange={onChangeRadio}
            check={valueRadio}
            defaultValue={RESOURCE_INFORMATION_TYPE.HEAD_COUNT}
            optionType="button"
            buttonStyle="solid">
            <Radio.Button value={RESOURCE_INFORMATION_TYPE.HEAD_COUNT}>
              Head count
            </Radio.Button>
            <Radio.Button
              value={RESOURCE_INFORMATION_TYPE.LABOR_COST}
              disabled={
                valueRadio === RESOURCE_INFORMATION_TYPE.HEAD_COUNT &&
                isSaveShowed
              }>
              Labor cost
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {valueRadio === RESOURCE_INFORMATION_TYPE.HEAD_COUNT ? (
            <HeadCountTable
              buId={Number(buId)}
              deliveryUnit={deliveryUnitDataDelivery}
              ref={headCountTableRef}
              canEdit={canEdit}
              isExpandPanel={isExpandPanel}
              mvv={mvv}
              mainColumns={getVisibleColumns([...mainColumns], checkedItems)}
            />
          ) : (
            <LaborCostTable
              mainColumns={getVisibleColumns([...mainColumns], checkedItems)}
            />
          )}
        </Col>
      </Row>
    </div>
  )
})

export default ResourcesInformation

ResourcesInformation.propTypes = {
  isExpandPanel: PropTypes.bool.isRequired,
  buId: PropTypes.number,
  deliveryUnitDataDelivery: PropTypes.object,
  isSaveShowed: PropTypes.bool,
  mvv: PropTypes.bool,
  canEdit: PropTypes.bool,
  canView: PropTypes.bool,
}
