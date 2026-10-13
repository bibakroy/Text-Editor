const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

// Browsers ignore whitespace and control characters inside a URL scheme,
// so "java\tscript:" still runs. Strip them before checking the protocol.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\x20\u007f-\u009f]/g;
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function protocolOf(url) {
  const normalized = url.replace(CONTROL_CHARS, "");
  if (!HAS_SCHEME.test(normalized)) return null;
  return normalized.slice(0, normalized.indexOf(":") + 1).toLowerCase();
}

// True for http(s), mailto, tel and relative URLs.
export function isSafeUrl(url, protocols = SAFE_PROTOCOLS) {
  const trimmed = (url || "").trim();
  if (!trimmed) return false;
  const protocol = protocolOf(trimmed);
  return protocol === null || protocols.includes(protocol);
}

// Returns the URL if it is safe to use as a link, otherwise "#".
// Relative links ("/page", "#section") are allowed; bare domains like
// "example.com" get an https:// prefix.
export default function sanitizeUrl(url, protocols = SAFE_PROTOCOLS) {
  const trimmed = (url || "").trim();
  if (!isSafeUrl(trimmed, protocols)) return "#";
  if (protocolOf(trimmed) === null && !/^[/#?.]/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}
