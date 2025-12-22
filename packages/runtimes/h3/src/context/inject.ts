import { H3Event } from 'h3'
import type { Bindings } from '@openhub2/dharma'

export function injectBindings(event: H3Event, bindings: Bindings): void {
  if (!event.context.openhub) {
    event.context.openhub = {}
  }
  event.context.openhub.bindings = {
    ...event.context.openhub.bindings,
    ...bindings
  }
}