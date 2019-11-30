import {
  isFunction,
  isNumber,
  isPromiseLike,
  isBoolean,
} from './util';

const createQueueItem = (fn, pause) => ({
  fn,
  pause,
});

const setTimeSeries = (series = [], { defaultPause = 0 } = {}) => {
  let _q = [];
  let timerID = null;

  for (let i = 0; i < series.length; i++) {
    const target = series[i];
    if (isFunction(target)) {
      _q.push(createQueueItem(target, defaultPause));
    } else if (isNumber(target)) {
      if (_q.length === 0 && target) {
        _q.push(createQueueItem(() => {}, defaultPause));
      }
      _q[_q.length - 1].pause += target;
    }
  }

  const cancel = () => {
    if (timerID) clearTimeout(timerID);
  };

  const run = () => {
    if (_q.length <= 0) return false;
    const { fn, pause } = _q.shift();
    const next = () => {
      timerID = setTimeout(run, pause);
    };
    let result;
    try {
      // callback
      result = fn(next);
      if (fn.length === 0) {
        if (isPromiseLike(result)) {
          // return promise
          result.then(next, cancel);
        } else if (isBoolean(result)) {
          // return boolean
          if (result) {
            next();
          } else {
            cancel();
          }
        } else {
          next();
        }
      }
    } catch (err) {
      cancel();
    }
  };

  run();

  return cancel;
};

export default setTimeSeries;
