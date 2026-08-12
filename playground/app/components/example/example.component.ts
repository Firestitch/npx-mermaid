import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FsMermaidComponent } from '../../../../src/app/components/mermaid/mermaid.component';


const FLOWCHART = `flowchart TD
  A[Agent writes HTML] --> B{format?}
  B -->|html| C[Sandboxed iframe]
  B -->|markdown| D[Markdown renderer]
  C --> E["Blocks mounted from the host"]`;

const SEQUENCE = `sequenceDiagram
  participant Agent
  participant MCP
  participant API
  Agent->>MCP: specify_docs_document_apply_edit
  MCP->>API: PATCH /docs/:id/apply-edit
  API-->>MCP: 200 {version, checksum}
  MCP-->>Agent: applied`;

const BROKEN = `flowchart TD
  A[Unquoted (parens) break this] --> B`;


@Component({
  selector: 'example',
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FsMermaidComponent,
  ],
})
export class ExampleComponent {

  public readonly flowchart = FLOWCHART;
  public readonly sequence = SEQUENCE;
  public readonly broken = BROKEN;

}
