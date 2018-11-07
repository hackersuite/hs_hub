import { Cache } from "../../../../src/util/cache";

describe("Cache tests", (): void => {
  test("Collections in cache should be defined", (): void => {
    expect(Cache.users).not.toBe(undefined);
  });
});