function MallSelector({ malls, activeMallId, isDark, onSelect }) {
  return (
    <section
      className={`rounded-[1.75rem] border p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur ${
        isDark
          ? 'border-slate-700/80 bg-slate-900/80'
          : 'border-slate-200/70 bg-white/80'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.28em] ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Mall
          </p>
          <h2
            className={`mt-1 text-xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Choose your mall
          </h2>
        </div>
        <label
          className={`flex min-w-0 flex-col gap-2 text-sm font-medium sm:w-80 ${
            isDark ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          Selected mall
          <select
            className={`rounded-2xl border px-4 py-3 text-base outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-100 focus:bg-slate-800'
                : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white'
            }`}
            value={activeMallId}
            disabled={!malls.length}
            onChange={(event) => onSelect(event.target.value)}
          >
            {!malls.length ? <option value="">No malls available</option> : null}
            {malls.map((mall) => (
              <option key={mall.id} value={mall.id}>
                {mall.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}

export default MallSelector
