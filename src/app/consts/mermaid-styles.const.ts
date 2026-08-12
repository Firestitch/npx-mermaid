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
/*
 * position:relative anchors the fullscreen button, which is absolutely placed in the top right.
 *
 * The white surface is the diagram's own, not the document's. Mermaid draws with the light palette
 * in FS_MERMAID_THEME_VARIABLES — dark strokes and text on light node fills — so a transparent
 * host inherits whatever is behind it and the diagram loses contrast the moment that is dark. It is
 * mounted into surfaces this package does not control and cannot predict: an AI-authored HTML
 * document, and Crepe's code-block preview panel, which is near-black. Painting the surface here
 * keeps a diagram legible in all of them, and makes it read as a figure rather than as loose
 * strokes floating on the page.
 */
${HOST}{display:block;position:relative;margin:16px 0;padding:8px;border-radius:6px;
  background:#fff;text-align:center;box-sizing:border-box;}
${HOST} .fs-mermaid-image{max-width:100%;height:auto;display:inline-block;}

/*
 * Always visible rather than revealed on hover: the diagram is a static image, so this button is
 * the only affordance saying there is more to see. Touch has no hover to reveal it with either.
 */
/*
 * Position and colour only. The button is left at Material's own size — it centres its glyph with
 * a padding it derives from that size, so resizing it here is what knocks the icon off centre.
 */
${HOST} .fs-mermaid-fullscreen{position:absolute;top:4px;right:4px;
  color:#43474e;opacity:.55;transition:opacity .15s ease;}
${HOST} .fs-mermaid-fullscreen:hover{opacity:1;}

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
/*
 * background and border are reset rather than left alone: this is a bare <pre>, and the surfaces
 * this renders in style that element for their own purposes — Crepe's code block paints one a dark
 * grey, which lands as a slab inside the error panel and makes the message unreadable.
 */
${HOST} .fs-mermaid-error__message{margin:0;overflow-x:auto;white-space:pre;text-align:left;
  background:transparent;border:0;padding:0;color:inherit;
  font-family:Consolas,'Courier New',monospace;font-size:12.5px;line-height:1.45;}
`;
