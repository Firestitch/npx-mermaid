import { Injectable } from '@angular/core';

import {
  FS_MERMAID_FONT_SIZE,
  FS_MERMAID_THEME_CSS,
  FS_MERMAID_THEME_VARIABLES,
} from '../consts/mermaid-theme.const';
import { documentFontFamily } from '../utils/mermaid-font.util';


/** A rendered diagram, or the parse error that stopped it. */
export interface FsMermaidRenderResult {
  svg: string | null;
  error: string | null;
}

let renderId = 0;


/**
 * Renders mermaid source to an SVG string.
 *
 * Mermaid is behind a dynamic `import()`: it is ~80MB unpacked across d3, katex, cytoscape and
 * roughjs, and a document with no diagram in it must not pay for any of that.
 *
 * Rendering always happens in the APPLICATION's document, even when the diagram will be displayed
 * inside an iframe. Mermaid measures text by drawing into a scratch element on `document.body`, and
 * the `document` it closes over is the host's — so the host is where it can actually measure. What
 * crosses into a guest document is the finished SVG, which needs no measuring.
 */
@Injectable({ providedIn: 'root' })
export class FsMermaidRenderer {

  private _mermaid: Promise<typeof import('mermaid').default> | null = null;

  public async render(source: string): Promise<FsMermaidRenderResult> {
    const mermaid = await this._load();
    const id = `fs-mermaid-${renderId++}`;

    try {
      const { svg } = await mermaid.render(id, source);

      return { svg, error: null };
    } catch (e) {
      return { svg: null, error: e instanceof Error ? e.message : String(e) };
    }
  }

  private _load(): Promise<typeof import('mermaid').default> {
    this._mermaid = this._mermaid ?? import('mermaid').then((module) => {
      /**
       * Read here rather than at module load: the stylesheet that sets the application's font may
       * not have been applied yet when this file is first evaluated, and `initialize` runs once,
       * so a font read too early is the font every diagram is stuck with.
       */
      const fontFamily = documentFontFamily();

      module.default.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        /**
         * `base` is the only built-in theme that keeps what `themeVariables` sets; the others
         * derive their own palette from a seed colour and overwrite most of it.
         */
        theme: 'base',
        themeVariables: {
          ...FS_MERMAID_THEME_VARIABLES,
          fontFamily,
          fontSize: `${FS_MERMAID_FONT_SIZE}px`,
        },
        themeCSS: FS_MERMAID_THEME_CSS,
        fontFamily,
        fontSize: FS_MERMAID_FONT_SIZE,
        /**
         * We render our own error panel, and without this mermaid renders one too — and leaves it
         * behind. `render()` builds its scratch element on `document.body`; on a parse error it
         * draws its "Syntax error in text" graphic into that element and rethrows WITHOUT removing
         * it, so every failed render parks another one at the bottom of the page.
         */
        suppressErrorRendering: true,
      });

      return module.default;
    });

    return this._mermaid;
  }

}
