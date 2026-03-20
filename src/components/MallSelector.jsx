function MallSelector({ malls, activeMallId, onSelect }) {
  return (
    <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Mall Selector
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Choose where you are eating
          </h2>
        </div>
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700 sm:w-80">
          Active mall
          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
            value={activeMallId}
            onChange={(event) => onSelect(event.target.value)}
          >
            {malls.map((mall) => (
              <option key={mall.id} value={mall.id}>
                {mall.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {malls.map((mall) => {
          const isActive = mall.id === activeMallId

          return (
            <button
              key={mall.id}
              type="button"
              onClick={() => onSelect(mall.id)}
              className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                isActive
                  ? 'border-orange-300 bg-orange-50 shadow-[0_12px_30px_rgba(249,115,22,0.15)]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className="text-base font-semibold text-slate-950">{mall.name}</p>
              <p className="mt-2 text-sm text-slate-600">
                {mall.options.length} {mall.options.length === 1 ? 'option' : 'options'}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default MallSelector
