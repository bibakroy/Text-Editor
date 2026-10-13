// jest-dom adds custom matchers for asserting on DOM nodes, e.g.
// expect(element).toHaveTextContent(/react/i)
import "@testing-library/jest-dom/vitest";

// jsdom has no layout engine, but ProseMirror measures the cursor position
// to scroll it into view. Give ranges empty measurements so that works.
const emptyRect = () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON() {} });
Range.prototype.getClientRects = () => [];
Range.prototype.getBoundingClientRect = emptyRect;
