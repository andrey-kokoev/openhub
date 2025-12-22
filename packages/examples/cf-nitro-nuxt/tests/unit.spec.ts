import { describe, it, expect } from 'vitest'
import { execa } from 'execa'
import * as path from 'path'

const packagePath = path.resolve(__dirname, '..')

describe('cf-nitro-nuxt example unit tests', () => {
  it('should install dependencies successfully', async () => {
    const { stdout, stderr } = await execa('pnpm', ['install', '--prefer-offline'], { cwd: packagePath })
    console.log(stdout)
    console.error(stderr)
    expect(stderr).toBe('')
  })

  it('should build successfully', async () => {
    const { stdout, stderr } = await execa('pnpm', ['build'], { cwd: packagePath })
    console.log(stdout)
    console.error(stderr)
    expect(stderr).not.toContain('Error')
  })

  it('should deploy successfully', async () => {
    const { stdout, stderr } = await execa('pnpm', ['run', 'deploy'], { cwd: packagePath })
    console.log(stdout)
    console.error(stderr)
    expect(stderr).not.toContain('Error')
  })
})