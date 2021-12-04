# Set Time Series

An zero dependency tool can help you set a timer to execute a series of function at specified intervals.

🏊‍♂️🕜🚴‍♂️🕑🏃‍♂️🕔🥇

![version](https://badgen.net/npm/v/set-time-series)
![code coverage](https://badgen.net/codecov/c/github/jinhongli/set-time-series)
![minzip size](https://badgen.net/bundlephobia/minzip/set-time-series)

## Installation

```shell
# use yarn
yarn add set-time-series

# use npm
npm install set-time-series
```

## How to Use

### Types

```typescript
type Job = (
  next?: () => void,
  data?: any
) => any | PromiseLike<any>;

type Series = (Job | number)[];

interface Options {
  defaultPause: number;
}

declare const setTimeSeries: (
  series?: Series,
  options?: Partial<Options>
) => () => void;
```

### Parameters

| Name    | Type   | Description                                               | Require |
| ------- | ------ | --------------------------------------------------------- | :-----: |
| series  | Series | An alternative array of job functions and their intervals |    Y    |
| options | object | Options                                                   |    N    |

### Return

It will return a **cancel** method which you can manually interrupt the rest series of function call.

### Examples

#### Basic

```js
import setTimeSeries from 'set-time-series';

const series = [
  () => console.log('TASK I...'),
  300,
  () => console.log('TASK II...'),
  500,
  () => console.log('TASK III...'),
];

setTimeSeries(series);

//   0ms later: TASK I...
// 300ms later: TASK II...
// 800ms later: TASK III...
```

#### Cancel timer

There are 3 ways that you can cancel the timer, and stop the rest function calls:

```js
const series = [
  () => {
    // 2. throw an error
    throw new Error('Oops, something is wrong!');
  },
  500,
  () => {
    // 3. reject the promise
    return Promise.reject();
  },
];

const cancel = setTimeSeries(series);

// 1. call the cancel method
cancel();
```

#### Async function

You can also call async function via:

```js
const series = [
  () => {
    // 1. return a Promise
    return fetch(api);
  },
  300,
  (next) => {
    // 2. call the next callback
    setTimeout(next, 500);
  },
  500,
  () => {},
];
setTimeSeries(series);
```

#### Transfer Data between job

It's only supported in v2.0

```js
const series = [
  () => {
    // 1. return data in an empty job
    return 'hello';
  },
  300,
  (next, data) => {
    console.log(data);
    // 2. call the next callback with data
    next(data + ' world');
  },
  500,
  (next, data) => {
    console.log(data);
    // 3. resolve a promise
    return Promise.resolve(data + ' & you');
  },
  (next, data) => {
    console.log(data);
  },
];
setTimeSeries(series);
//   0ms later: hello
// 300ms later: hello, world
// 800ms later: hello, world & you
```

## Caveats

If you want A sync function accept previous job's data, you must call `next()` manually(except the end job), otherwise the rest jobs won't run

```js
const series = [
  () => 1,
  (next, data) => {
    console.log(data);
    // doesn't work
    return data + 1;
  },
  (next, data) => {
    // this job will never run
    console.log(data);
  },
];
setTimeSeries(series);
//   0ms later: 1
```
