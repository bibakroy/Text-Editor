import { EditorContent, useEditor } from "@tiptap/react";
import { useState } from "react";
import classes from "../style/Editor.module.css";
import extensions from "./extensions";
import Toolbar from "./Toolbar";

const initialHTML = `<h1><em><u>Hello</u></em></h1>
<ol>
<li><p><sup><strong>World </strong></sup></p></li>
</ol>
<ul>
<li><p>Hello&nbsp;&nbsp;&nbsp;&nbsp;</p></li>
</ul>
<p>World    !</p>`;

// TipTap keeps an empty paragraph after a final heading, list or image so the
// cursor can get below it; leave it out of the HTML shown to the user.
const toOutputHTML = (editor) => editor.getHTML().replace(/(<p><\/p>)+$/, "");

export default function TextEditor() {
  const [html, setHtml] = useState("");

  const editor = useEditor({
    extensions,
    content: initialHTML,
    editorProps: {
      attributes: { "aria-label": "Editor", role: "textbox", "aria-multiline": "true" },
    },
    onCreate: ({ editor }) => setHtml(toOutputHTML(editor)),
    onUpdate: ({ editor }) => setHtml(toOutputHTML(editor)),
  });

  return (
    <div className={classes.editor}>
      <h1>TEXT EDITOR</h1>
      <div className={classes.wrapper}>
        <Toolbar editor={editor} />
        <EditorContent
          editor={editor}
          className={classes.content}
        />
      </div>
      <textarea
        className={classes.outputHTML}
        aria-label="HTML output"
        readOnly
        value={html}
      ></textarea>
    </div>
  );
}
