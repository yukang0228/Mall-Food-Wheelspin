function ThemeToggle({ themeMode, onToggle }) {
  const isDark = themeMode === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      className="theme-toggle"
      data-mode={isDark ? 'dark' : 'light'}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? 'Dark' : 'Light'}
    </button>
  )
}

export default ThemeToggle
