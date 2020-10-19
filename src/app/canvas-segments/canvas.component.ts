import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
    @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('sphereCanvas', { static: true }) sphereCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('textCanvas', { static: true }) textCanvas: ElementRef<HTMLCanvasElement>;
    dpi = window.devicePixelRatio;
    rad = (Math.PI * 2) / 5;
    context;
    radius = 30;
    opacity = 0;
    dataObj = [
        {
            title: 'Only Allowing',
            words: ['22', '22', '22', '22', '22']
        },
        {
            title: 'Blocking',
            words: ['120 Access Attempts', '100 Communications', '74 Communications', '100 C&C Attacks', '50 Lateral Attacks']
        },
        {
            title: 'Attack Surface',
            words: ['44%', '8%', '10%', '8%', '16%']
        }
    ];
    offset = -0.95;
    constructor() {
    }

    ngOnInit(): void {
        this.context = this.canvas.nativeElement.getContext('2d');
        this.fix_dpi();
        this.drawSphere();
        this.drawEqualSegments();
    }

    drawEqualSegments(): void {
        this.context.clearRect(0, 0, 1800, 1500);
        for (let i = 0; i < 5; i++) {
            this.context.beginPath();
            this.context.arc(800, 500, this.radius, (this.rad * i) + 0.05 + this.offset, (this.rad * (i + 1)) - 0.05 + this.offset);
            this.context.strokeStyle = this.createGradient(false);
            this.context.lineWidth = 20;
            this.context.stroke();
        }
        this.radius += 5;
        if (this.radius <= 300) {
            window.requestAnimationFrame(this.drawEqualSegments.bind(this));
        } else {
            this.radius = 30;
            this.context.translate(800, 500);
            const words = ['ROLES', 'INTERNET', 'INTERNAL NETWORK', 'USER GROUPS', 'OTHER SEGMENTS'];
            for (let i = 0; i < 5; i++) {
                this.getCircularText(words[i], 700, (this.rad) * i);
            }
        }
    }

    getCircularText(text, diameter, startAngle): void {
        this.context.save();
        const textHeight = 28;
        const inwardFacing = startAngle <= (Math.PI * 2) / 4 || startAngle >= ((Math.PI * 2) / 4) * 3;
        this.context.font = '18pt' + ' ' + 'Arial';
        if (inwardFacing) {
            text = text.split('').reverse().join('');
        } else {
            startAngle += Math.PI * -1;
        }
        this.context.textBaseline = 'middle';
        this.context.textAlign = 'center';
        this.context.fillStyle = 'white';
        for (const j of text) {
            const charWid = this.context.measureText(j).width;
            startAngle += (charWid / (diameter / 2 - textHeight)) / 2;
        }
        this.context.rotate(startAngle);
        for (const t of text) {
            const charWid = this.context.measureText(t).width;
            this.context.rotate((charWid / 2) / (diameter / 2 - textHeight) * -1);
            this.context.fillText(t, 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2));
            this.context.rotate((charWid / 2) / (diameter / 2 - textHeight) * -1);
        }
        this.context.restore();
    }

    createGradient(unequal): any {
        const gradient = this.context.createLinearGradient(0, 800, 0, 200);
        if (unequal) {
            gradient.addColorStop(0, '#572b9a');
            gradient.addColorStop(1, '#3185e8');
        } else {
            gradient.addColorStop(0, '#0d191e');
            gradient.addColorStop(0.3, '#429855');
            gradient.addColorStop(0.36, '#0d191e');
            gradient.addColorStop(0.6, '#429855');
            gradient.addColorStop(0.92, '#0d191e');
            gradient.addColorStop(1, '#429855');
        }
        return gradient;
    }

    drawSphere(): void {
        const context = this.sphereCanvas.nativeElement.getContext('2d');
        const gradient = context.createRadialGradient(40, 10, 50, 40, 0, 180);
        gradient.addColorStop(0, '#bdbdbd');
        gradient.addColorStop(1, '#404040');
        context.beginPath();
        context.fillStyle = gradient;
        context.arc(105, 105, 45, 0, 2 * Math.PI);
        context.fill();
    }

    fix_dpi(): void {
        const styleHeight: any = +getComputedStyle(this.canvas.nativeElement).getPropertyValue('height').slice(0, -2);
        const styleWidth: any = +getComputedStyle(this.canvas.nativeElement).getPropertyValue('width').slice(0, -2);
        this.canvas.nativeElement.setAttribute('height', (styleHeight * this.dpi).toString());
        this.canvas.nativeElement.setAttribute('width', (styleWidth * this.dpi).toString());
    }

    mouseEnter(index): void {
        if (this.opacity < 1) {
            this.clearCircle(0, 0, 290);
            this.context.globalAlpha = this.opacity;
            this.opacity += 0.1;
            for (let i = 0; i < 5; i++) {
                this.getCircularText(this.dataObj[index].words[i], 500, this.rad * i);
            }
            window.requestAnimationFrame(this.mouseEnter.bind(this, index));
        } else {
            this.context.globalAlpha = 1;
        }
    }

    mouseLeave(): void {
        this.clearCircle(0, 0, 290);
    }

    clearCircle(x, y, radius): void {
        this.context.save();
        this.context.globalCompositeOperation = 'destination-out';
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.context.fill();
        this.context.restore();
    }

}
