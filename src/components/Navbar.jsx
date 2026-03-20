const NAV_ITEMS = [
  { id: 'wheel', label: 'Wheel', adminOnly: false },
  { id: 'add-mall', label: 'Add Mall', adminOnly: true },
  { id: 'add-food', label: 'Food', adminOnly: true },
]

function Navbar({ activePage, isAdmin, onNavigate }) {
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <nav className="flex flex-wrap gap-3">
      {visibleItems.map((item) => {
        const isActive = item.id === activePage

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'bg-slate-950 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

export default Navbar
