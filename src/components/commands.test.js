import { Editor } from "@tiptap/core";
import { insertImage } from "./commands";
import extensions from "./extensions";

const createEditor = (content) => new Editor({ extensions, content });

describe("insertImage", () => {
  it.each([
    ["at the end of the document", "end"],
    ["in the middle of the document", 3],
  ])("keeps the image when text is inserted next (%s)", (_, position) => {
    const editor = createEditor("<p>one</p><p>two</p>");
    editor.commands.setTextSelection(position === "end" ? editor.state.doc.content.size - 1 : position);

    insertImage(editor, "https://example.com/a.png");
    expect(editor.state.selection.constructor.name).toBe("TextSelection");
    editor.commands.insertContent("✅");

    const html = editor.getHTML();
    expect(html).toContain('<img src="https://example.com/a.png">');
    expect(html).toContain("✅");
    editor.destroy();
  });
});

describe("links", () => {
  it("doesn't extend a link to text typed right after it", () => {
    const editor = createEditor('<p><a href="https://example.com">link</a></p>');
    editor.commands.setTextSelection(editor.state.doc.content.size - 1);
    editor.commands.insertContent(" more");

    expect(editor.getHTML()).toMatch(/link<\/a> more<\/p>/);
    editor.destroy();
  });
});
