import { combineReducers } from '@reduxjs/toolkit'
import ciClassesReducer from './ciClassesSlice'
import attributeDefinitionsReducer from './attributeDefinitionsSlice'
import configurationItemsReducer from './configurationItemsSlice'
import ciRelationshipsReducer from './ciRelationshipsSlice'
import ciGroupsReducer from './ciGroupsSlice'

const cmplanReducer = combineReducers({
  ciClasses: ciClassesReducer,
  attributeDefinitions: attributeDefinitionsReducer,
  configurationItems: configurationItemsReducer,
  ciRelationships: ciRelationshipsReducer,
  ciGroups: ciGroupsReducer,
})

export default cmplanReducer

// Re-export actions & thunks for convenience
export * from './ciClassesSlice'
export * from './attributeDefinitionsSlice'
export * from './configurationItemsSlice'
export * from './ciRelationshipsSlice'
export * from './ciGroupsSlice'
