import { useEffect } from 'react'

function ResultModal({
  isDark,
  isOpen,
  resultName,
  message = '',
  confirmLabel = 'Confirm',
  spinAgainLabel = 'Spin Again',
  onConfirm,
  onSpinAgain,
}) {
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
    <div className="modal-overlay">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="spin-result-title"
        className="modal-card"
        data-mode={isDark ? 'dark' : 'light'}
      >
        <p className="modal-kicker" data-mode={isDark ? 'dark' : 'light'}>Spin Result</p>
        <h2 id="spin-result-title" className="mt-3 text-3xl font-black tracking-tight">
          {resultName}
        </h2>
        {message ? (
          <p className="modal-help-text mt-3" data-mode={isDark ? 'dark' : 'light'}>
            {message}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onSpinAgain}
            className="modal-secondary-button"
            data-mode={isDark ? 'dark' : 'light'}
          >
            {spinAgainLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultModal
