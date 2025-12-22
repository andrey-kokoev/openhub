import { expect, test, vi } from "vitest";
import { solidstartMetaframework } from "../src";

test("solidstartMetaframework has correct name", () => {
  expect(solidstartMetaframework.name).toBe("solidstart");
});

test("solidstartMetaframework implements expected methods", () => {
  expect(solidstartMetaframework.defineConfig).toBeDefined();
  expect(solidstartMetaframework.registerCLI).toBeDefined();
  expect(solidstartMetaframework.registerDevtools).toBeDefined();
});

test("defineConfig merges schema properties into configSchema", () => {
  const configSchema = {
    properties: {
      existingProp: { type: "string" },
    },
  };

  solidstartMetaframework.defineConfig(configSchema as any);

  expect(configSchema.properties.provider).toBeDefined();
  expect(configSchema.properties.provider.type).toBe("string");
  expect(configSchema.properties.remote).toBeDefined();
  expect(configSchema.properties.remote.type).toBe("string");
  expect(configSchema.properties.remote.description).toContain("production");
  expect(configSchema.properties.existingProp).toBeDefined();
});

test("registerCLI registers remote flag with correct configuration", () => {
  const mockCli = {
    registerFlag: vi.fn(),
  };

  solidstartMetaframework.registerCLI(mockCli as any);

  expect(mockCli.registerFlag).toHaveBeenCalledWith(
    "remote",
    expect.objectContaining({
      type: "string",
      description: expect.stringContaining("remote mode"),
      default: "false",
    }),
  );
});

test("registerDevtools registers openhub panel with correct properties", () => {
  const mockDevtools = {
    registerPanel: vi.fn(),
  };

  solidstartMetaframework.registerDevtools(mockDevtools as any);

  expect(mockDevtools.registerPanel).toHaveBeenCalledWith(
    "openhub",
    expect.objectContaining({
      label: "OpenHub",
      icon: "tabler:box",
    }),
  );
});
