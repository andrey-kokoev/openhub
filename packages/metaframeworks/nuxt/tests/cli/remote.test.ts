import { expect, test, vi } from 'vitest'
import { registerRemoteFlag } from '../../src/cli/remote'

test('registerRemoteFlag registers remote flag', () => {
  const cli = {
    registerFlag: vi.fn(),
    registerCommand: vi.fn()
  }
  registerRemoteFlag(cli as any)
  expect(cli.registerFlag).toHaveBeenCalledWith('remote', expect.objectContaining({
    type: 'boolean'
  }))
})
