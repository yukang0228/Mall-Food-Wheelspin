import { useEffect, useMemo, useState } from 'react'
import AdminAuthModal from './components/AdminAuthModal.jsx'
import FilterBar from './components/FilterBar.jsx'
import FoodPage from './components/FoodPage.jsx'
import History from './components/History.jsx'
import MallPage from './components/MallPage.jsx'
import MallSelector from './components/MallSelector.jsx'
import MobilePanelModal from './components/MobilePanelModal.jsx'
import Navbar from './components/Navbar.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import Wheel from './components/Wheel.jsx'
import {
  DEFAULT_WHEEL_FILTERS,
  loadSelectedMallId,
  loadThemeMode,
  loadWheelFilters,
  saveSelectedMallId,
  saveThemeMode,
  saveWheelFilters,
} from './lib/storage.js'
import { supabase } from './lib/supabase.js'

const PAGES = {
  WHEEL: 'wheel',
  ADD_MALL: 'add-mall',
  ADD_FOOD: 'add-food',
}

const FOOD_STYLE_OPTIONS = [
  'Malay',
  'Chinese',
  'Indian',
  'Japanese',
  'Korean',
  'Western',
  'Fast Food',
  'Thai',
  'Beverage',
  'Pastry/Dessert',
  'Other'
]
const PRICE_RANGE_OPTIONS = ['$', '$$', '$$$']

function normalizeWhitespace(value) {
  return value.trim().replace(/\s+/g, ' ')
}

function normalizeApostrophes(value) {
  return value.replace(/[\u2018\u2019\u201B\u2032]/g, "'")
}

function normalizeMallName(value) {
  return normalizeWhitespace(value)
}

function normalizeFoodName(value) {
  return normalizeWhitespace(normalizeApostrophes(value))
}

function normalizeFoodNameForComparison(value) {
  return normalizeFoodName(value).toLowerCase()
}

function normalizeProfileRole(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function isMissingColumnError(error) {
  return String(error?.message ?? '').toLowerCase().includes('column')
}

function getRoleFromAuthUser(user) {
  return normalizeProfileRole(
    user?.app_metadata?.role ??
      user?.user_metadata?.role ??
      user?.app_metadata?.user_role ??
      user?.user_metadata?.user_role,
  )
}

function applyFoodFilters(foods, filters) {
  return foods.filter((food) => {
    if (filters.excludedFoodStyles.includes(food.food_style)) {
      return false
    }

    if (filters.halalOnly && !food.is_halal) {
      return false
    }

    if (filters.veganOnly && !food.is_vegan) {
      return false
    }

    if (filters.foodStyle && food.food_style !== filters.foodStyle) {
      return false
    }

    if (filters.priceRange && food.price_range !== filters.priceRange) {
      return false
    }

    return true
  })
}

function App() {
  const [activePage, setActivePage] = useState(PAGES.WHEEL)
  const [session, setSession] = useState(null)
  const [profileRole, setProfileRole] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false)
  const [authErrorMessage, setAuthErrorMessage] = useState('')
  const [authInfoMessage, setAuthInfoMessage] = useState('')
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false)
  const [malls, setMalls] = useState([])
  const [isLoadingMalls, setIsLoadingMalls] = useState(true)
  const [mallErrorMessage, setMallErrorMessage] = useState('')
  const [activeMallId, setActiveMallId] = useState(() => loadSelectedMallId())
  const [foods, setFoods] = useState([])
  const [isLoadingFoods, setIsLoadingFoods] = useState(false)
  const [foodErrorMessage, setFoodErrorMessage] = useState('')
  const [filters, setFilters] = useState(() => loadWheelFilters())
  const [isMallPickerOpen, setIsMallPickerOpen] = useState(false)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [historyEntries, setHistoryEntries] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [historyErrorMessage, setHistoryErrorMessage] = useState('')
  const [historySaveErrorMessage, setHistorySaveErrorMessage] = useState('')
  const [lastResult, setLastResult] = useState('')
  const [themeMode, setThemeMode] = useState(() => loadThemeMode())
  const isDark = themeMode === 'dark'
  const isAdmin = profileRole === 'admin'
  const authButtonLabel = session?.user?.email ? 'Sign Out' : 'Admin Sign In'
  const adminStatusMessage = useMemo(() => {
    if (isLoadingProfile) {
      return 'Checking admin access'
    }

    if (!session?.user?.email) {
      return 'Public wheel access'
    }

    if (authErrorMessage) {
      return `Profile access blocked for ${session.user.email}`
    }

    if (isAdmin) {
      return `Admin access: ${session.user.email}`
    }

    return `Signed in as ${profileRole || 'no role'}: ${session.user.email}`
  }, [authErrorMessage, isAdmin, isLoadingProfile, profileRole, session])

  const activeMall = useMemo(
    () => malls.find((mall) => mall.id === activeMallId) ?? null,
    [activeMallId, malls],
  )
  const hasValidActiveMall = useMemo(
    () => malls.some((mall) => mall.id === activeMallId),
    [activeMallId, malls],
  )
  const filteredFoods = useMemo(
    () => applyFoodFilters(foods, filters),
    [filters, foods],
  )
  const historyItems = useMemo(
    () =>
      historyEntries.map((entry) => ({
        id: entry.id,
        mallName:
          malls.find((mall) => mall.id === entry.mall_id)?.name ?? 'Unknown mall',
        foodName: entry.food_name_snapshot,
        createdOn: entry.created_on,
      })),
    [historyEntries, malls],
  )
  const recentHistoryItems = useMemo(() => historyItems.slice(0, 5), [historyItems])

  useEffect(() => {
    void loadMalls()
    void loadSpinHistory()
    void initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthErrorMessage('')
      setAuthInfoMessage('')

      if (!nextSession?.user) {
        setProfileRole('')
        setIsLoadingProfile(false)
        return
      }

      void loadProfileRole(nextSession.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    saveSelectedMallId(activeMallId)
  }, [activeMallId])

  useEffect(() => {
    saveWheelFilters(filters)
  }, [filters])

  useEffect(() => {
    saveThemeMode(themeMode)
    document.documentElement.dataset.theme = themeMode
  }, [themeMode])

  useEffect(() => {
    if (!isAdmin && activePage !== PAGES.WHEEL) {
      setActivePage(PAGES.WHEEL)
    }
  }, [activePage, isAdmin])

  useEffect(() => {
    setLastResult('')

    if (!activeMallId || isLoadingMalls) {
      setFoods([])
      setFoodErrorMessage('')
      setIsLoadingFoods(false)
      return
    }

    if (!hasValidActiveMall) {
      setFoods([])
      setFoodErrorMessage('')
      setIsLoadingFoods(false)
      return
    }

    void loadFoods(activeMallId)
  }, [activeMallId, hasValidActiveMall, isLoadingMalls])

  async function initializeAuth() {
    setIsLoadingProfile(true)

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()

    setSession(currentSession)

    if (!currentSession?.user) {
      setProfileRole('')
      setIsLoadingProfile(false)
      return
    }

    await loadProfileRole(currentSession.user)
  }

  async function loadProfileRole(user) {
    setIsLoadingProfile(true)

    const authRole = getRoleFromAuthUser(user)

    if (authRole) {
      setAuthErrorMessage('')
      setProfileRole(authRole)
      setIsLoadingProfile(false)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      setProfileRole('')
      setAuthErrorMessage('Signed in, but admin profile could not be loaded.')
      setIsLoadingProfile(false)
      return
    }

    let nextRole = normalizeProfileRole(data?.role)

    if (!nextRole) {
      const { data: userIdData, error: userIdError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (userIdError && !isMissingColumnError(userIdError)) {
        setProfileRole('')
        setAuthErrorMessage('Signed in, but admin profile could not be loaded.')
        setIsLoadingProfile(false)
        return
      }

      nextRole = normalizeProfileRole(userIdData?.role)
    }

    if (!nextRole && user.email) {
      const { data: emailData, error: emailError } = await supabase
        .from('profiles')
        .select('role')
        .ilike('email', user.email.trim())
        .maybeSingle()

      if (emailError && !isMissingColumnError(emailError)) {
        setProfileRole('')
        setAuthErrorMessage('Signed in, but admin profile could not be loaded.')
        setIsLoadingProfile(false)
        return
      }

      nextRole = normalizeProfileRole(emailData?.role)
    }

    setAuthErrorMessage('')
    setProfileRole(nextRole)
    setIsLoadingProfile(false)
  }

  async function loadMalls(preferredMallId) {
    setIsLoadingMalls(true)
    setMallErrorMessage('')

    const { data, error } = await supabase
      .from('malls')
      .select('id, name, created_on')
      .order('created_on', { ascending: true })

    if (error) {
      setMallErrorMessage(error.message)
      setIsLoadingMalls(false)
      return
    }

    const nextMalls = (data ?? []).map((mall) => ({
      ...mall,
      name: normalizeMallName(mall.name),
    }))

    setMalls(nextMalls)
    setActiveMallId((currentMallId) => {
      if (preferredMallId && nextMalls.some((mall) => mall.id === preferredMallId)) {
        return preferredMallId
      }

      if (currentMallId && nextMalls.some((mall) => mall.id === currentMallId)) {
        return currentMallId
      }

      return nextMalls[0]?.id ?? ''
    })
    setIsLoadingMalls(false)
  }

  async function loadFoods(mallId) {
    setIsLoadingFoods(true)
    setFoodErrorMessage('')

    const { data, error } = await supabase
      .from('foods')
      .select(
        'id, mall_id, name, is_halal, is_vegan, food_style, price_range, created_on, modified_on',
      )
      .eq('mall_id', mallId)
      .order('name', { ascending: true })

    if (error) {
      setFoodErrorMessage(error.message)
      setFoods([])
      setIsLoadingFoods(false)
      return
    }

    setFoods(
      (data ?? []).map((food) => ({
        ...food,
        name: normalizeFoodName(food.name),
      })),
    )
    setIsLoadingFoods(false)
  }

  async function loadSpinHistory() {
    setIsLoadingHistory(true)
    setHistoryErrorMessage('')

    const { data, error } = await supabase
      .from('spin_history')
      .select('id, mall_id, food_id, food_name_snapshot, created_on')
      .order('created_on', { ascending: false })
      .limit(50)

    if (error) {
      setHistoryErrorMessage(error.message)
      setHistoryEntries([])
      setIsLoadingHistory(false)
      return
    }

    setHistoryEntries(data ?? [])
    setIsLoadingHistory(false)
  }

  async function handleAdminSignIn(email) {
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setAuthErrorMessage('Admin email is required.')
      return
    }

    setIsSendingMagicLink(true)
    setAuthErrorMessage('')
    setAuthInfoMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: false,
      },
    })

    setIsSendingMagicLink(false)

    if (error) {
      setAuthErrorMessage(error.message)
      return
    }

    setAuthInfoMessage('Magic link sent. Open the email on this device to finish admin sign-in.')
  }

  async function handleAdminSignOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setAuthErrorMessage(error.message)
      return
    }

    setProfileRole('')
    setIsAdminAuthModalOpen(false)
    setAuthErrorMessage('')
    setAuthInfoMessage('')
  }

  async function handleCreateMall(name) {
    const normalizedName = normalizeMallName(name)

    if (!normalizedName) {
      return { error: 'Mall name is required.' }
    }

    const { data, error } = await supabase
      .from('malls')
      .insert({ name: normalizedName })
      .select('id, name, created_on')
      .single()

    if (error) {
      return { error: error.message }
    }

    await loadMalls(data.id)
    return { error: '' }
  }

  async function handleRenameMall(mallId, name) {
    const normalizedName = normalizeMallName(name)

    if (!normalizedName) {
      return { error: 'Mall name is required.' }
    }

    const { error } = await supabase
      .from('malls')
      .update({ name: normalizedName })
      .eq('id', mallId)

    if (error) {
      return { error: error.message }
    }

    await loadMalls(mallId)
    return { error: '' }
  }

  async function handleDeleteMall(mallId) {
    const { error } = await supabase.from('malls').delete().eq('id', mallId)

    if (error) {
      return { error: error.message }
    }

    await loadMalls()
    await loadSpinHistory()
    return { error: '' }
  }

  function validateFoodInput(foodValues, editingFoodId = '') {
    const normalizedName = normalizeFoodName(foodValues.name ?? '')

    if (!activeMallId) {
      return { error: 'Select a mall first.' }
    }

    if (!normalizedName) {
      return { error: 'Food name is required.' }
    }

    if (!FOOD_STYLE_OPTIONS.includes(foodValues.food_style)) {
      return { error: 'Select a valid food style.' }
    }

    if (!PRICE_RANGE_OPTIONS.includes(foodValues.price_range)) {
      return { error: 'Select a valid price range.' }
    }

    const normalizedLookupName = normalizeFoodNameForComparison(normalizedName)
    const duplicateFood = foods.find(
      (food) =>
        food.id !== editingFoodId &&
        normalizeFoodNameForComparison(food.name) === normalizedLookupName,
    )

    if (duplicateFood) {
      return { error: 'A food with this name already exists for the selected mall.' }
    }

    return {
      error: '',
      values: {
        mall_id: activeMallId,
        name: normalizedName,
        is_halal: Boolean(foodValues.is_halal),
        is_vegan: Boolean(foodValues.is_vegan),
        food_style: foodValues.food_style,
        price_range: foodValues.price_range,
      },
    }
  }

  async function handleCreateFood(foodValues) {
    if (!isAdmin) {
      return { error: 'Admin mode is required.' }
    }

    const validation = validateFoodInput(foodValues)

    if (validation.error) {
      return { error: validation.error }
    }

    const { error } = await supabase.from('foods').insert(validation.values)

    if (error) {
      return { error: error.message }
    }

    await loadFoods(activeMallId)
    return { error: '' }
  }

  async function handleUpdateFood(foodId, foodValues) {
    if (!isAdmin) {
      return { error: 'Admin mode is required.' }
    }

    const validation = validateFoodInput(foodValues, foodId)

    if (validation.error) {
      return { error: validation.error }
    }

    const { error } = await supabase
      .from('foods')
      .update(validation.values)
      .eq('id', foodId)

    if (error) {
      return { error: error.message }
    }

    await loadFoods(activeMallId)
    return { error: '' }
  }

  async function handleDeleteFood(foodId) {
    if (!isAdmin) {
      return { error: 'Admin mode is required.' }
    }

    const { error } = await supabase.from('foods').delete().eq('id', foodId)

    if (error) {
      return { error: error.message }
    }

    await loadFoods(activeMallId)
    return { error: '' }
  }

  async function handleSpinComplete(food) {
    setLastResult(food.name)
    setHistorySaveErrorMessage('')

    if (!activeMallId) {
      return
    }

    const { error } = await supabase.from('spin_history').insert({
      mall_id: activeMallId,
      food_id: food.id,
      food_name_snapshot: food.name,
    })

    if (error) {
      setHistorySaveErrorMessage('Spin finished, but history could not be saved.')
      return
    }

    await loadSpinHistory()
  }

  function handleFilterChange(nextFilters) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
    }))
  }

  function getWheelDisabledMessage() {
    if (!activeMallId) {
      return 'Choose a mall to load foods for the wheel.'
    }

    if (isLoadingFoods) {
      return 'Loading foods for this mall.'
    }

    if (!foods.length) {
      return 'No foods found for this mall yet. Admin can add them from the Food page.'
    }

    if (!filteredFoods.length) {
      return 'No foods match the current filters. Adjust them to continue.'
    }

    if (filteredFoods.length === 1) {
      return 'Only one food matches the current filters. Add more or broaden the filters.'
    }

    return 'Ready to spin.'
  }

  return (
    <div className="app-page" data-mode={isDark ? 'dark' : 'light'}>
      <div className="app-shell">
        <header className="app-header" data-mode={isDark ? 'dark' : 'light'}>
          <div className="app-header-stack">
            <div className="app-header-top">
              <div>
                <p className="app-brand-kicker" data-mode={isDark ? 'dark' : 'light'}>Cincailah</p>
                <h1 className="app-brand-title" data-mode={isDark ? 'dark' : 'light'}>Cincailah</h1>
              </div>
              <div className="app-header-actions">
                <button
                  type="button"
                  onClick={() => {
                    if (session?.user?.email) {
                      void handleAdminSignOut()
                      return
                    }

                    setAuthErrorMessage('')
                    setAuthInfoMessage('')
                    setIsAdminAuthModalOpen(true)
                  }}
                  className={`button-chip ${isDark ? 'button-chip--dark' : 'button-chip--light'} sm:hidden`}
                >
                  {authButtonLabel}
                </button>
                <ThemeToggle
                  themeMode={themeMode}
                  onToggle={() =>
                    setThemeMode((currentTheme) =>
                      currentTheme === 'dark' ? 'light' : 'dark',
                    )
                  }
                />
              </div>
            </div>

            <div className="app-header-nav" data-mode={isDark ? 'dark' : 'light'}>
              <Navbar
                activePage={activePage}
                authStatusMessage={adminStatusMessage}
                isDark={isDark}
                isAdmin={isAdmin}
                isLoadingProfile={isLoadingProfile}
                sessionEmail={session?.user?.email ?? ''}
                onNavigate={setActivePage}
                onOpenAdminSignIn={() => {
                  setAuthErrorMessage('')
                  setAuthInfoMessage('')
                  setIsAdminAuthModalOpen(true)
                }}
                onSignOut={() => {
                  void handleAdminSignOut()
                }}
              />
            </div>
          </div>
        </header>

        <main className="app-main">
          {activePage === PAGES.WHEEL ? (
            <div className="wheel-page-layout">
              <aside className="wheel-side-panel wheel-side-panel--left">
                <MallSelector
                  malls={malls}
                  activeMallId={activeMallId}
                  isDark={isDark}
                  onSelect={setActiveMallId}
                />
                <FilterBar
                  filters={filters}
                  foodStyleOptions={FOOD_STYLE_OPTIONS}
                  priceRangeOptions={PRICE_RANGE_OPTIONS}
                  isDark={isDark}
                  onChange={handleFilterChange}
                  onReset={() => setFilters(DEFAULT_WHEEL_FILTERS)}
                />
              </aside>

              <section className="wheel-main">
                <div className="mobile-quick-actions">
                  <button
                    type="button"
                    onClick={() => setIsMallPickerOpen(true)}
                    className="mobile-quick-action"
                    data-mode={isDark ? 'dark' : 'light'}
                  >
                    <p className="mobile-quick-kicker" data-mode={isDark ? 'dark' : 'light'}>Mall</p>
                    <p className="mobile-quick-value mobile-quick-value--truncate">{activeMall?.name ?? 'Select mall'}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterPanelOpen(true)}
                    className="mobile-quick-action"
                    data-mode={isDark ? 'dark' : 'light'}
                  >
                    <p className="mobile-quick-kicker" data-mode={isDark ? 'dark' : 'light'}>Filters</p>
                    <p className="mobile-quick-value">
                      {[
                        filters.halalOnly ? 'Halal' : '',
                        filters.veganOnly ? 'Vegan' : '',
                        filters.foodStyle || '',
                        filters.priceRange || '',
                      ]
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(' · ') || 'Open filters'}
                    </p>
                  </button>
                </div>
                <Wheel
                  key={activeMall?.id ?? 'wheel'}
                  isDark={isDark}
                  mallName={activeMall?.name ?? 'Select a mall'}
                  options={filteredFoods}
                  lastResult={lastResult}
                  disabledMessage={getWheelDisabledMessage()}
                  isLoading={isLoadingFoods}
                  onSpinComplete={handleSpinComplete}
                />
              </section>

              <aside className="wheel-side-panel wheel-side-panel--right">
                {mallErrorMessage ? (
                  <p className="status-message status-message--error">{mallErrorMessage}</p>
                ) : null}
                {!isLoadingMalls && !malls.length ? (
                  <p
                    className={`rounded-2xl border border-dashed px-4 py-4 text-sm ${
                      isDark
                        ? 'border-slate-700 bg-slate-900/80 text-slate-300'
                        : 'border-slate-300 bg-white/80 text-slate-600'
                    }`}
                  >
                    No malls found. Unlock admin mode and add one from the Add Mall tab.
                  </p>
                ) : null}
                {foodErrorMessage ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {foodErrorMessage}
                  </p>
                ) : null}
                <History
                  entries={recentHistoryItems}
                  isDark={isDark}
                  isLoading={isLoadingHistory}
                  errorMessage={historyErrorMessage}
                  saveErrorMessage={historySaveErrorMessage}
                />
              </aside>
            </div>
          ) : null}

          {activePage === PAGES.ADD_MALL && isAdmin ? (
            <MallPage
              malls={malls}
              isDark={isDark}
              isLoading={isLoadingMalls}
              errorMessage={mallErrorMessage}
              onCreateMall={handleCreateMall}
              onRenameMall={handleRenameMall}
              onDeleteMall={handleDeleteMall}
            />
          ) : null}

          {activePage === PAGES.ADD_FOOD && isAdmin ? (
            <FoodPage
              malls={malls}
              activeMallId={activeMallId}
              foods={foods}
              isDark={isDark}
              isLoading={isLoadingFoods}
              errorMessage={foodErrorMessage}
              foodStyleOptions={FOOD_STYLE_OPTIONS}
              priceRangeOptions={PRICE_RANGE_OPTIONS}
              onSelectMall={setActiveMallId}
              onCreateFood={handleCreateFood}
              onUpdateFood={handleUpdateFood}
              onDeleteFood={handleDeleteFood}
            />
          ) : null}
        </main>
      </div>

      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        isDark={isDark}
        isSubmitting={isSendingMagicLink}
        errorMessage={authErrorMessage}
        infoMessage={authInfoMessage}
        onClose={() => {
          setIsAdminAuthModalOpen(false)
          setAuthErrorMessage('')
          setAuthInfoMessage('')
        }}
        onSubmit={(email) => {
          void handleAdminSignIn(email)
        }}
      />

      <MobilePanelModal
        isOpen={isMallPickerOpen}
        isDark={isDark}
        title="Select mall"
        onClose={() => setIsMallPickerOpen(false)}
      >
        <div className="space-y-3">
          {malls.length ? (
            malls.map((mall) => {
              const isSelected = mall.id === activeMallId

              return (
                <button
                  key={mall.id}
                  type="button"
                  onClick={() => {
                    setActiveMallId(mall.id)
                    setIsMallPickerOpen(false)
                  }}
                  className={`w-full rounded-[1.35rem] border px-4 py-3 text-left transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-600 text-white'
                      : isDark
                        ? 'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800'
                        : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-semibold">{mall.name}</p>
                </button>
              )
            })
          ) : (
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              No malls available yet.
            </p>
          )}
        </div>
      </MobilePanelModal>

      <MobilePanelModal
        isOpen={isFilterPanelOpen}
        isDark={isDark}
        title="Filters"
        onClose={() => setIsFilterPanelOpen(false)}
      >
        <FilterBar
          filters={filters}
          foodStyleOptions={FOOD_STYLE_OPTIONS}
          priceRangeOptions={PRICE_RANGE_OPTIONS}
          isDark={isDark}
          onChange={handleFilterChange}
          onReset={() => setFilters(DEFAULT_WHEEL_FILTERS)}
        />
      </MobilePanelModal>
    </div>
  )
}

export default App
