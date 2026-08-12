import { Component } from '@angular/core';

import { FsExampleModule } from '@firestitch/example';

import { FsMermaidComponent } from '../../../../src/app/components/mermaid/mermaid.component';
import {
  BLOCK,
  CLASS_DIAGRAM,
  ENTITY_RELATIONSHIP,
  FLOWCHART,
  FLOWCHART_SUBGRAPH,
  GANTT,
  GIT_GRAPH,
  JOURNEY,
  MINDMAP,
  PARSE_ERROR,
  PIE,
  QUADRANT,
  SANKEY,
  SEQUENCE,
  STATE,
  TIMELINE,
  XY_CHART,
} from '../../consts/diagrams.const';
import { environment } from '../../../environments/environment';


@Component({
  templateUrl: 'examples.component.html',
  standalone: true,
  imports: [
    FsExampleModule,
    FsMermaidComponent,
  ],
})
export class ExamplesComponent {

  public config = environment;

  public readonly flowchart = FLOWCHART;
  public readonly flowchartSubgraph = FLOWCHART_SUBGRAPH;
  public readonly sequence = SEQUENCE;
  public readonly classDiagram = CLASS_DIAGRAM;
  public readonly state = STATE;
  public readonly entityRelationship = ENTITY_RELATIONSHIP;
  public readonly journey = JOURNEY;
  public readonly gantt = GANTT;
  public readonly pie = PIE;
  public readonly quadrant = QUADRANT;
  public readonly xyChart = XY_CHART;
  public readonly mindmap = MINDMAP;
  public readonly timeline = TIMELINE;
  public readonly gitGraph = GIT_GRAPH;
  public readonly block = BLOCK;
  public readonly sankey = SANKEY;
  public readonly parseError = PARSE_ERROR;

}
