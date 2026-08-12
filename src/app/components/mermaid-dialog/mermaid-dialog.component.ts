import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

import { FsDialogModule } from '@firestitch/dialog';
import { FsZoomPanComponent } from '@firestitch/zoom-pan';


export interface FsMermaidDialogData {
  /** The diagram as a data URL — already rendered by the inline component, so this never re-renders. */
  src: string;
  /** Dialog heading. Defaults to `Diagram`. */
  title?: string;
}

/** Breathing room left around the diagram when it is fitted to the surface. */
const FIT_PADDING = 12;

/**
 * The diagram at full size, with zoom and pan.
 *
 * This is the half that {@link FsMermaidComponent} deliberately does not do inline: the inline
 * diagram is a static image, and everything interactive lives in here. It only ever opens from the
 * application's own document, never from the guest iframe the inline component supports, so it is
 * free to use the CDK overlay.
 */
@Component({
  templateUrl: './mermaid-dialog.component.html',
  styleUrls: ['./mermaid-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FsDialogModule,
    FsZoomPanComponent,
    MatIconButton,
    MatIcon,
  ],
})
export class FsMermaidDialogComponent {

  public readonly data = inject<FsMermaidDialogData>(MAT_DIALOG_DATA);

  public readonly scaleLabel = signal('');
  public readonly fitPadding = FIT_PADDING;

  private readonly _zoomPan = viewChild(FsZoomPanComponent);
  private readonly _dialogRef = inject(MatDialogRef<FsMermaidDialogComponent>);

  constructor() {
    /**
     * The diagram fits itself when its image loads, but in here that lands while the dialog is
     * still animating open and measures a surface that is still growing — so it opens fitted to a
     * box that no longer exists. `afterOpened` is the point the panel is at its final size.
     *
     * Both passes are wanted, not one or the other: whichever of the image load and the open
     * animation finishes last is the one that produces the correct fit, and the earlier pass is
     * either harmless or a no-op (fit() bails when the image has no size yet).
     */
    this._dialogRef.afterOpened()
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.fit());
  }

  public zoomIn(): void {
    this._zoomPan()?.zoomIn();
  }

  public zoomOut(): void {
    this._zoomPan()?.zoomOut();
  }

  /**
   * Scale the diagram to the surface on both axes so nothing is cut off.
   *
   * `maxScale: 1` makes this shrink-only. Without it a small diagram is magnified to fill the
   * dialog — a four-node state machine blown up to the zoomMax ceiling, which is the opposite of
   * fitting it.
   */
  public fit(): void {
    this._zoomPan()?.fit({ padding: FIT_PADDING, maxScale: 1 });
  }

  public reset(): void {
    this._zoomPan()?.reset();
    this.fit();
  }

  public zoomed(scale: number): void {
    this.scaleLabel.set(`${Math.round(scale * 100)}%`);
  }

}
