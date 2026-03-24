function formatTimestamp(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function History({ entries, isDark, isLoading, errorMessage, saveErrorMessage }) {
  return (
    <section
      className={`rounded-[1.75rem] border p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur ${
        isDark
          ? 'border-slate-700/80 bg-slate-900/80'
          : 'border-slate-200/70 bg-white/80'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.28em] ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            History
          </p>
          <h2
            className={`mt-1 text-xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Last 5 spins
          </h2>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {entries.length} saved
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {saveErrorMessage ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {saveErrorMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Loading spin history...
          </p>
        ) : entries.length ? (
          entries.map((entry) => (
            <article
              key={entry.id}
              className={`rounded-[1.25rem] border px-3 py-3 ${
                isDark
                  ? 'border-slate-700 bg-slate-950/70'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {entry.mallName}
              </p>
              <p
                className={`mt-1 text-base font-semibold ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                {entry.foodName}
              </p>
              <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {formatTimestamp(entry.createdOn)}
              </p>
            </article>
          ))
        ) : (
          <div
            className={`rounded-2xl border border-dashed px-4 py-6 text-sm ${
              isDark
                ? 'border-slate-700 bg-slate-950/70 text-slate-400'
                : 'border-slate-300 bg-slate-50 text-slate-500'
            }`}
          >
            No spins yet. Your results will appear here after the wheel stops.
          </div>
        )}
      </div>
    </section>
  )
}

export default History
