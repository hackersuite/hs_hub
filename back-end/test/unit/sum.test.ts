import { sum } from "../../src/sum";

test("Adding 2 to 1 should equal 3", () => {
  expect(sum(2, 1)).toBe(3);
});