import type { DevtoolsContext } from '../../../../dharma/src/types'

export function registerDevtools (devtools: DevtoolsContext) {
  devtools.registerPanel('openhub', {
    label: 'OpenHub',
    icon: 'tabler:box',
  })
}
