import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

import { from, of, switchMap } from 'rxjs';

import { FsMaterialGuestStyles } from '../../services/material-guest-styles.service';
import { FsMermaidRenderer } from '../../services/mermaid-renderer.service';
import { FsMermaidStyles } from '../../services/mermaid-styles.service';
import { mermaidSvgToDataUrl } from '../../utils/mermaid-svg.util';
import { FsMermaidDialogComponent } from '../mermaid-dialog/mermaid-dialog.component';


/** Height the inline diagram is capped at before it is scaled down to fit. */
export const FS_MERMAID_MAX_HEIGHT = 1000;

/**
 * Take a size input as CSS. A number is pixels — the common case, `[maxHeight]="600"` — and a
 * string is passed through untouched so `'60vh'`, `'100%'` and `'auto'` all work.
 */
function cssSize(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * A rendered mermaid diagram.
 *
 * Like `<fs-syntax-highlighter>`, it is built to survive being mounted into a FOREIGN document —
 * the same-origin iframe that renders AI-authored HTML — so it carries no `styleUrls` and asks
 * {@link FsMermaidStyles} to put its stylesheet into its own `ownerDocument` instead.
 *
 * The diagram itself is a static image: a document figure is read, not driven, and zoom/pan on
 * every diagram in a page means the scroll dying each time the pointer crosses one. Everything
 * interactive lives in the fullscreen dialog instead, behind the opt-in `fullscreen` input.
 *
 * **Fullscreen works from a guest document too**, which is worth stating because the general
 * warning about the CDK overlay does not apply here. That warning is about *connected* overlays —
 * tooltips and menus, positioned from the trigger's `getBoundingClientRect()`, which for a
 * guest-resident trigger is measured in the iframe's viewport and lands offset. A dialog is
 * **globally** positioned (`.global().centerHorizontally().centerVertically()`), so it never reads
 * the trigger's rect: it opens centred in the host document, where the app's Material theme is
 * loaded and the dialog renders correctly.
 *
 * What genuinely does not survive the guest is Material chrome on the TRIGGER — `mat-icon-button`
 * and `mat-icon` need the theme and the Material Symbols webfont, neither of which a guest document
 * loads. So the button is a plain `<button>` with an inline glyph, styled from the same injected
 * stylesheet as everything else here.
 *
 * `fullscreen` stays opt-in regardless, because whether a figure should be expandable is the
 * host's call, not this component's.
 */
@Component({
  selector: 'fs-mermaid',
  templateUrl: './mermaid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatIconButton,
    MatIcon,
  ],
  // Same name as the element, purely so the injected stylesheet can out-specify ambient CSS.
  host: {
    class: 'fs-mermaid',
    '[style.width]': 'widthStyle()',
    '[style.max-width]': 'maxWidthStyle()',
  },
})
export class FsMermaidComponent {

  /** Mermaid source, exactly as authored. */
  public readonly source = input.required<string>();

  /**
   * Show the button that opens the diagram fullscreen, with zoom and pan.
   *
   * Off by default — see the class note: the dialog uses the CDK overlay, which cannot be trusted
   * in the guest document this component is also built to render in.
   */
  public readonly fullscreen = input(false);

  /** Ceiling on the inline diagram's height. A number is pixels. */
  public readonly maxHeight = input<number | string>(FS_MERMAID_MAX_HEIGHT);

  /** Width of the diagram box. A number is pixels; defaults to filling the container. */
  public readonly width = input<number | string>('100%');

  /** Ceiling on the diagram box's width. A number is pixels. */
  public readonly maxWidth = input<number | string>('100%');

  private readonly _renderer = inject(FsMermaidRenderer);
  private readonly _styles = inject(FsMermaidStyles);
  private readonly _materialStyles = inject(FsMaterialGuestStyles);
  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _dialog = inject(MatDialog);

  private readonly _result = toSignal(
    toObservable(computed(() => this.source()))
      .pipe(
        switchMap((source) => (source
          ? from(this._renderer.render(source))
          : of(null))),
      ),
    { initialValue: null },
  );

  /** The diagram as a data URL, or null while rendering or on a parse error. */
  public readonly src = computed<string | null>(() => {
    const svg = this._result()?.svg;

    return svg ? mermaidSvgToDataUrl(svg) : null;
  });

  /** Mermaid's own parse error, shown in place of the diagram so a bad block fails visibly. */
  public readonly error = computed<string | null>(() => this._result()?.error ?? null);

  public readonly maxHeightStyle = computed(() => cssSize(this.maxHeight()));
  public readonly widthStyle = computed(() => cssSize(this.width()));
  public readonly maxWidthStyle = computed(() => cssSize(this.maxWidth()));

  constructor() {
    const doc = this._el.nativeElement.ownerDocument;

    this._styles.ensure(doc);
    // Unconditional rather than gated on `fullscreen()`: a signal input read in the constructor
    // sees its default, not the binding. It is a few kilobytes of `.mat-*`-scoped rules in a
    // document that is already rendering a diagram, and a no-op in the host document.
    this._materialStyles.ensure(doc);
  }

  /**
   * Open the diagram fullscreen.
   *
   * The already-rendered data URL is handed over rather than the source, so the dialog shows the
   * same image immediately instead of running mermaid a second time.
   */
  public openFullscreen(): void {
    const src = this.src();

    if (!src) {
      return;
    }

    this._dialog.open(FsMermaidDialogComponent, {
      data: { src },
      autoFocus: false,
    });
  }

}
