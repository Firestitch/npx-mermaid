import { Injectable } from '@angular/core';

import { FS_MERMAID_STYLES, FS_MERMAID_STYLE_ID } from '../consts/mermaid-styles.const';


/** Puts the diagram's stylesheet into whichever document a diagram is rendering in. */
@Injectable({ providedIn: 'root' })
export class FsMermaidStyles {

  public ensure(doc: Document = document): void {
    if (!doc || doc.getElementById(FS_MERMAID_STYLE_ID)) {
      return;
    }

    const style = doc.createElement('style');

    style.id = FS_MERMAID_STYLE_ID;
    style.textContent = FS_MERMAID_STYLES;

    (doc.head ?? doc.documentElement).appendChild(style);
  }

}
