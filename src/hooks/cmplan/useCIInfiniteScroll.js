import { useCallback, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { fetchCIsByType } from '../../store/cmplan'

const CI_PAGE_SIZE = 10

/**
 * Attaches an IntersectionObserver sentinel to the bottom of a CI list.
 * When the sentinel becomes visible and `hasMore` is true, dispatches the
 * next page fetch.
 *
 * @param {Object} params
 * @param {string|undefined} params.ciType
 * @param {string}           params.searchText
 * @param {number}           params.currentPage  last page already loaded
 * @param {boolean}          params.hasMore
 * @param {boolean}          params.loading
 * @returns {Function} ref callback to attach to the sentinel element
 */
const useCIInfiniteScroll = ({ ciType, searchText, currentPage, hasMore, loading }) => {
  const dispatch = useDispatch()
  const observerRef = useRef(null)

  const loadNextPage = useCallback(() => {
    if (!ciType || !hasMore || loading) return
    dispatch(fetchCIsByType({
      ciType,
      searchText,
      page: currentPage + 1,
      pageSize: CI_PAGE_SIZE,
    }))
  }, [dispatch, ciType, searchText, currentPage, hasMore, loading])

  const sentinelRef = useCallback(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      if (!node) return
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadNextPage()
        },
        { threshold: 0.1 }
      )
      observerRef.current.observe(node)
    },
    [loadNextPage]
  )

  // Disconnect on unmount
  useEffect(
    () => () => {
      if (observerRef.current) observerRef.current.disconnect()
    },
    []
  )

  return sentinelRef
}

export default useCIInfiniteScroll
