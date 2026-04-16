import { useEffect } from 'react'

function MobilePanelModal({ isDark, isOpen, title, onClose, children }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflow
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="mobile-modal-overlay">
      <div className="mobile-modal-card" data-mode={isDark ? 'dark' : 'light'}>
        <div className="mobile-modal-header">
          <h2 className="mobile-modal-title" data-mode={isDark ? 'dark' : 'light'}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="mobile-modal-close"
            data-mode={isDark ? 'dark' : 'light'}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default MobilePanelModal
