import sanitizeUrl, { isSafeUrl } from "./sanitizeUrl";

describe("sanitizeUrl", () => {
  it.each([
    "https://example.com",
    "http://example.com/a?b=c",
    "mailto:me@example.com",
    "tel:+123456",
    "/relative/path",
    "#section",
  ])("keeps safe url %s", (url) => {
    expect(sanitizeUrl(url)).toBe(url);
  });

  it("adds https:// to bare domains", () => {
    expect(sanitizeUrl("example.com")).toBe("https://example.com");
  });

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    " javascript:alert(1)",
    "java\tscript:alert(1)",
    "java\nscript:alert(1)",
    "\u0001javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
  ])("blocks unsafe url %j", (url) => {
    expect(sanitizeUrl(url)).toBe("#");
    expect(isSafeUrl(url)).toBe(false);
  });

  it("handles empty input", () => {
    expect(sanitizeUrl("")).toBe("#");
    expect(sanitizeUrl(undefined)).toBe("#");
    expect(isSafeUrl("")).toBe(false);
  });

  it("supports a narrower protocol list", () => {
    const web = ["http:", "https:"];
    expect(sanitizeUrl("https://example.com/a.png", web)).toBe("https://example.com/a.png");
    expect(sanitizeUrl("mailto:me@example.com", web)).toBe("#");
  });
});
