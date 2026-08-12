import { Component } from '@angular/core';

import { FsExampleModule } from '@firestitch/example';

import { ExampleComponent } from '../example/example.component';
import { environment } from '../../../environments/environment';


@Component({
  templateUrl: 'examples.component.html',
  standalone: true,
  imports: [
    FsExampleModule,
    ExampleComponent,
  ],
})
export class ExamplesComponent {
  public config = environment;
}
