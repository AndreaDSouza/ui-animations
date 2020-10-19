import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as PIXI from 'pixi.js';
import '@pixi/graphics-extras';
import { sampleData } from './data';
@Component({
    selector: 'app-radar',
    templateUrl: './radar.component.html',
    styleUrls: ['./radar.component.scss']
})
export class RadarComponent implements OnInit {
    @ViewChild('pixi', { static: true }) pixi;
    pixiContainer = null;
    pixiApp: any;
    ticker = null;
    currTraffic;
    currStep = 1;
    totalSteps = 13; // 6am to 6pm = 13
    g;
    vertices = [];
    colors = [0xc60039, 0xfe9a0a, 0x3a79b9, 0x23b49a];
    width = 960;
    height = 500;
    interval = 40;
    pointSelected = 0;
    sampleData;
    constructor() {
        this.sampleData = sampleData;
    }

    ngOnInit(): void {
        this.createDataObj(0);
        this.pixiApp = new PIXI.Application({
            width: this.width,
            height: this.height,
            antialias: true
        });

        this.pixi.nativeElement.appendChild(this.pixiApp.view);

        this.ticker = PIXI.Ticker.shared;
        this.ticker.autoStart = false;
        this.ticker.add(() => this.doTicking());

        this.pixiApp.loader.load(() => this.onAssetsLoaded());

        this.createChartBase();
    }

    createDataObj(index): void {
        const point = this.pointSelected ? this.pointSelected - 1 : index - 1;
        this.currTraffic = _.cloneDeep(sampleData[index].items);
        this.currTraffic.forEach((t, i) => {
            t.data.forEach((d, j) => {
                const diff = index === 0 && !this.pointSelected ? 0 : d.value - sampleData[point].items[i].data[j].value;
                d.prev = index === 0 && !this.pointSelected ? d.value : sampleData[point].items[i].data[j].value;
                d.stepInc = index === 0 && !this.pointSelected ? 0 : diff / 70;
            });
        });
    }

    createChartBase(): void {
        const polygon = new PIXI.Graphics() as any;
        this.pixiContainer.addChild(polygon);
        let radius = 0;
        const lines = new PIXI.Graphics();
        this.pixiContainer.addChild(lines);
        const step = (Math.PI * 2) / 5;
        const start = (2 * Math.PI / 4);
        for (let i = 0; i < 5; i++) {
            polygon.lineStyle(1, 0xffffff, 0.2)
                .drawRegularPolygon(this.width / 2, this.height / 2, radius += 45, 5, 0);
            lines.lineStyle(1, 0xffffff, 0.2)
                .moveTo(this.width / 2, this.height / 2)
                .lineTo(
                    (this.width / 2) + Math.cos(start + (step * i)) * 225,
                    (this.height / 2) - Math.sin(start + (step * i)) * 225
                );
        }
    }

    onAssetsLoaded(): void {
        this.pixiContainer = new PIXI.Container();
        this.pixiApp.stage.addChild(this.pixiContainer);
        this.g = new PIXI.Graphics();
        this.pixiContainer.addChild(this.g);
        this.ticker.start();
    }

    drawPolygons(data, color): void {
        const step = (Math.PI * 2) / 5;
        const start = (2 * Math.PI / 4);
        const points = [];
        for (let i = 0; i < 5; i++) {
            const x = (this.width / 2) + Math.cos(start - (step * i)) * data[i].prev;
            const y = (this.height / 2) - Math.sin(start - (step * i)) * data[i].prev;
            points.push(x);
            points.push(y);
            const vertex = new PIXI.Graphics()
                .lineStyle(1.5, color)
                .beginFill(color, 1)
                .drawCircle(x, y, 2)
                .endFill();
            this.vertices.push(vertex);
            this.pixiContainer.addChild(vertex);
        }
        this.g.drawPolygon(points);
    }

    doTicking(): void {
        if (this.currStep === this.totalSteps && this.interval === 80) {
            this.ticker.stop();
        } else if (this.interval === 80) {
            if (this.pointSelected) { this.ticker.stop(); }
            else {
                this.createDataObj(this.currStep);
                this.currStep++;
                this.interval = 0;
            }
        } else {
            this.interval++;
            this.g.clear();
            this.vertices.forEach((vertex) => {
                vertex.clear();
            });
            this.currTraffic.forEach((t, i) => {
                t.data.forEach(d => {
                    if ((Math.sign(d.stepInc) === 1 && d.prev < d.value) || (Math.sign(d.stepInc) === -1 && d.prev > d.value)) {
                        d.prev += d.stepInc;
                    }
                });
                this.g.lineStyle(1, this.colors[i]);
                this.g.beginFill(this.colors[i], 0.2);
                this.drawPolygons(t.data, this.colors[i]);
            });
        }
    }

    replayAnimation(): void {
        this.createDataObj(0);
        this.interval = 0;
        this.currStep = 1;
        this.pointSelected = 0;
        this.ticker.start();
    }

    sliderChange(val): void {
        this.g.clear();
        this.vertices.forEach((vertex) => {
            vertex.clear();
        });
        this.pointSelected = this.currStep;
        this.createDataObj(val - 1);
        this.interval = 0;
        this.currStep = val;
        this.ticker.start();
    }
}
