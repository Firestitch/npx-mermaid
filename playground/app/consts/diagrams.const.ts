/**
 * One source per mermaid diagram type, so the playground shows what the theme does to each of
 * them. They render through the same `<fs-mermaid>` as everything else — the diagram type is
 * decided entirely by the first word of the source.
 */

export const FLOWCHART = `flowchart TD
  A[Agent writes HTML] --> B{format?}
  B -->|html| C[Sandboxed iframe]
  B -->|markdown| D[Markdown renderer]
  C --> E["Blocks mounted from the host"]
  D --> E`;

export const FLOWCHART_SUBGRAPH = `flowchart LR
  subgraph host [Host document]
    R[Renderer] --> S[SVG string]
    S --> U[Data URL]
  end
  subgraph guest [Guest iframe]
    I["&lt;img&gt;"]
    P[Injected stylesheet]
  end
  U --> I
  P -.-> I`;

export const SEQUENCE = `sequenceDiagram
  participant Agent
  participant MCP
  participant API
  Agent->>MCP: specify_docs_document_apply_edit
  activate MCP
  MCP->>API: PATCH /docs/:id/apply-edit
  activate API
  API-->>MCP: 200 {version, checksum}
  deactivate API
  MCP-->>Agent: applied
  deactivate MCP
  Note over Agent,MCP: A stale baseVersion comes back as {stale: true}`;

export const CLASS_DIAGRAM = `classDiagram
  class FsMermaidComponent {
    +InputSignal~string~ source
    +Signal~string~ src
    +Signal~string~ error
  }
  class FsMermaidRenderer {
    -Promise mermaid
    +render(source) FsMermaidRenderResult
  }
  class FsMermaidStyles {
    +ensure(doc) void
  }
  FsMermaidComponent --> FsMermaidRenderer : renders through
  FsMermaidComponent --> FsMermaidStyles : dresses itself with`;

export const STATE = `stateDiagram-v2
  [*] --> Empty
  Empty --> Rendering : source set
  Rendering --> Rendered : svg
  Rendering --> Failed : parse error
  Rendered --> Rendering : source changed
  Failed --> Rendering : source changed
  Rendered --> [*]`;

export const ENTITY_RELATIONSHIP = `erDiagram
  PROJECT ||--o{ TASK : contains
  TASK ||--o{ COMMENT : has
  TASK }o--|| ACCOUNT : "assigned to"
  PROJECT {
    int id PK
    string name
  }
  TASK {
    int id PK
    string identifier
    string name
    int account_id FK
  }
  COMMENT {
    int id PK
    text body
  }`;

export const JOURNEY = `journey
  title Publishing a document
  section Draft
    Write the content: 4: Agent
    Read the diff: 3: Agent, Reviewer
  section Publish
    Apply the edit: 5: Agent
    Read it in the app: 5: Reader`;

export const GANTT = `gantt
  title Release
  dateFormat YYYY-MM-DD
  axisFormat %b %d
  section Library
    Renderer      :done,   a1, 2026-01-05, 5d
    Theme         :active, a2, 2026-01-12, 4d
    Playground    :        a3, after a2, 3d
  section Release
    Package       :        b1, after a3, 2d
    Publish       :crit,   b2, after b1, 1d`;

export const PIE = `pie title Unpacked bundle weight
  "mermaid" : 62
  "d3" : 21
  "katex" : 12
  "fs-mermaid" : 5`;

export const QUADRANT = `quadrantChart
  title Diagram types
  x-axis Rarely used --> Everyday
  y-axis Plain --> Rich
  quadrant-1 Worth the weight
  quadrant-2 Keep sharp
  quadrant-3 Leave alone
  quadrant-4 Watch
  Flowchart: [0.92, 0.55]
  Sequence: [0.78, 0.72]
  Gantt: [0.35, 0.88]
  Mindmap: [0.3, 0.42]
  Pie: [0.55, 0.2]`;

export const XY_CHART = `xychart-beta
  title "Render time by node count"
  x-axis [4, 8, 16, 32, 64]
  y-axis "Milliseconds" 0 --> 400
  bar [18, 34, 76, 158, 340]
  line [18, 34, 76, 158, 340]`;

export const MINDMAP = `mindmap
  root((fs-mermaid))
    Rendering
      Lazy import
      Host document
    Output
      SVG data URL
      Intrinsic size
    Styling
      Theme variables
      Injected stylesheet`;

export const TIMELINE = `timeline
  title Rendering a diagram
  Parse : mermaid.parse
  Layout : dagre : label measurement
  Draw : SVG in the host document
  Display : data URL in an img`;

export const GIT_GRAPH = `gitGraph
  commit id: "scaffold"
  branch theme
  checkout theme
  commit id: "base theme"
  commit id: "edge labels"
  checkout main
  merge theme tag: "18.0.1"
  commit id: "playground"`;

export const BLOCK = `block-beta
  columns 3
  Source["Mermaid source"] space Renderer["Renderer"]
  space space space
  Styles["Injected CSS"] space Image["&lt;img&gt;"]
  Source --> Renderer
  Renderer --> Image
  Styles --> Image`;

export const SANKEY = `sankey-beta
Mermaid source,Parser,40
Parser,Layout,40
Layout,SVG string,40
SVG string,Data URL,25
SVG string,Discarded,15`;

/**
 * A deliberately tall diagram — a ~2000px column, comfortably past the 1000px `maxHeight` default,
 * so the playground shows what the cap actually does: the diagram is scaled down to fit it rather
 * than cropped, and fullscreen is where you go to read it at size.
 */
export const TALL = `flowchart TD
  A[Source authored] --> B[Renderer receives source]
  B --> C[Mermaid parses]
  C --> D[Layout engine runs]
  D --> E[Edges routed]
  E --> F[Labels placed]
  F --> G[SVG string emitted]
  G --> H[Fonts inlined]
  H --> I[Theme CSS applied]
  I --> J[SVG serialized]
  J --> K[Encoded as data URL]
  K --> L[Bound to the img]
  L --> M[Browser decodes]
  M --> N[Intrinsic size read]
  N --> O[maxHeight applied]
  O --> P[Scaled to fit]
  P --> Q[Painted inline]
  Q --> R[Fullscreen button shown]
  R --> S[Reader clicks it]
  S --> T[Dialog opens stretch]
  T --> U[Zoom pan mounts]
  U --> V[Image loads]
  V --> W[Fit on both axes]
  W --> X[Reader zooms in]
  X --> Y[Dialog closed]`;

/** Deliberately broken, so the error panel is on the page next to the diagrams it stands in for. */
export const PARSE_ERROR = `flowchart TD
  A[Unquoted (parens) break this] --> B`;
