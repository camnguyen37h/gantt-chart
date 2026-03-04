import { convertObjectToParams } from './convertObjectToParam'

// Map React environment variables (must be prefixed with REACT_APP_)
// Using direct paths for demo/mock API
const API = 'http://localhost:3000'
const baseURI = 'http://localhost:3000'
const timeSheetAPI = 'http://localhost:3000'
const API_GROUP = 'http://localhost:3000'
const API_MASTERDATA = 'http://localhost:3000'
const API_SALE = 'http://localhost:3000'
const API_CRM = 'http://localhost:3000'
const API_SALE_SYNC = 'http://localhost:3000'

export const URIProperty = {
    defaultHeader() {
        return {
            'Content-Type': 'application/json',
            Authorization: 'Basic ZGFzaGJvYXJkOmFiY0AxMjM0ITIzNTQl',
        }
    },

    getHrReport() {
        return `https://gateway.cmcglobal.com.vn/poa/api/group/GroupReport`
    },

    deletePlan() {
        return `${API}/project/auth/plan`
    },

    login() {
        return baseURI + '/oauth/token'
    },

    logout() {
        return `${API}/oauth/logout`
    },

    checkLogged() {
        return `${API}/me`
    },

    projectByType() {
        return `${API}/projects/type`
    },

    cssChart() {
        return API.concat('/chartcss')
    },

    eeChart() {
        return API.concat('/effort/efficiency')
    },
    getListOfProjectsOfUser() {
        return API.concat('/user/projects')
    },

    getListOfProjectSettingsOfUser() {
        return API.concat('/user/settingProjects')
    },
    getListGNameSettingProject(param) {
        return API.concat(`group-child?id=` + param)
    },

    getDetailedEEData() {
        return API.concat('/billable/detail')
    },

    getDetailedCSSData() {
        return API.concat('/css/detail')
    },

    getListPlansOfProject() {
        return API.concat('/project/auth/plan')
    },

    getAllDuProjectList() {
        return API.concat('/project/du/list')
    },

    getAllTypeProjectList() {
        return API.concat('/project/type-project/list')
    },

    getListPlansByUser() {
        return API.concat('/user/plans')
    },

    resourcePlan() {
        return API.concat('/project/auth/plan')
    },

    exportPlansOfProject(projectId) {
        return API.concat(
            `/resource-allocate/export?projectId=${projectId}`
        )
    },

    exportBillableOfProject(projectId) {
        return API.concat(
            `/project/billable/export?projectId=${projectId}`
        )
    },

    exportListProject(projectId) {
        return API.concat(`/project/list/export?projectId=${projectId}`)
    },

    getListMember(projectId) {
        return API.concat(`/projectMember`)
    },

    getListMemberOfProject(projectId) {
        return API.concat(`/project-member`)
    },

    removeMemberOfProject() {
        return API.concat(`/project-member/remove-member`)
    },

    billable() {
        return API.concat('/project/auth/billable')
    },

    cssURI() {
        return API.concat('/project/auth/css')
    },
    updateCssURI() {
        return API.concat('/project/auth/css/update')
    },
    deleteCssURI() {
        return API.concat('/project/auth/css/delete')
    },
    exportCSS(projectId) {
        return API.concat(`/css/export?projectId=${projectId}`)
    },

    getListOfResource() {
        return API.concat('/resources-new')
    },

    getListOfResourceByPm() {
        return API.concat('/resources-new-by-pm')
    },

    getDeliverUnits() {
        return API.concat('/resources/dus')
    },

    getListResourcesAvailable() {
        return API.concat('/getResourcesAvailable')
    },
    getListTask() {
        return API.concat('/project/auth/task')
    },
    getProjectKpi(projectId) {
        return API.concat('/project/kpi')
    },
    // HungNC
    getListAssignedTasks() {
        return API.concat(
            '/project/auth/tasks-assigned-resource-by-time'
        )
    },
    getTimesheet() {
        return API.concat('/timesheetResource')
    },
    getProjectBasicInfo() {
        return API.concat('/project/project-basic-info')
    },
    getProjectsInDu() {
        return API.concat('/getProjectDeliveyUnit')
    },

    getPlan() {
        return API.concat('/resource/plan')
    },
    //NgocDV
    getResourceManPowers() {
        return API.concat('/resource/man-power')
    },

    getResourceAllocation() {
        return API.concat('/resource-allocation')
    },
    getProjectAllocation() {
        return API.concat('/projects_allocation')
    },

    getUnallocations() {
        return API.concat('/resource/unallocation')
    },
    filterResourceAllocation() {
        return API.concat(
            '/v1/public/resource-allocation/report/resource-allocation-list'
        )
    },
    getparamFilterResourceAllocation() {
        return API.concat('/paramFilter-resource-allocation')
    },
    /**
     * @author nvangoc
     * @returns {string}
     */
    getCreateRiskInProject() {
        return API.concat('/project/risk')
    },
    getRiskPriorityRank() {
        return API.concat('/project/risk/priority-rank')
    },
    getRiskCategory() {
        return API.concat('/project/risk/category')
    },
    getRiskHandlingOptions() {
        return API.concat('/project/risk/handling-options')
    },
    getRiskImpact() {
        return API.concat('/project/risk/impact')
    },
    getRiskLikelihood() {
        return API.concat('/project/risk/likelihood')
    },
    getRiskStatus() {
        return API.concat('/project/risk/status')
    },
    getRiskSubCategory() {
        return API.concat('/project/risk/sub-category')
    },
    getRiskById() {
        return API.concat('/project/risk-detail')
    },
    getEditRiskInProject() {
        return API.concat('/project/risk/edit')
    },
    deleteRisk() {
        return API.concat('/project/risk/delete')
    },
    getRiskHistory() {
        return API.concat('/project/risk-history')
    },
    getIssueByProject() {
        return API.concat('/project/auth/issue-dashboard')
    },
    exportProjectAllocation(param) {
        return API.concat(
            `/v1/public/project-allocation/report/export?userId=${param.userId}&duId=${param.duId}&mvv=${param.mvv}&projectId=${param.projectId}&startDate=${param.startDate}&endDate=${param.endDate}`
        )
    },
    exportBillableSummary(param) {
        return API.concat(
            `/project/billableSummary/export?date=${param}`
        )
    },
    updateProjectInfoByRoleQa() {
        return API.concat(`/update/project/information`)
    },

    getWorkProgress() {
        return API.concat('/project/work-progress')
    },

    getOverdueTasks() {
        return API.concat('/project/overdue-tasks')
    },

    getProjectTimesheets() {
        return API.concat('/project/project-timesheets')
    },

    getNoncomplianceTasks() {
        return API.concat('/project/noncompliance-tasks')
    },

    getTeamHourByActivities() {
        return API.concat('/project/team-hour-by-activities')
    },
    getThroughtputBurndownData() {
        return API.concat('/project/throughtput-burndown')
    },
    //Start-DB2-Timesheet-2019
    getListUser() {
        return API.concat('/user/list')
    },
    getListProject() {
        return API.concat('/ProjectP2')
    },
    getSpentTimeLogByUser(userId) {
        return timeSheetAPI.concat(
            `/spentTimeViewUser?userId=${userId}`
        )
    },
    updateSpentTime() {
        return timeSheetAPI.concat(`/spenttime/update-spent-time`)
    },
    deleteSpentTime() {
        return timeSheetAPI.concat(`/spenttime/delete-spent-time`)
    },
    getRequestListForPM(userId) {
        return API.concat(`/request/getListMyRequest?userId=${userId}`)
    },
    getListProductSpentTime() {
        return timeSheetAPI.concat(`/product/list-product`)
    },
    addTaskSpentTime(projectID, userID) {
        return timeSheetAPI.concat(
            `/spenttime/addtask-spenttime?projectId=${projectID}&userId=${userID}`
        )
    },
    updateTaskSpentTime() {
        return timeSheetAPI.concat(`/spenttime/update-project-task`)
    },
    deleteTaskSpentTime() {
        return timeSheetAPI.concat(`/spenttime/delete-project-task`)
    },
    getListDuTimeSheet(productId) {
        return timeSheetAPI.concat(
            `/actualbill/bill-du?projectId=${productId}`
        )
    },
    // getListUser() {
    //   return API.concat('/user/list');
    // },
    getUser() {
        return API.concat('/user')
    },
    changePass() {
        return API.concat('/user/changepassword')
    },
    getUserSkill() {
        return API_MASTERDATA.concat('/user/list-skill')
    },
    issueCreate() {
        return API.concat('/project/auth/issue-create')
    },
    getAllGroup() {
        return API_GROUP.concat('/allgroup')
    },
    deleteGroup() {
        return API_GROUP.concat('/group/delete/')
    },

    updateUser() {
        return API.concat('/update')
    },

    getIssueById() {
        return API.concat('/project/auth/issue-detail')
    },
    exportDeliveryUnit(param) {
        return API.concat(
            `/list-delivery-unit/export?month=${param.month}&year=${param.year}&column=${param.column}&sort=${param.sort}`
        )
    },
    exportResourceAllocation(param) {
        return API.concat(
            `/v1/public/resource-allocation/report/resource-allocation-list/export?month=${param.month}&year=${param.year}&column=${param.column}&sort=${param.sort}&page=${param.page}&resourceName=${param.resourceName}&deliveryUnit=${param.deliveryUnit}&duPic=${param.duPic}&projectName=${param.projectName}&projectType=${param.projectType}`
        )
    },
    exportActualTimeSheetEffort(params) {
        return API.concat(
            `/v1/public/resource-allocation/report/export-by-actual-timesheet` +
            convertObjectToParams(params)
        )
    },
    exportResourceAllocationNew(params) {
        return API.concat(
            `/v1/public/resource-allocation/report/export` +
            convertObjectToParams(params)
        )
    },
    exportResourceUnallocation(param) {
        return API.concat(
            `/resource/unallocation/export?month=${param.month}&year=${param.year}&activePage=${param.activePage}&size=${param.size}&column=${param.column}&sort=${param.sort}&resourceName=${param.resourceName}&status=${param.status}&deliveryUnit=${param.deliveryUnit}`
        )
    },
    exportResourceInProject(param) {
        return API.concat(
            `/resource/project/export?month=${param.month}&year=${param.year}&market=${param.market}`
        )
    },
    exportProjectKPIReport(param) {
        return API.concat(
            `/v1/public/project-kpi/report/export?startDate=${param.startDate}&endDate=${param.endDate}`
        )
    },
    exportProjectOperationReport(param) {
        return API.concat(
            `/v1/public/project-kpi/report/export-operation?startDate=${param.startDate}&endDate=${param.endDate}`
        )
    },
    exportActualTimeSheetByRoleReport(param) {
        let url = new URL(
            API.concat(
                '/v1/public/resource-allocation/report/export-hr-actual-timesheet'
            )
        )

        Object.keys(param).forEach(key => {
            if (
                Array.isArray(param[key])
                    ? param[key].length > 0
                    : param[key] !== undefined && param[key] !== null && param[key] !== ''
            ) {
                url.searchParams.append(key, param[key])
            }
        })

        return url.toString()
    },
    exportMVVListInProject(param) {
        let url = new URL(
            API.concat(
                '/v1/public/resource-allocation/report/export-hr-mvv'
            )
        )

        Object.keys(param).forEach(key => {
            if (
                Array.isArray(param[key])
                    ? param[key].length > 0
                    : param[key] !== undefined && param[key] !== ''
            ) {
                url.searchParams.append(key, param[key])
            }
        })

        return url.toString()
    },

    exportPerformanceAndBonus(param) {
        return API_SALE.concat(
            `/api/performance-bonus/export?startDate=${param.startDate}&endDate=${param.endDate}`
        )
    },

    exportPerformanceScoreByMonth(param) {
        let url = new URL(
            API.concat(
                '/v1/public/resource-allocation/report/export-hr-actual-timesheet-by-month'
            )
        )

        Object.keys(param).forEach(key => {
            if (
                Array.isArray(param[key])
                    ? param[key].length > 0
                    : param[key] !== undefined && param[key] !== ''
            ) {
                url.searchParams.append(key, param[key])
            }
        })

        return url.toString()
    },
    exportPerformanceScoreByDay(param) {
        let url = new URL(
            API.concat(
                '/v1/public/resource-allocation/report/export-hr-actual-timesheet-by-day'
            )
        )

        Object.keys(param).forEach(key => {
            if (
                Array.isArray(param[key])
                    ? param[key].length > 0
                    : param[key] !== undefined && param[key] !== ''
            ) {
                url.searchParams.append(key, param[key])
            }
        })

        return url.toString()
    },
    //htanh6
    exportResourceInProjectPreview(param) {
        return API.concat(
            `/resource/project/preview?month=${param.month}&year=${param.year}&market=${param.market}&size=${param.size}&page=${param.page}`
        )
    },
    exportEffortResourceInDU(param) {
        return API.concat(
            `/resource/overview/v2/allocation/export?location=${param.location}&timeType=${param.timeType}&year=${param.year}&month=${param.month}&numberQuarter=${param.numberQuarter}&duId=${param.duId}&groupId=${param.groupId}`
        )
    },
    exportAvailableResource(param) {
        return API.concat(
            `/resource/overview/v2/allocation/export?location=${param.location}&group=${param.group}&rolesSearch=${param.rolesResource}&gId=${param.gId}&isDu=${param.isDu}&child=${param.child}&fromDate=${param.startDate}&toDate=${param.endDate}&skills=${param.skills}&languages=${param.language}&levels=${param.seniority}`
        )
    },
    //csv project list
    exportListProjectDelivery(param) {
        return API_CRM.concat(
            `/api/delivery/v1/project/projectlist/export?` + param
        )
    },

    apiCheckPermissionViewProjectDetail() {
        return API_CRM.concat(`/authorization/project-info`)
    },

    //lxlinh
    createEvaluateProject() {
        return API.concat('/project/insert-evaluate-project')
    },
    editEvaluateProject() {
        return API.concat('/project/edit-evaluate-project')
    },
    updateCommentEvaluate() {
        return API.concat(
            '/project/evaluate-project/evaluate-comment/update'
        )
    },
    getEvaluateProjects() {
        return API.concat(
            '/project/evaluate-project/evaluate-project-week'
        )
    },

    getSolutionByRisk() {
        return API.concat('/project/auth/solution')
    },
    addSolution() {
        return API.concat('/solutions')
    },

    getUserByProject() {
        return API.concat('/project/user')
    },
    assignProjectIssue() {
        return API.concat('/project/issue/assign')
    },
    issueDelete() {
        return API.concat('/project/issue-delete')
    },

    getCommentBySolution() {
        return API.concat('/project/auth/commentSolution')
    },

    commentCreate() {
        return API.concat('/project/auth/comment-create')
    },
    getResourcesAllocation() {
        return API.concat('/resources/allocations')
    },

    issueUpdate() {
        return API.concat('/project/auth/issue-update')
    },

    deleteSolution() {
        return API.concat('/project/auth/delete-solution')
    },

    commentDelete() {
        return API.concat('/project/auth/delete-comment')
    },

    getIssueHistory() {
        return API.concat('/project/issue-history')
    },

    editSolutionComment() {
        return API.concat('/project/auth/edit-comment')
    },

    getProjectMembers() {
        return API.concat(`/project/member`)
    },

    assignSolution() {
        return API.concat('/project/auth/assign-solution')
    },

    changeStatusSolution() {
        return API.concat('/project/auth/solution/update-status')
    },

    getPcvRatesByProjectId(projectId) {
        return API.concat(`/projects/${projectId}/pcv-rates`)
    },

    createProjectPcvRate() {
        return API.concat('/project-pcv-rates')
    },

    updateProjectPcvRate() {
        return API.concat('/project-pcv-rates')
    },
    deleteProjectPcvRate() {
        return API.concat('/project-pcv-rates')
    },

    getProjectDelivery() {
        return API.concat('/project/project-delivery/get')
    },

    saveProjectDelivery() {
        return API.concat('/project/project-delivery/create')
    },
    updateProjectDelivery() {
        return API.concat('/project/project-delivery/update')
    },
    deleteProjectDelivery() {
        return API.concat('/project/project-delivery/delete')
    },
    /**
     * NVTIEP2
     */
    getProjectTypes() {
        return API.concat('/project-type/list')
    },
    getEditProject() {
        return API.concat(`/project/edit`)
    },
    getListProjectInfo() {
        return API.concat(`/project/parent-project-info`)
    },
    getListWoInfo() {
        return API.concat(`/project/project-code-and-work-order-info`)
    },
    updateProject() {
        return API.concat(`/project/update`)
    },
    putProjectInfo() {
        return API.concat(`/project/update-project-information`)
    },
    updateProjectQA(projectId) {
        return API.concat(`/project/update-qa-project/${projectId}`)
    },
    postProjectZone() {
        return API.concat(`/zone/add-zone`)
    },
    changeStatusProject() {
        return API.concat(`/project/changeStatus`)
    },
    /**
     * MR DUC
     */
    insertUser() {
        return API.concat('/user/insert')
    },
    insertGroup() {
        return API.concat('/group/insert')
    },
    updateGroup() {
        return API_GROUP.concat('/group/update')
    },

    /**
     * MR DUC
     */
    //PNTHANH
    getAllUserRole() {
        return API.concat('/user/listRole')
    },
    getRole() {
        return API.concat('/allrole')
    },
    addUserRole() {
        return API.concat('/user/add/role')
    },
    removeUserRole() {
        return API.concat('/user/remove/role')
    },
    getAllRolePermission() {
        return API.concat('/role/getAllRolePermission')
    },
    removeRolePermission() {
        return API.concat('/role/removeRolePermission')
    },
    addRolePermission() {
        return API.concat('/add/role/permission')
    },
    getOnePermission() {
        return API.concat('/permission/id')
    },

    updateRole() {
        return API.concat('/role/update')
    },

    roleCreate() {
        return API.concat('/role/save')
    },
    deleteRole() {
        return API.concat('/role/delete')
    },
    getPermission() {
        return API.concat('/allpermission')
    },
    updatePermission() {
        return API.concat('/permission/update')
    },
    permissionCreate() {
        return API.concat('/permission/save')
    },
    deletePermission() {
        return API.concat('/permission/delete')
    },
    /**
     * CONG
     */
    getAllSkill() {
        return API_MASTERDATA.concat('/skill/list')
    },
    createSkill() {
        return API_MASTERDATA.concat('/skill/create')
    },
    updateSkill() {
        return API_MASTERDATA.concat('/skill/update')
    },
    deleteSkill(data) {
        return API_MASTERDATA.concat('/skill/delete/' + data)
    },

    getListProjectType() {
        return API.concat('/project/project-type/get')
    },
    getCreateProjectType() {
        return API.concat('/project/project-type/create')
    },
    getProjectTypeById(data) {
        return API.concat('/project/project-type/' + data)
    },
    getDeleteProjectType(data) {
        return API.concat('/project/project-type/delete/' + data)
    },
    updateProjectType() {
        return API.concat('/project/project-type/update')
    },
    getListProjectRole() {
        return API.concat('/project/project-role/get')
    },

    getGroupByProjectMember() {
        return API.concat(`/project/group`)
    },

    getListProjectCode(projectId) {
        return API_CRM.concat(
            `/api/delivery/v1/project/projectCode/${projectId}`
        )
    },

    getBillableByProjectId(projectId) {
        return API.concat(`/projects/${projectId}/project-billable`)
    },
    createProjectBillable() {
        return API.concat('/create-billable')
    },
    deleteProjectBillable(projectBillableId) {
        return API.concat(`/project-billable/${projectBillableId}`)
    },
    updateProjectBillable(projectBillableId) {
        return API.concat(`/update-billable/${projectBillableId}`)
    },
    getProjectComment(projectId) {
        return API.concat(`/projectcomment/list/${projectId}`)
    },
    createProjectComment() {
        return API.concat('/projectcomment/add')
    },
    deleteProjectComment(commentId) {
        return API.concat(`/projectcomment/delete/${commentId}`)
    },
    updateProjectComment() {
        return API.concat('/projectcomment/edit')
    },
    updateLineOfCode() {
        return API.concat(`/project/line-of-code`)
    },
    getProject(projectId) {
        return API.concat(`/project`)
    },

    getProjectOverview() {
        return API.concat(`/project/project-overview`)
    },
    getOverviewTable(projectId) {
        return API.concat(
            `/project/kpi-overview?projectId=${projectId}`
        )
    },
    getAllUserEdit() {
        return API.concat(`/project/edit/alluser`)
    },

    //Start-DB2-Timesheet-2019
    //Linh
    getListFormula() {
        return API.concat(`/formula/getAll`)
    },
    getAllNotifiCation(userId) {
        return API.concat(
            `/notification/getListDTOByUserId?userId=${userId}`
        )
    },

    //pasx
    getAllVersionByProjectId(projectId) {
        return API.concat(`/pasx/getAllVersion?projectId=${projectId}`)
    },
    getDetailVersionById(versionId) {
        return API.concat(
            `/pasx/getDetailVersionById?pasxId=${versionId}`
        )
    },
    getListRequestPasx() {
        return API.concat(`/pasx/getlistRequestPasx`)
    },
    approveRequestPasx(pasxId) {
        return API.concat(`/pasx/approvelRequestPasx?pasxId=${pasxId}`)
    },
    rejectRequestPasx(pasxId) {
        return API.concat(`/pasx/rejectRequestPasx?pasxId=${pasxId}`)
    },
    createNewPasx(projectId) {
        return API.concat(`/pasx/add-pasx?projectId=${projectId}`)
    },
    updatePasx(pasxId) {
        return API.concat(`/pasx/updatePasxById?pasxId=${pasxId}`)
    },
    checkOverlap(userId, fromDate, toDate) {
        return API.concat(
            `/pasx/checkOverlap?userId=${userId}&fromDate=${fromDate}&toDate=${toDate}`
        )
    },
    // end pasx
    getAllListTimeSheet(userId, week, year) {
        return API.concat(
            `/viewdatalog?userId=${userId}&week=${week}&year=${year}`
        )
    },
    // tqdat3 get list du

    getProjectByUserBindSelect(userId) {
        return API.concat(`/getprojectbyuserId?userId=${userId}`)
    },
    getListBookedByWeek() {
        return API.concat(`/getListBookedByWeek`)
    },
    getListAllocatedByWeek() {
        return API.concat(`/getListAllocatedByWeek`)
    },
    getListAvailableByWeek() {
        return API.concat(`/getListAvailableByWeek`)
    },
    getCurrentWeek() {
        return API.concat(`/resourceAvailableCurrentWeek`)
    },
    getAllTimeSheetByUser() {
        return timeSheetAPI.concat(`/spenttime/view-spent`)
    },
    getProjectByUser(userId, projectType, selectDate, role) {
        if (selectDate) {
            return API.concat(
                `/getListProject?userId=${userId}&type=${projectType}&selectDate=${selectDate}&role=${role}`
            )
        }
        return API.concat(
            `/getListProject?userId=${userId}&type=${projectType}`
        )
    },
    searchProjectsTimeSheet() {
        return API_CRM.concat(
            `/api/delivery/v1/view/search-project-list-by-activities`
        )
    },
    searchProjectsBillable() {
        return API_CRM.concat(
            `/api/delivery/v1/view/search-project-list-by-permissions`
        )
    },
    searchProjectsTimeSheetMember() {
        return API.concat(`/allocated-project`)
    },
    createTasklog() {
        return timeSheetAPI.concat(`/spenttime/add-project-task`)
    },
    getGroupUserByUserId(userId) {
        return API.concat(`/group/userId?userId=${userId}`)
    },
    updateTimeSheetDb() {
        return timeSheetAPI.concat(`/spenttime/update-spent-time`)
    },
    /** Get recent interact project (interval: 1 week) */
    getRecentProjects(userId) {
        return timeSheetAPI.concat(
            `/spenttime/view-log-spent-member-remember?userId=${userId}`
        )
    },
    // request timesheet
    getRequestListRequestTimeSheet() {
        return timeSheetAPI.concat(`/spenttime/timesheet`)
    },
    // request timesheet pagging
    getRequestListRequestTimeSheetPagging() {
        return timeSheetAPI.concat(`/spenttime/timesheet2`)
    },

    getProjectListTimeSheet() {
        return timeSheetAPI.concat(`/spenttime/allProject`)
    },
    getAllGroupChild() {
        return API.concat(`/allgroup-child`)
    },
    getMyTimesheet() {
        return timeSheetAPI.concat(`/spenttime/view-log-spent-member`)
    },
    deleteTasks() {
        return timeSheetAPI.concat(`/spenttime/delete-project-task`)
    },
    updateTask() {
        return timeSheetAPI.concat(`/spenttime/update-project-task`)
    },
    getRequestTimeSheet(userId) {
        return API.concat(`/fill-request?userId=${userId}`)
    },

    getListProductWithRole(roleIds) {
        return timeSheetAPI.concat(
            `/product/list-product?arrRoleId=${roleIds}`
        )
    },

    createProduct() {
        return timeSheetAPI.concat(`/product/create`)
    },
    updateProduct() {
        return timeSheetAPI.concat(`/product/edit`)
    },
    deleteProduct(productId) {
        return timeSheetAPI.concat(`/product/${productId}`)
    },
    createActivity() {
        return timeSheetAPI.concat(`/activity/create`)
    },
    updateActivity() {
        return timeSheetAPI.concat(`/activity/edit`)
    },
    deleteActivity(activityId) {
        return timeSheetAPI.concat(`/activity/${activityId}`)
    },
    // end Product and Activity
    getTimeSheetApprove() {
        return timeSheetAPI.concat(`/spenttime/view-log-spent`)
    },
    getTimeSheetApproveByProjectId(params) {
        return timeSheetAPI.concat(
            `/spenttime/view-log-spent-filter?role=${params.role}&week=${params.week}&years=${params.years}&projectId=${params.projectId}`
        )
    },
    urlTimeSheetChangeStatus() {
        return timeSheetAPI.concat(`/spenttime/view-log-spent`)
    },
    urlRejectTask() {
        // spenttime/reject-task-role
        return timeSheetAPI.concat(`/spenttime/reject-task-role`)
    },
    urlApproveTask() {
        // spenttime/approvel-task-role
        return timeSheetAPI.concat(`/spenttime/approvel-task-role`)
    },
    urlApproveRequestAll() {
        // spenttime/approvel-task-role
        return timeSheetAPI.concat(`/spenttime/send-to-request`)
    },
    urlRejectRequestAll() {
        // spenttime/approvel-task-role
        return timeSheetAPI.concat(
            `/spenttime/reject-allRequest-OfProject-ByWeek-Task`
        )
    },
    sendRequestMember() {
        return timeSheetAPI.concat(`/spenttime/send-request-approve`)
    },
    sendRequestOfProject(projectId, years, week, userId) {
        return timeSheetAPI.concat(
            `/spenttime/send-to-request-each-project?projectId=${projectId}&years=${years}&week=${week}&userId=${userId}`
        )
    },
    approveOfProject(projectId, userId, week, years, role) {
        return timeSheetAPI.concat(
            `/spenttime/approvel-eachProject-allTask?projectId=${projectId}&years=${years}&week=${week}&userId=${userId}&role=${role}`
        )
    },
    rejectOfProject(projectId, userId, week, years, role, comment) {
        return timeSheetAPI.concat(
            `/spenttime/reject-eachProject-allTask?projectId=${projectId}&years=${years}&week=${week}&userId=${userId}&role=${role}&comment=${comment}`
        )
    },

    getAllUserByProject(projectIds) {
        return timeSheetAPI.concat(
            `/spenttime/getListUsersByProjectIds?projectIds=${projectIds}`
        )
    },

    getProjectByRole(role, userId) {
        return timeSheetAPI.concat(
            `/spenttime/getListProjectByRole?role=${role}&userId=${userId}`
        )
    },

    getUsersByProjectIds(projectIds) {
        return timeSheetAPI.concat(
            `/spenttime/getListUsersByProjectIds?projectIds=${projectIds}`
        )
    },
    getDataProjectReport() {
        return API.concat(`/project/reports`)
    },
    getDataProjectReportByRole(data) {
        return API.concat(
            `/project/reports?weak=${data.week}&projectId=${data.projectId}&userId=${data.userId}&year=${data.year}`
        )
        // return API.concat(`/project/reports?weak=${data.week}&projectId=${data.projectId}&userId=${data.userId}&year=${data.year}&role=${data.role}`)
    },
    getDataProjectReportFilter(week, year) {
        return API.concat(`/project/reports?weak=${week}&year=${year}`)
    },

    getDataDeliveryTimeSheetReport() {
        return timeSheetAPI.concat(`/spenttime/delivery/reports`)
    },
    exportFileExcelDelivery(week, year, du) {
        if (du === '') {
            return timeSheetAPI.concat(
                `/spenttime/cover-excel-to-File-delivery?weak=${week}&year=${year}`
            )
        } else {
            return timeSheetAPI.concat(
                `/spenttime/cover-excel-to-File-delivery?weak=${week}&year=${year}&DU=${du}`
            )
        }
    },
    getListGroupParentChildByDu() {
        return API_GROUP.concat(`/allgroup-parentchild-all`)
    },
    //end-DB2-Timesheet-2019
    getListMonitoring() {
        return API.concat(`/delivery-unit/monitoring`)
    },
    getAllIssue() {
        return API.concat(`/issue/all`)
    },
    getProjectByDu() {
        return API.concat(`/project/du`)
    },
    getAllRisk() {
        return API.concat(`/risk/all`)
    },
    updateManPower() {
        return API.concat(`/man-powers/updatebytime`)
    },
    getDUStatistic() {
        return API.concat(`/du-statistic`)
    },
    getAvailableResourceV2() {
        return API.concat(
            `/resource/overview/available/du-statistic-v2`
        )
    },
    getAllGroupParentChild() {
        return API.concat(`/allgroup-parentchild`)
    },
    getAllGroupDropdown() {
        return API_MASTERDATA.concat(
            `/setting/companyDelivery/all-group-dropdown`
        )
    },
    getAllGroupParentChildQuarterYear() {
        return API_GROUP.concat(`/allgroup-parentchild-quarteryear`)
    },
    getAllGroupParentChildQuarterYearWithPermission() {
        return API_GROUP.concat(
            `/allgroup-parentchild-quarteryear-with-permission`
        )
    },
    updateDUStatistic() {
        return API.concat(`/update/du-statistic`)
    },
    getBillableProjectDelivery() {
        return API.concat(`/delivery/project-billable`)
    },
    getUserNotWorkingDeliveryUnit() {
        return API.concat(`/delivery/userNotWorking`)
    },
    editNoteDeliveryUnit() {
        return API.concat(`/delivery/edit-note`)
    },
    getListProjectNorm() {
        return API_MASTERDATA.concat(`/project/norm`)
    },
    createProjectNorm() {
        return API_MASTERDATA.concat(`/project/norm/add`)
    },
    updateProjectNorm() {
        return API_MASTERDATA.concat(`/project/norm/update`)
    },
    deleteProjectNorm(data) {
        return API_MASTERDATA.concat('/project/norm/delete/' + data)
    },
    getAllDUSetting() {
        return API_MASTERDATA.concat(`/setting/du/all`)
    },
    getListDUSetting() {
        return API_MASTERDATA.concat(`/setting/du`)
    },
    createDUSetting() {
        return API_MASTERDATA.concat(`/setting/du/add`)
    },
    updateDUSetting() {
        return API_MASTERDATA.concat(`/setting/du/update`)
    },
    deleteDUSetting(data) {
        return API_MASTERDATA.concat('/setting/du/delete/' + data)
    },
    getAllGlobalSetting() {
        return API_MASTERDATA.concat(`/setting/global/all`)
    },
    getListGlobalSetting() {
        return API_MASTERDATA.concat(`/setting/global`)
    },
    createGlobalSetting() {
        return API_MASTERDATA.concat(`/setting/global/add`)
    },
    updateGlobalSetting() {
        return API_MASTERDATA.concat(`/setting/global/update`)
    },
    deleteGlobalSetting(data) {
        return API_MASTERDATA.concat('/setting/global/delete/' + data)
    },
    getInforGeneralProject() {
        return API.concat(`/project/general-info`)
    },
    addProject() {
        return API.concat(`/project/add`)
    },
    getNormByDate() {
        return API_MASTERDATA.concat(`/project/norm/getByDate`)
    },
    getListGroupParent() {
        return API_GROUP.concat(`/group/parent`)
    },
    getListUnDevelopmentGroup() {
        return API_GROUP.concat(`/group/unDevelopmentGroup`)
    },
    addHistoryGroup() {
        return API_GROUP.concat(`/group/history/add`)
    },
    updateHistoryGroup() {
        return API_GROUP.concat(`/group/history/update`)
    },
    deleteHistoryGroup() {
        return API_GROUP.concat(`/group/history/delete`)
    },
    getGroupById() {
        return API_GROUP.concat(`/group/getById`)
    },
    loginDashboard() {
        return baseURI.concat(`/login`)
    },
    logoutDashboard() {
        return `${baseURI}/logout`
    },
    getProjectCssCommentById() {
        return API.concat(`/project/getProjectCssCommemt`)
    },
    createProjectCssComment() {
        return API.concat(`/project/createProjectCssCommemt`)
    },
    updateProjectCssComment() {
        return API.concat(`/project/updateProjectCssCommemt`)
    },
    deleteProjectCssComment(id) {
        return API.concat(`/project/deleteProjectCssCommemt/` + id)
    },
    getAllCompanyDelivery() {
        return API_MASTERDATA.concat(`/setting/companyDelivery/all`)
    },
    getListCompanyDelivery() {
        return API_MASTERDATA.concat(`/setting/companyDelivery`)
    },
    createCompanyDelivery() {
        return API_MASTERDATA.concat(`/setting/companyDelivery/add`)
    },
    updateCompanyDelivery() {
        return API_MASTERDATA.concat(`/setting/companyDelivery/update`)
    },
    deleteCompanyDelivery(data) {
        return API_MASTERDATA.concat(
            '/setting/companyDelivery/delete/' + data
        )
    },
    importSapGlobalOverview: {
        url: API_SALE.concat(
            '/api/sap-global-overview/files/import-sap-global-overview'
        ),
        method: 'post',
    },
    importPlanningGlobalOverview: {
        url: API_MASTERDATA.concat('/uploads'),
        method: 'post',
    },
    getGlobalDelivery() {
        return API.concat('/global-delivery')
    },
    getGlobalSale() {
        return API.concat('/global-sale')
    },
    getSaleLead() {
        return API.concat('/sale/lead')
    },
    getAllSaleSetting() {
        return API_MASTERDATA.concat(`/setting/saleSetting/all`)
    },
    getListSaleSetting() {
        return API_MASTERDATA.concat(`/setting/saleSetting`)
    },
    createSaleSetting() {
        return API_MASTERDATA.concat(`/setting/saleSetting/add`)
    },
    updateSaleSetting() {
        return API_MASTERDATA.concat(`/setting/saleSetting/update`)
    },
    deleteSaleSetting(data) {
        return API_MASTERDATA.concat(
            '/setting/saleSetting/delete/' + data
        )
    },

    getSaleLeadSetting() {
        return API_MASTERDATA.concat(`/setting/sale-lead`)
    },
    updateSaleLead() {
        return API_MASTERDATA.concat(`/setting/sale-lead/update`)
    },

    //GroupSale
    getAllGroupSale() {
        return `${API_GROUP}/group-sale/list`
    },
    getChildGroup(idG) {
        return API_GROUP.concat(
            `/current-child-by-group?groupId=` + idG
        )
    },
    getAMGroupSale() {
        return `${API_GROUP}/group-sale/list-am-in-range`
    },

    addGroupSaleUser() {
        return `${API_GROUP}/group-sale/add`
    },

    getNotSaleUser() {
        return `${API_GROUP}/group-sale/unAssignUser`
    },

    updateSaleGroupUser() {
        return `${API_GROUP}/group-sale/update`
    },

    gettreeSale() {
        return `${API_GROUP}/group-sale/group-sale-tree`
    },

    getUserById() {
        return `${API_GROUP}/group-sale/user`
    },

    deleteHistoryGroupSale() {
        return `${API_GROUP}/group-sale/delete`
    },

    getSaleTreeQuarterYear() {
        return API.concat(`/sale/listTreeQuarterYear`)
    },
    getSaleTarget() {
        return `${API_MASTERDATA}/sale-target`
    },
    deleteSaleTarget() {
        return `${API_MASTERDATA}/sale-target`
    },
    addTargetSale() {
        return `${API_MASTERDATA}/sale-target`
    },
    updateTargetSale() {
        return `${API_MASTERDATA}/sale-target`
    },

    getProjectsInSearchBox() {
        return API.concat('/project/search')
    },
    getProjectsInSearchInfo() {
        return API.concat('/project/searchProject')
    },

    getVolumePipeline() {
        return API.concat('/sale/pipelines')
    },
    getChangesPipeline() {
        return API.concat('/sale/changespipeline')
    },
    getSaleNote() {
        return API.concat('/sale/note')
    },
    insertSaleNote() {
        return API.concat('/sale/note')
    },
    updateSaleNote() {
        return API.concat('/sale/note')
    },
    deleteSaleNote(data) {
        return API.concat('/sale/note/' + data)
    },

    //MarketSetting
    marketSetting() {
        return API_MASTERDATA.concat('/setting/market/')
    },
    marketSettingUpdate() {
        return API_MASTERDATA.concat('/setting/market/update')
    },
    getMarketByGroupSale() {
        return API_GROUP.concat('/group-sale/market')
    },
    getListCRMPipeline() {
        return API.concat('/sale/crm-pipeline')
    },
    getListLogs() {
        return API.concat('/logs')
    },
    getAllUserOfDeliveryUnit() {
        return API.concat('/user/deliveryUnit')
    },
    getAllUserBySearch(value) {
        return API_CRM.concat(
            `/api/delivery/v1/user/search-open?search=${value}`
        )
    },
    updateUserProject() {
        return API.concat('/project/user/add')
    },
    removeUserProject() {
        return API.concat('/project/user/remove')
    },
    getSaleOverView() {
        return API.concat('/sale/overview')
    },
    getGlobalSaleRevenue() {
        return API.concat('/global-sale-revenue')
    },

    getUserList() {
        return API_CRM.concat(`/api/delivery/v1/user/search`)
    },
    getSaleOverViewUpdate() {
        return API.concat('/sale/overview-update')
    },
    getSaleProductivity() {
        return API.concat('/sale/productivity')
    },
    getListAMInTime() {
        return API.concat('/group-sale/list-am')
    },
    getListGroupSaleInTime() {
        return API_GROUP.concat('/group-sale-in-time')
    },
    getAllAM() {
        return API.concat('/allAM')
    },
    getAllBU() {
        return API_GROUP.concat('/allBU')
    },
    //holiday setting
    holidaySetting() {
        return API_MASTERDATA.concat('/setting/holiday')
    },
    deleteHolidaySetting(id) {
        return API_MASTERDATA.concat('/setting/holiday/' + id)
    },
    getDataModelWorkOrder() {
        return API.concat('/getModelDataWorkOrder')
    },
    workOrder() {
        return API.concat('/workorder')
    },
    getAllSubWork() {
        return API.concat('/subWorkInfo')
    },
    createDeliveryPlan() {
        return API.concat('/deliveryPlan')
    },
    getListDeliveryPlan() {
        return API.concat('/deliveryPlan')
    },
    getDeliveryPlan() {
        return API.concat('/getDeliveryPlan')
    },
    getManagerNameOfGroup() {
        return API.concat('/group/listManager')
    },
    deleteDeliveryPlan() {
        return API.concat('/deleteDeliveryPlan')
    },
    versionUpDeliveryPlan() {
        return API.concat('/versionUp')
    },
    changeStatusDeliveryPlan() {
        return API.concat('/deliveryPlan/changeStatus')
    },
    //populate delivery plan
    checkConflictEffortDeliveryPlan() {
        return API.concat('/deliveryPlan/checkConflictEffort')
    },
    populateDeliveryPlan() {
        return API.concat('/deliveryPlan/populate')
    },
    exportDeliveryPlan(id) {
        return API.concat(
            `/delivery-unit/exportDeliveryPlan?deliveryPlanId=${id} `
        )
    },
    countExistedSubWo() {
        return API.concat(`/deliveryPlan/findExistedSUbWo`)
    },
    disableDeliveryPlan() {
        return API.concat(`/deliveryPlan/disableDeliveryPlan`)
    },
    subWorkOrder() {
        return API.concat('/sub-workorder')
    },
    countHolidayBetweenDate() {
        return API_MASTERDATA.concat('/setting/countHolidayBetweenDate')
    },
    getWorkOrderByWorkOrderId(id) {
        return API.concat('/workorder/record/' + id)
    },
    getStatOverview(groupId, type) {
        return API.concat('/get-overview-chart')
    },
    getDataChartOverview(group) {
        return API.concat('/sale/overview-datachart')
    },
    getListGroup() {
        return API.concat('/getListGroupByName?lstGroupName')
    },

    getListUserInGroup(groupId, startDate, endDate) {
        let url = API.concat('/group/get-email-in-group')
        url += '?groupId=' + groupId
        if (startDate && endDate) {
            url += '&startDate=' + startDate + '&endDate=' + endDate
        }
        return url
    },
    getFeedBacks(uuid, group, email, startDate, endDate) {
        let url =
            'https://forms.cmcglobal.com.vn/api/feedbacks/analytics?norate=1&uuid=' +
            uuid
        if (email) {
            url += '&email=' + email
        } else {
            url += '&group=' + group
        }
        url +=
            startDate || endDate
                ? '&startDate=' + startDate + '&endDate=' + endDate
                : ''
        return url
    },
    getUUID() {
        return 'https://forms.cmcglobal.com.vn/api/auth'
    },
    getAllSaleTargetBetween() {
        return API_MASTERDATA.concat(
            `/setting/findAllSaleTargetByStartDateAndEndDate`
        )
    },
    getSalePipelineForKPI() {
        return API.concat('/sale/getSalePipelineForKPI')
    },
    getSalePipeLineAndSaleTargetAndSaleLead() {
        return API.concat(
            '/sale/getSalePipeLineAndSaleTargetAndSaleLead'
        )
    },
    getListAMMD() {
        return API_GROUP.concat('/getListAMMD')
    },

    getSaleKpi() {
        return API.concat('/sale/kpi')
    },
    aggregateTreeSaleKpi() {
        return API.concat('/sale/kpi-aggregate')
    },
    getListLeadCRM() {
        return API.concat('/sale/lead/data')
    },
    getDuList() {
        return API_GROUP.concat('/group/du-name')
    },
    getLocationFilter() {
        return API.concat('/user/location-filter')
    },
    exportEmployee() {
        return API.concat(`/delivery/userNotWorking/exportExcel`)
    },
    exportProject(params) {
        let Uri = ''
        let currentUrl = window.location.pathname
        let paramsUrl = ''
        currentUrl.split('/').map((ele, index) => {
            if (index > 2) {
                paramsUrl = paramsUrl
            } else {
                if (!isNaN(ele) && ele != '') {
                    paramsUrl = paramsUrl + '/' + '{projectId}'
                } else {
                    paramsUrl = ele == '' ? paramsUrl : paramsUrl + '/' + ele
                }
            }
        })

        // params = JSON.parse(params)
        const kk = {
            token: localStorage.getItem('access_token'),
            activityKey: 'VIEW',
            paramsUrl: paramsUrl,
            userNameDoFilter: localStorage.getItem('userName'),
            username: localStorage.getItem('userName'),
        }
        if (params === null) {
            params = {}
        }
        params = Object.assign(params, kk)
        if (params) {
            Object.keys(params).forEach(key => {
                Uri += key + '=' + params[key] + '&'
            })
        }
        return API.concat(`/projects/export?${Uri}`)
    },

    getActualBill(from, to, projectId, page, size, du, projectCodes) {
        return timeSheetAPI.concat(
            `/actualbill/view-by-project?from=${from}&to=${to}&projectId=${projectId}&pageIndex=${page}&pageSize=${size}&du=${du}&projectCodes=${projectCodes}`
        )
    },

    apiGetProjectCodeByProject(projectId) {
        return baseURI.concat(
            `/api/get-projectcode-by-project?projectId=${projectId ? projectId : 0}`
        )
    },

    searchUser(key) {
        return API.concat(`/user/search?key=${key}`)
    },

    addBillUser() {
        return timeSheetAPI.concat(`/actualbill/add-bill-user`)
    },
    updateBillUser() {
        return timeSheetAPI.concat(`/actualbill/update-bill-user`)
    },
    addBillTask() {
        return timeSheetAPI.concat(`/actualbill/add-bill-task`)
    },
    updateBillTask(id) {
        return timeSheetAPI.concat(
            `/actualbill/update-bill-task?id=${id}`
        )
    },
    saveProjectBill(projectId) {
        return timeSheetAPI.concat(
            `/actualbill/save-project-bill?projectId=${projectId}`
        )
    },
    exportProjectBill(date, type, projectId) {
        return timeSheetAPI.concat(
            `/actualbill/export-project-bill?projectId=${projectId}&date=${date}&type=${type}`
        )
    },
    deleteBillUser(userId, projectId) {
        return timeSheetAPI.concat(
            `/actualbill/delete-bill-user?userId=${userId}&projectId=${projectId}`
        )
    },
    deleteBillTask(userId, projectCode, from, to, projectId) {
        return timeSheetAPI.concat(
            `/actualbill/delete-bill-task?userId=${userId}&projectCode=${projectCode}&from=${from}&to=${to}&projectId=${projectId}`
        )
    },
    approveTimesheet(startDate, endDate) {
        return timeSheetAPI.concat(
            `/spenttime/approve-multi-task?startDate=${startDate}&endDate=${endDate}`
        )
    },

    getResourceEffort(
        location,
        timeType,
        year,
        month,
        numberQuarter,
        gId,
        group,
        isDu,
        child
    ) {
        return API.concat(
            `/resource/overview/allocation?location=${location}&timeType=${timeType}&year=${year}&month=${month}&numberQuarter=${numberQuarter}&gId=${gId}&group=${group}&isDu=${isDu}&child=${child}`
        )
    },
    getResourceEffortV2(
        location,
        gId,
        group,
        isDu,
        child,
        fromDate,
        toDate,
        skills,
        languages,
        seniority
    ) {
        return API.concat(
            `/resource/overview/statistics-score-card?location=${location}&gId=${gId}&group=${group}&isDu=${isDu}&child=${child}&fromDate=${fromDate}&toDate=${toDate}&skills=${encodeURIComponent(
                skills
            )}&languages=${encodeURIComponent(languages)}&levels=${encodeURIComponent(
                seniority
            )}`
        )
    },
    updateBillRate() {
        return timeSheetAPI.concat(`/actualbill/update-bill-rate`)
    },

    apiGetMvvTimeSheetByUser() {
        return timeSheetAPI.concat(`/timesheet/list-mvv-by-user`)
    },

    apiGetMvvTimeSheetByProject() {
        return timeSheetAPI.concat(`/timesheet/list-mvv-by-project`)
    },

    apiRatePerformanceTimeSheetByProject() {
        return timeSheetAPI.concat(`/timesheet/rate-performance-score`)
    },

    apiGetSettingPerformanceScore() {
        return API_MASTERDATA.concat(`/setting-performance-score`)
    },

    apiGetUserRoleList() {
        return API.concat(`/user-role-list`)
    },

    apiGetMvvActualBillable() {
        return timeSheetAPI.concat(
            `/actualbill/list-mvv-code-by-projectId`
        )
    },

    apiGetTimeSheetByUser() {
        return timeSheetAPI.concat(`/timesheet/get-by-user`)
    },

    apiGetActualByUser() {
        return timeSheetAPI.concat(`/timesheet/get-actual-by-user`)
    },

    apiGetActualByProject() {
        return timeSheetAPI.concat(`/timesheet/get-actual-by-project`)
    },

    apiGetTimeSheetByProject(isCallAPIMember) {
        return timeSheetAPI.concat(
            `/timesheet/get-by-project${isCallAPIMember ? '/member' : ''}`
        )
    },

    apiCheckCurrentPM() {
        return API_CRM.concat(`/api/delivery/v1/user/is-current-pm`)
    },

    saveProjectReuest() {
        return API.concat(`/project-requests/save-request-update`)
    },
    submitProjectReuest() {
        return API.concat(`/project-requests/submit-request-update`)
    },
    getDataProjectRequest(projectId) {
        return API.concat(
            `/project-requests/get-request-update-project?projectId=${projectId}`
        )
    },
    approveOfSepG() {
        return API.concat(`/project-requests/approve-request-update`)
    },
    rejectOfSepG() {
        return API.concat(`/project-requests/reject-request-update`)
    },
    getDataCloseRequest(projectId) {
        return API.concat(
            `/project-requests/get-request-close-project?projectId=${projectId}`
        )
    },
    uploadFileProject() {
        return API_SALE.concat(`/upload/uploads`)
    },
    getListUpload() {
        return API_SALE.concat(`/upload/get-file-by-list-id`)
    },
    getRequestUpdateProject(projectId) {
        return API.concat(
            `/project-requests/get-request-update-project?projectId=${projectId}`
        )
    },
    getAvailableResouce(
        timeType,
        location,
        month,
        year,
        numberQuarter,
        group,
        pageno,
        pagesize
    ) {
        return API.concat(
            `/resource/overview/allocation/preview?location=${location}&timeType=${timeType}&year=${year}&month=${month}&numberQuarter=${numberQuarter}&group=${group}&pageNo=${pageno}&pageSize=${pagesize}`
        )
    },
    getAvailableResouceByMainSkill(
        location,
        group,
        skills,
        gId,
        isDu,
        child,
        startDate,
        endDate,
        language,
        seniority
    ) {
        return API.concat(
            `/resource/overview/available/skillv2?location=${location}&group=${group}&skills=${encodeURIComponent(
                skills
            )}&languages=${encodeURIComponent(
                language
            )}&gId=${gId}&isDu=${isDu}&child=${child}&fromDate=${startDate}&toDate=${endDate}&levels=${encodeURIComponent(
                seniority
            )}`
        )
    },
    getAvailableResouceByRole(
        location,
        group,
        roles,
        gId,
        isDu,
        child,
        startDate,
        endDate,
        language,
        skills
    ) {
        return API.concat(
            `/resource/overview/available/rolev2?location=${location}&group=${group}&roles=${encodeURIComponent(
                roles
            )}&languages=${encodeURIComponent(
                language
            )}&gId=${gId}&isDu=${isDu}&child=${child}&fromDate=${startDate}&toDate=${endDate}&skills=${encodeURIComponent(
                skills
            )}`
        )
    },
    getAvailableResouceByLevels(
        location,
        group,
        seniority,
        gId,
        isDu,
        child,
        startDate,
        endDate,
        language,
        skills
    ) {
        return API.concat(
            `/resource/overview/available/levelv2?location=${location}&group=${group}&levels=${encodeURIComponent(
                seniority
            )}&languages=${encodeURIComponent(
                language
            )}&gId=${gId}&isDu=${isDu}&child=${child}&fromDate=${startDate}&toDate=${endDate}&skills=${encodeURIComponent(
                skills
            )}`
        )
    },
    validateDuplicatedProjectCode(projecCode, customerId) {
        return API.concat(
            `/project/check-parent-code?projectCode=${projecCode}&customerId=${customerId}`
        )
    },

    getProjectNameByPC(projectCode) {
        return API.concat(
            `/project/get-project-name?projectCode=${projectCode}`
        )
    },

    getSearchAllByApprovedReject() {
        return API.concat(
            `/project-requests/search-all-by-approved-reject`
        )
    },
    getNewToken() {
        return baseURI.concat(`/refresh-token`)
    },
    getListInputTimeliness(projectId) {
        return API_CRM.concat(
            `/api/delivery/v1/project/${projectId}/inputs/timeliness`
        )
    },
    getListInputOnTimeResponse(projectId) {
        return API_CRM.concat(
            `/api/delivery/v1/project/${projectId}/inputs/ontime-response`
        )
    },

    getListInputOnTimeResolution(projectId) {
        return API_CRM.concat(
            `/api/delivery/v1/project/${projectId}/inputs/ontime-resolution`
        )
    },
    getFilterAvailableResourceByRole(param) {
        const {
            location,
            gId,
            group,
            isDu,
            child,
            startDate,
            endDate,
            skills,
            language,
            rolesResource,
            childFilter,
            roleSearch,
        } = param
        return API.concat(
            `/resource/overview/available/role-list?rolesSelect=${encodeURIComponent(
                rolesResource
            )}&location=${location}&group=${group}&skills=${encodeURIComponent(
                skills
            )}&languages=${encodeURIComponent(
                language
            )}&gId=${gId}&isDu=${isDu}&child=${child}&fromDate=${startDate}&toDate=${endDate}&childFilter=${childFilter}&roleSearch=${encodeURIComponent(
                roleSearch
            )}`
        )
    },
    getFilterAvailableResourceBySkill(param) {
        const {
            location,
            gId,
            group,
            isDu,
            child,
            startDate,
            endDate,
            skills,
            language,
            childFilter,
            seniority,
        } = param
        return API.concat(
            `/resource/overview/available/skill-list?&location=${location}&group=${group}&skillSearch=${encodeURIComponent(
                skills
            )}&languages=${encodeURIComponent(
                language
            )}&gId=${gId}&isDu=${isDu}&child=${child}&fromDate=${startDate}&toDate=${endDate}&childFilter=${childFilter}&senioritySearch=${encodeURIComponent(
                seniority
            )}`
        )
    },
    getFilterAvailableResourceByLanguage(param) {
        const {
            location,
            gId,
            group,
            isDu,
            child,
            startDate,
            endDate,
            skills,
            language,
            childFilter,
            seniority,
        } = param

        return API.concat(
            `/resource/overview/available/language-list?&location=${location}&group=${group}&skills=${encodeURIComponent(
                skills
            )}&langSearch=${encodeURIComponent(
                language
            )}&gId=${gId}&isDu=${isDu}&child=${child}&fromDate=${startDate}&toDate=${endDate}&childFilter=${childFilter}&senioritySearch=${encodeURIComponent(
                seniority
            )}`
        )
    },
    getFilterSeniority(param) {
        const {
            location,
            gId,
            group,
            isDu,
            child,
            startDate,
            endDate,
            skills,
            language,
            rolesResource,
            childFilter,
            seniority,
        } = param

        return API.concat(
            `/resource/overview/available/seniority-list?rolesSearch=${encodeURIComponent(
                rolesResource
            )}&location=${location}&group=${group}&skills=${encodeURIComponent(
                skills
            )}&languages=${encodeURIComponent(
                language
            )}&gId=${gId}&isDu=${isDu}&child=${child}&fromDate=${startDate}&toDate=${endDate}&childFilter=${childFilter}&levelSearch=${encodeURIComponent(
                seniority
            )}`
        )
    },
    getTableInformation(
        location,
        gId,
        group,
        isDu,
        child,
        fromDate,
        toDate,
        skills,
        languages,
        roles,
        pageSize,
        pageNum,
        sortBy,
        sortDirection,
        filterEffort,
        seniority
    ) {
        return API.concat(
            `/resource/overview/available/table?location=${location}&gId=${gId}&group=${group}&isDu=${isDu}&child=${child}&fromDate=${fromDate}&toDate=${toDate}&skills=${encodeURIComponent(
                skills
            )}&languages=${encodeURIComponent(languages)}&levels=${encodeURIComponent(
                seniority
            )}&pageSize=${pageSize}&pageNum=${pageNum}&sortBy=${sortBy}&sortDirection=${sortDirection}&filterEffort=${filterEffort}`
        )
    },
    getWarningManMonthProjectCode(params) {
        const { month, year, projectCode } = params

        return API.concat(
            `/resources/allocations/evaluate-effort-by-project-code?month=${month}&year=${year}&projectCode=${projectCode}`
        )
    },
    getHistoryPerformanceBonus() {
        return API_SALE.concat(`/api/performance-bonus/hitories`)
    },
    getHistoryPerformanceBonusByEmployee(pageNum = 1, pageSize = 10) {
        return API_SALE.concat(
            `/api/performance-bonus/hitories/employee?pageNum=${pageNum}&pageSize=${pageSize}`
        )
    },
    getHistoryPerformanceBonusByEditor(pageNum = 1, pageSize = 10) {
        return API_SALE.concat(
            `/api/performance-bonus/hitories/editors?pageNum=${pageNum}&pageSize=${pageSize}`
        )
    },
    getMaximumManMonthInMonth() {
        return API_SALE.concat(
            `/api/project-billable/maximum-mm-in-month`
        )
    },
    getBillableGroups() {
        return API_SALE.concat(`/api/project-billable/groups`)
    },
    getTotalMMAllocate() {
        return API.concat('/total-mm-allocate')
    },
    getViewDetailMMPlan() {
        return API.concat('/view-detail-mm-plan')
    },
    getListDetailTasks() {
        return API.concat('/get-detail-tasks')
    },
    getListRoles() {
        return {
            url: API.concat('/ranking/get-all-roles'),
            method: 'get',
        }
    },
    getListCriteriaByRole() {
        return {
            url: API.concat('/ranking/get-criteria-by-roles'),
            method: 'get',
        }
    },
    getEditCriteriaByRole() {
        return {
            url: API.concat('/ranking/get-criteria-by-role'),
            method: 'get',
        }
    },
    getPerformanceBonusMemberProject(params) {
        return {
            url: API_SALE.concat(`/api/performance-bonus/member-project`),
            method: 'get',
        }
    },
    getPerformanceBonusProjectMember(params) {
        return {
            url: API_SALE.concat(`/api/performance-bonus/project-member`),
            method: 'get',
        }
    },
    getListSkillTypes() {
        return {
            url: API.concat('/ranking/get-skill-types'),
            method: 'get',
        }
    },
    savePerformanceRanking() {
        return {
            url: API.concat('/ranking/save-criteria-by-role'),
            method: 'post',
        }
    },
    getListScoreLevel() {
        return {
            url: API.concat('/ranking/get-score-level-by-role'),
            method: 'get',
        }
    },
    getListRankDetail() {
        return {
            url: API.concat('/ranking/get-rank-member'),
            method: 'get',
        }
    },
    savePerformanceRating() {
        return {
            url: API.concat('/ranking/member-ranking'),
            method: 'post',
        }
    },
}
