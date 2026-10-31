export function money(amount: number): string {
  const digits = Math.abs(amount).toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `${amount < 0 ? '−' : ''}$${digits}`;
}
