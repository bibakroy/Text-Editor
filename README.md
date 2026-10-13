# ReactJs-Text-Editor

A rich text editor built with React and [TipTap](https://tiptap.dev). The HTML
for whatever you write is shown live below the editor.

Requires Node `^22.13.0` or `>=24` (`nvm use` picks it up from `.nvmrc`).
`npm install` refuses to run on older versions.

```bash
npm install
npm run dev      # start the dev server
npm test         # run the tests (watch mode)
npm run lint     # lint
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

Links are limited to `http`, `https`, `mailto`, `tel` and relative URLs, and
images to `http`/`https`, including in pasted content. If you render the HTML
output somewhere else, still run it through a sanitizer such as DOMPurify there.
