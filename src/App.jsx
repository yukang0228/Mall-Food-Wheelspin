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
  loadSpinHistoryEntries,
  loadThemeMode,
  loadWheelFilters,
  saveSelectedMallId,
  saveSpinHistoryEntries,
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

function getHistoryUserKey(session) {
  const email = session?.user?.email?.trim().toLowerCase()

  if (email) {
    return email
  }

  return session?.user?.id ?? 'guest'
}

function getAdminAuthRedirectUrl() {
  const configuredUrl = import.meta.env.VITE_APP_URL?.trim()

  if (configuredUrl) {
    return configuredUrl
  }

  return new URL(import.meta.env.BASE_URL, window.location.origin).toString()
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
  const historyUserKey = useMemo(() => getHistoryUserKey(session), [session])

  useEffect(() => {
    void loadMalls()
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
    setIsLoadingHistory(true)
    setHistoryErrorMessage('')
    setHistoryEntries(loadSpinHistoryEntries(historyUserKey))
    setIsLoadingHistory(false)
  }, [historyUserKey])

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
        emailRedirectTo: getAdminAuthRedirectUrl(),
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

    const nextEntry = {
      id: `${Date.now()}-${food.id}`,
      mall_id: activeMallId,
      food_id: food.id,
      food_name_snapshot: food.name,
      created_on: new Date().toISOString(),
    }

    setHistoryEntries((currentEntries) => {
      const nextEntries = [nextEntry, ...currentEntries].slice(0, 50)
      const isSaved = saveSpinHistoryEntries(historyUserKey, nextEntries)

      if (!isSaved) {
        setHistorySaveErrorMessage('Spin finished, but history could not be saved on this device.')
      }

      return nextEntries
    })
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
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-[radial-gradient(circle_at_top,_rgba(30,41,59,0.98),_rgba(15,23,42,1)_45%,_rgba(2,6,23,1)_100%)] text-slate-100'
          : 'bg-[radial-gradient(circle_at_top,_rgba(255,239,213,0.85),_rgba(249,250,251,0.96)_45%,_rgba(214,228,255,0.85)_100%)] text-slate-900'
      }`}
    >
      <div className="flex min-h-screen w-full flex-col px-4 py-4 sm:px-5 lg:px-6 xl:px-8 2xl:px-10">
        <header
          className={`overflow-hidden rounded-[1.75rem] border p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-5 ${
            isDark
              ? 'border-slate-700/80 bg-slate-900/80'
              : 'border-white/70 bg-white/75'
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl space-y-2">
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.35em] ${
                    isDark ? 'text-orange-300' : 'text-orange-700'
                  }`}
                >
                  Cincailah
                </p>
                <h1
                  className={`font-['Trebuchet_MS','Avenir_Next',sans-serif] text-3xl font-black tracking-tight sm:text-4xl ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  Cannot decide? Just spin lah.
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
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
                  className="button-chip button-chip--light sm:hidden"
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

            <div
              className={`flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between ${
                isDark ? 'border-slate-700/80' : 'border-slate-200/80'
              }`}
            >
              <Navbar
                activePage={activePage}
                isDark={isDark}
                authStatusMessage={adminStatusMessage}
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
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {adminStatusMessage}
              </p>
            </div>
          </div>
        </header>

        <main className="mt-6 flex-1">
          {activePage === PAGES.WHEEL ? (
            <div className="space-y-6 xl:grid xl:grid-cols-[235px_minmax(0,1fr)_255px] xl:gap-5 xl:space-y-0 2xl:grid-cols-[245px_minmax(0,1fr)_265px]">
              <section className="order-1 space-y-4 xl:col-start-1">
                <div className="grid gap-3 sm:hidden">
                  <button
                    type="button"
                    onClick={() => setIsMallPickerOpen(true)}
                    className={`rounded-[1.35rem] border px-4 py-3 text-left ${
                      isDark
                        ? 'border-slate-700 bg-slate-900 text-slate-100'
                        : 'border-slate-200 bg-white text-slate-900'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Mall</p>
                    <p className="mt-1 text-sm font-semibold">{activeMall?.name ?? 'Select mall'}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterPanelOpen(true)}
                    className={`rounded-[1.35rem] border px-4 py-3 text-left ${
                      isDark
                        ? 'border-slate-700 bg-slate-900 text-slate-100'
                        : 'border-slate-200 bg-white text-slate-900'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Filters</p>
                    <p className="mt-1 text-sm font-semibold">
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
              </section>

              <div className="order-2 mx-auto w-full max-w-[1500px] xl:col-start-2 xl:row-start-1 xl:self-start xl:max-w-none">
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
              </div>

              <aside className="order-3 space-y-4 xl:col-start-3">
                {mallErrorMessage ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {mallErrorMessage}
                  </p>
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
