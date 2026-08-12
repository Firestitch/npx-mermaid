import {
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  createComponent,
  inject,
  isDevMode,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';


export const FS_MATERIAL_GUEST_STYLE_ID = 'fs-material-guest-styles';

/** The components a guest-mounted `<button mat-icon-button><mat-icon>` is made of. */
const SOURCES = [MatIconButton, MatIcon];

/** Every `var(--x` in a stylesheet, including ones nested inside another's fallback. */
const TOKEN = /var\(\s*(--[\w-]+)/g;

/**
 * Where the harvested token values are declared in the guest.
 *
 * Not `:root`. This lands in a document whose markup belongs to someone else, and the contract is
 * that nothing here can reach it. Scoped to Material's own classes these declarations are
 * unreachable by anything the author wrote; on `:root` they would at least be visible to it.
 */
const SCOPE = '.mat-mdc-icon-button,.mat-icon';

/** Parked off-screen rather than `display:none`, so nothing about layout is in doubt. */
const PROBE_STYLE = 'position:fixed;top:-10000px;left:-10000px;visibility:hidden';

/** What a selector in the copied CSS is allowed to start with. See {@link FsMaterialGuestStyles}. */
const NAMESPACED = /^(\.(mat|mdc|cdk)-|mat-icon\b|\[dir=)/;


/**
 * Puts the CSS an Angular Material control needs into a document that never loaded the app's theme.
 *
 * Angular injects component styles into the HOST document's head — `SharedStylesHost` holds the
 * injected `DOCUMENT` and appends to `doc.head` — so a control mounted into a foreign document, as
 * this package's diagrams are, arrives with no styles at all. This copies the two things the
 * icon-button/icon pair needs, and nothing else.
 *
 * THE RULES, read off the compiled component definitions. Both components are
 * `ViewEncapsulation.None`, so their CSS is plain global class selectors with no generated
 * attributes, and the text is portable verbatim. That single fact is what makes any of this work.
 *
 * THE TOKEN VALUES, resolved against a real, throwaway Material button rendered in the host.
 * Material's CSS is written entirely against `var(--mat-…)`, and those are declared by the
 * application's theme — which must NOT be copied wholesale into someone else's document. Reading
 * them one at a time off a live control yields the app's real density, real overrides and real
 * colours: about fifteen namespaced declarations instead of the theme's several hundred.
 *
 * The probe is a genuine `createComponent(MatIconButton)` rather than a `<button>` with the class
 * names typed out, because the class names are the part that would fail SILENTLY. An app themed at
 * a non-default density declares its size on `.mat-mdc-icon-button.mat-mdc-button-base`, not on
 * `:root`, so a probe missing one class reads nothing for the size and the guest button renders at
 * Material's built-in 40px while every other button in the app is 44px. Letting Material apply its
 * own host bindings means there is no class contract here to get wrong.
 *
 * Values are read with `getPropertyValue`, never by ENUMERATING custom properties off computed
 * style — enumeration is a Chromium behaviour and this has to work everywhere. Deriving the names
 * from Material's own CSS is what makes reading them one at a time possible.
 *
 * WHAT THIS CANNOT FIX. Two Material behaviours bind to the injected `DOCUMENT` rather than to the
 * element's `ownerDocument`: the ripple loader listens for focus/mousedown/mouseenter/touchstart on
 * the host document, and the CDK focus monitor resolves its root as `_getShadowRoot(el) ||
 * this._document`. Neither ever sees an event inside the frame, so a guest control has no click
 * ripple and never gets `.cdk-keyboard-focused`. Hover and press state layers are pure CSS and work
 * normally; Material also sets `outline:none`, so the KEYBOARD FOCUS RING has to be supplied by the
 * caller's own stylesheet — see `FS_MERMAID_STYLES`.
 */
@Injectable({ providedIn: 'root' })
export class FsMaterialGuestStyles {

  private readonly _injector = inject(EnvironmentInjector);

  /**
   * Put the stylesheet into a guest document.
   *
   * A no-op for the application's own document, which already has all of this, and where these
   * rules — carrying resolved values rather than `var()` references — would shadow the live theme.
   */
  public ensure(doc: Document): void {
    if (!doc || doc === document || doc.getElementById(FS_MATERIAL_GUEST_STYLE_ID)) {
      return;
    }

    const css = this._build(doc);

    if (!css) {
      return;
    }

    const style = doc.createElement('style');

    style.id = FS_MATERIAL_GUEST_STYLE_ID;
    style.textContent = css;

    (doc.head ?? doc.documentElement).appendChild(style);

    if (isDevMode()) {
      this._audit(style.sheet);
    }
  }

  private _build(doc: Document): string {
    const rules = SOURCES
      .flatMap((type) => (type as unknown as { ɵcmp?: { styles?: string[] } }).ɵcmp?.styles ?? [])
      .join('\n');

    if (!rules) {
      if (isDevMode()) {
        console.warn(
          'FsMaterialGuestStyles: Angular Material exposes no compiled component styles to copy. '
          + 'A Material control rendered in a foreign document will be unstyled.',
        );
      }

      return '';
    }

    // A failed probe is worth degrading for rather than throwing over: without the token block the
    // guest falls back to the literal defaults written into Material's own CSS, which is a working
    // button at the wrong size, and the diagram itself still renders.
    let tokens = '';

    try {
      tokens = this._tokens(rules, doc);
    } catch (e) {
      if (isDevMode()) {
        console.error('FsMaterialGuestStyles: could not resolve Material theme tokens.', e);
      }
    }

    return `${tokens}\n${rules}`;
  }

  /** The `var()` names in `rules`, resolved against a live control, as declarations under SCOPE. */
  private _tokens(rules: string, doc: Document): string {
    const host = document.createElement('button');

    host.setAttribute('style', PROBE_STYLE);
    this._anchor(doc).appendChild(host);

    try {
      const buttonRef = createComponent(MatIconButton, {
        environmentInjector: this._injector,
        hostElement: host,
      });

      const iconElement = host.appendChild(document.createElement('mat-icon'));
      const iconRef = createComponent(MatIcon, {
        environmentInjector: this._injector,
        hostElement: iconElement,
      });

      try {
        // Host PROPERTY bindings — `mat-unthemed` among them — land on the first check; only the
        // static class attribute is applied at creation.
        buttonRef.changeDetectorRef.detectChanges();
        iconRef.changeDetectorRef.detectChanges();

        const buttonStyle = getComputedStyle(host);
        const iconStyle = getComputedStyle(iconElement);
        const declarations: string[] = [];

        for (const name of new Set(Array.from(rules.matchAll(TOKEN), (match) => match[1]))) {
          // An empty value means the theme never declared it — Material's `--mat-sys-*` names under
          // an M2 theme, for one. Skipping it leaves the guest on the same built-in fallback the
          // host is already using, which is the point: match the host, not the spec.
          const value = buttonStyle.getPropertyValue(name).trim()
            || iconStyle.getPropertyValue(name).trim();

          if (value) {
            declarations.push(`${name}:${value}`);
          }
        }

        return declarations.length ? `${SCOPE}{${declarations.join(';')}}` : '';
      } finally {
        (iconRef as ComponentRef<unknown>).destroy();
        (buttonRef as ComponentRef<unknown>).destroy();
      }
    } finally {
      host.remove();
    }
  }

  /**
   * Where in the HOST document to park the probe.
   *
   * Beside the frame the guest renders in, not on `<body>`, so a theme scoped to a container — a
   * dark section, a drawer that overrides density — is read the way the app would read it for a
   * control at that spot.
   */
  private _anchor(doc: Document): Element {
    const frame = doc.defaultView?.frameElement ?? null;

    return frame?.parentElement ?? document.body ?? document.documentElement;
  }

  /**
   * Shout if Material ever ships a selector here that could reach the author's own markup.
   *
   * The entire licence for injecting this stylesheet into a document this package does not own is
   * that every selector in it is namespaced to Material's own classes. Because the CSS is COPIED
   * rather than written here, nobody reads it again after the day that was checked. This does the
   * reading, using the browser's own parser rather than a regex over the text.
   */
  private _audit(sheet: CSSStyleSheet | null): void {
    const offenders: string[] = [];
    const walk = (rules: CSSRuleList | undefined) => {
      for (const rule of Array.from(rules ?? []) as (CSSRule & {
        selectorText?: string;
        cssRules?: CSSRuleList;
      })[]) {
        if (rule.cssRules) {
          walk(rule.cssRules);
        } else if (rule.selectorText) {
          offenders.push(
            ...rule.selectorText
              .split(',')
              .map((selector) => selector.trim())
              .filter((selector) => selector && !NAMESPACED.test(selector)),
          );
        }
      }
    };

    walk(sheet?.cssRules);

    if (offenders.length) {
      console.error(
        'FsMaterialGuestStyles: Angular Material now ships selectors that are not namespaced to '
        + 'its own classes. Injected into an AI-authored document these would restyle the author\'s '
        + 'own markup and must be excluded:',
        offenders,
      );
    }
  }

}
