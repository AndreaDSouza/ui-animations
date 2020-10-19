
import { Routes } from '@angular/router';
import { ParticleComponent } from './canvas-particle/particle.component';
import { CanvasComponent } from './canvas-segments/canvas.component';
import { SankeyComponent } from './d3-sankey/sankey.component';
import { RadarComponent } from './pixi-radar/radar.component';
export const routes: Routes = [
  {
    path: 'canvas',
    component: CanvasComponent
  },
  {
    path: 'sankey',
    component: SankeyComponent
  },
  {
    path: 'radar',
    component: RadarComponent
  },
  {
    path: 'particle',
    component: ParticleComponent
  }
];