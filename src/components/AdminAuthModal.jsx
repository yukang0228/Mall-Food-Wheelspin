import { useEffect, useState } from 'react'

const ADMIN_GATE_PIN = import.meta.env.VITE_ADMIN_GATE_PIN?.trim() ?? ''

function AdminAuthModal({
  isDark,
  isOpen,
  isSubmitting,
  errorMessage,
  infoMessage,
  onClose,
  onSubmit,
}) {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [isPinUnlocked, setIsPinUnlocked] = useState(false)
  const [pinErrorMessage, setPinErrorMessage] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setPin('')
      setIsPinUnlocked(false)
      setPinErrorMessage('')
    }
  }, [isOpen])

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

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(email)
  }

  function handlePinSubmit(event) {
    event.preventDefault()

    if (!ADMIN_GATE_PIN) {
      setPinErrorMessage('Admin PIN is not configured.')
      return
    }

    if (pin !== ADMIN_GATE_PIN) {
      setPinErrorMessage('Incorrect PIN.')
      return
    }

    setIsPinUnlocked(true)
    setPinErrorMessage('')
  }

  return (
    <div className="modal-overlay--soft">
      <div className="modal-card modal-card--compact" data-mode={isDark ? 'dark' : 'light'}>
        <div className="modal-header">
          <div>
            <p className="modal-kicker" data-mode={isDark ? 'dark' : 'light'}>Admin Access</p>
            <h2 className="modal-title" data-mode={isDark ? 'dark' : 'light'}>Sign in with magic link</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-button"
            data-mode={isDark ? 'dark' : 'light'}
          >
            Close
          </button>
        </div>

        {!isPinUnlocked ? (
          <form className="modal-form" onSubmit={handlePinSubmit}>
            <label className="field-stack" data-mode={isDark ? 'dark' : 'light'}>
              Access PIN
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                className="form-control"
                data-mode={isDark ? 'dark' : 'light'}
                placeholder="Enter PIN"
              />
            </label>

            {pinErrorMessage ? (
              <p className="status-message status-message--error">{pinErrorMessage}</p>
            ) : null}

            <div className="modal-actions">
              <button
                type="submit"
                className="modal-primary-button"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={onClose}
                className="modal-secondary-button"
                data-mode={isDark ? 'dark' : 'light'}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            <label className="field-stack" data-mode={isDark ? 'dark' : 'light'}>
              Admin email
              <input
                autoFocus
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="form-control"
                data-mode={isDark ? 'dark' : 'light'}
                placeholder="admin@example.com"
              />
            </label>

            <p className="modal-help-text" data-mode={isDark ? 'dark' : 'light'}>
              Use an admin email that already has a Supabase auth user and a matching
              `profiles.role` of `admin`.
            </p>

            {errorMessage ? (
              <p className="status-message status-message--error">{errorMessage}</p>
            ) : null}

            {infoMessage ? (
              <p className="status-message status-message--success">{infoMessage}</p>
            ) : null}

            <div className="modal-actions">
              <button
                type="submit"
                disabled={isSubmitting}
                className="modal-primary-button"
              >
                {isSubmitting ? 'Sending...' : 'Send magic link'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="modal-secondary-button"
                data-mode={isDark ? 'dark' : 'light'}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AdminAuthModal
