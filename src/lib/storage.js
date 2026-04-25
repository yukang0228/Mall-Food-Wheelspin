export const STORAGE_KEY = 'mall-food-wheelspin'
export const ADMIN_STORAGE_KEY = 'mall-food-wheelspin-admin'
export const SELECTED_MALL_STORAGE_KEY = 'mall-food-wheelspin-selected-mall'
export const WHEEL_FILTERS_STORAGE_KEY = 'mall-food-wheelspin-wheel-filters'
export const THEME_MODE_STORAGE_KEY = 'mall-food-wheelspin-theme-mode'
export const SPIN_HISTORY_STORAGE_KEY = 'mall-food-wheelspin-spin-history'
export const SCHEMA_VERSION = 1
export const DEFAULT_WHEEL_FILTERS = {
  halalOnly: false,
  veganOnly: false,
  foodStyle: '',
  priceRange: '',
  excludedFoodStyles: [],
}

export function loadStoredState(fallbackState) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return fallbackState
    }

    const parsed = JSON.parse(raw)

    if (parsed?.version !== SCHEMA_VERSION || !parsed?.data) {
      return fallbackState
    }

    return parsed.data
  } catch {
    return fallbackState
  }
}

export function saveStoredState(state) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        data: state,
      }),
    )
  } catch {
    return
  }
}

export function loadAdminState() {
  try {
    return window.localStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function saveAdminState(isAdmin) {
  try {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, isAdmin ? 'true' : 'false')
  } catch {
    return
  }
}

export function clearAdminState() {
  try {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY)
  } catch {
    return
  }
}

function readLegacyData() {
  return loadStoredState({})
}

function normalizeWheelFilters(value) {
  const excludedFoodStyles = Array.isArray(value?.excludedFoodStyles)
    ? value.excludedFoodStyles.filter((item) => typeof item === 'string')
    : []

  return {
    halalOnly: Boolean(value?.halalOnly),
    veganOnly: Boolean(value?.veganOnly),
    foodStyle: typeof value?.foodStyle === 'string' ? value.foodStyle : '',
    priceRange: typeof value?.priceRange === 'string' ? value.priceRange : '',
    excludedFoodStyles,
  }
}

export function loadSelectedMallId() {
  try {
    const selectedMallId = window.localStorage.getItem(SELECTED_MALL_STORAGE_KEY)

    if (selectedMallId) {
      return selectedMallId
    }
  } catch {
    return ''
  }

  const legacyData = readLegacyData()
  return typeof legacyData?.activeMallId === 'string' ? legacyData.activeMallId : ''
}

export function saveSelectedMallId(mallId) {
  try {
    if (!mallId) {
      window.localStorage.removeItem(SELECTED_MALL_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(SELECTED_MALL_STORAGE_KEY, mallId)
  } catch {
    return
  }
}

export function loadWheelFilters() {
  try {
    const raw = window.localStorage.getItem(WHEEL_FILTERS_STORAGE_KEY)

    if (raw) {
      return normalizeWheelFilters(JSON.parse(raw))
    }
  } catch {
    return { ...DEFAULT_WHEEL_FILTERS }
  }

  const legacyData = readLegacyData()
  return normalizeWheelFilters(legacyData?.filters ?? DEFAULT_WHEEL_FILTERS)
}

export function saveWheelFilters(filters) {
  try {
    window.localStorage.setItem(
      WHEEL_FILTERS_STORAGE_KEY,
      JSON.stringify(normalizeWheelFilters(filters)),
    )
  } catch {
    return
  }
}

export function loadThemeMode() {
  try {
    const value = window.localStorage.getItem(THEME_MODE_STORAGE_KEY)

    if (value === 'dark' || value === 'light') {
      return value
    }
  } catch {
    return 'light'
  }

  return 'light'
}

export function saveThemeMode(themeMode) {
  try {
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode)
  } catch {
    return
  }
}

function normalizeSpinHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  const id = typeof entry.id === 'string' ? entry.id : ''
  const mall_id = typeof entry.mall_id === 'string' ? entry.mall_id : ''
  const food_id = typeof entry.food_id === 'string' ? entry.food_id : ''
  const food_name_snapshot =
    typeof entry.food_name_snapshot === 'string' ? entry.food_name_snapshot : ''
  const created_on = typeof entry.created_on === 'string' ? entry.created_on : ''

  if (!id || !mall_id || !food_name_snapshot || !created_on) {
    return null
  }

  return {
    id,
    mall_id,
    food_id,
    food_name_snapshot,
    created_on,
  }
}

function getSpinHistoryStorageKey(userKey) {
  return `${SPIN_HISTORY_STORAGE_KEY}:${userKey || 'guest'}`
}

export function loadSpinHistoryEntries(userKey = 'guest') {
  try {
    const raw = window.localStorage.getItem(getSpinHistoryStorageKey(userKey))

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((entry) => normalizeSpinHistoryEntry(entry))
      .filter(Boolean)
      .slice(0, 50)
  } catch {
    return []
  }
}

export function saveSpinHistoryEntries(userKey = 'guest', entries) {
  try {
    const normalizedEntries = Array.isArray(entries)
      ? entries
          .map((entry) => normalizeSpinHistoryEntry(entry))
          .filter(Boolean)
          .slice(0, 50)
      : []

    window.localStorage.setItem(
      getSpinHistoryStorageKey(userKey),
      JSON.stringify(normalizedEntries),
    )
    return true
  } catch {
    return false
  }
}
