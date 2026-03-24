function ResultModal({ isDark, isOpen, resultName, onConfirm, onSpinAgain }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="spin-result-title"
        className={`w-full max-w-md rounded-[2rem] border p-6 shadow-[0_24px_80px_rgba(15,23,42,0.3)] ${
          isDark
            ? 'border-slate-700 bg-slate-900 text-slate-100'
            : 'border-slate-200 bg-white text-slate-950'
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-[0.28em] ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Spin Result
        </p>
        <h2 id="spin-result-title" className="mt-3 text-3xl font-black tracking-tight">
          {resultName}
        </h2>
        <p className={`mt-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          The wheel has stopped. Confirm this pick or spin again.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={onSpinAgain}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              isDark
                ? 'border-slate-600 text-slate-100 hover:bg-slate-800'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Spin Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultModal
