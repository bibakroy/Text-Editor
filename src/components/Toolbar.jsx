import { useEditorState } from "@tiptap/react";
import classes from "../style/Editor.module.css";
import { focusEditor, insertImage } from "./commands";
import { toHexColor } from "../utils/color";
import sanitizeUrl from "../utils/sanitizeUrl";

const BLOCK_TYPES = [
  { label: "Normal", value: "paragraph" },
  ...[1, 2, 3, 4, 5, 6].map((level) => ({ label: `H${level}`, value: `h${level}` })),
  { label: "Blockquote", value: "blockquote" },
  { label: "Code", value: "codeBlock" },
];
const FONT_SIZES = ["8", "10", "12", "14", "16", "18", "24", "30", "36", "48", "60", "72"];
const FONT_FAMILIES = ["Arial", "Georgia", "Impact", "Tahoma", "Times New Roman", "Verdana"];
const EMOJIS = ["😀", "😂", "😍", "😎", "🤔", "😢", "👍", "👎", "🎉", "❤️", "🔥", "✅"];

function currentBlockType(editor) {
  for (let level = 1; level <= 6; level++) {
    if (editor.isActive("heading", { level })) return `h${level}`;
  }
  if (editor.isActive("codeBlock")) return "codeBlock";
  if (editor.isActive("blockquote")) return "blockquote";
  return "paragraph";
}

// The innermost list around the cursor, so a numbered list nested in a
// bullet list only lights up the numbered-list button.
function currentListType(editor) {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    const name = $from.node(depth).type.name;
    if (name === "bulletList" || name === "orderedList") return name;
  }
  return null;
}

// Block types replace each other, so leave any blockquote first instead of
// nesting a heading or code block inside it.
function setBlockType(editor, value) {
  focusEditor(editor);
  const chain = editor.chain().focus();
  if (value !== "blockquote" && editor.isActive("blockquote")) {
    chain.unsetBlockquote();
  }
  if (value.startsWith("h")) {
    chain.setHeading({ level: Number(value.slice(1)) });
  } else if (value === "codeBlock") {
    chain.setCodeBlock();
  } else {
    chain.setParagraph();
    if (value === "blockquote") chain.setBlockquote();
  }
  chain.run();
}

function Button({ label, title, active, disabled, onClick }) {
  return (
    <button
      type="button"
      className={active ? `${classes.button} ${classes.active}` : classes.button}
      aria-label={title}
      aria-pressed={active}
      title={title}
      disabled={disabled}
      // Keep the editor's selection when clicking a toolbar button.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function Toolbar({ editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor && {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        code: editor.isActive("code"),
        superscript: editor.isActive("superscript"),
        subscript: editor.isActive("subscript"),
        listType: currentListType(editor),
        link: editor.isActive("link"),
        blockType: currentBlockType(editor),
        align:
          ["center", "right", "justify"].find((align) =>
            editor.isActive({ textAlign: align })
          ) || "left",
        fontSize: (editor.getAttributes("textStyle").fontSize || "").replace("px", ""),
        fontFamily: editor.getAttributes("textStyle").fontFamily || "",
        color: toHexColor(editor.getAttributes("textStyle").color),
        highlight: toHexColor(editor.getAttributes("highlight").color, "#ffff00"),
        canIndent: editor.can().sinkListItem("listItem"),
        canOutdent: editor.can().liftListItem("listItem"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      },
  });

  if (!editor || !state) return null;

  const chain = () => {
    focusEditor(editor);
    return editor.chain().focus();
  };

  const addLink = () => {
    const previous = editor.getAttributes("link").href || "";
    const url = window.prompt("Link URL", previous);
    if (url === null) return;
    if (url.trim() === "") {
      chain().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = sanitizeUrl(url);
    if (href === "#") {
      window.alert("Only http, https, mailto and tel links are allowed.");
      return;
    }
    if (editor.state.selection.empty && !editor.isActive("link")) {
      // Nothing selected: insert the URL itself as the link text.
      chain()
        .insertContent({ type: "text", text: url.trim(), marks: [{ type: "link", attrs: { href } }] })
        .run();
      return;
    }
    chain().extendMarkRange("link").setLink({ href }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL (https://...)");
    if (!url) return;
    const src = sanitizeUrl(url, ["http:", "https:"]);
    if (src === "#") {
      window.alert("Only http and https image URLs are allowed.");
      return;
    }
    insertImage(editor, src);
  };

  return (
    <div className={classes.toolbar} role="toolbar" aria-label="Formatting">
      <div className={classes.group}>
        <Button label={<b>B</b>} title="Bold" active={state.bold} onClick={() => chain().toggleBold().run()} />
        <Button label={<i>I</i>} title="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()} />
        <Button label={<u>U</u>} title="Underline" active={state.underline} onClick={() => chain().toggleUnderline().run()} />
        <Button label={<s>S</s>} title="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()} />
        <Button label="{ }" title="Monospace" active={state.code} onClick={() => chain().toggleCode().run()} />
        <Button label="x²" title="Superscript" active={state.superscript} onClick={() => chain().toggleSuperscript().run()} />
        <Button label="x₂" title="Subscript" active={state.subscript} onClick={() => chain().toggleSubscript().run()} />
      </div>

      <div className={classes.group}>
        <select aria-label="Block type" value={state.blockType} onChange={(e) => setBlockType(editor, e.target.value)}>
          {BLOCK_TYPES.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          aria-label="Font size"
          value={state.fontSize}
          onChange={(e) =>
            e.target.value ? chain().setFontSize(`${e.target.value}px`).run() : chain().unsetFontSize().run()
          }
        >
          <option value="">Size</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <select
          aria-label="Font"
          value={state.fontFamily}
          onChange={(e) =>
            e.target.value ? chain().setFontFamily(e.target.value).run() : chain().unsetFontFamily().run()
          }
        >
          <option value="">Font</option>
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div className={classes.group}>
        <Button label="•" title="Bullet list" active={state.listType === "bulletList"} onClick={() => chain().toggleBulletList().run()} />
        <Button label="1." title="Numbered list" active={state.listType === "orderedList"} onClick={() => chain().toggleOrderedList().run()} />
        <Button label="→" title="Indent" disabled={!state.canIndent} onClick={() => chain().sinkListItem("listItem").run()} />
        <Button label="←" title="Outdent" disabled={!state.canOutdent} onClick={() => chain().liftListItem("listItem").run()} />
      </div>

      <div className={classes.group}>
        {[
          ["left", "⇤", "Align left"],
          ["center", "↔", "Align center"],
          ["right", "⇥", "Align right"],
          ["justify", "☰", "Justify"],
        ].map(([align, label, title]) => (
          <Button
            key={align}
            label={label}
            title={title}
            active={state.align === align}
            onClick={() =>
              // Left is the default, so clear the style instead of writing it.
              align === "left" ? chain().unsetTextAlign().run() : chain().setTextAlign(align).run()
            }
          />
        ))}
      </div>

      <div className={classes.group}>
        <label className={classes.color} title="Text color">
          A
          <input type="color" aria-label="Text color" value={state.color} onChange={(e) => chain().setColor(e.target.value).run()} />
        </label>
        <label className={classes.color} title="Highlight color">
          ▮
          <input
            type="color"
            aria-label="Highlight color"
            value={state.highlight}
            onChange={(e) => chain().setHighlight({ color: e.target.value }).run()}
          />
        </label>
        <Button label="🔗" title="Link" active={state.link} onClick={addLink} />
        <Button label="✂" title="Remove link" disabled={!state.link} onClick={() => chain().extendMarkRange("link").unsetLink().run()} />
        <select
          aria-label="Emoji"
          value=""
          onChange={(e) => e.target.value && chain().insertContent(e.target.value).run()}
        >
          <option value="">☺</option>
          {EMOJIS.map((emoji) => (
            <option key={emoji} value={emoji}>{emoji}</option>
          ))}
        </select>
        <Button label="🖼" title="Image" onClick={addImage} />
        <Button label="⌫" title="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()} />
        <Button label="↶" title="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()} />
        <Button label="↷" title="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()} />
      </div>
    </div>
  );
}
