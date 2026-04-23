import { combineReducers } from '@reduxjs/toolkit'
import {
  ciTypesReducer,
  attributeDefinitionsReducer,
  configurationItemsReducer,
  ciRelationshipsReducer,
  ciGroupsReducer,
  ciAuditLogReducer,
  ciRuleConfigReducer,
  crmDirectionReducer,
  ciTypeRelationshipsReducer,
} from './reducers'

const cmplanReducer = combineReducers({
  ciTypes: ciTypesReducer,
  attributeDefinitions: attributeDefinitionsReducer,
  configurationItems: configurationItemsReducer,
  ciRelationships: ciRelationshipsReducer,
  ciGroups: ciGroupsReducer,
  ciAuditLog: ciAuditLogReducer,
  ciRuleConfig: ciRuleConfigReducer,
  crmDirection: crmDirectionReducer,
  ciTypeRelationships: ciTypeRelationshipsReducer,
})

export default cmplanReducer

// Re-export thunks, selectors, and actions for convenient imports.
export * from './asyncThunks'
export * from './reducers'