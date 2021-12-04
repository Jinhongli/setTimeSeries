const TYPE_OBJECT = 'object';
const TYPE_FUNCTION = 'function';
const TYPE_NUMBER = 'number';

const isPromiseLike = <T>(it: unknown): it is PromiseLike<T> =>
  it !== null &&
  (typeof it === TYPE_OBJECT || typeof it === TYPE_FUNCTION) &&
  typeof (it as any).then === TYPE_FUNCTION;

const isFunction = (it: unknown): it is () => void =>
  typeof it === TYPE_FUNCTION;
const isNumber = (it: unknown): it is number =>
  typeof it === TYPE_NUMBER;

export type Job = (
  next?: () => void,
  data?: any
) => any | PromiseLike<any>;

export type Series = (Job | number)[];

export interface Options {
  pause: number;
}

interface IQueueItem {
  fn: Job;
  pause: number;
}

const setTimeSeries = (
  series: Series = [],
  options: Partial<Options> = {}
) => {
  let _q: IQueueItem[] = [];
  // @ts-ignore
  let timerID: ReturnType<typeof setTimeout> = 0;

  for (let i = 0; i < series.length; i++) {
    const target = series[i];
    if (isFunction(target)) {
      _q.push({ fn: target, pause: options.pause || 0 });
    } else if (isNumber(target)) {
      if (_q.length === 0 && target) {
        _q.push({ fn: () => {}, pause: options.pause || 0 });
      }
      _q[_q.length - 1].pause += target;
    }
  }

  const cancel = () => clearTimeout(timerID);

  const run = (data?: any) => {
    if (_q.length <= 0) return;
    const { fn, pause } = _q.shift()!;
    const next = (data?: any) => {
      clearTimeout(timerID);
      // @ts-ignore
      timerID = setTimeout(run.bind(null, data), pause);
    };
    let result;
    try {
      // callback
      result = fn(next, data);
      if (isPromiseLike(result)) {
        // return promise
        result.then(next, cancel);
      } else {
        if (fn.length === 0) {
          // sync fn
          next(result);
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
