import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as _ from 'lodash';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import { sampleData } from './data';

@Component({
    selector: 'app-sankey',
    templateUrl: './sankey.component.html',
    styleUrls: ['./sankey.component.scss']
})

export class SankeyComponent implements OnInit {
    sankey;
    data: DAG;
    width;
    height;
    totalL = 0;
    totalR = 0;
    prevPosL;
    prevPosR;
    parent = [];
    maxHeight;
    maxValue;
    centerPos;
    maxNodeHeight = 80;
    @ViewChild('sankeyCanvas', { static: true }) sankeyCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('sankeyCanvasMini', { static: true }) sankeyCanvasMini: ElementRef<HTMLCanvasElement>;
    constructor() {
    }

    ngOnInit(): void {
        this.data = sampleData;
        this.setDimensions();
        this.fix_dpi();
        this.createMinimap(false, false);
    }

    private setDimensions(): void {
        let totalHeightL = 0;
        let totalHeightR = 0;
        this.totalL = 0;
        this.totalR = 0;
        this.maxValue = Math.max(...this.data.links.map((link) => link.value));
        this.data.links.map(link => {
            if (link.target === 1) {
                totalHeightL += ((link.value / this.maxValue) * this.maxNodeHeight) + 10;
                this.totalL += link.value;
            } else {
                totalHeightR += ((link.value / this.maxValue) * this.maxNodeHeight) + 10;
                this.totalR += link.value;
            }
        });
        this.maxHeight = Math.max(totalHeightL, totalHeightR);
        this.centerPos = this.maxHeight <= 150 ? (this.maxHeight / 2) - 25 : 100;
        document.getElementById('sankey-canvas').style.top = this.centerPos;
        this.height = this.maxHeight;
        this.width = window.innerWidth - 200;
    }

    private createMinimap(drillDown, goBack): void {
        const scrollContainer = document.getElementById('scroll-container');
        const scrollHeight = 800;
        const minimapK = 6;

        d3.selectAll('svg > *').remove();

        const drag = d3.drag()
            .on('start drag', (ev) => scrollContainer.scrollTop = ev.y * minimapK - scrollHeight / 2);

        const svg0 = d3.select(scrollContainer)
            .on('scroll', function (d) {
                slider.attr('y', this.scrollTop);
            })
            .select('svg')
            .style('padding-top', 140)
            .style('padding-bottom', 50)
            .attr('width', this.width)
            .attr('height', this.height);

        svg0.append('g').attr('transform', 'translate(40,0)');

        const svg1 = d3.select('#minimap > svg')
            .attr('viewBox', [0, 0, this.width, this.height].join(' '))
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('width', this.width / minimapK)
            .attr('height', this.height / minimapK)
            .call(drag);

        const slider = svg1.append('rect')
            .attr('class', 'slider-rect')
            .attr('fill', 'white')
            .attr('fill-opacity', 0.2)
            .attr('width', this.width + 200)
            .attr('height', scrollHeight)
            .attr('transform', 'translate(-100,0)');

        this.drawChart(svg0, drillDown, goBack);
        this.drawChart(svg1, drillDown, goBack, true);
        this.drawSphere();
    }

    private drawChart(svg, drillDown, goBack, minimap?): void {
        this.sankey = d3Sankey.sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[200, 0], [this.width - 200, this.height]]);

        const sankeyData = _.cloneDeep(this.data);
        this.sankey(sankeyData);
        this.prevPosL = this.prevPosR = this.centerPos;
        this.drawNodes(svg, sankeyData.nodes, drillDown, goBack, minimap);
        this.drawLinks(svg, sankeyData.links, drillDown, goBack);
    }

    private drawNodes(svg, sankeyNodes, drillDown, goBack, minimap?): void {
        const node = svg.append('g')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .selectAll('g')
            .data(sankeyNodes)
            .enter().append('g');

        node.append('rect')
            .attr('class', 'node')
            .call(d3.drag().on('start', (d) => this.handleDrillDown(d)))
            .attr('x', (d) => d.x0)
            .attr('y', (d) => d.nodeId === 'X' ? minimap && (drillDown || goBack) ? this.centerPos + 50 : this.centerPos : d.y0)
            .attr('height', (d) => d.nodeId === 'X' ? 50 : (d.value / this.maxValue) * this.maxNodeHeight + 1)
            .attr('width', (d) => d.x1 - d.x0)
            .attr('fill', (d) => d.color)
            .attr('cursor', (d) => d.child ? 'pointer' : 'default');

        if (drillDown || goBack) {
            d3.selectAll('.node')
                .filter((d) => d.nodeId !== 'X')
                .style('fill-opacity', 0)
                .transition().duration(1200)
                .style('fill-opacity', 1);
        }

        node.append('text')
            .text((d) => d.name)
            .attr('x', (d) => d.x1 + 20)
            .attr('y', (d) => (d.y1 + d.y0) / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'start')
            .attr('fill', '#bdbdbd')
            .style('font-weight', '100')
            .filter((d) => d.x0 < this.width / 2)
            .attr('x', (d) => d.x0 - 20)
            .attr('text-anchor', 'end')
            .filter((d) => d.nodeId === 'X')
            .attr('text-anchor', 'middle')
            .attr('x', (d) => d.x0 + ((d.x1 - d.x0) / 2))
            .attr('y', (d) => drillDown && minimap ? 240 : 200)
            .attr('font-size', 12)
            .style('fill-opacity', 1)
            .style('letter-spacing', '4px')
            .style('text-transform', 'uppercase');

        node.selectAll('text')
            .filter((d) => d.nodeId !== 'X')
            .style('fill-opacity', 0)
            .transition().duration(1200)
            .style('fill-opacity', 1);
    }

    private drawLinks(svg, sankeyLinks, drillDown, goBack): void {
        svg.append('g')
            .selectAll('path')
            .data(sankeyLinks)
            .enter().append('path')
            .attr('class', 'link')
            .attr('fill-opacity', 0.2)
            .style('fill', (d) => d.color)
            .attr('d', (d) => this.calcLink(d));


        if (drillDown || goBack) {
            this.prevPosL = this.prevPosR = this.centerPos;
            d3.selectAll('.link')
                .attr('d', (d) => this.calcLink(d))
                .attr('fill-opacity', 0)
                .transition().duration(800)
                .attr('fill-opacity', 0.2);
        }
    }

    private calcLink(d, drillDown?, goBack?): string {
        const curvature = 0.6;
        if (d.target.nodeId === 'X') {
            const x0 = d.source.x1;
            const y0 = goBack ? d.source.y1 : d.source.y0;
            const x1 = d.target.x0;
            const y1 = this.prevPosL;
            const y2 = drillDown ? 0 : d.source.y1;
            const xi = d3.interpolateNumber(x0, x1);
            const x2 = xi(curvature);
            const x3 = xi(1 - curvature);
            const nodePerc = drillDown || goBack ? 0 : (d.source.value / this.totalL) * 50;
            this.prevPosL = y1 + nodePerc;
            return 'M' + x0 + ',' + y0
                + 'C' + x2 + ',' + y0
                + ' ' + x3 + ',' + y1
                + ' ' + x1 + ',' + y1
                + 'L' + x1 + ',' + (y1 + nodePerc)
                + 'C' + x3 + ',' + (y1 + nodePerc)
                + ' ' + x2 + ',' + y2
                + ' ' + x0 + ',' + y2;
        } else {
            const x0 = d.target.x0;
            const y0 = goBack ? d.target.y1 : d.target.y0;
            const x1 = d.source.x0 + 15;
            const y1 = this.prevPosR;
            const y2 = drillDown ? 0 : d.target.y1;
            const xi = d3.interpolateNumber(x0, x1);
            const x2 = xi(curvature);
            const x3 = xi(1 - curvature);
            const nodePerc = drillDown || goBack ? 0 : (d.target.value / this.totalR) * 50;
            this.prevPosR = y1 + nodePerc;
            return 'M' + x0 + ',' + y0
                + 'C' + x2 + ',' + y0
                + ' ' + x3 + ',' + y1
                + ' ' + x1 + ',' + y1
                + 'L' + x1 + ',' + (y1 + nodePerc)
                + 'C' + x3 + ',' + (y1 + nodePerc)
                + ' ' + x2 + ',' + y2
                + ' ' + x0 + ',' + y2;
        }
    }

    public handleDrillDown(selected): void {
        if (selected.subject.child) {
            d3.selectAll('.node')
                .transition().duration(600)
                .style('fill-opacity', 0);

            d3.selectAll('.link')
                .transition().duration(600)
                .style('fill-opacity', 0);

            d3.selectAll('text')
                .filter((d) => d.nodeId !== 'X')
                .transition().duration(600)
                .style('fill-opacity', 0);

            setTimeout(() => {
                this.parent.push(this.data);
                this.data = selected.subject.child;
                this.setDimensions();
                this.createMinimap(true, false);
                document.getElementById('sankey-canvas-mini').style.top = '20px';
            }, 600);
        }
    }

    public handleGoBack(): void {
        if (this.parent.length) {
            d3.selectAll('.node')
                .transition()
                .duration(600)
                .style('fill-opacity', 0);

            d3.selectAll('.link')
                .transition()
                .duration(600)
                .style('fill-opacity', 0);

            d3.selectAll('text')
                .filter((d) => d.nodeId !== 'X')
                .transition().duration(600)
                .style('fill-opacity', 0);

            setTimeout(() => {
                this.data = this.parent[this.parent.length - 1];
                this.parent.splice(this.parent.length - 1, 1);
                this.setDimensions();
                this.createMinimap(false, true);
            }, 600);
        }
    }

    private drawSphere(): void {
        const context = this.sankeyCanvas.nativeElement.getContext('2d');
        const gradient = context.createRadialGradient(40, 10, 50, 40, 0, 180);
        gradient.addColorStop(0, '#bdbdbd');
        gradient.addColorStop(1, '#404040');
        context.beginPath();
        context.fillStyle = gradient;
        context.arc(105, 105, 100, 0, 2 * Math.PI);
        context.fill();

        const contextMini = this.sankeyCanvasMini.nativeElement.getContext('2d');
        contextMini.beginPath();
        contextMini.fillStyle = gradient;
        contextMini.arc(15, 15, 15, 0, 2 * Math.PI);
        contextMini.fill();
    }

    private fix_dpi(): void {
        const styleHeight = +getComputedStyle(this.sankeyCanvas.nativeElement).getPropertyValue('height').slice(0, -2);
        const styleWidth = +getComputedStyle(this.sankeyCanvas.nativeElement).getPropertyValue('width').slice(0, -2);
        this.sankeyCanvas.nativeElement.setAttribute('height', (styleHeight * window.devicePixelRatio).toString());
        this.sankeyCanvas.nativeElement.setAttribute('width', (styleWidth * window.devicePixelRatio).toString());

        const styleHeightMini = +getComputedStyle(this.sankeyCanvasMini.nativeElement).getPropertyValue('height').slice(0, -2);
        const styleWidthMini = +getComputedStyle(this.sankeyCanvasMini.nativeElement).getPropertyValue('width').slice(0, -2);
        this.sankeyCanvasMini.nativeElement.setAttribute('height', (styleHeightMini * window.devicePixelRatio).toString());
        this.sankeyCanvasMini.nativeElement.setAttribute('width', (styleWidthMini * window.devicePixelRatio).toString());
    }
}

interface SNodeExtra {
    name: string;
    nodeId: string;
    color: string;
    child?;
}

interface SLinkExtra {
    source: number;
    target: number;
    value: number;
    color: string;
}
type SNode = d3Sankey.SankeyNode<SNodeExtra, SLinkExtra>;
type SLink = d3Sankey.SankeyLink<SNodeExtra, SLinkExtra>;

interface DAG {
    nodes: SNode[];
    links: SLink[];
}
