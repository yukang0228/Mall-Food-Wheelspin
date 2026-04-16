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
    <section className="surface-panel" data-mode={isDark ? 'dark' : 'light'}>
      <div className="surface-panel-header">
        <div>
          <p className="section-kicker" data-mode={isDark ? 'dark' : 'light'}>Filters</p>
          <h2 className="section-title" data-mode={isDark ? 'dark' : 'light'}>Quick filter</h2>
        </div>

        <div>
          <button
            type="button"
            onClick={onReset}
            className="button-outline"
            data-mode={isDark ? 'dark' : 'light'}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="filter-grid">
        <div className="col-span-full flex gap-3">
          <button
            type="button"
            onClick={() => toggleFilter('halalOnly')}
            className={`flex h-16 w-16 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
              filters.halalOnly
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.26)]'
                : isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
            aria-pressed={filters.halalOnly}
          >
            Halal
          </button>

          <button
            type="button"
            onClick={() => toggleFilter('veganOnly')}
            className={`flex h-16 w-16 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
              filters.veganOnly
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.26)]'
                : isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
            aria-pressed={filters.veganOnly}
          >
            Vegan
          </button>
        </div>

        <label className="field-stack" data-mode={isDark ? 'dark' : 'light'}>
          Food style
          <select
            name="foodStyle"
            value={filters.foodStyle}
            onChange={handleSelectChange}
            className="form-control"
            data-mode={isDark ? 'dark' : 'light'}
          >
            <option value="">All food styles</option>
            {foodStyleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="field-stack" data-mode={isDark ? 'dark' : 'light'}>
          Price range
          <select
            name="priceRange"
            value={filters.priceRange}
            onChange={handleSelectChange}
            className="form-control"
            data-mode={isDark ? 'dark' : 'light'}
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

      <details className="filter-exclude-panel" data-mode={isDark ? 'dark' : 'light'}>
        <summary className="filter-exclude-summary" data-mode={isDark ? 'dark' : 'light'}>
          Exclude food styles
          {filters.excludedFoodStyles.length ? ` (${filters.excludedFoodStyles.length})` : ''}
        </summary>
        <div className="filter-exclude-list">
          {foodStyleOptions.map((style) => {
            const isExcluded = filters.excludedFoodStyles.includes(style)

            return (
              <label
                key={style}
                className="filter-exclude-item"
                data-mode={isDark ? 'dark' : 'light'}
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
                <span className="filter-exclude-label">{style}</span>
              </label>
            )
          })}
        </div>
      </details>
    </section>
  )
}

export default FilterBar
