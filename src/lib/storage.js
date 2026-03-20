export const STORAGE_KEY = 'mall-food-wheelspin'
export const ADMIN_STORAGE_KEY = 'mall-food-wheelspin-admin'
export const SELECTED_MALL_STORAGE_KEY = 'mall-food-wheelspin-selected-mall'
export const WHEEL_FILTERS_STORAGE_KEY = 'mall-food-wheelspin-wheel-filters'
export const SCHEMA_VERSION = 1
export const DEFAULT_WHEEL_FILTERS = {
  halalOnly: false,
  veganOnly: false,
  foodStyle: '',
  priceRange: '',
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
  return {
    halalOnly: Boolean(value?.halalOnly),
    veganOnly: Boolean(value?.veganOnly),
    foodStyle: typeof value?.foodStyle === 'string' ? value.foodStyle : '',
    priceRange: typeof value?.priceRange === 'string' ? value.priceRange : '',
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
