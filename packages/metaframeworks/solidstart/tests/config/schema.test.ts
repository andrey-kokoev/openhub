import { expect, test } from "vitest";
import { schema } from "../../src/config/schema";

test("schema has provider property", () => {
  expect(schema.properties.provider).toBeDefined();
  expect(schema.properties.provider.type).toBe("string");
});

test("schema has remote property with string type supporting boolean and enum values", () => {
  expect(schema.properties.remote).toBeDefined();
  expect(schema.properties.remote.type).toBe("string");
  expect(schema.properties.remote.description).toContain("production");
  expect(schema.properties.remote.description).toContain("preview");
  expect(schema.properties.remote.default).toBe("false");
});
