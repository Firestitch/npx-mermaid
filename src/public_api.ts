/*
 * Public API Surface of fs-mermaid
 */

export { FsMermaidComponent } from './app/components/mermaid/mermaid.component';

export { FsMermaidRenderer } from './app/services/mermaid-renderer.service';
export { FsMermaidStyles } from './app/services/mermaid-styles.service';

export { mermaidSvgToDataUrl } from './app/utils/mermaid-svg.util';

export { FS_MERMAID_STYLES, FS_MERMAID_STYLE_ID } from './app/consts/mermaid-styles.const';
export { FsMermaidRenderResult } from './app/services/mermaid-renderer.service';
