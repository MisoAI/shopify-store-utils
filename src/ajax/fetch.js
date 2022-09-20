import { EventSource, formatStacktrace } from '../util';
import { AjaxRequestEvent, AjaxResponseEvent } from './model';

export const SOURCE_NAME = 'fetch';

class FetchEventSource extends EventSource {

  constructor() {
    super();
  }

  _install() {
    const _fetch = this._fetch = window.fetch;
    const self = this;

    window.fetch = async function(resource, init) {
      const stacktrace = formatStacktrace(new Error().stack);
      let request;
      self._try(() => {
        request = new Request(resource, init);
        self._emit(new AjaxRequestEvent(SOURCE_NAME, { request, stacktrace }));
      });

      // TODO: on response error/abort
      const response = await _fetch.apply(this, arguments);

      self._try(() => {
        request && self._emit(new AjaxResponseEvent(SOURCE_NAME, { request, response, stacktrace }));
      });
      return response;
    };
  }

}

let SOURCE;

export function observe(callback, {} = {}) {
  return (SOURCE || (SOURCE = new FetchEventSource())).subscribe(callback);
}

export function fetch() {
  return (SOURCE ? SOURCE._fetch : window.fetch).apply(window, arguments);
}
