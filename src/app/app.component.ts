import { Component } from '@angular/core';

type Coords = { x: number; y: number; z: number; };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor() { }
}

