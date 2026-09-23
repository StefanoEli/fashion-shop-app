// Simple in-memory cart (session scope) shared via React context.
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Product, Variant } from '../data/catalog';
import type { CartLine } from './tracking';

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (product: Product, variant: Variant, quantity?: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue['add'] = (product, variant, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.sku === variant.sku);
        if (existing) {
          return prev.map((l) =>
            l.sku === variant.sku ? { ...l, quantity: l.quantity + quantity } : l,
          );
        }
        return [...prev, { product, sku: variant.sku, quantity, price: variant.price }];
      });
    };
    const remove: CartContextValue['remove'] = (sku) =>
      setLines((prev) => prev.filter((l) => l.sku !== sku));
    const clear = () => setLines([]);

    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);

    return { lines, count, total, add, remove, clear };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
