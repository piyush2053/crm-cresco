const DECIMAL_NUMBER = /^-?\d+\.\d+$/;

// UI-only formatting: API payloads, calculations and editable inputs keep raw precision.
export function formatDecimal(value) {
  if (value === null || value === undefined || value === "") return value;
  if (typeof value === "number") {
    return Number.isFinite(value) && !Number.isInteger(value) ? value.toFixed(2) : value;
  }
  if (typeof value === "string" && DECIMAL_NUMBER.test(value.trim())) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : value;
  }
  return value;
}

export function formatNumber2(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatMoney(value, suffix = "") {
  return `₹${formatNumber2(value)}${suffix}`;
}

// API activity/audit messages can contain already-composed values such as
// "Grade market rate updated to ₹400.0000/Kg".
export function formatDecimalText(value) {
  if (typeof value !== "string") return value;
  return value.replace(/(?<![\d.])-?\d+\.\d+(?![\d.])/g, match => {
    const number = Number(match);
    return Number.isFinite(number) ? number.toFixed(2) : match;
  });
}
