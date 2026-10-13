import { Editor } from "@tiptap/core";
import extensions from "./extensions";

const toHTML = (content) => {
  const editor = new Editor({ extensions, content });
  const html = editor.getHTML();
  editor.destroy();
  return html;
};

describe("editor extensions", () => {
  it("drops javascript: links from pasted HTML", () => {
    const html = toHTML('<p><a href="javascript:alert(1)">bad</a> <a href="https://example.com">good</a></p>');
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="https://example.com"');
  });

  it("drops event-handler attributes and unknown tags", () => {
    const html = toHTML('<p>hi</p><img src="https://example.com/a.png" onerror="alert(1)"><script>alert(1)</script>');
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<script");
    expect(html).toContain('src="https://example.com/a.png"');
  });

  it("keeps the formatting the toolbar offers", () => {
    const html = toHTML(
      '<h2 style="text-align: center"><u>u</u><sup>s</sup><sub>b</sub><s>x</s><code>c</code></h2>' +
        '<p><span style="color: #ff0000; font-size: 24px; font-family: Georgia">t</span><mark data-color="#ffff00">m</mark></p>'
    );
    for (const part of ["text-align: center", "<u>", "<sup>", "<sub>", "<s>", "<code>", "color: rgb(255, 0, 0)", "font-size: 24px", "Georgia", "<mark"]) {
      expect(html).toContain(part);
    }
  });
});

describe("mark rules", () => {
  const withEditor = (content, fn) => {
    const editor = new Editor({ extensions, content });
    editor.commands.selectAll();
    fn(editor);
    const html = editor.getHTML();
    editor.destroy();
    return html;
  };

  it("lets inline code combine with other formatting", () => {
    const html = withEditor("<p>x</p>", (editor) => {
      editor.chain().toggleBold().toggleItalic().toggleCode().run();
    });
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
    expect(html).toContain("<code>");
  });

  it("makes superscript and subscript mutually exclusive", () => {
    const html = withEditor("<p>x</p>", (editor) => {
      editor.chain().toggleSuperscript().toggleSubscript().run();
    });
    expect(html).toContain("<sub>");
    expect(html).not.toContain("<sup>");
  });
});
