import { expect, test, vi } from "vitest";
import { registerRemoteFlag } from "../../src/cli/remote";

test("registerRemoteFlag registers remote flag", () => {
  const mockCli = {
    registerFlag: vi.fn(),
  };

  registerRemoteFlag(mockCli as any);

  expect(mockCli.registerFlag).toHaveBeenCalledWith("remote", {
    type: "string",
    description:
      "Enable remote mode for OpenHub bindings (true, false, production, preview)",
    default: "false",
  });
});
