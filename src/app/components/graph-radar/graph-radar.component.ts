import { Component, Input, Output, EventEmitter } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule } from '@angular/forms';


export interface RadarItem {
    key: string, description: string, value: number
}

export interface RadarItemForm {
    key: AbstractControl<string>,
    description: AbstractControl<string>,
    value: AbstractControl<number>
}

export interface Radar {
    id: number;
    key: string;
    description: string;
    items: RadarItem[];
    lock?: boolean;
}

@Component({
    selector: 'app-graph-radar',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, FormsModule],
    templateUrl: './graph-radar.component.html',
    styleUrls: ['./graph-radar.component.scss']
})
export class GraphRadarComponent {
    @Input() value!: FormArray<FormGroup<RadarItemForm>>;
    @Input() compareDatasets: { label: string, data: number[], borderColor?: string, backgroundColor?: string }[] = [];
    @Output() valueChanged = new EventEmitter<{ item: Partial<RadarItem>, action: 'increment' | 'decrement' }>();

    public buttons: { left: string, top: string }[] = [];


    public radarOptions: ChartOptions = {
        responsive: true,
        animation: false,
        plugins: {
            legend: {
                display: false,
                labels: { color: '#ff0000ff' }
            },
        },
        scales: {
            r: {
                min: 0,
                max: 100,
                angleLines: { color: '#fff' },
                grid: { color: '#fff' },
                pointLabels: {
                    display: false,
                    color: '#fff', font: { size: 11 },
                },
                ticks: { display: false, },
            }
        }
    };

    get datasets() {
        const data = this.value.controls.map(control => control.value.value);
        const datasets: any[] = [
            {
                label: '',
                data,
                fill: true,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0,123,255,0.2)',
                pointBackgroundColor: '#007bff',
                pointBorderColor: '#007bff'
            }
        ];
        if (this.compareDatasets?.length) {
            datasets.push(...this.compareDatasets);
        }
        return datasets;
    }

    get labels() {
        return this.value.controls.map(control => control.value.description);
    }

    ngOnChanges() {
        this._initRadars();
    }

    ngOnInit() {
        this.value.valueChanges.subscribe(() => {
            this._initRadars();
        });
    }

    private _initRadars() {
        const config = { center: 225, radius: 210 };
        const items = this.value.controls;
        this.buttons = items.map((item, i) => {
            const angle = (i * 2 * Math.PI / items.length) - Math.PI / 2;
            return {
                left: ((config.center - 40) + config.radius * Math.cos(angle)) + 'px',
                top: ((config.center - 11) + config.radius * Math.sin(angle)) + 'px'
            };
        });
    }

    public increment(item: FormGroup<RadarItemForm>) {
        if (item.controls.value.value < 100) {
            item.controls['value'].setValue(item.controls.value.value + 5);
            item.markAsDirty();
            this.valueChanged.emit({ item: item.value, action: 'increment' });
        }
    }

    public decrement(item: FormGroup<RadarItemForm>) {
        if (item.controls.value.value > 0) {
            item.controls['value'].setValue(item.controls.value.value - 5);
            item.markAsDirty();
            this.valueChanged.emit({ item: item.value, action: 'decrement' });
        }
    }
}
