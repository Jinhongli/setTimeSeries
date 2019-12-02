import setTimeSeries from '../src';

let fn;
let wrapedFn;

beforeEach(() => {
  fn = jest.fn(() => Date.now());
  wrapedFn = () => {
    fn();
  };
});
afterEach(() => {
  fn = null;
  wrapedFn = null;
});

test('should call fns in right order', done => {
  setTimeSeries([
    wrapedFn,
    wrapedFn,
    wrapedFn,
    () => {
      expect(fn).toHaveBeenCalledTimes(3);
      expect(fn.mock.results[0].value).toBeLessThan(
        fn.mock.results[1].value
      );
      expect(fn.mock.results[1].value).toBeLessThan(
        fn.mock.results[2].value
      );
      done();
    },
  ]);
});
