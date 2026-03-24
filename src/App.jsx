import { useEffect, useMemo, useState } from 'react'
import AdminToggle from './components/AdminToggle.jsx'
import FilterBar from './components/FilterBar.jsx'
import FoodPage from './components/FoodPage.jsx'
import History from './components/History.jsx'
import MallPage from './components/MallPage.jsx'
import MallSelector from './components/MallSelector.jsx'
import Navbar from './components/Navbar.jsx'
import PinModal from './components/PinModal.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import Wheel from './components/Wheel.jsx'
import {
  DEFAULT_WHEEL_FILTERS,
  clearAdminState,
  loadAdminState,
  loadSelectedMallId,
  loadThemeMode,
  loadWheelFilters,
  saveAdminState,
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

const ADMIN_PIN = '1022'
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
  const [isAdmin, setIsAdmin] = useState(() => loadAdminState())
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [pinErrorMessage, setPinErrorMessage] = useState('')
  const [malls, setMalls] = useState([])
  const [isLoadingMalls, setIsLoadingMalls] = useState(true)
  const [mallErrorMessage, setMallErrorMessage] = useState('')
  const [activeMallId, setActiveMallId] = useState(() => loadSelectedMallId())
  const [foods, setFoods] = useState([])
  const [isLoadingFoods, setIsLoadingFoods] = useState(false)
  const [foodErrorMessage, setFoodErrorMessage] = useState('')
  const [filters, setFilters] = useState(() => loadWheelFilters())
  const [historyEntries, setHistoryEntries] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [historyErrorMessage, setHistoryErrorMessage] = useState('')
  const [historySaveErrorMessage, setHistorySaveErrorMessage] = useState('')
  const [lastResult, setLastResult] = useState('')
  const [themeMode, setThemeMode] = useState(() => loadThemeMode())
  const isDark = themeMode === 'dark'

  const activeMall = useMemo(
    () => malls.find((mall) => mall.id === activeMallId) ?? null,
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

    if (!activeMallId) {
      setFoods([])
      setFoodErrorMessage('')
      setIsLoadingFoods(false)
      return
    }

    void loadFoods(activeMallId)
  }, [activeMallId])

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

  function handleAdminToggle(nextValue) {
    if (nextValue) {
      setPinErrorMessage('')
      setIsPinModalOpen(true)
      return
    }

    clearAdminState()
    setIsAdmin(false)
    setIsPinModalOpen(false)
    setPinErrorMessage('')
  }

  function handlePinSubmit(pin) {
    if (pin !== ADMIN_PIN) {
      setPinErrorMessage('Incorrect PIN.')
      return
    }

    saveAdminState(true)
    setIsAdmin(true)
    setIsPinModalOpen(false)
    setPinErrorMessage('')
  }

  function handleClosePinModal() {
    setIsPinModalOpen(false)
    setPinErrorMessage('')
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
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-[radial-gradient(circle_at_top,_rgba(30,41,59,0.98),_rgba(15,23,42,1)_45%,_rgba(2,6,23,1)_100%)] text-slate-100'
          : 'bg-[radial-gradient(circle_at_top,_rgba(255,239,213,0.85),_rgba(249,250,251,0.96)_45%,_rgba(214,228,255,0.85)_100%)] text-slate-900'
      }`}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
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
                  Mall Food Wheelspin
                </p>
                <h1
                  className={`font-['Trebuchet_MS','Avenir_Next',sans-serif] text-3xl font-black tracking-tight sm:text-4xl ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  Spin once, settle lunch, move on.
                </h1>
                <p
                  className={`max-w-2xl text-sm leading-6 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Wheel stays public. Admin Mode unlocks mall and food management with a
                  frontend PIN stored in localStorage.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ThemeToggle
                  themeMode={themeMode}
                  onToggle={() =>
                    setThemeMode((currentTheme) =>
                      currentTheme === 'dark' ? 'light' : 'dark',
                    )
                  }
                />
                <AdminToggle
                  isAdmin={isAdmin}
                  isDark={isDark}
                  onChange={handleAdminToggle}
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
                isAdmin={isAdmin}
                onNavigate={setActivePage}
              />
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isAdmin ? 'Admin mode unlocked' : 'Admin mode locked'}
              </p>
            </div>
          </div>
        </header>

        <main className="mt-6 flex-1">
          {activePage === PAGES.WHEEL ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <section className="space-y-6">
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

              <aside className="space-y-6">
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

      <PinModal
        isOpen={isPinModalOpen}
        errorMessage={pinErrorMessage}
        isDark={isDark}
        onClose={handleClosePinModal}
        onSubmit={handlePinSubmit}
      />
    </div>
  )
}

export default App
