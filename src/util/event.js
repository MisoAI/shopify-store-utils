import { removeItem } from './misc';

class JointEventSource {

  constructor(sources) {
    this._sources = sources;
  }

  subscribe(callback) {
    const unsubscribes = [];
    for (const source of this._sources) {
      unsubscribes.push(source.subscribe(callback));
    }
    return () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    };
  }

}

export default class EventSource {

  static join(...sources) {
    return new JointEventSource(sources);
  }

  constructor({ install }) {
    this._callbacks = [];
    install = install || this._install;
    if (!install || typeof install !== 'function') {
      throw new Error(`Subclass should implement _install() method or pass install function to constructor.`);
    }
    install.call(this);
  }

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
