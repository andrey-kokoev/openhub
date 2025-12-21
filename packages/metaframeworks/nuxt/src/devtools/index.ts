import type { DevtoolsContext } from '@openhub2/dharma'

export function registerDevtools (devtools: DevtoolsContext) {
  devtools.registerPanel('openhub', {
    label: 'OpenHub',
    icon: 'tabler:box',
  })
}
