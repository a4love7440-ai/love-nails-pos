import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  return { toast, show }
}

export function Toast({ toast }) {
  if (!toast) return null
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  return (
    <div className="toast">
      <span>{icons[toast.type] || '✅'}</span>
      <span>{toast.msg}</span>
    </div>
  )
}
