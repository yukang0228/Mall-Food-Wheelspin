function FilterBar({
  filters,
  foodStyleOptions,
  priceRangeOptions,
  isDark,
  onChange,
  onReset,
}) {
  function handleSelectChange(event) {
    const { name, value } = event.target
    onChange({ [name]: value })
  }

  function handleExcludedStyleChange(style, checked) {
    const nextExcludedStyles = checked
      ? [...filters.excludedFoodStyles, style]
      : filters.excludedFoodStyles.filter((item) => item !== style)

    onChange({ excludedFoodStyles: nextExcludedStyles })
  }

  function toggleFilter(name) {
    onChange({ [name]: !filters[name] })
  }

  return (
    <section
      className={`rounded-[1.75rem] border p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur ${
        isDark
          ? 'border-slate-700/80 bg-slate-900/80'
          : 'border-slate-200/70 bg-white/80'
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.28em] ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Filters
          </p>
          <h2
            className={`mt-1 text-xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Quick filter
          </h2>
        </div>

        <button
          type="button"
          onClick={onReset}
          className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
            isDark
              ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
              : 'border-slate-200 text-slate-700 hover:bg-white'
          }`}
        >
          Reset
        </button>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,1fr)]">
        <button
          type="button"
          onClick={() => toggleFilter('halalOnly')}
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            filters.halalOnly
              ? 'border-emerald-500 bg-emerald-600 text-white'
              : isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
          }`}
          aria-pressed={filters.halalOnly}
        >
          Halal
        </button>

        <button
          type="button"
          onClick={() => toggleFilter('veganOnly')}
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            filters.veganOnly
              ? 'border-emerald-500 bg-emerald-600 text-white'
              : isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
          }`}
          aria-pressed={filters.veganOnly}
        >
          Vegan
        </button>

        <label
          className={`flex flex-col gap-2 text-sm font-medium ${
            isDark ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          Food style
          <select
            name="foodStyle"
            value={filters.foodStyle}
            onChange={handleSelectChange}
            className={`rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-100 focus:bg-slate-800'
                : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white'
            }`}
          >
            <option value="">All food styles</option>
            {foodStyleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label
          className={`flex flex-col gap-2 text-sm font-medium ${
            isDark ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          Price range
          <select
            name="priceRange"
            value={filters.priceRange}
            onChange={handleSelectChange}
            className={`rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-100 focus:bg-slate-800'
                : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white'
            }`}
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

      <details
        className={`mt-3 rounded-2xl border px-4 py-3 ${
          isDark ? 'border-slate-700 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
        }`}
      >
        <summary
          className={`cursor-pointer list-none text-sm font-semibold ${
            isDark ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          Exclude food styles
          {filters.excludedFoodStyles.length ? ` (${filters.excludedFoodStyles.length})` : ''}
        </summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {foodStyleOptions.map((style) => {
            const isExcluded = filters.excludedFoodStyles.includes(style)

            return (
              <label
                key={style}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                  isDark
                    ? 'border-slate-700 bg-slate-900 text-slate-200'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  name="excludedFoodStyles"
                  checked={isExcluded}
                  onChange={(event) =>
                    handleExcludedStyleChange(style, event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>{style}</span>
              </label>
            )
          })}
        </div>
      </details>
    </section>
  )
}

export default FilterBar
