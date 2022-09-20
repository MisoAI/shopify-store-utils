import { fetch } from './ajax';

export async function get(path, {
  escapeObserver = true,
  ext = 'js',
} = {}) {
  if (path.charAt(0) === '/') {
    path = path.substring(1);
  }
  const response = await (escapeObserver ? fetch : window.fetch)(`${window.Shopify.routes.root}${path}.${ext}`);
  return await getBodyOrThrow(response);
}

export async function cart(options) {
  return get(`cart`, options);
}

export async function product(handle, options) {
  return get(`products/${handle}`, options);
}

async function getBodyOrThrow(response) {
  if (response.status >= 400) {
    throw new Error(`[${response.status}] ${response.message}: ${response.description}.`);
  }
  return await response.json();
}
