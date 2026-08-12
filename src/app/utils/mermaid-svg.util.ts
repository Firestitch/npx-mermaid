/**
 * Mermaid hands back an SVG document as a string. It is shown as an `<img>` rather than inlined:
 * a mermaid SVG carries internal `id`s and `url(#…)` marker references, and several inlined on one
 * page collide with each other so arrowheads and markers render against the wrong diagram.
 */
export function mermaidSvgToDataUrl(svg: string): string {
  // btoa only accepts a binary string, so the UTF-8 bytes have to be spelled out one char each
  const bytes = new TextEncoder().encode(withIntrinsicSize(svg));
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

/**
 * Give the SVG the size it was drawn at.
 *
 * Every mermaid diagram type defaults to `useMaxWidth: true`, which sizes the root element
 * `width="100%"` + `style="max-width: Npx"` and sets **no height at all**. That is meant for an
 * inline SVG that should shrink with its column — but as the source of an `<img>` it means the
 * image has an aspect ratio and no intrinsic size, so the browser lays it out at whatever the
 * container happens to be wide. A four-node diagram is then drawn at full container width, and
 * every measurement of it comes back as exactly the container, which makes fitting meaningless:
 * the fit ratio is always ~1 and a `maxScale` ceiling can never bind.
 *
 * Rewriting width/height from the viewBox restores the authored size, so the content really is
 * measurable and "fit, but never magnify" means what it says.
 */
function withIntrinsicSize(svg: string): string {
  const openTag = /<svg\b[^>]*>/i.exec(svg);

  if (!openTag) {
    return svg;
  }

  const tag = openTag[0];
  const viewBox = (/viewBox\s*=\s*["']([^"']+)["']/i.exec(tag) || [])[1];

  if (!viewBox) {
    return svg;
  }

  // viewBox is "minX minY width height"
  const [, , width, height] = viewBox.trim().split(/[\s,]+/).map(Number);

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return svg;
  }

  const sized = tag
    .replace(/\s(?:width|height)\s*=\s*["'][^"']*["']/gi, '')
    .replace(
      /(\sstyle\s*=\s*["'])([^"']*)(["'])/i,
      (_match, before, body, after) => `${before}${body.replace(/max-width\s*:[^;"']*;?/gi, '')}${after}`,
    )
    .replace(/<svg\b/i, `<svg width="${width}" height="${height}"`);

  // spliced by index rather than String.replace, whose replacement string treats `$` specially
  return svg.slice(0, openTag.index) + sized + svg.slice(openTag.index + tag.length);
}
