const TYPE_OBJECT = 'object';
const TYPE_FUNCTION = 'function';
const TYPE_BOOLEAN = 'boolean';
const TYPE_NUMBER = 'number';

export const isPromiseLike = obj =>
  obj !== null &&
  (typeof obj === TYPE_OBJECT || typeof obj === TYPE_FUNCTION) &&
  typeof obj.then === TYPE_FUNCTION;

export const isFunction = v => typeof v === TYPE_FUNCTION;

export const isNumber = v => typeof v === TYPE_NUMBER;

export const isBoolean = v => typeof v === TYPE_BOOLEAN;
