/**
 * OpenHub Devtools Panel Configuration
 * 
 * Shows:
 * - Current mode (local / remote / production)
 * - Connected provider
 * - Available bindings (Database, KV, Blob)
 * - Proxy endpoint status
 */
export const panel = {
  name: 'openhub',
  title: 'OpenHub',
  icon: 'tabler:box',
  view: {
    type: 'iframe',
    src: '/__openhub2/devtools',
  },
}

