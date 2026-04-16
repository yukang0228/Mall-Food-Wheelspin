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
    <section className="surface-panel" data-mode={isDark ? 'dark' : 'light'}>
      <div className="history-header">
        <div>
          <p className="section-kicker" data-mode={isDark ? 'dark' : 'light'}>History</p>
          <h2 className="section-title" data-mode={isDark ? 'dark' : 'light'}>Last 5 spins</h2>
        </div>
        <div className="history-count" data-mode={isDark ? 'dark' : 'light'}>
          {entries.length} saved
        </div>
      </div>

      <div className="history-list">
        {saveErrorMessage ? (
          <p className="status-message status-message--warning">{saveErrorMessage}</p>
        ) : null}

        {errorMessage ? (
          <p className="status-message status-message--error">{errorMessage}</p>
        ) : null}

        {isLoading ? (
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Loading spin history...
          </p>
        ) : entries.length ? (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="history-item"
              data-mode={isDark ? 'dark' : 'light'}
            >
              <p className="history-item-mall" data-mode={isDark ? 'dark' : 'light'}>{entry.mallName}</p>
              <p className="history-item-name" data-mode={isDark ? 'dark' : 'light'}>{entry.foodName}</p>
              <p className="history-item-time" data-mode={isDark ? 'dark' : 'light'}>{formatTimestamp(entry.createdOn)}</p>
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
