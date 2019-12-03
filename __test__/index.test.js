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
      expect(fn.mock.results[1].value).toBeGreaterThanOrEqual(
        fn.mock.results[0].value
      );
      expect(fn.mock.results[2].value).toBeGreaterThanOrEqual(
        fn.mock.results[1].value
      );
      done();
    },
  ]);
});

test('should not throw error without functions', () => {
  expect(() => {
    setTimeSeries();
  }).not.toThrow();
});

test('should call fns with specified interval', done => {
  setTimeSeries([
    100,
    wrapedFn,
    200,
    wrapedFn,
    300,
    50,
    wrapedFn,
    () => {
      expect(fn).toHaveBeenCalledTimes(3);
      expect(fn.mock.results[0].value).toBeGreaterThanOrEqual(100);
      expect(
        fn.mock.results[1].value - fn.mock.results[0].value
      ).toBeGreaterThanOrEqual(200);
      expect(
        fn.mock.results[2].value - fn.mock.results[1].value
      ).toBeGreaterThanOrEqual(350);
      done();
    },
  ]);
});

test('should ignore other types except number & function', done => {
  expect(() => {
    setTimeSeries([
      100,
      wrapedFn,
      200,
      '100',
      wrapedFn,
      300,
      50,
      wrapedFn,
      () => {
        expect(fn).toHaveBeenCalledTimes(3);
        expect(fn.mock.results[0].value).toBeGreaterThanOrEqual(
          100
        );
        expect(
          fn.mock.results[1].value - fn.mock.results[0].value
        ).toBeGreaterThanOrEqual(200);
        expect(
          fn.mock.results[2].value - fn.mock.results[1].value
        ).toBeGreaterThanOrEqual(350);
        done();
      },
    ]);
  }).not.toThrow();
});

test('should call fns with default interval', done => {
  setTimeSeries(
    [
      wrapedFn,
      wrapedFn,
      wrapedFn,
      () => {
        expect(fn).toHaveBeenCalledTimes(3);
        expect(
          fn.mock.results[1].value - fn.mock.results[0].value
        ).toBeGreaterThanOrEqual(100);
        expect(
          fn.mock.results[2].value - fn.mock.results[1].value
        ).toBeGreaterThanOrEqual(100);
        done();
      },
    ],
    { defaultPause: 100 }
  );
});

test('should cancel timer by returned "cancel()" method', done => {
  const cancel = setTimeSeries([
    wrapedFn,
    500,
    wrapedFn,
    500,
    wrapedFn,
  ]);
  setTimeout(() => {
    cancel();
  }, 600);
  setTimeout(() => {
    expect(fn).toHaveBeenCalledTimes(2);
    done();
  }, 1200);
});

test('should cancel timer by throw an error', done => {
  setTimeSeries([
    () => {
      fn();
      throw new Error('oops');
    },
    500,
    wrapedFn,
    500,
    wrapedFn,
  ]);
  setTimeout(() => {
    expect(fn).toHaveBeenCalledTimes(1);
    done();
  }, 1200);
});

test('should control timer when task function accept "next" method', done => {
  setTimeSeries([
    next => {
      fn();
      setTimeout(next, 500);
    },
    500,
    wrapedFn,
    500,
    wrapedFn,
    () => {
      expect(fn).toHaveBeenCalledTimes(3);
      expect(
        fn.mock.results[1].value - fn.mock.results[0].value
      ).toBeGreaterThanOrEqual(1000);
      expect(
        fn.mock.results[2].value - fn.mock.results[1].value
      ).toBeGreaterThanOrEqual(500);
      done();
    },
  ]);
});

test('should control timer when task function return Boolean', done => {
  setTimeSeries([
    () => {
      fn();
      return true;
    },
    500,
    () => {
      fn();
      return false;
    },
    500,
    wrapedFn,
  ]);
  setTimeout(() => {
    expect(fn).toHaveBeenCalledTimes(2);
    done();
  }, 1200);
});

test('should control timer when task function return Promise', done => {
  setTimeSeries([
    () => {
      fn();
      return Promise.resolve();
    },
    500,
    () => {
      fn();
      return Promise.reject();
    },
    500,
    wrapedFn,
  ]);
  setTimeout(() => {
    expect(fn).toHaveBeenCalledTimes(2);
    done();
  }, 1200);
});
