import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-particle',
    templateUrl: './particle.component.html',
    styleUrls: ['./particle.component.scss']
})
export class ParticleComponent implements OnInit {
    @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasSphere', { static: true }) canvasSphere: ElementRef<HTMLCanvasElement>;
    dpi = window.devicePixelRatio;
    radians = (360 / 5) * (Math.PI / 180);
    arc = ((2 * Math.PI) / 5);
    context;
    numDots;
    n;
    centerPt = { x: 500, y: 500 };
    dots = [];
    radius = 0;
    size = 4;
    minRad = 250;
    maxRad = 400;
    constructor() {
    }

    ngOnInit(): void {
        this.context = this.canvas.nativeElement.getContext('2d');
        this.createParicles();
        this.fix_dpi();
        this.drawSphere();
    }

    createParicles(): void {
        for (let i = this.minRad, tot = 12; i <= this.maxRad; i += 50, tot += 2) {
            this.numDots = this.n = tot;
            const angle = (2 * Math.PI) / this.numDots;
            const offset = tot * 2;
            let prevAngle = 0;
            while (this.n--) {
                this.dots.push({
                    currentRadius: 90,
                    finalRadius: i,
                    step: (i - 90) / 100,
                    currentAngle: angle + prevAngle,
                    finalAngle: angle + prevAngle,
                    speed: (i - 90) / 100,
                    fillColor: 'skyblue',
                    isReverse: false
                });
                this.dots.push({
                    currentRadius: 90,
                    finalRadius: i,
                    step: (i - 90) / 100,
                    currentAngle: angle + prevAngle + offset,
                    finalAngle: angle + prevAngle + offset,
                    speed: (i - 90) / 100,
                    fillColor: 'green',
                    isReverse: false
                });
                prevAngle += angle;
            }
        }
        this.drawPoints();
    }

    drawPoints(): void {
        this.n = this.dots.length - 1;
        let dX;
        let dY;
        this.context.clearRect(0, 0, 1000, 1000);
        while (this.n--) {
            const currDot = this.dots[this.n];
            dX = this.centerPt.x + Math.sin(currDot.currentAngle) * currDot.currentRadius;
            dY = this.centerPt.y + Math.cos(currDot.currentAngle) * currDot.currentRadius;

            if (currDot.currentRadius <= currDot.finalRadius && !currDot.isReverse) {
                currDot.currentAngle += 0.01;
                currDot.currentRadius += currDot.step;
            }
            else if (currDot.currentAngle > currDot.finalAngle + 0.5) {
                currDot.currentAngle -= 0.015;
                this.size = this.size < 0 ? 0 : this.size - 0.0002;
            }
            else if (currDot.currentRadius >= 0) {
                currDot.isReverse = true;
                currDot.currentAngle -= 0.05;
                currDot.currentRadius -= currDot.step * 2;
                this.size = this.size < 0 ? 0 : this.size - 0.0005;
            }

            this.context.fillStyle = currDot.fillColor;
            this.context.fillRect(dX, dY, this.size, this.size);
        }
        if (!(this.dots[this.n + 1].isReverse && this.dots[this.n + 1].currentRadius <= 0)) {
            window.requestAnimationFrame(this.drawPoints.bind(this));
        }
    }

    drawSphere(): void {
        const context = this.canvasSphere.nativeElement.getContext('2d');
        const gradient = context.createRadialGradient(10, 10, 50, 40, 0, 200);
        gradient.addColorStop(0, 'darkgrey');
        gradient.addColorStop(1, '#404040');
        context.beginPath();
        context.fillStyle = gradient;
        context.arc(120, 120, 120, 0, 2 * Math.PI);
        context.fill();
    }

    fix_dpi(): void {
        let styleHeight: any = +getComputedStyle(this.canvasSphere.nativeElement).getPropertyValue('height').slice(0, -2);
        let styleWidth: any = +getComputedStyle(this.canvasSphere.nativeElement).getPropertyValue('width').slice(0, -2);
        this.canvasSphere.nativeElement.setAttribute('height', (styleHeight * this.dpi).toString());
        this.canvasSphere.nativeElement.setAttribute('width', (styleWidth * this.dpi).toString());
        styleHeight = +getComputedStyle(this.canvas.nativeElement).getPropertyValue('height').slice(0, -2);
        styleWidth = +getComputedStyle(this.canvas.nativeElement).getPropertyValue('width').slice(0, -2);
        this.canvas.nativeElement.setAttribute('height', (styleHeight * this.dpi).toString());
        this.canvas.nativeElement.setAttribute('width', (styleWidth * this.dpi).toString());
    }
}
