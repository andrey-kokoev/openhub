import { describe, expect, test, vi } from 'vitest'
import { registerRemoteFlag, parseRemoteFlag } from '../../src/cli'

describe('registerRemoteFlag', () => {
  test('registers remote flag with CLI context', () => {
    const cli = {
      registerFlag: vi.fn(),
      registerCommand: vi.fn(),
    }
    registerRemoteFlag(cli as any)
    expect(cli.registerFlag).toHaveBeenCalledWith(
      'remote',
      expect.objectContaining({
        type: 'string',
        description: expect.any(String),
      })
    )
  })
})

describe('parseRemoteFlag', () => {
  test('returns false for undefined', () => {
    expect(parseRemoteFlag(undefined)).toBe(false)
  })

  test('returns false for false', () => {
    expect(parseRemoteFlag(false)).toBe(false)
  })

  test('returns false for "false"', () => {
    expect(parseRemoteFlag('false')).toBe(false)
  })

  test('returns true for true', () => {
    expect(parseRemoteFlag(true)).toBe(true)
  })

  test('returns true for "true"', () => {
    expect(parseRemoteFlag('true')).toBe(true)
  })

  test('returns "production" for "production"', () => {
    expect(parseRemoteFlag('production')).toBe('production')
  })

  test('returns "preview" for "preview"', () => {
    expect(parseRemoteFlag('preview')).toBe('preview')
  })

  test('returns true for other truthy strings', () => {
    expect(parseRemoteFlag('anything')).toBe(true)
  })
})

