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

function History({ entries, isLoading, errorMessage, saveErrorMessage }) {
  return (
    <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            History
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Last 50 spins
          </h2>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {entries.length} saved
        </div>
      </div>

      <div className="mt-5 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
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
          <p className="text-sm text-slate-600">Loading spin history...</p>
        ) : entries.length ? (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {entry.mallName}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {entry.foodName}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {formatTimestamp(entry.createdOn)}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            No spins yet. Your results will appear here after the wheel stops.
          </div>
        )}
      </div>
    </section>
  )
}

export default History
