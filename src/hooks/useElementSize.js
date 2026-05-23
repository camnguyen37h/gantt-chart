import { useState, useEffect, useRef } from 'react'

export const useElementSize = () => {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }
      const entry = entries[0];
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  return { containerRef, size }
}

export default useElementSize
