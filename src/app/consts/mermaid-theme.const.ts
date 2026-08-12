/**
 * The diagram's own look: colours, type and the handful of CSS rules mermaid's themes get wrong.
 *
 * This is NOT in `mermaid-styles.const.ts`, and the split is not arbitrary. That stylesheet dresses
 * the ELEMENT — the `<img>` and the error panel — and reaches them through the document's cascade.
 * A diagram is an `<img>` whose source is a self-contained SVG document, and no stylesheet on the
 * page reaches inside an image. Everything here is therefore handed to mermaid to bake INTO the
 * SVG at render time, where it is the only styling the diagram will ever have.
 */

/**
 * Every colour the diagram uses, in one place, so the whole look can be re-pitched by editing this
 * object rather than hunting through the variable map below it.
 */
const PALETTE = {
  /** Text. Slate rather than black — full black on a pale fill reads harsher than it needs to. */
  ink: '#2b3440',
  /** Edge labels, signals, and other secondary text. */
  inkMuted: '#55606d',

  /**
   * Nodes. Mermaid's stock theme fills them lavender (`#ECECFF`) with a `#9370DB` purple border,
   * which is the single most recognisable thing about an unstyled mermaid diagram.
   */
  nodeFill: '#e9eef4',
  nodeFillStrong: '#ccd8e5',
  nodeBorder: '#8098ad',
  accent: '#5a7d9e',

  /** Edges, and the arrowheads that inherit from them. */
  line: '#94a1ad',

  surface: '#ffffff',
  surfaceSunken: '#f5f7f9',
  borderSubtle: '#dfe4e9',

  /** Sequence-diagram notes, the one place a warm colour earns its keep. */
  noteFill: '#fdf6e3',
  noteBorder: '#e8d7a9',
  noteInk: '#5c4d2c',
};

/**
 * The categorical scale, for the diagram types that colour by series rather than by role: pie
 * slices, journey and timeline sections, mindmap branches.
 *
 * It has to be spelled out. Mermaid's `base` theme builds these scales out of `primaryColor`,
 * `secondaryColor` and hue rotations of them — which works when the seed is saturated, and
 * collapses when it is a pale node fill: a pie of four rotations of `#e9eef4` is four whites.
 *
 * Kept light on purpose. Every label mermaid draws over these fills is set in one dark ink for the
 * whole scale, so a saturated entry anywhere in it is a slice with unreadable text sitting on it.
 */
const SCALE = [
  '#c7dcf3', // blue
  '#cfe6da', // green
  '#f7dfc4', // amber
  '#f2d3d4', // rose
  '#cfe4ec', // cyan
  '#ded9ee', // violet
  '#e6dfcc', // sand
  '#d7dde4', // slate
  '#b5cded', // blue, deeper
  '#bcdcc9', // green, deeper
  '#f2d0ae', // amber, deeper
  '#ebc3c6', // rose, deeper
];

/**
 * Branch colours for git graphs, the one categorical scale that CANNOT be pastel: they are drawn
 * as 2px strokes and small commit dots, and a pale stroke on white is a line that is not there.
 * Labels sitting on these are switched to white below.
 */
const GIT_SCALE = [
  '#4a7fb5',
  '#4f9d6d',
  '#c2883a',
  '#c0616b',
  '#4a93a8',
  '#7a72b3',
  '#94854f',
  '#6b7787',
];

/** Mermaid reads these scales by index — `cScale0…`, `pie1…`, `git0…` — and never as a list. */
function indexed(prefix: string, values: string[], start = 0): Record<string, string> {
  return values.reduce((vars, value, i) => ({ ...vars, [`${prefix}${i + start}`]: value }), {});
}

/**
 * A shade under the 16px mermaid renders at by default. A diagram is a figure sitting inside body
 * copy, and at 16px its labels compete with the prose around it instead of reading as a caption.
 */
export const FS_MERMAID_FONT_SIZE = 14;

/**
 * Applied on top of the theme, for the things `themeVariables` cannot express.
 *
 * Mermaid inserts this into the SVG BEFORE it draws, and it measures every label from the live DOM
 * (`getBoundingClientRect()` on the label's div) — so padding added here widens the box mermaid
 * lays the diagram out around, rather than spilling out of a box already sized without it.
 */
export const FS_MERMAID_THEME_CSS = `
/*
 * An edge label is a bare box painted behind the text, and mermaid paints it SEMI-TRANSPARENT —
 * 0.5 in flowcharts and state diagrams, 0.7 on an ER relationship. Over the line it labels that
 * does not cut the line, it veils it: the segment behind the label comes out a paler shade than
 * the rest of the edge, so a single arrow appears to change colour halfway along.
 *
 * Opaque white, so the label reads as a clean gap in the line rather than a smudge over it. Every
 * diagram type names these boxes differently, hence the list.
 */
.edgeLabel,
.edgeLabel p,
.edgeLabel .label span,
.labelBkg {
  background: ${PALETTE.surface};
}

.edgeLabel rect,
.edgeLabel .label rect,
.relationshipLabelBox,
.relationshipLabelBox rect {
  fill: ${PALETTE.surface};
  opacity: 1;
}

/* Room around the text, so the gap in the line is wider than the glyphs and reads as deliberate. */
.edgeLabel,
.edgeLabel .label span {
  padding: 1px 7px;
  border-radius: 4px;
}

.edgeLabel p {
  margin: 0;
}

/* Subgraph frames. Plain <rect>s, so unlike node shapes they can be rounded without reshaping
   anything — a stadium node is also a <rect>, and rounding by selector would flatten it. */
.cluster rect {
  rx: 8;
  ry: 8;
}
`;

/**
 * Mermaid's `base` theme, which exists to be overridden — every other built-in theme computes its
 * palette from a seed and discards most of what is set here.
 *
 * Values are re-applied AFTER mermaid derives the rest, so an explicit setting always wins over
 * the derivation that would otherwise have produced it.
 */
export const FS_MERMAID_THEME_VARIABLES: Record<string, unknown> = {
  background: PALETTE.surface,
  primaryColor: PALETTE.nodeFill,
  primaryBorderColor: PALETTE.nodeBorder,
  primaryTextColor: PALETTE.ink,
  secondaryColor: PALETTE.surfaceSunken,
  tertiaryColor: PALETTE.surface,
  lineColor: PALETTE.line,
  textColor: PALETTE.ink,
  titleColor: PALETTE.ink,

  mainBkg: PALETTE.nodeFill,
  nodeBorder: PALETTE.nodeBorder,
  nodeTextColor: PALETTE.ink,

  clusterBkg: PALETTE.surfaceSunken,
  clusterBorder: PALETTE.borderSubtle,

  /* White, not grey: the label sits on the line, so it has to read as a gap cut into it. */
  edgeLabelBackground: PALETTE.surface,
  labelBackgroundColor: PALETTE.surface,
  labelTextColor: PALETTE.ink,

  // Sequence
  actorBkg: PALETTE.nodeFill,
  actorBorder: PALETTE.nodeBorder,
  actorTextColor: PALETTE.ink,
  actorLineColor: PALETTE.borderSubtle,
  signalColor: PALETTE.inkMuted,
  signalTextColor: PALETTE.inkMuted,
  labelBoxBkgColor: PALETTE.nodeFill,
  labelBoxBorderColor: PALETTE.nodeBorder,
  loopTextColor: PALETTE.inkMuted,
  noteBkgColor: PALETTE.noteFill,
  noteBorderColor: PALETTE.noteBorder,
  noteTextColor: PALETTE.noteInk,
  activationBkgColor: PALETTE.nodeFillStrong,
  activationBorderColor: PALETTE.nodeBorder,
  sequenceNumberColor: PALETTE.surface,

  // Class and state
  classText: PALETTE.ink,
  transitionColor: PALETTE.line,
  transitionLabelColor: PALETTE.ink,
  altBackground: PALETTE.surfaceSunken,

  // Entity relationship. The attribute rows stripe; the stripe should be barely there.
  attributeBackgroundColorOdd: PALETTE.surface,
  attributeBackgroundColorEven: PALETTE.surfaceSunken,

  /*
   * Gantt. Almost nothing here is derived from the node colours, so left alone a gantt chart is
   * the one diagram that would still render in mermaid's stock palette.
   */
  sectionBkgColor: PALETTE.surfaceSunken,
  sectionBkgColor2: '#f2f6fb',
  altSectionBkgColor: PALETTE.surface,
  taskBkgColor: PALETTE.nodeFill,
  taskBorderColor: PALETTE.nodeBorder,
  taskTextColor: PALETTE.ink,
  taskTextLightColor: PALETTE.ink,
  taskTextDarkColor: PALETTE.ink,
  taskTextOutsideColor: PALETTE.ink,
  activeTaskBkgColor: PALETTE.nodeFillStrong,
  activeTaskBorderColor: PALETTE.accent,
  doneTaskBkgColor: '#e6eaef',
  doneTaskBorderColor: '#aab6c4',
  critBkgColor: '#f8dcdc',
  critBorderColor: '#d18b8b',
  gridColor: '#e3e9f0',
  todayLineColor: '#d1707a',

  // Pie. Stock is a black 2px stroke at 0.7 opacity, which mutes every slice and outlines it hard.
  pieStrokeColor: PALETTE.surface,
  pieOuterStrokeColor: PALETTE.borderSubtle,
  pieStrokeWidth: '2px',
  pieOuterStrokeWidth: '1px',
  pieOpacity: '1',
  pieTitleTextColor: PALETTE.ink,
  pieSectionTextColor: PALETTE.ink,
  pieLegendTextColor: PALETTE.ink,
  pieTitleTextSize: '17px',
  pieSectionTextSize: '13px',
  pieLegendTextSize: '13px',

  // Git
  commitLabelColor: PALETTE.ink,
  commitLabelBackground: PALETTE.surface,
  tagLabelColor: PALETTE.ink,
  tagLabelBackground: PALETTE.noteFill,
  tagLabelBorder: PALETTE.noteBorder,

  // XY chart, whose stock palette is a flat-UI set that matches nothing else here.
  xyChart: {
    plotColorPalette: '#5a7d9e,#5aa87a,#d1a05a,#c0616b',
  },

  /* The same scale under all three names mermaid reads it by: `pie` is 1-based, the others are 0. */
  ...indexed('cScale', SCALE),
  ...indexed('fillType', SCALE.slice(0, 8)),
  ...indexed('pie', SCALE, 1),

  ...indexed('git', GIT_SCALE),
  /* Branch labels sit ON the branch colour, so they invert rather than take the shared ink. */
  ...indexed('gitBranchLabel', GIT_SCALE.map(() => PALETTE.surface)),
};
