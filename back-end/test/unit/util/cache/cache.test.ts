import { Cache } from "../../../../src/util/cache";

describe("Cache tests", (): void => {
  test("Collections in cache should be defined", () => {
    expect(Cache.users).not.toBe(undefined);
  });
});