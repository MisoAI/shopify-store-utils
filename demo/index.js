import { version, api, ajax, history, getCustomerId, getAnonymousUserToken, parseUrl, CartObserver } from '../src';

const TAG = '%cSSU';
const STYLE = 'color: #fff; background-color: #650CF7; padding: 2px 2px 1px 4px;';

function log(...data) {
  console.log(TAG, STYLE, ...data);
}

log(`version: ${version}`);

const anonymousUserToken = getAnonymousUserToken();
anonymousUserToken && log(`anonymous user token: ${anonymousUserToken}`);

const customerId = getCustomerId();
customerId && log(`customer id: ${customerId}`);

const page = parseUrl();
log(`page: ${page.type}`,[page]);

ajax.observe(event => {
  const { source, type, url } = event;
  log(`[${source}][${type}] ${url.pathname}`, [event]);
});

(async () => {
  const cart = await api.cart();
  log(`cart`, [cart]);
})();

switch (page.type) {
  case 'product':
    (async () => {
      const product = await api.product(page.productHandle);
      log(`product`, [product]);
    })();
    break;
}

const cart = new CartObserver();
cart.subscribe(event => {
  log(`cart update`, [event]);
});

history.observe(event => {
  log(`history event: ${event.type}`, [event]);
});

window.ssu = {
  version, api, ajax, getCustomerId, getAnonymousUserToken, parseUrl
};
