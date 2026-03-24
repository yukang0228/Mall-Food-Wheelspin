function ThemeToggle({ themeMode, onToggle }) {
  const isDark = themeMode === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
        isDark
          ? 'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
      }`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? 'Dark' : 'Light'}
    </button>
  )
}

export default ThemeToggle
