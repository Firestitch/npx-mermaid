/*
 * Public API Surface of fs-mermaid
 */

export { FsMermaidComponent, FS_MERMAID_MAX_HEIGHT } from './app/components/mermaid/mermaid.component';
export {
  FsMermaidDialogComponent,
  FsMermaidDialogData,
} from './app/components/mermaid-dialog/mermaid-dialog.component';

export { FsMermaidRenderer } from './app/services/mermaid-renderer.service';
export { FsMermaidStyles } from './app/services/mermaid-styles.service';
// Deliberately free of any mermaid dependency, so it can be lifted into a shared package the day
// @firestitch/syntax-highlighter's copy button needs the same treatment.
export {
  FsMaterialGuestStyles,
  FS_MATERIAL_GUEST_STYLE_ID,
} from './app/services/material-guest-styles.service';

export { mermaidSvgToDataUrl } from './app/utils/mermaid-svg.util';

export { FS_MERMAID_STYLES, FS_MERMAID_STYLE_ID } from './app/consts/mermaid-styles.const';
export { FsMermaidRenderResult } from './app/services/mermaid-renderer.service';
