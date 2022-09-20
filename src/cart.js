import { deepFreeze, EventSource } from './util';
import { observe } from './ajax';
import { cart as fetchCartInfo } from './api';

class CartUpdateEvent {

  constructor(oldState, newState, difference) {
    Object.assign(this, { oldState, newState, difference });
    Object.freeze(this);
  }

}

export default class CartObserver extends EventSource {

  constructor({ aggressive = true } = {}) {
    super();
    this._aggressive = aggressive;
    this._unsubscribe = observe(this._handleAjaxEvent.bind(this));
    if (aggressive) {
      this.sync();
    }
  }

  async _handleAjaxEvent({ type, url, response }) {
    if (type !== 'response' || !response) {
      return;
    }

    const path = url.pathname;
    const isJson = isJsonResponse(path);
    const action = getActionType(path);

    if (this._aggressive && ((action !== 'get' && !isJson) || action === 'add')) {
      // trigger sync if:
      // 1. it's a non-trivial action without body, or
      // 2. get action (for it's response does not contain complete cart content information)
      this.sync();
      return;
    }

    if (isJson) {
      this._update(deepFreeze(await response.clone().json()));
    }
  }

  _update(newState) {
    const oldState = this._state;
    this._state = newState;

    const difference = oldState && diffState(oldState, newState);
    if (!oldState || difference.changed) {
      this._emit(new CartUpdateEvent(oldState, newState, difference));
    }
  }

  get state() {
    return this._state;
  }

  async sync() {
    this._update(await fetchCartInfo());
  }

  destroy() {
    if (this._unsubscribe) {
      this._unsubscribe();
      delete this._unsubscribe;
    }
  }

}

function isJsonResponse(path) {
  return path.endsWith('.js') || path.endsWith('.json');
}

function getActionType(path) {
  const i = path.indexOf('/cart');
  let j = path.lastIndexOf('.');
  if (j < 0) {
    j = path.length;
  }
  if (path.charAt(j - 1) === '/') {
    j--;
  }
  return j - i === 5 ? 'get' : path.substring(i + 6, j);
}

function diffState(oldState, newState) {
  // consider state changed iff items are different or token has been updated
  const diff = {
    items: diffStateItems(oldState, newState)
  };
  if (newState.token !== oldState.token) {
    diff.token = newState.token;
  }
  diff.changed = !!(diff.token || diff.items.length);
  return Object.freeze(diff);
}

function diffStateItems(oldState, newState) {
  const items = [];
  const map = {};
  for (let item of newState.items) {
    item = { ...item };
    items.push(item);
    map[item.key] = item;
  }
  for (let item of oldState.items) {
    const item0 = map[item.key];
    if (item0) {
      item0.quantity -= item.quantity;
    } else {
      item = { ...item, quantity: -item.quantity };
      items.push(item);
      map[item.key] = item;
    }
  }
  return Object.freeze(items.filter(item => item.quantity).map(Object.freeze));
}
