/**
 * Permission Utilities for Business Plan
 * Manages user permissions and access control
 */

// Permission constants
export const PERMISSIONS = {
  // View permissions
  VIEW_TOTAL: 'VIEW_TOTAL',
  VIEW_OB: 'VIEW_OB',
  VIEW_ONSITE: 'VIEW_ONSITE',
  VIEW_OFFSHORE: 'VIEW_OFFSHORE',
  VIEW_FINANCIAL_DATA: 'VIEW_FINANCIAL_DATA',
  VIEW_ALL_DEPARTMENTS: 'VIEW_ALL_DEPARTMENTS',
  VIEW_OWN_DEPARTMENT: 'VIEW_OWN_DEPARTMENT',
  
  // Edit permissions
  EDIT_BUSINESS_PLAN: 'EDIT_BUSINESS_PLAN',
  EDIT_REVENUE_PLAN: 'EDIT_REVENUE_PLAN',
  EDIT_DELIVERY_PLAN: 'EDIT_DELIVERY_PLAN',
  
  // Administrative permissions
  APPROVE_BUSINESS_PLAN: 'APPROVE_BUSINESS_PLAN',
  DELETE_BUSINESS_PLAN: 'DELETE_BUSINESS_PLAN',
  EXPORT_DATA: 'EXPORT_DATA'
};

// Role definitions with their permissions
export const ROLES = {
  ADMIN: {
    name: 'Administrator',
    permissions: Object.values(PERMISSIONS) // All permissions
  },
  
  MANAGER: {
    name: 'Manager',
    permissions: [
      PERMISSIONS.VIEW_TOTAL,
      PERMISSIONS.VIEW_OB,
      PERMISSIONS.VIEW_ONSITE,
      PERMISSIONS.VIEW_OFFSHORE,
      PERMISSIONS.VIEW_FINANCIAL_DATA,
      PERMISSIONS.VIEW_ALL_DEPARTMENTS,
      PERMISSIONS.EDIT_BUSINESS_PLAN,
      PERMISSIONS.EDIT_REVENUE_PLAN,
      PERMISSIONS.EDIT_DELIVERY_PLAN,
      PERMISSIONS.APPROVE_BUSINESS_PLAN,
      PERMISSIONS.EXPORT_DATA
    ]
  },
  
  PM: {
    name: 'Project Manager',
    permissions: [
      PERMISSIONS.VIEW_TOTAL,
      PERMISSIONS.VIEW_ONSITE,
      PERMISSIONS.VIEW_OFFSHORE,
      PERMISSIONS.VIEW_FINANCIAL_DATA,
      PERMISSIONS.VIEW_OWN_DEPARTMENT,
      PERMISSIONS.EDIT_BUSINESS_PLAN,
      PERMISSIONS.EDIT_REVENUE_PLAN,
      PERMISSIONS.EDIT_DELIVERY_PLAN,
      PERMISSIONS.EXPORT_DATA
    ]
  },
  
  TEAM_LEAD: {
    name: 'Team Lead',
    permissions: [
      PERMISSIONS.VIEW_TOTAL,
      PERMISSIONS.VIEW_OWN_DEPARTMENT,
      PERMISSIONS.VIEW_FINANCIAL_DATA,
      PERMISSIONS.EDIT_DELIVERY_PLAN,
      PERMISSIONS.EXPORT_DATA
    ]
  },
  
  DEVELOPER: {
    name: 'Developer',
    permissions: [
      PERMISSIONS.VIEW_OWN_DEPARTMENT,
      PERMISSIONS.VIEW_DELIVERY_PLAN
    ]
  },
  
  VIEWER: {
    name: 'Viewer',
    permissions: [
      PERMISSIONS.VIEW_TOTAL
    ]
  }
};

/**
 * Check if user has a specific permission
 * @param {object} user - User object with role or permissions array
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
export const checkPermission = (user, permission) => {
  if (!user) return false;
  
  // If user has direct permissions array
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }
  
  // If user has a role
  if (user.role) {
    const role = ROLES[user.role];
    if (role && role.permissions) {
      return role.permissions.includes(permission);
    }
  }
  
  return false;
};

/**
 * Check if user has any of the specified permissions
 * @param {object} user - User object
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} True if user has at least one permission
 */
export const checkAnyPermission = (user, permissions) => {
  return permissions.some(permission => checkPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {object} user - User object
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} True if user has all permissions
 */
export const checkAllPermissions = (user, permissions) => {
  return permissions.every(permission => checkPermission(user, permission));
};

/**
 * Get all permissions for a user
 * @param {object} user - User object
 * @returns {Array} Array of permission strings
 */
export const getUserPermissions = (user) => {
  if (!user) return [];
  
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions;
  }
  
  if (user.role && ROLES[user.role]) {
    return ROLES[user.role].permissions;
  }
  
  return [];
};

/**
 * Check if user can view financial data
 * @param {object} user - User object
 * @returns {boolean} True if user can view financial data
 */
export const canViewFinancialData = (user) => {
  return checkPermission(user, PERMISSIONS.VIEW_FINANCIAL_DATA);
};

/**
 * Check if user can edit business plan
 * @param {object} user - User object
 * @returns {boolean} True if user can edit
 */
export const canEditBusinessPlan = (user) => {
  return checkPermission(user, PERMISSIONS.EDIT_BUSINESS_PLAN);
};

/**
 * Get accessible departments for user
 * @param {object} user - User object
 * @returns {Array} Array of department codes
 */
export const getAccessibleDepartments = (user) => {
  if (checkPermission(user, PERMISSIONS.VIEW_ALL_DEPARTMENTS)) {
    return ['Total', 'BJI', 'Internal', 'DU1', 'DU3'];
  }
  
  if (checkPermission(user, PERMISSIONS.VIEW_OWN_DEPARTMENT) && user.department) {
    return [user.department];
  }
  
  return [];
};

/**
 * Filter data based on user's department access
 * @param {Array} data - Array of data objects
 * @param {object} user - User object
 * @returns {Array} Filtered data
 */
export const filterDataByDepartment = (data, user) => {
  const accessibleDepts = getAccessibleDepartments(user);
  
  if (accessibleDepts.includes('Total') || accessibleDepts.length === 0) {
    return data; // Return all data
  }
  
  return data.filter(item => accessibleDepts.includes(item.department));
};

/**
 * Mask sensitive data if user doesn't have permission
 * @param {any} value - Value to mask
 * @param {object} user - User object
 * @returns {any} Original value or masked value
 */
export const maskSensitiveData = (value, user) => {
  if (canViewFinancialData(user)) {
    return value;
  }
  return '***';
};

/**
 * Check if user can view specific work type
 * @param {object} user - User object
 * @param {string} workType - 'onsite' or 'offshore'
 * @returns {boolean} True if user can view
 */
export const canViewWorkType = (user, workType) => {
  if (workType === 'onsite') {
    return checkPermission(user, PERMISSIONS.VIEW_ONSITE);
  }
  if (workType === 'offshore') {
    return checkPermission(user, PERMISSIONS.VIEW_OFFSHORE);
  }
  return false;
};

/**
 * Check if user can view specific view mode
 * @param {object} user - User object
 * @param {string} viewMode - 'total' or 'ob'
 * @returns {boolean} True if user can view
 */
export const canViewMode = (user, viewMode) => {
  if (viewMode === 'total') {
    return checkPermission(user, PERMISSIONS.VIEW_TOTAL);
  }
  if (viewMode === 'ob') {
    return checkPermission(user, PERMISSIONS.VIEW_OB);
  }
  return false;
};

/**
 * Get available work types for user
 * @param {object} user - User object
 * @returns {Array} Array of available work types
 */
export const getAvailableWorkTypes = (user) => {
  const workTypes = [];
  
  if (checkPermission(user, PERMISSIONS.VIEW_ONSITE)) {
    workTypes.push('onsite');
  }
  
  if (checkPermission(user, PERMISSIONS.VIEW_OFFSHORE)) {
    workTypes.push('offshore');
  }
  
  return workTypes;
};

/**
 * Get available view modes for user
 * @param {object} user - User object
 * @returns {Array} Array of available view modes
 */
export const getAvailableViewModes = (user) => {
  const viewModes = [];
  
  if (checkPermission(user, PERMISSIONS.VIEW_TOTAL)) {
    viewModes.push('total');
  }
  
  if (checkPermission(user, PERMISSIONS.VIEW_OB)) {
    viewModes.push('ob');
  }
  
  return viewModes;
};

/**
 * Create user permission object for component props
 * @param {object} user - User object
 * @returns {object} Permission flags object
 */
export const createPermissionFlags = (user) => {
  return {
    canViewTotal: checkPermission(user, PERMISSIONS.VIEW_TOTAL),
    canViewOB: checkPermission(user, PERMISSIONS.VIEW_OB),
    canViewOnsite: checkPermission(user, PERMISSIONS.VIEW_ONSITE),
    canViewOffshore: checkPermission(user, PERMISSIONS.VIEW_OFFSHORE),
    canViewFinancial: checkPermission(user, PERMISSIONS.VIEW_FINANCIAL_DATA),
    canViewAllDepartments: checkPermission(user, PERMISSIONS.VIEW_ALL_DEPARTMENTS),
    canEdit: checkPermission(user, PERMISSIONS.EDIT_BUSINESS_PLAN),
    canEditRevenue: checkPermission(user, PERMISSIONS.EDIT_REVENUE_PLAN),
    canEditDelivery: checkPermission(user, PERMISSIONS.EDIT_DELIVERY_PLAN),
    canApprove: checkPermission(user, PERMISSIONS.APPROVE_BUSINESS_PLAN),
    canDelete: checkPermission(user, PERMISSIONS.DELETE_BUSINESS_PLAN),
    canExport: checkPermission(user, PERMISSIONS.EXPORT_DATA)
  };
};

/**
 * Validate user action based on permissions
 * @param {object} user - User object
 * @param {string} action - Action to validate
 * @returns {object} { allowed: boolean, message: string }
 */
export const validateAction = (user, action) => {
  const permission = PERMISSIONS[action];
  
  if (!permission) {
    return { allowed: false, message: 'Hành động không hợp lệ' };
  }
  
  if (checkPermission(user, permission)) {
    return { allowed: true, message: '' };
  }
  
  return { 
    allowed: false, 
    message: `Bạn không có quyền thực hiện hành động này. Cần quyền: ${permission}` 
  };
};
