import { useState } from 'react'

const NAV_ITEMS = [
  { id: 'wheel', label: 'Wheel', adminOnly: false },
  { id: 'add-mall', label: 'Add Mall', adminOnly: true },
  { id: 'add-food', label: 'Food', adminOnly: true },
]

function Navbar({
  activePage,
  isAdmin,
  isDark,
  authStatusMessage,
  isLoadingProfile,
  sessionEmail,
  onNavigate,
  onOpenAdminSignIn,
  onSignOut,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)
  const authLabel = sessionEmail ? 'Sign Out' : 'Admin Sign In'
  const statusLabel =
    authStatusMessage ||
    (isLoadingProfile
      ? 'Checking admin access'
      : isAdmin
        ? `Admin: ${sessionEmail}`
        : sessionEmail
          ? `Signed in: ${sessionEmail}`
          : 'Public wheel access')

  return (
    <div className="navbar-shell">
      <div className="flex items-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
          className="navbar-mobile-toggle"
          data-mode={isDark ? 'dark' : 'light'}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="text-lg leading-none">{isMobileMenuOpen ? '×' : '≡'}</span>
        </button>

        {isMobileMenuOpen ? (
          <nav className="navbar-links">
            {visibleItems.map((item) => {
              const isActive = item.id === activePage

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`button-chip ${isActive ? 'button-chip--active' : 'button-chip--neutral'}`}
                  data-mode={isDark ? 'dark' : 'light'}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        ) : null}
      </div>

      <nav className="navbar-links hidden sm:flex">
        {visibleItems.map((item) => {
          const isActive = item.id === activePage

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`button-chip ${isActive ? 'button-chip--active' : 'button-chip--neutral'}`}
              data-mode={isDark ? 'dark' : 'light'}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="navbar-auth-row">
        <p className="navbar-status" data-mode={isDark ? 'dark' : 'light'}>
          {statusLabel}
        </p>
        <button
          type="button"
          onClick={sessionEmail ? onSignOut : onOpenAdminSignIn}
          className={`button-chip ${isDark ? 'button-chip--dark' : 'button-chip--light'}`}
        >
          {authLabel}
        </button>
      </div>
    </div>
  )
}

export default Navbar
