import { removeItem } from './misc';

export default class EventSource {

  constructor() {
    this._callbacks = [];
    this._install();
  }

  _install() {}

  _emit(event) {
    for (const callback of this._callbacks) {
      this._try(() => callback(event));
    }
  }

  _try(fn) {
    try {
      return fn();
    } catch(e) {
      this._error(e);
    }
  }

  _error(e) {
    // TODO: error handling
    console.error(e);
  }

  subscribe(callback) {
    this._callbacks.push(callback);
    return () => this._unsubscribe(callback);
  }

  _unsubscribe(callback) {
    removeItem(this._callbacks, callback);
  }

}
