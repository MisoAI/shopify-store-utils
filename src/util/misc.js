export function tryGet(fn) {
  try {
    return fn();
  } catch(_) {}
}

export function removeItem(array, item) {
  const i = array.indexOf(item);
  if (i > -1) {
    array.splice(i, 1);
  }
}

export function trimObj(obj) {
  if (typeof obj !== 'object') {
    return obj;
  }
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] === undefined) {
      delete obj[k];
    }
  }
  return obj;
}

export function asArray(value) {
  return Array.isArray(value) ? value : (value === undefined) ? [] : [value];
}

export function delegateGetters(target, source, propNames) {
  propNames = typeof propNames === 'string' ? [propNames] : propNames;
  Object.defineProperties(target, propNames.reduce((acc, propName) => {
    acc[propName] = typeof source[propName] === 'function' ? { value: source[propName].bind(source) } : { get: () => source[propName] };
    return acc;
  }, {}));
}

export function deepFreeze(obj) {
  const props = Object.getOwnPropertyNames(obj);
  for (const prop of props) {
    const value = obj[prop];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj);
}

export function formatStacktrace(stack) {
  return stack.split('\n').slice(1).map(s => s.trim());
}
