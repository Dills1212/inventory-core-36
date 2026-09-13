export function formatMoney(value, currency = "AUD", symbol = "$") {
  const num = Number(value ?? 0);
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export function formatQty(value) {
  const num = Number(value ?? 0);
  return num % 1 === 0 ? num.toString() : num.toFixed(2);
}

// Convert #RRGGBB to rgba string with given alpha
export function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(217,119,6,${alpha})`;
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function darkenHex(hex, amount = 0.15) {
  if (!hex) return "#B45309";
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
