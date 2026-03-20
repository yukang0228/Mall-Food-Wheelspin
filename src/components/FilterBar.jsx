function FilterBar({
  filters,
  foodStyleOptions,
  priceRangeOptions,
  onChange,
  onReset,
}) {
  function handleCheckboxChange(event) {
    const { checked, name } = event.target
    onChange({ [name]: checked })
  }

  function handleSelectChange(event) {
    const { name, value } = event.target
    onChange({ [name]: value })
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Filters
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Narrow the wheel before you spin
          </h2>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
        >
          Reset Filters
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="halalOnly"
            checked={filters.halalOnly}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Halal only
        </label>

        <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="veganOnly"
            checked={filters.veganOnly}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Vegan only
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Food style
          <select
            name="foodStyle"
            value={filters.foodStyle}
            onChange={handleSelectChange}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
          >
            <option value="">All food styles</option>
            {foodStyleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Price range
          <select
            name="priceRange"
            value={filters.priceRange}
            onChange={handleSelectChange}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
          >
            <option value="">All price ranges</option>
            {priceRangeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}

export default FilterBar
