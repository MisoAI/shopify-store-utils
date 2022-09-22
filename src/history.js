import EventSource from './util/event';

class HistoryEvent {

  constructor(type, props = {}) {
    this.type = type;
    Object.assign(this, props);
    Object.freeze(this);
  }

}

class HistoryEventSource extends EventSource {

  constructor() {
    super();
    this._install();
  }

  _install() {
    const { pushState: _pushState, replaceState: _replaceState } = window.history;
    const self = this;

    function pushState(state, _, url) {
      const result = _pushState.apply(this, arguments);
      self._emit(new HistoryEvent('pushstate', { state, url }));
      return result;
    }

    function replaceState(state, _, url) {
      const result = _replaceState.apply(this, arguments);
      self._emit(new HistoryEvent('replacestate', { state, url }));
      return result;
    }

    Object.assign(window.history, { pushState, replaceState });

    window.addEventListener('popstate', ({ state }) => {
      self._emit(new HistoryEvent('popstate', { state }));
    }, false);
  
    window.addEventListener('hashchange', () => {
      self._emit(new HistoryEvent('hashchange', {}));
    }, false);  
  }

}

let SOURCE;

export function observe(callback, {} = {}) {
  return (SOURCE || (SOURCE = new HistoryEventSource())).subscribe(callback);
}
