export function verifyAdminGatePin(pin, configuredPin) {
  const normalizedConfiguredPin =
    typeof configuredPin === 'string' ? configuredPin.trim() : ''

  if (!normalizedConfiguredPin) {
    return {
      isUnlocked: false,
      errorMessage: 'Admin PIN is not configured.',
    }
  }

  if (pin !== normalizedConfiguredPin) {
    return {
      isUnlocked: false,
      errorMessage: 'Incorrect PIN.',
    }
  }

  return {
    isUnlocked: true,
    errorMessage: '',
  }
}
