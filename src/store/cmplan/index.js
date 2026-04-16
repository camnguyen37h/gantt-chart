import { combineReducers } from '@reduxjs/toolkit'
import ciClassesReducer from './ciClassesSlice'
import attributeDefinitionsReducer from './attributeDefinitionsSlice'
import configurationItemsReducer from './configurationItemsSlice'
import ciRelationshipsReducer from './ciRelationshipsSlice'
import ciGroupsReducer from './ciGroupsSlice'
import ciAuditLogReducer from './ciAuditLogSlice'
import ciRuleConfigReducer from './ciRuleConfigSlice'

const cmplanReducer = combineReducers({
  ciClasses: ciClassesReducer,
  attributeDefinitions: attributeDefinitionsReducer,
  configurationItems: configurationItemsReducer,
  ciRelationships: ciRelationshipsReducer,
  ciGroups: ciGroupsReducer,
  ciAuditLog: ciAuditLogReducer,
  ciRuleConfig: ciRuleConfigReducer,
})

export default cmplanReducer

// Re-export actions & thunks for convenience
export * from './ciClassesSlice'
export * from './attributeDefinitionsSlice'
export * from './configurationItemsSlice'
export * from './ciRelationshipsSlice'
export * from './ciGroupsSlice'
export * from './ciAuditLogSlice'
export * from './ciRuleConfigSlice'
