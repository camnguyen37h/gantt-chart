import { convertObjectToParams } from './convertObjectToParam'

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
        return `${process.env.API}/project/auth/plan`
    },

    login() {
        return process.env.baseURI + '/oauth/token'
    },

    logout() {
        return `${process.env.API}/oauth/logout`
    },

    checkLogged() {
        return `${process.env.API}/me`
    },

    projectByType() {
        return `${process.env.API}/projects/type`
    },

    cssChart() {
        return process.env.API.concat('/chartcss')
    },

    eeChart() {
        return process.env.API.concat('/effort/efficiency')
    },
    getListOfProjectsOfUser() {
        return process.env.API.concat('/user/projects')
    },

    getListOfProjectSettingsOfUser() {
        return process.env.API.concat('/user/settingProjects')
    },
    getListGNameSettingProject(param) {
        return process.env.API.concat(`group-child?id=` + param)
    },

    getDetailedEEData() {
        return process.env.API.concat('/billable/detail')
    },

    getDetailedCSSData() {
        return process.env.API.concat('/css/detail')
    },

    getListPlansOfProject() {
        return process.env.API.concat('/project/auth/plan')
    },

    getAllDuProjectList() {
        return process.env.API.concat('/project/du/list')
    },

    getAllTypeProjectList() {
        return process.env.API.concat('/project/type-project/list')
    },

    getListPlansByUser() {
        return process.env.API.concat('/user/plans')
    },

    resourcePlan() {
        return process.env.API.concat('/project/auth/plan')
    },

    exportPlansOfProject(projectId) {
        return process.env.API.concat(
            `/resource-allocate/export?projectId=${projectId}`
        )
    },

    exportBillableOfProject(projectId) {
        return process.env.API.concat(
            `/project/billable/export?projectId=${projectId}`
        )
    },

    exportListProject(projectId) {
        return process.env.API.concat(`/project/list/export?projectId=${projectId}`)
    },

    getListMember(projectId) {
        return process.env.API.concat(`/projectMember`)
    },

    getListMemberOfProject(projectId) {
        return process.env.API.concat(`/project-member`)
    },

    removeMemberOfProject() {
        return process.env.API.concat(`/project-member/remove-member`)
    },

    billable() {
        return process.env.API.concat('/project/auth/billable')
    },

    cssURI() {
        return process.env.API.concat('/project/auth/css')
    },
    updateCssURI() {
        return process.env.API.concat('/project/auth/css/update')
    },
    deleteCssURI() {
        return process.env.API.concat('/project/auth/css/delete')
    },
    exportCSS(projectId) {
        return process.env.API.concat(`/css/export?projectId=${projectId}`)
    },

    getListOfResource() {
        return process.env.API.concat('/resources-new')
    },

    getListOfResourceByPm() {
        return process.env.API.concat('/resources-new-by-pm')
    },

    getDeliverUnits() {
        return process.env.API.concat('/resources/dus')
    },

    getListResourcesAvailable() {
        return process.env.API.concat('/getResourcesAvailable')
    },
    getListTask() {
        return process.env.API.concat('/project/auth/task')
    },
    getProjectKpi(projectId) {
        return process.env.API.concat('/project/kpi')
    },
    // HungNC
    getListAssignedTasks() {
        return process.env.API.concat(
            '/project/auth/tasks-assigned-resource-by-time'
        )
    },
    getTimesheet() {
        return process.env.API.concat('/timesheetResource')
    },
    getProjectBasicInfo() {
        return process.env.API.concat('/project/project-basic-info')
    },
    getProjectsInDu() {
        return process.env.API.concat('/getProjectDeliveyUnit')
    },

    getPlan() {
        return process.env.API.concat('/resource/plan')
    },
    //NgocDV
    getResourceManPowers() {
        return process.env.API.concat('/resource/man-power')
    },

    getResourceAllocation() {
        return process.env.API.concat('/resource-allocation')
    },
    getProjectAllocation() {
        return process.env.API.concat('/projects_allocation')
    },

    getUnallocations() {
        return process.env.API.concat('/resource/unallocation')
    },
    filterResourceAllocation() {
        return process.env.API.concat(
            '/v1/public/resource-allocation/report/resource-allocation-list'
        )
    },
    getparamFilterResourceAllocation() {
        return process.env.API.concat('/paramFilter-resource-allocation')
    },
    /**
     * @author nvangoc
     * @returns {string}
     */
    getCreateRiskInProject() {
        return process.env.API.concat('/project/risk')
    },
    getRiskPriorityRank() {
        return process.env.API.concat('/project/risk/priority-rank')
    },
    getRiskCategory() {
        return process.env.API.concat('/project/risk/category')
    },
    getRiskHandlingOptions() {
        return process.env.API.concat('/project/risk/handling-options')
    },
    getRiskImpact() {
        return process.env.API.concat('/project/risk/impact')
    },
    getRiskLikelihood() {
        return process.env.API.concat('/project/risk/likelihood')
    },
    getRiskStatus() {
        return process.env.API.concat('/project/risk/status')
    },
    getRiskSubCategory() {
        return process.env.API.concat('/project/risk/sub-category')
    },
    getRiskById() {
        return process.env.API.concat('/project/risk-detail')
    },
    getEditRiskInProject() {
        return process.env.API.concat('/project/risk/edit')
    },
    deleteRisk() {
        return process.env.API.concat('/project/risk/delete')
    },
    getRiskHistory() {
        return process.env.API.concat('/project/risk-history')
    },
    getIssueByProject() {
        return process.env.API.concat('/project/auth/issue-dashboard')
    },
    exportProjectAllocation(param) {
        return process.env.API.concat(
            `/v1/public/project-allocation/report/export?userId=${param.userId}&duId=${param.duId}&mvv=${param.mvv}&projectId=${param.projectId}&startDate=${param.startDate}&endDate=${param.endDate}`
        )
    },
    exportBillableSummary(param) {
        return process.env.API.concat(
            `/project/billableSummary/export?date=${param}`
        )
    },
    updateProjectInfoByRoleQa() {
        return process.env.API.concat(`/update/project/information`)
    },

    getWorkProgress() {
        return process.env.API.concat('/project/work-progress')
    },

    getOverdueTasks() {
        return process.env.API.concat('/project/overdue-tasks')
    },

    getProjectTimesheets() {
        return process.env.API.concat('/project/project-timesheets')
    },

    getNoncomplianceTasks() {
        return process.env.API.concat('/project/noncompliance-tasks')
    },

    getTeamHourByActivities() {
        return process.env.API.concat('/project/team-hour-by-activities')
    },
    getThroughtputBurndownData() {
        return process.env.API.concat('/project/throughtput-burndown')
    },
    //Start-DB2-Timesheet-2019
    getListUser() {
        return process.env.API.concat('/user/list')
    },
    getListProject() {
        return process.env.API.concat('/ProjectP2')
    },
    getSpentTimeLogByUser(userId) {
        return process.env.timeSheetAPI.concat(
            `/spentTimeViewUser?userId=${userId}`
        )
    },
    updateSpentTime() {
        return process.env.timeSheetAPI.concat(`/spenttime/update-spent-time`)
    },
    deleteSpentTime() {
        return process.env.timeSheetAPI.concat(`/spenttime/delete-spent-time`)
    },
    getRequestListForPM(userId) {
        return process.env.API.concat(`/request/getListMyRequest?userId=${userId}`)
    },
    getListProductSpentTime() {
        return process.env.timeSheetAPI.concat(`/product/list-product`)
    },
    addTaskSpentTime(projectID, userID) {
        return process.env.timeSheetAPI.concat(
            `/spenttime/addtask-spenttime?projectId=${projectID}&userId=${userID}`
        )
    },
    updateTaskSpentTime() {
        return process.env.timeSheetAPI.concat(`/spenttime/update-project-task`)
    },
    deleteTaskSpentTime() {
        return process.env.timeSheetAPI.concat(`/spenttime/delete-project-task`)
    },
    getListDuTimeSheet(productId) {
        return process.env.timeSheetAPI.concat(
            `/actualbill/bill-du?projectId=${productId}`
        )
    },
    // getListUser() {
    //   return process.env.API.concat('/user/list');
    // },
    getUser() {
        return process.env.API.concat('/user')
    },
    changePass() {
        return process.env.API.concat('/user/changepassword')
    },
    getUserSkill() {
        return process.env.API_MASTERDATA.concat('/user/list-skill')
    },
    issueCreate() {
        return process.env.API.concat('/project/auth/issue-create')
    },
    getAllGroup() {
        return process.env.API_GROUP.concat('/allgroup')
    },
    deleteGroup() {
        return process.env.API_GROUP.concat('/group/delete/')
    },

    updateUser() {
        return process.env.API.concat('/update')
    },

    getIssueById() {
        return process.env.API.concat('/project/auth/issue-detail')
    },
    exportDeliveryUnit(param) {
        return process.env.API.concat(
            `/list-delivery-unit/export?month=${param.month}&year=${param.year}&column=${param.column}&sort=${param.sort}`
        )
    },
    exportResourceAllocation(param) {
        return process.env.API.concat(
            `/v1/public/resource-allocation/report/resource-allocation-list/export?month=${param.month}&year=${param.year}&column=${param.column}&sort=${param.sort}&page=${param.page}&resourceName=${param.resourceName}&deliveryUnit=${param.deliveryUnit}&duPic=${param.duPic}&projectName=${param.projectName}&projectType=${param.projectType}`
        )
    },
    exportActualTimeSheetEffort(params) {
        return process.env.API.concat(
            `/v1/public/resource-allocation/report/export-by-actual-timesheet` +
            convertObjectToParams(params)
        )
    },
    exportResourceAllocationNew(params) {
        return process.env.API.concat(
            `/v1/public/resource-allocation/report/export` +
            convertObjectToParams(params)
        )
    },
    exportResourceUnallocation(param) {
        return process.env.API.concat(
            `/resource/unallocation/export?month=${param.month}&year=${param.year}&activePage=${param.activePage}&size=${param.size}&column=${param.column}&sort=${param.sort}&resourceName=${param.resourceName}&status=${param.status}&deliveryUnit=${param.deliveryUnit}`
        )
    },
    exportResourceInProject(param) {
        return process.env.API.concat(
            `/resource/project/export?month=${param.month}&year=${param.year}&market=${param.market}`
        )
    },
    exportProjectKPIReport(param) {
        return process.env.API.concat(
            `/v1/public/project-kpi/report/export?startDate=${param.startDate}&endDate=${param.endDate}`
        )
    },
    exportProjectOperationReport(param) {
        return process.env.API.concat(
            `/v1/public/project-kpi/report/export-operation?startDate=${param.startDate}&endDate=${param.endDate}`
        )
    },
    exportActualTimeSheetByRoleReport(param) {
        let url = new URL(
            process.env.API.concat(
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
            process.env.API.concat(
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
        return process.env.API_SALE.concat(
            `/api/performance-bonus/export?startDate=${param.startDate}&endDate=${param.endDate}`
        )
    },

    exportPerformanceScoreByMonth(param) {
        let url = new URL(
            process.env.API.concat(
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
            process.env.API.concat(
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
        return process.env.API.concat(
            `/resource/project/preview?month=${param.month}&year=${param.year}&market=${param.market}&size=${param.size}&page=${param.page}`
        )
    },
    exportEffortResourceInDU(param) {
        return process.env.API.concat(
            `/resource/overview/v2/allocation/export?location=${param.location}&timeType=${param.timeType}&year=${param.year}&month=${param.month}&numberQuarter=${param.numberQuarter}&duId=${param.duId}&groupId=${param.groupId}`
        )
    },
    exportAvailableResource(param) {
        return process.env.API.concat(
            `/resource/overview/v2/allocation/export?location=${param.location}&group=${param.group}&rolesSearch=${param.rolesResource}&gId=${param.gId}&isDu=${param.isDu}&child=${param.child}&fromDate=${param.startDate}&toDate=${param.endDate}&skills=${param.skills}&languages=${param.language}&levels=${param.seniority}`
        )
    },
    //csv project list
    exportListProjectDelivery(param) {
        return process.env.API_CRM.concat(
            `/api/delivery/v1/project/projectlist/export?` + param
        )
    },

    apiCheckPermissionViewProjectDetail() {
        return process.env.API_CRM.concat(`/authorization/project-info`)
    },

    //lxlinh
    createEvaluateProject() {
        return process.env.API.concat('/project/insert-evaluate-project')
    },
    editEvaluateProject() {
        return process.env.API.concat('/project/edit-evaluate-project')
    },
    updateCommentEvaluate() {
        return process.env.API.concat(
            '/project/evaluate-project/evaluate-comment/update'
        )
    },
    getEvaluateProjects() {
        return process.env.API.concat(
            '/project/evaluate-project/evaluate-project-week'
        )
    },

    getSolutionByRisk() {
        return process.env.API.concat('/project/auth/solution')
    },
    addSolution() {
        return process.env.API.concat('/solutions')
    },

    getUserByProject() {
        return process.env.API.concat('/project/user')
    },
    assignProjectIssue() {
        return process.env.API.concat('/project/issue/assign')
    },
    issueDelete() {
        return process.env.API.concat('/project/issue-delete')
    },

    getCommentBySolution() {
        return process.env.API.concat('/project/auth/commentSolution')
    },

    commentCreate() {
        return process.env.API.concat('/project/auth/comment-create')
    },
    getResourcesAllocation() {
        return process.env.API.concat('/resources/allocations')
    },

    issueUpdate() {
        return process.env.API.concat('/project/auth/issue-update')
    },

    deleteSolution() {
        return process.env.API.concat('/project/auth/delete-solution')
    },

    commentDelete() {
        return process.env.API.concat('/project/auth/delete-comment')
    },

    getIssueHistory() {
        return process.env.API.concat('/project/issue-history')
    },

    editSolutionComment() {
        return process.env.API.concat('/project/auth/edit-comment')
    },

    getProjectMembers() {
        return process.env.API.concat(`/project/member`)
    },

    assignSolution() {
        return process.env.API.concat('/project/auth/assign-solution')
    },

    changeStatusSolution() {
        return process.env.API.concat('/project/auth/solution/update-status')
    },

    getPcvRatesByProjectId(projectId) {
        return process.env.API.concat(`/projects/${projectId}/pcv-rates`)
    },

    createProjectPcvRate() {
        return process.env.API.concat('/project-pcv-rates')
    },

    updateProjectPcvRate() {
        return process.env.API.concat('/project-pcv-rates')
    },
    deleteProjectPcvRate() {
        return process.env.API.concat('/project-pcv-rates')
    },

    getProjectDelivery() {
        return process.env.API.concat('/project/project-delivery/get')
    },

    saveProjectDelivery() {
        return process.env.API.concat('/project/project-delivery/create')
    },
    updateProjectDelivery() {
        return process.env.API.concat('/project/project-delivery/update')
    },
    deleteProjectDelivery() {
        return process.env.API.concat('/project/project-delivery/delete')
    },
    /**
     * NVTIEP2
     */
    getProjectTypes() {
        return process.env.API.concat('/project-type/list')
    },
    getEditProject() {
        return process.env.API.concat(`/project/edit`)
    },
    getListProjectInfo() {
        return process.env.API.concat(`/project/parent-project-info`)
    },
    getListWoInfo() {
        return process.env.API.concat(`/project/project-code-and-work-order-info`)
    },
    updateProject() {
        return process.env.API.concat(`/project/update`)
    },
    putProjectInfo() {
        return process.env.API.concat(`/project/update-project-information`)
    },
    updateProjectQA(projectId) {
        return process.env.API.concat(`/project/update-qa-project/${projectId}`)
    },
    postProjectZone() {
        return process.env.API.concat(`/zone/add-zone`)
    },
    changeStatusProject() {
        return process.env.API.concat(`/project/changeStatus`)
    },
    /**
     * MR DUC
     */
    insertUser() {
        return process.env.API.concat('/user/insert')
    },
    insertGroup() {
        return process.env.API.concat('/group/insert')
    },
    updateGroup() {
        return process.env.API_GROUP.concat('/group/update')
    },

    /**
     * MR DUC
     */
    //PNTHANH
    getAllUserRole() {
        return process.env.API.concat('/user/listRole')
    },
    getRole() {
        return process.env.API.concat('/allrole')
    },
    addUserRole() {
        return process.env.API.concat('/user/add/role')
    },
    removeUserRole() {
        return process.env.API.concat('/user/remove/role')
    },
    getAllRolePermission() {
        return process.env.API.concat('/role/getAllRolePermission')
    },
    removeRolePermission() {
        return process.env.API.concat('/role/removeRolePermission')
    },
    addRolePermission() {
        return process.env.API.concat('/add/role/permission')
    },
    getOnePermission() {
        return process.env.API.concat('/permission/id')
    },

    updateRole() {
        return process.env.API.concat('/role/update')
    },

    roleCreate() {
        return process.env.API.concat('/role/save')
    },
    deleteRole() {
        return process.env.API.concat('/role/delete')
    },
    getPermission() {
        return process.env.API.concat('/allpermission')
    },
    updatePermission() {
        return process.env.API.concat('/permission/update')
    },
    permissionCreate() {
        return process.env.API.concat('/permission/save')
    },
    deletePermission() {
        return process.env.API.concat('/permission/delete')
    },
    /**
     * CONG
     */
    getAllSkill() {
        return process.env.API_MASTERDATA.concat('/skill/list')
    },
    createSkill() {
        return process.env.API_MASTERDATA.concat('/skill/create')
    },
    updateSkill() {
        return process.env.API_MASTERDATA.concat('/skill/update')
    },
    deleteSkill(data) {
        return process.env.API_MASTERDATA.concat('/skill/delete/' + data)
    },

    getListProjectType() {
        return process.env.API.concat('/project/project-type/get')
    },
    getCreateProjectType() {
        return process.env.API.concat('/project/project-type/create')
    },
    getProjectTypeById(data) {
        return process.env.API.concat('/project/project-type/' + data)
    },
    getDeleteProjectType(data) {
        return process.env.API.concat('/project/project-type/delete/' + data)
    },
    updateProjectType() {
        return process.env.API.concat('/project/project-type/update')
    },
    getListProjectRole() {
        return process.env.API.concat('/project/project-role/get')
    },

    getGroupByProjectMember() {
        return process.env.API.concat(`/project/group`)
    },

    getListProjectCode(projectId) {
        return process.env.API_CRM.concat(
            `/api/delivery/v1/project/projectCode/${projectId}`
        )
    },

    getBillableByProjectId(projectId) {
        return process.env.API.concat(`/projects/${projectId}/project-billable`)
    },
    createProjectBillable() {
        return process.env.API.concat('/create-billable')
    },
    deleteProjectBillable(projectBillableId) {
        return process.env.API.concat(`/project-billable/${projectBillableId}`)
    },
    updateProjectBillable(projectBillableId) {
        return process.env.API.concat(`/update-billable/${projectBillableId}`)
    },
    getProjectComment(projectId) {
        return process.env.API.concat(`/projectcomment/list/${projectId}`)
    },
    createProjectComment() {
        return process.env.API.concat('/projectcomment/add')
    },
    deleteProjectComment(commentId) {
        return process.env.API.concat(`/projectcomment/delete/${commentId}`)
    },
    updateProjectComment() {
        return process.env.API.concat('/projectcomment/edit')
    },
    updateLineOfCode() {
        return process.env.API.concat(`/project/line-of-code`)
    },
    getProject(projectId) {
        return process.env.API.concat(`/project`)
    },

    getProjectOverview() {
        return process.env.API.concat(`/project/project-overview`)
    },
    getOverviewTable(projectId) {
        return process.env.API.concat(
            `/project/kpi-overview?projectId=${projectId}`
        )
    },
    getAllUserEdit() {
        return process.env.API.concat(`/project/edit/alluser`)
    },

    //Start-DB2-Timesheet-2019
    //Linh
    getListFormula() {
        return process.env.API.concat(`/formula/getAll`)
    },
    getAllNotifiCation(userId) {
        return process.env.API.concat(
            `/notification/getListDTOByUserId?userId=${userId}`
        )
    },

    //pasx
    getAllVersionByProjectId(projectId) {
        return process.env.API.concat(`/pasx/getAllVersion?projectId=${projectId}`)
    },
    getDetailVersionById(versionId) {
        return process.env.API.concat(
            `/pasx/getDetailVersionById?pasxId=${versionId}`
        )
    },
    getListRequestPasx() {
        return process.env.API.concat(`/pasx/getlistRequestPasx`)
    },
    approveRequestPasx(pasxId) {
        return process.env.API.concat(`/pasx/approvelRequestPasx?pasxId=${pasxId}`)
    },
    rejectRequestPasx(pasxId) {
        return process.env.API.concat(`/pasx/rejectRequestPasx?pasxId=${pasxId}`)
    },
    createNewPasx(projectId) {
        return process.env.API.concat(`/pasx/add-pasx?projectId=${projectId}`)
    },
    updatePasx(pasxId) {
        return process.env.API.concat(`/pasx/updatePasxById?pasxId=${pasxId}`)
    },
    checkOverlap(userId, fromDate, toDate) {
        return process.env.API.concat(
            `/pasx/checkOverlap?userId=${userId}&fromDate=${fromDate}&toDate=${toDate}`
        )
    },
    // end pasx
    getAllListTimeSheet(userId, week, year) {
        return process.env.API.concat(
            `/viewdatalog?userId=${userId}&week=${week}&year=${year}`
        )
    },
    // tqdat3 get list du

    getProjectByUserBindSelect(userId) {
        return process.env.API.concat(`/getprojectbyuserId?userId=${userId}`)
    },
    getListBookedByWeek() {
        return process.env.API.concat(`/getListBookedByWeek`)
    },
    getListAllocatedByWeek() {
        return process.env.API.concat(`/getListAllocatedByWeek`)
    },
    getListAvailableByWeek() {
        return process.env.API.concat(`/getListAvailableByWeek`)
    },
    getCurrentWeek() {
        return process.env.API.concat(`/resourceAvailableCurrentWeek`)
    },
    getAllTimeSheetByUser() {
        return process.env.timeSheetAPI.concat(`/spenttime/view-spent`)
    },
    getProjectByUser(userId, projectType, selectDate, role) {
        if (selectDate) {
            return process.env.API.concat(
                `/getListProject?userId=${userId}&type=${projectType}&selectDate=${selectDate}&role=${role}`
            )
        }
        return process.env.API.concat(
            `/getListProject?userId=${userId}&type=${projectType}`
        )
    },
    searchProjectsTimeSheet() {
        return process.env.API_CRM.concat(
            `/api/delivery/v1/view/search-project-list-by-activities`
        )
    },
    searchProjectsBillable() {
        return process.env.API_CRM.concat(
            `/api/delivery/v1/view/search-project-list-by-permissions`
        )
    },
    searchProjectsTimeSheetMember() {
        return process.env.API.concat(`/allocated-project`)
    },
    createTasklog() {
        return process.env.timeSheetAPI.concat(`/spenttime/add-project-task`)
    },
    getGroupUserByUserId(userId) {
        return process.env.API.concat(`/group/userId?userId=${userId}`)
    },
    updateTimeSheetDb() {
        return process.env.timeSheetAPI.concat(`/spenttime/update-spent-time`)
    },
    /** Get recent interact project (interval: 1 week) */
    getRecentProjects(userId) {
        return process.env.timeSheetAPI.concat(
            `/spenttime/view-log-spent-member-remember?userId=${userId}`
        )
    },
    // request timesheet
    getRequestListRequestTimeSheet() {
        return process.env.timeSheetAPI.concat(`/spenttime/timesheet`)
    },
    // request timesheet pagging
    getRequestListRequestTimeSheetPagging() {
        return process.env.timeSheetAPI.concat(`/spenttime/timesheet2`)
    },

    getProjectListTimeSheet() {
        return process.env.timeSheetAPI.concat(`/spenttime/allProject`)
    },
    getAllGroupChild() {
        return process.env.API.concat(`/allgroup-child`)
    },
    getMyTimesheet() {
        return process.env.timeSheetAPI.concat(`/spenttime/view-log-spent-member`)
    },
    deleteTasks() {
        return process.env.timeSheetAPI.concat(`/spenttime/delete-project-task`)
    },
    updateTask() {
        return process.env.timeSheetAPI.concat(`/spenttime/update-project-task`)
    },
    getRequestTimeSheet(userId) {
        return process.env.API.concat(`/fill-request?userId=${userId}`)
    },

    getListProductWithRole(roleIds) {
        return process.env.timeSheetAPI.concat(
            `/product/list-product?arrRoleId=${roleIds}`
        )
    },

    createProduct() {
        return process.env.timeSheetAPI.concat(`/product/create`)
    },
    updateProduct() {
        return process.env.timeSheetAPI.concat(`/product/edit`)
    },
    deleteProduct(productId) {
        return process.env.timeSheetAPI.concat(`/product/${productId}`)
    },
    createActivity() {
        return process.env.timeSheetAPI.concat(`/activity/create`)
    },
    updateActivity() {
        return process.env.timeSheetAPI.concat(`/activity/edit`)
    },
    deleteActivity(activityId) {
        return process.env.timeSheetAPI.concat(`/activity/${activityId}`)
    },
    // end Product and Activity
    getTimeSheetApprove() {
        return process.env.timeSheetAPI.concat(`/spenttime/view-log-spent`)
    },
    getTimeSheetApproveByProjectId(params) {
        return process.env.timeSheetAPI.concat(
            `/spenttime/view-log-spent-filter?role=${params.role}&week=${params.week}&years=${params.years}&projectId=${params.projectId}`
        )
    },
    urlTimeSheetChangeStatus() {
        return process.env.timeSheetAPI.concat(`/spenttime/view-log-spent`)
    },
    urlRejectTask() {
        // spenttime/reject-task-role
        return process.env.timeSheetAPI.concat(`/spenttime/reject-task-role`)
    },
    urlApproveTask() {
        // spenttime/approvel-task-role
        return process.env.timeSheetAPI.concat(`/spenttime/approvel-task-role`)
    },
    urlApproveRequestAll() {
        // spenttime/approvel-task-role
        return process.env.timeSheetAPI.concat(`/spenttime/send-to-request`)
    },
    urlRejectRequestAll() {
        // spenttime/approvel-task-role
        return process.env.timeSheetAPI.concat(
            `/spenttime/reject-allRequest-OfProject-ByWeek-Task`
        )
    },
    sendRequestMember() {
        return process.env.timeSheetAPI.concat(`/spenttime/send-request-approve`)
    },
    sendRequestOfProject(projectId, years, week, userId) {
        return process.env.timeSheetAPI.concat(
            `/spenttime/send-to-request-each-project?projectId=${projectId}&years=${years}&week=${week}&userId=${userId}`
        )
    },
    approveOfProject(projectId, userId, week, years, role) {
        return process.env.timeSheetAPI.concat(
            `/spenttime/approvel-eachProject-allTask?projectId=${projectId}&years=${years}&week=${week}&userId=${userId}&role=${role}`
        )
    },
    rejectOfProject(projectId, userId, week, years, role, comment) {
        return process.env.timeSheetAPI.concat(
            `/spenttime/reject-eachProject-allTask?projectId=${projectId}&years=${years}&week=${week}&userId=${userId}&role=${role}&comment=${comment}`
        )
    },

    getAllUserByProject(projectIds) {
        return process.env.timeSheetAPI.concat(
            `/spenttime/getListUsersByProjectIds?projectIds=${projectIds}`
        )
    },

    getProjectByRole(role, userId) {
        return process.env.timeSheetAPI.concat(
            `/spenttime/getListProjectByRole?role=${role}&userId=${userId}`
        )
    },

    getUsersByProjectIds(projectIds) {
        return process.env.timeSheetAPI.concat(
            `/spenttime/getListUsersByProjectIds?projectIds=${projectIds}`
        )
    },
    getDataProjectReport() {
        return process.env.API.concat(`/project/reports`)
    },
    getDataProjectReportByRole(data) {
        return process.env.API.concat(
            `/project/reports?weak=${data.week}&projectId=${data.projectId}&userId=${data.userId}&year=${data.year}`
        )
        // return process.env.API.concat(`/project/reports?weak=${data.week}&projectId=${data.projectId}&userId=${data.userId}&year=${data.year}&role=${data.role}`)
    },
    getDataProjectReportFilter(week, year) {
        return process.env.API.concat(`/project/reports?weak=${week}&year=${year}`)
    },

    getDataDeliveryTimeSheetReport() {
        return process.env.timeSheetAPI.concat(`/spenttime/delivery/reports`)
    },
    exportFileExcelDelivery(week, year, du) {
        if (du === '') {
            return process.env.timeSheetAPI.concat(
                `/spenttime/cover-excel-to-File-delivery?weak=${week}&year=${year}`
            )
        } else {
            return process.env.timeSheetAPI.concat(
                `/spenttime/cover-excel-to-File-delivery?weak=${week}&year=${year}&DU=${du}`
            )
        }
    },
    getListGroupParentChildByDu() {
        return process.env.API_GROUP.concat(`/allgroup-parentchild-all`)
    },
    //end-DB2-Timesheet-2019
    getListMonitoring() {
        return process.env.API.concat(`/delivery-unit/monitoring`)
    },
    getAllIssue() {
        return process.env.API.concat(`/issue/all`)
    },
    getProjectByDu() {
        return process.env.API.concat(`/project/du`)
    },
    getAllRisk() {
        return process.env.API.concat(`/risk/all`)
    },
    updateManPower() {
        return process.env.API.concat(`/man-powers/updatebytime`)
    },
    getDUStatistic() {
        return process.env.API.concat(`/du-statistic`)
    },
    getAvailableResourceV2() {
        return process.env.API.concat(
            `/resource/overview/available/du-statistic-v2`
        )
    },
    getAllGroupParentChild() {
        return process.env.API.concat(`/allgroup-parentchild`)
    },
    getAllGroupDropdown() {
        return process.env.API_MASTERDATA.concat(
            `/setting/companyDelivery/all-group-dropdown`
        )
    },
    getAllGroupParentChildQuarterYear() {
        return process.env.API_GROUP.concat(`/allgroup-parentchild-quarteryear`)
    },
    getAllGroupParentChildQuarterYearWithPermission() {
        return process.env.API_GROUP.concat(
            `/allgroup-parentchild-quarteryear-with-permission`
        )
    },
    updateDUStatistic() {
        return process.env.API.concat(`/update/du-statistic`)
    },
    getBillableProjectDelivery() {
        return process.env.API.concat(`/delivery/project-billable`)
    },
    getUserNotWorkingDeliveryUnit() {
        return process.env.API.concat(`/delivery/userNotWorking`)
    },
    editNoteDeliveryUnit() {
        return process.env.API.concat(`/delivery/edit-note`)
    },
    getListProjectNorm() {
        return process.env.API_MASTERDATA.concat(`/project/norm`)
    },
    createProjectNorm() {
        return process.env.API_MASTERDATA.concat(`/project/norm/add`)
    },
    updateProjectNorm() {
        return process.env.API_MASTERDATA.concat(`/project/norm/update`)
    },
    deleteProjectNorm(data) {
        return process.env.API_MASTERDATA.concat('/project/norm/delete/' + data)
    },
    getAllDUSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/du/all`)
    },
    getListDUSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/du`)
    },
    createDUSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/du/add`)
    },
    updateDUSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/du/update`)
    },
    deleteDUSetting(data) {
        return process.env.API_MASTERDATA.concat('/setting/du/delete/' + data)
    },
    getAllGlobalSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/global/all`)
    },
    getListGlobalSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/global`)
    },
    createGlobalSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/global/add`)
    },
    updateGlobalSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/global/update`)
    },
    deleteGlobalSetting(data) {
        return process.env.API_MASTERDATA.concat('/setting/global/delete/' + data)
    },
    getInforGeneralProject() {
        return process.env.API.concat(`/project/general-info`)
    },
    addProject() {
        return process.env.API.concat(`/project/add`)
    },
    getNormByDate() {
        return process.env.API_MASTERDATA.concat(`/project/norm/getByDate`)
    },
    getListGroupParent() {
        return process.env.API_GROUP.concat(`/group/parent`)
    },
    getListUnDevelopmentGroup() {
        return process.env.API_GROUP.concat(`/group/unDevelopmentGroup`)
    },
    addHistoryGroup() {
        return process.env.API_GROUP.concat(`/group/history/add`)
    },
    updateHistoryGroup() {
        return process.env.API_GROUP.concat(`/group/history/update`)
    },
    deleteHistoryGroup() {
        return process.env.API_GROUP.concat(`/group/history/delete`)
    },
    getGroupById() {
        return process.env.API_GROUP.concat(`/group/getById`)
    },
    loginDashboard() {
        return process.env.baseURI.concat(`/login`)
    },
    logoutDashboard() {
        return `${process.env.baseURI}/logout`
    },
    getProjectCssCommentById() {
        return process.env.API.concat(`/project/getProjectCssCommemt`)
    },
    createProjectCssComment() {
        return process.env.API.concat(`/project/createProjectCssCommemt`)
    },
    updateProjectCssComment() {
        return process.env.API.concat(`/project/updateProjectCssCommemt`)
    },
    deleteProjectCssComment(id) {
        return process.env.API.concat(`/project/deleteProjectCssCommemt/` + id)
    },
    getAllCompanyDelivery() {
        return process.env.API_MASTERDATA.concat(`/setting/companyDelivery/all`)
    },
    getListCompanyDelivery() {
        return process.env.API_MASTERDATA.concat(`/setting/companyDelivery`)
    },
    createCompanyDelivery() {
        return process.env.API_MASTERDATA.concat(`/setting/companyDelivery/add`)
    },
    updateCompanyDelivery() {
        return process.env.API_MASTERDATA.concat(`/setting/companyDelivery/update`)
    },
    deleteCompanyDelivery(data) {
        return process.env.API_MASTERDATA.concat(
            '/setting/companyDelivery/delete/' + data
        )
    },
    importSapGlobalOverview: {
        url: process.env.API_SALE.concat(
            '/api/sap-global-overview/files/import-sap-global-overview'
        ),
        method: 'post',
    },
    importPlanningGlobalOverview: {
        url: process.env.API_MASTERDATA.concat('/uploads'),
        method: 'post',
    },
    getGlobalDelivery() {
        return process.env.API.concat('/global-delivery')
    },
    getGlobalSale() {
        return process.env.API.concat('/global-sale')
    },
    getSaleLead() {
        return process.env.API.concat('/sale/lead')
    },
    getAllSaleSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/saleSetting/all`)
    },
    getListSaleSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/saleSetting`)
    },
    createSaleSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/saleSetting/add`)
    },
    updateSaleSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/saleSetting/update`)
    },
    deleteSaleSetting(data) {
        return process.env.API_MASTERDATA.concat(
            '/setting/saleSetting/delete/' + data
        )
    },

    getSaleLeadSetting() {
        return process.env.API_MASTERDATA.concat(`/setting/sale-lead`)
    },
    updateSaleLead() {
        return process.env.API_MASTERDATA.concat(`/setting/sale-lead/update`)
    },

    //GroupSale
    getAllGroupSale() {
        return `${process.env.API_GROUP}/group-sale/list`
    },
    getChildGroup(idG) {
        return process.env.API_GROUP.concat(
            `/current-child-by-group?groupId=` + idG
        )
    },
    getAMGroupSale() {
        return `${process.env.API_GROUP}/group-sale/list-am-in-range`
    },

    addGroupSaleUser() {
        return `${process.env.API_GROUP}/group-sale/add`
    },

    getNotSaleUser() {
        return `${process.env.API_GROUP}/group-sale/unAssignUser`
    },

    updateSaleGroupUser() {
        return `${process.env.API_GROUP}/group-sale/update`
    },

    gettreeSale() {
        return `${process.env.API_GROUP}/group-sale/group-sale-tree`
    },

    getUserById() {
        return `${process.env.API_GROUP}/group-sale/user`
    },

    deleteHistoryGroupSale() {
        return `${process.env.API_GROUP}/group-sale/delete`
    },

    getSaleTreeQuarterYear() {
        return process.env.API.concat(`/sale/listTreeQuarterYear`)
    },
    getSaleTarget() {
        return `${process.env.API_MASTERDATA}/sale-target`
    },
    deleteSaleTarget() {
        return `${process.env.API_MASTERDATA}/sale-target`
    },
    addTargetSale() {
        return `${process.env.API_MASTERDATA}/sale-target`
    },
    updateTargetSale() {
        return `${process.env.API_MASTERDATA}/sale-target`
    },

    getProjectsInSearchBox() {
        return process.env.API.concat('/project/search')
    },
    getProjectsInSearchInfo() {
        return process.env.API.concat('/project/searchProject')
    },

    getVolumePipeline() {
        return process.env.API.concat('/sale/pipelines')
    },
    getChangesPipeline() {
        return process.env.API.concat('/sale/changespipeline')
    },
    getSaleNote() {
        return process.env.API.concat('/sale/note')
    },
    insertSaleNote() {
        return process.env.API.concat('/sale/note')
    },
    updateSaleNote() {
        return process.env.API.concat('/sale/note')
    },
    deleteSaleNote(data) {
        return process.env.API.concat('/sale/note/' + data)
    },

    //MarketSetting
    marketSetting() {
        return process.env.API_MASTERDATA.concat('/setting/market/')
    },
    marketSettingUpdate() {
        return process.env.API_MASTERDATA.concat('/setting/market/update')
    },
    getMarketByGroupSale() {
        return process.env.API_GROUP.concat('/group-sale/market')
    },
    getListCRMPipeline() {
        return process.env.API.concat('/sale/crm-pipeline')
    },
    getListLogs() {
        return process.env.API.concat('/logs')
    },
    getAllUserOfDeliveryUnit() {
        return process.env.API.concat('/user/deliveryUnit')
    },
    getAllUserBySearch(value) {
        return process.env.API_CRM.concat(
            `/api/delivery/v1/user/search-open?search=${value}`
        )
    },
    updateUserProject() {
        return process.env.API.concat('/project/user/add')
    },
    removeUserProject() {
        return process.env.API.concat('/project/user/remove')
    },
    getSaleOverView() {
        return process.env.API.concat('/sale/overview')
    },
    getGlobalSaleRevenue() {
        return process.env.API.concat('/global-sale-revenue')
    },

    getUserList() {
        return process.env.API_CRM.concat(`/api/delivery/v1/user/search`)
    },
    getSaleOverViewUpdate() {
        return process.env.API.concat('/sale/overview-update')
    },
    getSaleProductivity() {
        return process.env.API.concat('/sale/productivity')
    },
    getListAMInTime() {
        return process.env.API.concat('/group-sale/list-am')
    },
    getListGroupSaleInTime() {
        return process.env.API_GROUP.concat('/group-sale-in-time')
    },
    getAllAM() {
        return process.env.API.concat('/allAM')
    },
    getAllBU() {
        return process.env.API_GROUP.concat('/allBU')
    },
    //holiday setting
    holidaySetting() {
        return process.env.API_MASTERDATA.concat('/setting/holiday')
    },
    deleteHolidaySetting(id) {
        return process.env.API_MASTERDATA.concat('/setting/holiday/' + id)
    },
    getDataModelWorkOrder() {
        return process.env.API.concat('/getModelDataWorkOrder')
    },
    workOrder() {
        return process.env.API.concat('/workorder')
    },
    getAllSubWork() {
        return process.env.API.concat('/subWorkInfo')
    },
    createDeliveryPlan() {
        return process.env.API.concat('/deliveryPlan')
    },
    getListDeliveryPlan() {
        return process.env.API.concat('/deliveryPlan')
    },
    getDeliveryPlan() {
        return process.env.API.concat('/getDeliveryPlan')
    },
    getManagerNameOfGroup() {
        return process.env.API.concat('/group/listManager')
    },
    deleteDeliveryPlan() {
        return process.env.API.concat('/deleteDeliveryPlan')
    },
    versionUpDeliveryPlan() {
        return process.env.API.concat('/versionUp')
    },
    changeStatusDeliveryPlan() {
        return process.env.API.concat('/deliveryPlan/changeStatus')
    },
    //populate delivery plan
    checkConflictEffortDeliveryPlan() {
        return process.env.API.concat('/deliveryPlan/checkConflictEffort')
    },
    populateDeliveryPlan() {
        return process.env.API.concat('/deliveryPlan/populate')
    },
    exportDeliveryPlan(id) {
        return process.env.API.concat(
            `/delivery-unit/exportDeliveryPlan?deliveryPlanId=${id} `
        )
    },
    countExistedSubWo() {
        return process.env.API.concat(`/deliveryPlan/findExistedSUbWo`)
    },
    disableDeliveryPlan() {
        return process.env.API.concat(`/deliveryPlan/disableDeliveryPlan`)
    },
    subWorkOrder() {
        return process.env.API.concat('/sub-workorder')
    },
    countHolidayBetweenDate() {
        return process.env.API_MASTERDATA.concat('/setting/countHolidayBetweenDate')
    },
    getWorkOrderByWorkOrderId(id) {
        return process.env.API.concat('/workorder/record/' + id)
    },
    getStatOverview(groupId, type) {
        return process.env.API.concat('/get-overview-chart')
    },
    getDataChartOverview(group) {
        return process.env.API.concat('/sale/overview-datachart')
    },
    getListGroup() {
        return process.env.API.concat('/getListGroupByName?lstGroupName')
    },

    getListUserInGroup(groupId, startDate, endDate) {
        let url = process.env.API.concat('/group/get-email-in-group')
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
        return process.env.API_MASTERDATA.concat(
            `/setting/findAllSaleTargetByStartDateAndEndDate`
        )
    },
    getSalePipelineForKPI() {
        return process.env.API.concat('/sale/getSalePipelineForKPI')
    },
    getSalePipeLineAndSaleTargetAndSaleLead() {
        return process.env.API.concat(
            '/sale/getSalePipeLineAndSaleTargetAndSaleLead'
        )
    },
    getListAMMD() {
        return process.env.API_GROUP.concat('/getListAMMD')
    },

    getSaleKpi() {
        return process.env.API.concat('/sale/kpi')
    },
    aggregateTreeSaleKpi() {
        return process.env.API.concat('/sale/kpi-aggregate')
    },
    getListLeadCRM() {
        return process.env.API.concat('/sale/lead/data')
    },
    getDuList() {
        return process.env.API_GROUP.concat('/group/du-name')
    },
    getLocationFilter() {
        return process.env.API.concat('/user/location-filter')
    },
    exportEmployee() {
        return process.env.API.concat(`/delivery/userNotWorking/exportExcel`)
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
        return process.env.API.concat(`/projects/export?${Uri}`)
    },

    getActualBill(from, to, projectId, page, size, du, projectCodes) {
        return process.env.timeSheetAPI.concat(
            `/actualbill/view-by-project?from=${from}&to=${to}&projectId=${projectId}&pageIndex=${page}&pageSize=${size}&du=${du}&projectCodes=${projectCodes}`
        )
    },

    apiGetProjectCodeByProject(projectId) {
        return process.env.baseURI.concat(
            `/api/get-projectcode-by-project?projectId=${projectId ? projectId : 0}`
        )
    },

    searchUser(key) {
        return process.env.API.concat(`/user/search?key=${key}`)
    },

    addBillUser() {
        return process.env.timeSheetAPI.concat(`/actualbill/add-bill-user`)
    },
    updateBillUser() {
        return process.env.timeSheetAPI.concat(`/actualbill/update-bill-user`)
    },
    addBillTask() {
        return process.env.timeSheetAPI.concat(`/actualbill/add-bill-task`)
    },
    updateBillTask(id) {
        return process.env.timeSheetAPI.concat(
            `/actualbill/update-bill-task?id=${id}`
        )
    },
    saveProjectBill(projectId) {
        return process.env.timeSheetAPI.concat(
            `/actualbill/save-project-bill?projectId=${projectId}`
        )
    },
    exportProjectBill(date, type, projectId) {
        return process.env.timeSheetAPI.concat(
            `/actualbill/export-project-bill?projectId=${projectId}&date=${date}&type=${type}`
        )
    },
    deleteBillUser(userId, projectId) {
        return process.env.timeSheetAPI.concat(
            `/actualbill/delete-bill-user?userId=${userId}&projectId=${projectId}`
        )
    },
    deleteBillTask(userId, projectCode, from, to, projectId) {
        return process.env.timeSheetAPI.concat(
            `/actualbill/delete-bill-task?userId=${userId}&projectCode=${projectCode}&from=${from}&to=${to}&projectId=${projectId}`
        )
    },
    approveTimesheet(startDate, endDate) {
        return process.env.timeSheetAPI.concat(
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
        return process.env.API.concat(
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
        return process.env.API.concat(
            `/resource/overview/statistics-score-card?location=${location}&gId=${gId}&group=${group}&isDu=${isDu}&child=${child}&fromDate=${fromDate}&toDate=${toDate}&skills=${encodeURIComponent(
                skills
            )}&languages=${encodeURIComponent(languages)}&levels=${encodeURIComponent(
                seniority
            )}`
        )
    },
    updateBillRate() {
        return process.env.timeSheetAPI.concat(`/actualbill/update-bill-rate`)
    },

    apiGetMvvTimeSheetByUser() {
        return process.env.timeSheetAPI.concat(`/timesheet/list-mvv-by-user`)
    },

    apiGetMvvTimeSheetByProject() {
        return process.env.timeSheetAPI.concat(`/timesheet/list-mvv-by-project`)
    },

    apiRatePerformanceTimeSheetByProject() {
        return process.env.timeSheetAPI.concat(`/timesheet/rate-performance-score`)
    },

    apiGetSettingPerformanceScore() {
        return process.env.API_MASTERDATA.concat(`/setting-performance-score`)
    },

    apiGetUserRoleList() {
        return process.env.API.concat(`/user-role-list`)
    },

    apiGetMvvActualBillable() {
        return process.env.timeSheetAPI.concat(
            `/actualbill/list-mvv-code-by-projectId`
        )
    },

    apiGetTimeSheetByUser() {
        return process.env.timeSheetAPI.concat(`/timesheet/get-by-user`)
    },

    apiGetActualByUser() {
        return process.env.timeSheetAPI.concat(`/timesheet/get-actual-by-user`)
    },

    apiGetActualByProject() {
        return process.env.timeSheetAPI.concat(`/timesheet/get-actual-by-project`)
    },

    apiGetTimeSheetByProject(isCallAPIMember) {
        return process.env.timeSheetAPI.concat(
            `/timesheet/get-by-project${isCallAPIMember ? '/member' : ''}`
        )
    },

    apiCheckCurrentPM() {
        return process.env.API_CRM.concat(`/api/delivery/v1/user/is-current-pm`)
    },

    saveProjectReuest() {
        return process.env.API.concat(`/project-requests/save-request-update`)
    },
    submitProjectReuest() {
        return process.env.API.concat(`/project-requests/submit-request-update`)
    },
    getDataProjectRequest(projectId) {
        return process.env.API.concat(
            `/project-requests/get-request-update-project?projectId=${projectId}`
        )
    },
    approveOfSepG() {
        return process.env.API.concat(`/project-requests/approve-request-update`)
    },
    rejectOfSepG() {
        return process.env.API.concat(`/project-requests/reject-request-update`)
    },
    getDataCloseRequest(projectId) {
        return process.env.API.concat(
            `/project-requests/get-request-close-project?projectId=${projectId}`
        )
    },
    uploadFileProject() {
        return process.env.API_SALE.concat(`/upload/uploads`)
    },
    getListUpload() {
        return process.env.API_SALE.concat(`/upload/get-file-by-list-id`)
    },
    getRequestUpdateProject(projectId) {
        return process.env.API.concat(
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
        return process.env.API.concat(
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
        return process.env.API.concat(
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
        return process.env.API.concat(
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
        return process.env.API.concat(
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
        return process.env.API.concat(
            `/project/check-parent-code?projectCode=${projecCode}&customerId=${customerId}`
        )
    },

    getProjectNameByPC(projectCode) {
        return process.env.API.concat(
            `/project/get-project-name?projectCode=${projectCode}`
        )
    },

    getSearchAllByApprovedReject() {
        return process.env.API.concat(
            `/project-requests/search-all-by-approved-reject`
        )
    },
    getNewToken() {
        return process.env.baseURI.concat(`/refresh-token`)
    },
    getListInputTimeliness(projectId) {
        return process.env.API_CRM.concat(
            `/api/delivery/v1/project/${projectId}/inputs/timeliness`
        )
    },
    getListInputOnTimeResponse(projectId) {
        return process.env.API_CRM.concat(
            `/api/delivery/v1/project/${projectId}/inputs/ontime-response`
        )
    },

    getListInputOnTimeResolution(projectId) {
        return process.env.API_CRM.concat(
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
        return process.env.API.concat(
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
        return process.env.API.concat(
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

        return process.env.API.concat(
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

        return process.env.API.concat(
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
        return process.env.API.concat(
            `/resource/overview/available/table?location=${location}&gId=${gId}&group=${group}&isDu=${isDu}&child=${child}&fromDate=${fromDate}&toDate=${toDate}&skills=${encodeURIComponent(
                skills
            )}&languages=${encodeURIComponent(languages)}&levels=${encodeURIComponent(
                seniority
            )}&pageSize=${pageSize}&pageNum=${pageNum}&sortBy=${sortBy}&sortDirection=${sortDirection}&filterEffort=${filterEffort}`
        )
    },
    getWarningManMonthProjectCode(params) {
        const { month, year, projectCode } = params

        return process.env.API.concat(
            `/resources/allocations/evaluate-effort-by-project-code?month=${month}&year=${year}&projectCode=${projectCode}`
        )
    },
    getHistoryPerformanceBonus() {
        return process.env.API_SALE.concat(`/api/performance-bonus/hitories`)
    },
    getHistoryPerformanceBonusByEmployee(pageNum = 1, pageSize = 10) {
        return process.env.API_SALE.concat(
            `/api/performance-bonus/hitories/employee?pageNum=${pageNum}&pageSize=${pageSize}`
        )
    },
    getHistoryPerformanceBonusByEditor(pageNum = 1, pageSize = 10) {
        return process.env.API_SALE.concat(
            `/api/performance-bonus/hitories/editors?pageNum=${pageNum}&pageSize=${pageSize}`
        )
    },
    getMaximumManMonthInMonth() {
        return process.env.API_SALE.concat(
            `/api/project-billable/maximum-mm-in-month`
        )
    },
    getBillableGroups() {
        return process.env.API_SALE.concat(`/api/project-billable/groups`)
    },
    getTotalMMAllocate() {
        return process.env.API.concat('/total-mm-allocate')
    },
    getViewDetailMMPlan() {
        return process.env.API.concat('/view-detail-mm-plan')
    },
    getListDetailTasks() {
        return process.env.API.concat('/get-detail-tasks')
    },
    getListRoles() {
        return {
            url: process.env.API.concat('/ranking/get-all-roles'),
            method: 'get',
        }
    },
    getListCriteriaByRole() {
        return {
            url: process.env.API.concat('/ranking/get-criteria-by-roles'),
            method: 'get',
        }
    },
    getEditCriteriaByRole() {
        return {
            url: process.env.API.concat('/ranking/get-criteria-by-role'),
            method: 'get',
        }
    },
    getPerformanceBonusMemberProject(params) {
        return {
            url: process.env.API_SALE.concat(`/api/performance-bonus/member-project`),
            method: 'get',
        }
    },
    getPerformanceBonusProjectMember(params) {
        return {
            url: process.env.API_SALE.concat(`/api/performance-bonus/project-member`),
            method: 'get',
        }
    },
    getListSkillTypes() {
        return {
            url: process.env.API.concat('/ranking/get-skill-types'),
            method: 'get',
        }
    },
    savePerformanceRanking() {
        return {
            url: process.env.API.concat('/ranking/save-criteria-by-role'),
            method: 'post',
        }
    },
    getListScoreLevel() {
        return {
            url: process.env.API.concat('/ranking/get-score-level-by-role'),
            method: 'get',
        }
    },
    getListRankDetail() {
        return {
            url: process.env.API.concat('/ranking/get-rank-member'),
            method: 'get',
        }
    },
    savePerformanceRating() {
        return {
            url: process.env.API.concat('/ranking/member-ranking'),
            method: 'post',
        }
    },
}
