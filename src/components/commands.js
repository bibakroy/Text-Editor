import { Selection } from "@tiptap/pm/state";

// Focus the editor before changing it. TipTap's focus() waits a frame, so a
// change made from a dropdown would otherwise happen while the dropdown still
// has focus, leaving the browser's cursor behind the new content.
export function focusEditor(editor) {
  if (!editor.view.hasFocus()) editor.view.focus();
}

// setImage leaves the new image selected, so the next thing typed or
// inserted would replace it. Move the cursor past it instead, adding a
// paragraph when the image is the last thing in the document.
export function insertImage(editor, src) {
  focusEditor(editor);
  return editor
    .chain()
    .focus()
    .setImage({ src })
    .command(({ tr, state }) => {
      const after = tr.selection.to;
      if (!tr.doc.resolve(after).nodeAfter) {
        tr.insert(after, state.schema.nodes.paragraph.create());
      }
      tr.setSelection(Selection.near(tr.doc.resolve(after), 1));
      return true;
    })
    .run();
}
