/** Formats an RM amount, showing cents only when the amount actually has them. */
export function formatRM(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const hasCents = Math.abs(rounded % 1) > 0.001;
  return `RM ${rounded.toLocaleString('en-MY', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Same as formatRM but without the "RM " prefix, for use inside table cells that already label the column. */
export function formatAmount(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const hasCents = Math.abs(rounded % 1) > 0.001;
  return rounded.toLocaleString('en-MY', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}
