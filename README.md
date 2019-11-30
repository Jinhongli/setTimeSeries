# Set Time Series

Set a timer which can execute a series of function at different intervals.

🏊‍♂️🕜🚴‍♂️🕑🏃‍♂️🕔🥇

![build size](https://badgen.net/bundlephobia/minzip/set-time-series)

## Syntax

`setTimeSeries(series, [options])`

### Parameters

| Name    | Type                   | Description                                         | Require |
| ------- | ---------------------- | --------------------------------------------------- | :-----: |
| series  | (function \| number)[] | An alternate array of functions and their intervals |    Y    |
| options | object                 | Options                                             |    N    |

### Return

It will return a **cancel** method whick you can cancel the rest series of function call.

## How to use

If you use Webpack or Rollup,

### Basic

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

### Cancel timer

There are several ways that you can cancel the timer, and stop the rest function calls:

```js
const series = [
  () => {
    // 2. return `false` in function call
    return false;
  },
  300,
  () => {
    // 3. throw an error in function call
    throw new Error('Oops');
  },
  500,
  () => {
    // 4. reject the returned promise
    return Promise.reject();
  },
];

const cancel = setTimeSeries(series);

// 1. call the returned cancel method
cancel();
```

### Async function

You can also call async function via:

```js
const series = [
  () => {
    // 1. return a Promise
    return fetch();
  },
  300,
  next => {
    // 2. call the next callback
    setTimeout(next, 500);
  },
  500,
  () => {},
];
setTimeSeries(series);
```
