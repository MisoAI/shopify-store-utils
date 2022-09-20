import { asArray } from '../util';
import * as _fetch from './fetch';
import * as _xhr from './xhr';

const SOURCES_ENTRIES = [_fetch, _xhr];

const SOURCE_MAP = {};
const SOURCES = [];
for (const { SOURCE_NAME, observe } of SOURCES_ENTRIES) {
  SOURCE_MAP[SOURCE_NAME] = { observe };
  SOURCES.push(SOURCE_NAME);
}

export function observe(callback, {
  sources = SOURCES,
  sameOrigin = true,
} = {}) {
  const predicate = asPredicate({ sameOrigin });
  const wrappedCallback = event => predicate(event) && callback(event);
  for (const source of asArray(sources)) {
    SOURCE_MAP[source].observe(wrappedCallback);
  }
}

export const fetch = _fetch.fetch;

function asPredicate({ sameOrigin }) {
  return ({ url }) => {
    if (sameOrigin && !isSameOrigin(url)) {
      return false;
    }
    return true;
  };
}

const ORIGIN = new URL((new Request('/')).url).origin;

function isSameOrigin(url) {
  return url.origin === ORIGIN;
}
