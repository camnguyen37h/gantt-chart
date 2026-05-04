// Re-export actions and slice reducers (named) per slice.
// Consumers read state inline via `useSelector(state => state.cmplan.<slice>.<field>)`,
// matching the convention in `src/lib/business-plan/redux/reducers/`.

export * from './ciTypes'
export * from './attributeDefinitions'
export * from './configurationItems'
export * from './ciRelationships'
export * from './ciGroups'
export * from './ciAuditLog'
export * from './ciRuleConfig'
export * from './crmDirection'
export * from './ciTypeRelationships'
export * from './projectBasicInfo'

export { default as ciTypesReducer } from './ciTypes'
export { default as attributeDefinitionsReducer } from './attributeDefinitions'
export { default as configurationItemsReducer } from './configurationItems'
export { default as ciRelationshipsReducer } from './ciRelationships'
export { default as ciGroupsReducer } from './ciGroups'
export { default as ciAuditLogReducer } from './ciAuditLog'
export { default as ciRuleConfigReducer } from './ciRuleConfig'
export { default as crmDirectionReducer } from './crmDirection'
export { default as ciTypeRelationshipsReducer } from './ciTypeRelationships'
export { default as projectBasicInfoReducer } from './projectBasicInfo'
