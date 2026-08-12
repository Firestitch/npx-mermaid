export const FS_MERMAID_STYLE_ID = 'fs-mermaid-styles';

/**
 * Element AND a class of the same name, which the component sets on its own host.
 *
 * The doubling is for specificity. This stylesheet is injected into documents it does not own,
 * alongside CSS written by people who have never heard of it — a guest document's `<style>` sits in
 * its `<body>`, later in the cascade than this injection, so anything class-based over there would
 * otherwise win outright.
 */
const HOST = 'fs-mermaid.fs-mermaid';

/**
 * The diagram's stylesheet, as a string for injection into whichever document it renders in.
 *
 * Same reasoning as `@firestitch/syntax-highlighter`: these are mounted into foreign documents — an
 * AI-authored HTML document renders in a same-origin iframe — and Angular's component styles are
 * injected into the HOST document's head, which that guest never reads.
 *
 * Every rule is scoped under the element. A guest document's own `<style>` blocks sit in its
 * `<body>`, later in the cascade than this injection, so an author's bare `img { … }` would
 * otherwise win on equal specificity.
 */
export const FS_MERMAID_STYLES = `
${HOST}{display:block;margin:16px 0;text-align:center;}
${HOST} .fs-mermaid-image{max-width:100%;height:auto;display:inline-block;}

${HOST} .fs-mermaid-error{padding:10px 12px;border:1px solid rgba(204,0,0,0.35);border-radius:6px;
  background:rgba(204,0,0,0.06);color:#a00;text-align:left;}
/* font-family is inherited on purpose: unlike the diagram, this panel is real DOM in the document
   it renders in, so it can simply be set in that document's own font. */
${HOST} .fs-mermaid-error__title{margin-bottom:6px;font-size:12px;font-weight:600;
  letter-spacing:0.04em;text-transform:uppercase;font-family:inherit;}

/*
 * Left aligned and unwrapped on purpose. Mermaid's message is terminal output whose "-----^" caret
 * line points at the offending token; centring each line on its own puts the caret nowhere near it,
 * and wrapping breaks the alignment outright.
 */
${HOST} .fs-mermaid-error__message{margin:0;overflow-x:auto;white-space:pre;text-align:left;
  font-family:Consolas,'Courier New',monospace;font-size:12.5px;line-height:1.45;}
`;
