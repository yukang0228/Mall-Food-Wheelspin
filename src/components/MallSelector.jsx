function MallSelector({ malls, activeMallId, isDark, onSelect }) {
  return (
    <section className="surface-panel" data-mode={isDark ? 'dark' : 'light'}>
      <div className="surface-panel-stack">
        <div>
          <p className="section-kicker" data-mode={isDark ? 'dark' : 'light'}>Mall</p>
          <h2 className="section-title" data-mode={isDark ? 'dark' : 'light'}>Choose your mall</h2>
        </div>
        <label className="field-stack" data-mode={isDark ? 'dark' : 'light'}>
          Selected mall
          <select
            className="form-control text-base"
            data-mode={isDark ? 'dark' : 'light'}
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
