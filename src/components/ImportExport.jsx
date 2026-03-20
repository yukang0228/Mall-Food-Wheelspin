import { useRef, useState } from 'react'

function ImportExport({ exportData, onImport }) {
  const inputRef = useRef(null)
  const [message, setMessage] = useState('')

  function handleExport() {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = 'mall-food-wheelspin-state.json'
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('Exported current app state to JSON.')
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      onImport(parsed)
      setMessage('Imported app state from JSON.')
    } catch {
      setMessage('Import failed. Use a valid JSON export file.')
    } finally {
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        Import / Export
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
        >
          Import JSON
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {message ? (
        <p className="mt-3 text-sm text-slate-600">{message}</p>
      ) : null}
    </div>
  )
}

export default ImportExport
