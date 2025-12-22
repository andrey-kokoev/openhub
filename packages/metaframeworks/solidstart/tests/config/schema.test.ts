import { expect, test } from "vitest";
import { schema } from "../../src/config/schema";

test("schema has provider property", () => {
  expect(schema.properties.provider).toBeDefined();
  expect(schema.properties.provider.type).toBe("string");
});

test("schema has remote property", () => {
  expect(schema.properties.remote).toBeDefined();
  expect(schema.properties.remote.type).toBe("boolean");
  expect(schema.properties.remote.default).toBe(false);
});
