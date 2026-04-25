import { describe, expect, it } from 'vitest'
import { verifyAdminGatePin } from './adminAuth.js'

describe('verifyAdminGatePin', () => {
  it('keeps admin auth locked when the PIN is not configured', () => {
    expect(verifyAdminGatePin('1234', '')).toEqual({
      isUnlocked: false,
      errorMessage: 'Admin PIN is not configured.',
    })
  })

  it('keeps admin auth locked when the wrong PIN is entered', () => {
    expect(verifyAdminGatePin('9999', '1234')).toEqual({
      isUnlocked: false,
      errorMessage: 'Incorrect PIN.',
    })
  })

  it('unlocks admin auth only when the exact configured PIN is entered', () => {
    expect(verifyAdminGatePin('1234', ' 1234 ')).toEqual({
      isUnlocked: true,
      errorMessage: '',
    })
  })
})
