import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { routes } from './app.routing';
import { PreloadAllModules } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ParticleComponent } from './canvas-particle/particle.component';
import { CanvasComponent } from './canvas-segments/canvas.component';
import { SankeyComponent } from './d3-sankey/sankey.component';
import { RadarComponent } from './pixi-radar/radar.component';
@NgModule({
  declarations: [
    AppComponent,
    ParticleComponent,
    CanvasComponent,
    SankeyComponent,
    RadarComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
