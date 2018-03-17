import {hello} from "./index";

describe('index', () => {
  it('should say hello', () => {
    expect(hello()).toBe(true)
  });
});