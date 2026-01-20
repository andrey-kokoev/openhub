import type { Metaframework } from "@openhub2/types";
import { schema } from "./config/schema";
import { registerRemoteFlag } from "./cli";
import { registerDevtools as registerDevtoolsPanel } from "./devtools";
import openhubPlugin from "./plugin";

export const solidstartMetaframework: Metaframework = {
  name: "solidstart",
  configureRuntime(runtime, config) {
    // TODO: Add runtime configuration if needed outside the Vinxi plugin flow
  },
  defineConfig(configSchema) {
    Object.assign(configSchema.properties, schema.properties);
  },
  registerCLI(cli) {
    registerRemoteFlag(cli);
  },
  registerDevtools(devtools) {
    registerDevtoolsPanel(devtools);
  },
};

export default openhubPlugin;
export { openhubPlugin };
