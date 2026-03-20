import { useMemo, useState } from 'react'

function OptionsEditor({
  mall,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onBulkImport,
}) {
  const [newOption, setNewOption] = useState('')
  const [bulkText, setBulkText] = useState('')
  const [message, setMessage] = useState('')
  const sortedOptions = useMemo(
    () =>
      [...(mall?.options ?? [])].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    [mall?.options],
  )

  function handleAddSubmit(event) {
    event.preventDefault()
    const trimmed = newOption.trim()

    if (!trimmed) {
      setMessage('Enter a food option before adding.')
      return
    }

    onAddOption(trimmed)
    setNewOption('')
    setMessage(`Added or kept "${trimmed}" after dedupe.`)
  }

  function handleBulkSubmit(event) {
    event.preventDefault()
    const added = onBulkImport(bulkText)

    if (added > 0) {
      setBulkText('')
      setMessage(`Imported ${added} option${added === 1 ? '' : 's'}.`)
      return
    }

    setMessage('No new options were imported.')
  }

  if (!mall) {
    return null
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Food Options
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {mall.name}
          </h2>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {mall.options.length} total
        </div>
      </div>

      <form className="mt-5 flex gap-3" onSubmit={handleAddSubmit}>
        <input
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
          value={newOption}
          onChange={(event) => setNewOption(event.target.value)}
          placeholder="Add one food option"
        />
        <button
          type="submit"
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add
        </button>
      </form>

      <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
        {sortedOptions.length ? (
          sortedOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
            >
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
                value={option.name}
                onChange={(event) =>
                  onUpdateOption(option.id, event.target.value)
                }
                aria-label={`Edit ${option.name}`}
              />
              <button
                type="button"
                onClick={() => onDeleteOption(option.id)}
                className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600 transition hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            No food options yet. Add items manually or paste a bulk list below.
          </div>
        )}
      </div>

      <form className="mt-5" onSubmit={handleBulkSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Bulk paste import
          <textarea
            className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            placeholder={'One option per line\nLaksa\nFish and Chips\nChicken Chop'}
          />
        </label>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Dedupe ignores case, extra spaces, and apostrophe variations.
          </p>
          <button
            type="submit"
            className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Import List
          </button>
        </div>
      </form>

      {message ? (
        <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {message}
        </p>
      ) : null}
    </section>
  )
}

export default OptionsEditor
