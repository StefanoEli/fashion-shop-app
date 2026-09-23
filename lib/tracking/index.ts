// Public tracking API used by screens. Screens never touch an SDK directly —
// they call these helpers, which build canonical events and hand them to the
// TrackingManager for fan-out to the enabled MMPs.

import type { Product } from '../../data/catalog';
import { tracking } from './manager';
import type { CanonicalItem } from './types';

export { tracking } from './manager';
export type { EventLogEntry } from './manager';
export type { CanonicalEvent } from './types';

const CURRENCY = 'EUR';

function itemFromProduct(p: Product, quantity = 1): CanonicalItem {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category_1,
    price: p.price,
    quantity,
  };
}

export type CartLine = { product: Product; sku: string; quantity: number; price: number };

function itemFromLine(line: CartLine): CanonicalItem {
  return {
    id: line.product.id,
    name: line.product.name,
    brand: line.product.brand,
    category: line.product.category_1,
    price: line.price,
    quantity: line.quantity,
  };
}

export function initTracking(): void {
  tracking.init();
}

export function trackViewItem(product: Product): void {
  tracking.track({
    name: 'view_item',
    currency: CURRENCY,
    value: product.price,
    items: [itemFromProduct(product)],
  });
}

export function trackViewItemList(category: string, products: Product[]): void {
  tracking.track({
    name: 'view_item_list',
    currency: CURRENCY,
    items: products.slice(0, 20).map((p) => itemFromProduct(p)),
    meta: { list_name: category },
  });
}

export function trackAddToCart(product: Product, quantity = 1): void {
  tracking.track({
    name: 'add_to_cart',
    currency: CURRENCY,
    value: product.price * quantity,
    items: [itemFromProduct(product, quantity)],
  });
}

export function trackViewCart(lines: CartLine[]): void {
  tracking.track({
    name: 'view_cart',
    currency: CURRENCY,
    value: lines.reduce((s, l) => s + l.price * l.quantity, 0),
    items: lines.map(itemFromLine),
  });
}

export function trackBeginCheckout(lines: CartLine[]): void {
  tracking.track({
    name: 'begin_checkout',
    currency: CURRENCY,
    value: lines.reduce((s, l) => s + l.price * l.quantity, 0),
    items: lines.map(itemFromLine),
  });
}

export function trackPurchase(lines: CartLine[], transactionId: string): void {
  tracking.track({
    name: 'purchase',
    currency: CURRENCY,
    value: lines.reduce((s, l) => s + l.price * l.quantity, 0),
    items: lines.map(itemFromLine),
    transactionId,
  });
}
