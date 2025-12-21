import type { DevtoolsContext } from '@openhub/dharma'

export function registerDevtools(devtools: DevtoolsContext) {
  devtools.registerPanel('openhub', {
    label: 'OpenHub',
    icon: 'tabler:box',
  })
}
