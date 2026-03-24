import { useEffect, useState } from 'react'

function PinModal({ isDark, isOpen, errorMessage, onClose, onSubmit }) {
  const [pin, setPin] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setPin('')
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(pin)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div
        className={`w-full max-w-sm rounded-[2rem] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.25)] ${
          isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-950'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.28em] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Admin Mode
            </p>
            <h2
              className={`mt-2 text-2xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              Enter PIN
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label
            className={`flex flex-col gap-2 text-sm font-medium ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            Admin PIN
            <input
              autoFocus
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              className={`rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100 focus:bg-slate-800'
                  : 'border-slate-200 bg-slate-50 focus:bg-white'
              }`}
              placeholder="Enter PIN"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Unlock
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                isDark
                  ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PinModal
