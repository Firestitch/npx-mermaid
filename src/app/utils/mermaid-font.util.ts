/**
 * The font stack a diagram can actually be drawn in.
 *
 * Mermaid draws in `"trebuchet ms", verdana, arial, sans-serif` unless told otherwise — a stack
 * that matches no application, and which stands out for exactly that reason when the diagram sits
 * inline with body copy set in something else. So the page's own font is read and handed over.
 *
 * WEBFONTS ARE STRIPPED OUT OF IT, and that is not a shortcut — it is the whole reason this file
 * exists. A diagram is an `<img>` whose source is a standalone SVG document, and an SVG rendered as
 * an image is not allowed to load anything external, webfonts included. Mermaid, meanwhile, lays
 * the diagram out by MEASURING every label in the host document, where the webfont is loaded, and
 * bakes those coordinates into the SVG.
 *
 * Name a webfont in that SVG and the two disagree: boxes are sized for glyphs the image will never
 * paint, and it repaints them in the fallback. The result is not a subtly different typeface, it is
 * a broken diagram — labels off-centre in their nodes, edge labels missing the line they belong to,
 * table headers clipped mid-word. Everything here is drawn with a font both sides can resolve.
 */

/**
 * Deliberately concrete families, with no `-apple-system` / `BlinkMacSystemFont` at the front.
 *
 * Those two are keywords the page resolves against the OS UI font, and this stack has to resolve
 * IDENTICALLY in two places — the host document that measures the labels, and the isolated SVG
 * document that paints them. A keyword one of them honours and the other does not reintroduces the
 * exact mismatch this file exists to prevent, so the stack names fonts that are simply installed.
 */
const SYSTEM_FALLBACK = '"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif';

/** Reads the page's font, keeping only what an image can render, always ending somewhere safe. */
export function documentFontFamily(doc: Document = document): string {
  const element = doc?.body ?? doc?.documentElement;
  const declared = (element && doc.defaultView?.getComputedStyle(element).fontFamily) || '';

  const installed = declared
    .split(',')
    .map((family) => family.trim())
    .filter((family) => family && !isWebFont(doc, family));

  return [...installed, SYSTEM_FALLBACK].join(', ');
}

/**
 * A family is a webfont if the document carries an `@font-face` for it — that is precisely the set
 * of families whose files the page fetched and the image cannot.
 */
function isWebFont(doc: Document, family: string): boolean {
  if (!doc.fonts) {
    return false;
  }

  const name = unquote(family);
  let match = false;

  doc.fonts.forEach((face) => {
    match = match || unquote(face.family) === name;
  });

  return match;
}

function unquote(family: string): string {
  return family.trim().replace(/^["']|["']$/g, '')
    .toLowerCase();
}
