import React from 'react'
import BusinessPlanDetail from '../lib/business-plan/BusinessPlanDetail'

/**
 * Business Plan Detail Page
 * This page wraps the BusinessPlanDetail component from lib/business-plan
 * 
 * The component handles:
 * - General Information management
 * - Business Plan formula calculations
 * - Revenue Plan management
 * - Delivery Plan management
 * - Documents handling
 * - Activity tracking
 * - Workflow approval process
 */
const BusinessPlanDetailPage = ({ match, history }) => {
  return <BusinessPlanDetail match={match} history={history} />
}

export default BusinessPlanDetailPage
