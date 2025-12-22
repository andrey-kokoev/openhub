import { expect, test, vi } from 'vitest'
import { registerRemoteFlag } from '../../src/cli/remote'

test('registerRemoteFlag registers remote flag', () => {
  const mockCli = {
    registerFlag: vi.fn()
  }
  
  registerRemoteFlag(mockCli as any)
  
  expect(mockCli.registerFlag).toHaveBeenCalledWith('remote', {
    type: 'boolean',
    description: 'Enable remote mode for OpenHub bindings',
    default: false
  })
})
