function AdminToggle({ isAdmin, isDark, onChange }) {
  return (
    <label
      className={`inline-flex items-center gap-3 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm ${
        isDark
          ? 'border-slate-700 bg-slate-900 text-slate-200'
          : 'border-slate-200 bg-white text-slate-700'
      }`}
    >
      <span>Admin Mode</span>
      <button
        type="button"
        role="switch"
        aria-checked={isAdmin}
        onClick={() => onChange(!isAdmin)}
        className={`relative h-7 w-12 rounded-full transition ${
          isAdmin ? 'bg-emerald-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            isAdmin ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </label>
  )
}

export default AdminToggle
