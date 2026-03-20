export const STORAGE_KEY = 'mall-food-wheelspin'
export const ADMIN_STORAGE_KEY = 'mall-food-wheelspin-admin'
export const SCHEMA_VERSION = 1

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
