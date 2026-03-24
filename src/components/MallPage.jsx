import { useState } from 'react'

function MallPage({
  malls,
  isDark,
  isLoading,
  errorMessage,
  onCreateMall,
  onRenameMall,
  onDeleteMall,
}) {
  const [newMallName, setNewMallName] = useState('')
  const [editingMallId, setEditingMallId] = useState('')
  const [editingName, setEditingName] = useState('')
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleCreateMall(event) {
    event.preventDefault()
    setFormError('')
    setIsSaving(true)

    const { error } = await onCreateMall(newMallName)

    setIsSaving(false)

    if (error) {
      setFormError(error)
      return
    }

    setNewMallName('')
  }

  async function handleRenameMall(event, mallId) {
    event.preventDefault()
    setFormError('')
    setIsSaving(true)

    const { error } = await onRenameMall(mallId, editingName)

    setIsSaving(false)

    if (error) {
      setFormError(error)
      return
    }

    setEditingMallId('')
    setEditingName('')
  }

  async function handleDeleteMall(mallId, mallName) {
    const shouldDelete = window.confirm(`Delete "${mallName}"?`)

    if (!shouldDelete) {
      return
    }

    setFormError('')
    setIsSaving(true)

    const { error } = await onDeleteMall(mallId)

    setIsSaving(false)

    if (error) {
      setFormError(error)
    }
  }

  return (
    <section
      className={`rounded-[2rem] border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur ${
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
            Mall Management
          </p>
          <h2
            className={`mt-2 text-2xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Add, rename, and delete malls
          </h2>
        </div>
      </div>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleCreateMall}>
        <input
          type="text"
          value={newMallName}
          onChange={(event) => setNewMallName(event.target.value)}
          placeholder="New mall name"
          className={`flex-1 rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
            isDark
              ? 'border-slate-700 bg-slate-800 text-slate-100 focus:bg-slate-800'
              : 'border-slate-200 bg-slate-50 focus:bg-white'
          }`}
        />
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Add Mall
        </button>
      </form>

      {formError || errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError || errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <p className={`mt-6 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Loading malls...
        </p>
      ) : malls.length ? (
        <div className="mt-6 space-y-3">
          {malls.map((mall) => {
            const isEditing = editingMallId === mall.id

            return (
              <div
                key={mall.id}
                className={`rounded-[1.5rem] border p-4 ${
                  isDark
                    ? 'border-slate-700 bg-slate-950/70'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                {isEditing ? (
                  <form
                    className="flex flex-col gap-3 sm:flex-row"
                    onSubmit={(event) => handleRenameMall(event, mall.id)}
                  >
                    <input
                      type="text"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      className={`flex-1 rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-100'
                          : 'border-slate-200 bg-white'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMallId('')
                        setEditingName('')
                        setFormError('')
                      }}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        isDark
                          ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                          : 'border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        {mall.name}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Created {mall.created_on || 'unknown'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMallId(mall.id)
                          setEditingName(mall.name)
                          setFormError('')
                        }}
                        className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                          isDark
                            ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                            : 'border-slate-200 text-slate-700 hover:bg-white'
                        }`}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMall(mall.id, mall.name)}
                        className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p
          className={`mt-6 rounded-2xl border border-dashed px-4 py-6 text-sm ${
            isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-600'
          }`}
        >
          No malls found. Add the first mall to start using the wheel.
        </p>
      )}
    </section>
  )
}

export default MallPage
