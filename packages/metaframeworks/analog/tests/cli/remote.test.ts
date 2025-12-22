import { expect, test } from 'vitest'
import { registerRemoteFlag } from '../../src/cli/remote'

test('registerRemoteFlag registers remote flag', () => {
  const mockCli = {
    registerFlag: (name: string, options: any) => {
      expect(name).toBe('remote')
      expect(options.type).toBe('boolean')
      expect(options.default).toBe(false)
    }
  }
  
  registerRemoteFlag(mockCli as any)
})
