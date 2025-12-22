import type { ConfigSchema } from "@openhub2/dharma";

export const schema: ConfigSchema = {
  properties: {
    provider: {
      type: "string",
      description: "Provider package name (e.g. @openhub2/provider-cloudflare)",
    },
    remote: {
      type: "boolean",
      default: false,
      description: "Enable remote mode for bindings",
    },
  },
};
