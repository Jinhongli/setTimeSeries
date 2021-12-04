const { default: setTimeSeries } = require('../src');

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

test('should call fns in right order', (done) => {
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

test('should call fns with specified interval', (done) => {
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

test('should ignore other types except number & function', (done) => {
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

test('should call fns with default interval', (done) => {
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

test('should cancel timer by returned "cancel()" method', (done) => {
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

test('should cancel timer by throw an error', (done) => {
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

test('should control timer when task function accept "next" method', (done) => {
  setTimeSeries([
    (next) => {
      fn();
      setTimeout(next, 200);
    },
    200,
    wrapedFn,
    200,
    wrapedFn,
    () => {
      expect(fn).toHaveBeenCalledTimes(3);
      expect(
        fn.mock.results[1].value - fn.mock.results[0].value
      ).toBeGreaterThanOrEqual(400);
      expect(
        fn.mock.results[2].value - fn.mock.results[1].value
      ).toBeGreaterThanOrEqual(200);
      done();
    },
  ]);
});

test('should control timer when task function return Promise', (done) => {
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

test('should transfer data correctly in sync function', (done) => {
  setTimeSeries([
    () => 1,
    (next, data) => {
      expect(data).toBe(1);
      next(2);
    },
    (next, data) => {
      expect(data).toBe(2);
      next(3);
    },
    () => 4,
    (next, data) => {
      expect(data).toBe(4);
      done();
    },
  ]);
});

test('should transfer data correctly in async function', (done) => {
  setTimeSeries([
    (next) => {
      setTimeout(() => {
        next(1);
      }, 200);
    },
    (next, data) => {
      expect(data).toBe(1);
      return Promise.resolve(2);
    },
    (next, data) => {
      expect(data).toBe(2);
      done();
    },
  ]);
});
