import type { DevtoolsContext } from "@openhub2/types";

export function registerDevtools(devtools: DevtoolsContext) {
  devtools.registerPanel("openhub", {
    label: "OpenHub",
    icon: "tabler:box",
  });
}
