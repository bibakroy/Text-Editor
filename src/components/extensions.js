import Code from "@tiptap/extension-code";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { isSafeUrl } from "../utils/sanitizeUrl";

const extensions = [
  StarterKit.configure({
    code: false,
    link: false,
  }),
  // With autolink on, TipTap makes links "inclusive", so text typed right
  // after a link becomes part of it. Turn that off.
  Link.extend({ inclusive: false }).configure({
    openOnClick: false,
    defaultProtocol: "https",
    // Also applies to pasted HTML, so javascript: links never get in.
    isAllowedUri: (url, { defaultValidate }) =>
      defaultValidate(url) && isSafeUrl(url),
  }),
  // By default inline code strips every other mark; let it combine with
  // bold, italic, etc. like the rest of the toolbar.
  Code.extend({ excludes: "" }),
  TextStyleKit,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Subscript.extend({ excludes: "superscript" }),
  Superscript.extend({ excludes: "subscript" }),
  Image,
  Placeholder.configure({ placeholder: "Write your text here and edit..." }),
];

export default extensions;
