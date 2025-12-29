import type { CLIContext } from "@openhub2/types";

export function registerRemoteFlag(cli: CLIContext) {
  cli.registerFlag("remote", {
    type: "string",
    description:
      "Enable remote mode for OpenHub bindings (true, false, production, preview)",
    default: "false",
  });
}
