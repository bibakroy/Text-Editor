// <input type="color"> only accepts #rrggbb, but colors parsed from HTML
// come back as rgb(...) or short hex.
export function toHexColor(color, fallback = "#000000") {
  if (!color) return fallback;
  const rgb = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgb) {
    return "#" + rgb.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, "0")).join("");
  }
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!hex) return fallback;
  const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join("") : hex[1];
  return `#${digits.toLowerCase()}`;
}
