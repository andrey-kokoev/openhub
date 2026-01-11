import type { DevtoolsContext } from '@openhub2/types'
import { panel } from './panel'

/**
 * Register OpenHub devtools panel for Nuxt Devtools
 * Conforms to Article IV Section 2 of the Constitution:
 * Metaframeworks may provide devtools integration
 */
export function registerDevtools (devtools: DevtoolsContext): void {
  devtools.registerPanel(panel.name, panel)
}

export { panel }
