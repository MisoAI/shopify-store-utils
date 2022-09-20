import { EventSource, formatStacktrace } from '../util';
import { AjaxRequestEvent, AjaxResponseEvent } from './model';

export const SOURCE_NAME = 'xhr';

function asBody(body) {
  if (typeof body === 'string' ||
      body instanceof Blob ||
      body instanceof ArrayBuffer ||
      body instanceof TypedArray ||
      body instanceof DataView ||
      body instanceof FormData ||
      body instanceof ReadableStream ||
      body instanceof URLSearchParams) {
    return body;
  }
  return JSON.stringify(body);
}

function asRequest({ url, method, headers, body }) {
  return new Request(url, {
    method,
    headers,
    body: asBody(body),
  });
}

function asResponse(xhr) {
  const body = asBody(xhr.response);
  const status = xhr.status;
  const statusText = xhr.statusText;
  const headers = new Headers();
  for (const line of xhr.getAllResponseHeaders().split('\r\n')) {
    const pair = line.split(': ', 2);
    if (pair.length < 2) {
      throw new Error(`Error: failed to parse response header line: ${line}`);
    }
    headers.append(...pair);
  }
  return new Response(body, {
    status,
    statusText,
    headers,
  });
}

export class XhrEventSource extends EventSource {

  constructor() {
    super();
    this._context = new WeakMap();
  }

  _install() {
    const { open: _open, setRequestHeader: _setRequestHeader, send: _send } = window.XMLHttpRequest.prototype;
    Object.assign(this, { _open, _setRequestHeader, _send });
    const context = this._context;
    const self = this;

    function open(method, url, async) {
      self._try(() => {
        context.set(this, { method, url, async, headers: new Headers() });
      });
      return _open.apply(this, arguments);
    }

    function setRequestHeader(header, value) {
      self._try(() => {
        const info = context.get(this);
        if (info) {
          info.headers.append(header, value);
        }
      });
      return _setRequestHeader.apply(this, arguments);
    }
    
    function send(body) {
      const stacktrace = formatStacktrace(new Error().stack);
      self._try(() => {
        const info = context.get(this);
        const xhr = this;
        if (info) {
          const request = asRequest({ ...info, body });
          this.addEventListener('load', event => {
            const response = asResponse(xhr);
            self._emit(new AjaxResponseEvent(SOURCE_NAME, { request, response, xhr, event, stacktrace }));
          });
          self._emit(new AjaxRequestEvent(SOURCE_NAME, { request, xhr, stacktrace }));
        }
      });
      return _send.apply(this, arguments);
    }

    Object.assign(window.XMLHttpRequest.prototype, { open, setRequestHeader, send });
  }

}

let SOURCE;

export function observe(callback, {} = {}) {
  return (SOURCE || (SOURCE = new XhrEventSource())).subscribe(callback);
}
