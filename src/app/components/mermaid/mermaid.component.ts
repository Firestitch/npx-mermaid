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

import { from, of, switchMap } from 'rxjs';

import { FsMermaidRenderer } from '../../services/mermaid-renderer.service';
import { FsMermaidStyles } from '../../services/mermaid-styles.service';
import { mermaidSvgToDataUrl } from '../../utils/mermaid-svg.util';


/**
 * A rendered mermaid diagram.
 *
 * Like `<fs-syntax-highlighter>`, it is built to survive being mounted into a FOREIGN document —
 * the same-origin iframe that renders AI-authored HTML — so it carries no `styleUrls` and asks
 * {@link FsMermaidStyles} to put its stylesheet into its own `ownerDocument` instead.
 *
 * It deliberately has no zoom, pan or fullscreen chrome. Those need the CDK overlay and a resize
 * handle, neither of which behaves in a guest document: an overlay's container is appended to the
 * HOST body but positioned from a rect measured in the iframe's viewport, so it lands visibly
 * offset. The richer interactive diagram remains the markdown editor's, which only ever renders in
 * the application's own document.
 */
@Component({
  selector: 'fs-mermaid',
  templateUrl: './mermaid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class FsMermaidComponent {

  /** Mermaid source, exactly as authored. */
  public readonly source = input.required<string>();

  private readonly _renderer = inject(FsMermaidRenderer);
  private readonly _styles = inject(FsMermaidStyles);
  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);

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

  constructor() {
    this._styles.ensure(this._el.nativeElement.ownerDocument);
  }

}
