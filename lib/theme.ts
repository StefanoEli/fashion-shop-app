export const colors = {
  bg: '#ffffff',
  surface: '#f6f6f7',
  ink: '#111114',
  muted: '#6b7280',
  hair: '#e5e7eb',
  accent: '#111114',
  accentInk: '#ffffff',
  price: '#111114',
  star: '#f59e0b',
};

export function formatPrice(n: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(n);
}
