import { SourceConstants } from '@/constants/ActivityKeyConstants'

const typeList = {
  PROJECT: 'PROJECT',
  PROJECT_REQUEST: 'PROJECT_REQUEST',
}

const MenuTabs = {
  DASHBOARD: 'Dashboard',
  DELIVERY: 'Delivery',
  SETTING: 'Setting',
  TASKS: 'Tasks',
}

const DETAIL_PAGE_CONFIG = [
  {
    key: 'project_list',
    label: 'Project List',
    state: SourceConstants.PROJECTS_LIST,
    listUrls: [
      SourceConstants.PROJECT_OVERVIEW,
      SourceConstants.DELIVERY_PROJECT_ISSUE_UPDATE,
      SourceConstants.PROJECT_RISK,
      SourceConstants.PROJECT_RISK_DETAIL,
      SourceConstants.PROJECT_ISSUE,
      SourceConstants.PROJECT_MEMBER,
      SourceConstants.PROJECT_RESOURCE_ALLOCATE,
      SourceConstants.PROJECT_KPI,
      SourceConstants.PROJECT_SETTING,
      SourceConstants.PROJECT_MONITOR_REPORT,
      SourceConstants.PROJECT_INPUTS,
      SourceConstants.PROJECT_CM_OVERVIEWS,
      SourceConstants.PROJECT_CI,
      SourceConstants.PROJECT_CI_RELATIONSHIP,
      SourceConstants.PROJECT_TICKET_SYSTEM,
    ],
    stringDetail: '{projectId}',
    subMenuGroups: [
      { name: 'CM Plan', pathPrefix: 'project-cmplan' },
    ],
  },
  {
    key: 'reports_sap',
    label: 'Sap Report',
    state: SourceConstants.REPORTS_SAP,
    listUrls: [SourceConstants.REPORTS_SAP_DETAIL],
  },
  {
    key: 'project_request',
    label: 'Project Request',
    state: SourceConstants.TASKS_PROJECT_REQUEST_LIST,
    listUrls: [
      SourceConstants.PROJECT_OPEN_NEW_WITH_ID,
      SourceConstants.PROJECT_UPDATE_DETAIL_WITH_ID,
      SourceConstants.PROJECT_CLOSE_DETAIL,
      SourceConstants.PROJECT_CLOSE_DETAIL_WITH_ID,
      SourceConstants.PROJECT_OPEN_NEW_WITHOUT_ID,
      SourceConstants.PROJECT_UPDATE_DETAIL_WITHOUT_ID,
    ],
  },
  {
    key: 'wo_list',
    label: 'WO list',
    state: SourceConstants.PROJECT_WO_LIST,
    listUrls: [SourceConstants.PROJECT_WO_OVERVIEW],
    isBackToList: true,
  },
  {
    key: 'business_plan_list',
    label: 'Business plan list',
    state: SourceConstants.BUSINESS_PLAN_LIST,
    listUrls: [SourceConstants.BUSINESS_PLAN_DETAIL],
    isBackToList: true,
  },
  {
    key: 'business_plan_request',
    label: 'Business plan request',
    state: SourceConstants.BUSINESS_PLAN_REQUEST,
    listUrls: [SourceConstants.BUSINESS_PLAN_DETAIL],
    isBackToList: true,
  },
  
]

const PAGE_WITHOUT_BREADCRUMB = [SourceConstants.DELIVERY_DPM]

const PATH = {
  SAP_REPORT: 'sap-report',
}

export { typeList, MenuTabs, DETAIL_PAGE_CONFIG, PAGE_WITHOUT_BREADCRUMB, PATH }
