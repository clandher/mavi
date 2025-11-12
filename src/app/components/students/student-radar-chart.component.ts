import { Component, Input } from '@angular/core';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { CommonModule } from '@angular/common';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { StudentService } from '@app/core/student.service';
import { filter } from 'rxjs';
import { Student } from '@app/core/dto';

@Component({
    selector: 'app-student-radar-chart',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    providers: [
        provideCharts(withDefaultRegisterables()),
    ],
    templateUrl: './student-radar-chart.component.html',
})
export class StudentRadarChartComponent {
    // Claves para mapear los labels con los valores editables
    keys: (keyof typeof this.editableRadar)[] = [
        'communication',
        'teamwork',
        'leadership',
        'creativity',
        'responsibility'
    ];
    public student: Student | undefined = undefined;
    // Posiciones absolutas para los botones alrededor del canvas
    buttonPositions: { left: string, top: string }[] = [];


    constructor(private studentService: StudentService) { }


    ngAfterViewInit(): void {
        this.studentService.student().pipe(filter(student => !!student)).subscribe(student => {
            this.student = student;
        });
    }

    radarType: ChartType = 'radar';
    radarOptions: ChartOptions = {
        responsive: true,
        animation: false,
        plugins: {
            legend: {
                display: false  ,
                onClick: () => {
                    console.log('Legend clicked');
                },
                onHover: () => {
                    console.log('Legend hovered');
                },

                position: 'top', labels: {
                    color: '#ff0000ff',
                    // color: '#fff',

                }
            },

        },
        scales: {
            r: {
                min: 0,
                max: 100,
                angleLines: { color: '#fff' }, // líneas radiales
                grid: { color: '#fff' }, // líneas de fondo
                pointLabels: { color: '#fff', font: { size: 11 }, display: true }, // etiquetas
                ticks: {
                    display: false,
                    font: { size: 11 },
                    color: '#1cf100ff',
                    backdropColor: 'rgba(0, 0, 0, 0.9)',
                    stepSize: 10,
                }, // valores sin fondo
            }
        }
    };

    radarLabels: { label: string, offsetX?: number, offsetY?: number }[] = [
        { label: 'Comunicación', offsetX: 0, offsetY: 0 },
        { label: 'Trabajo en equipo', offsetX: 60, offsetY: -5 },
        { label: 'Liderazgo', offsetX: 50, offsetY: 0 },
        { label: 'Creatividad', offsetX: -50, offsetY: 0 },
        { label: 'Responsabilidad', offsetX: -50, offsetY: -5 }
    ];

    get radarLabelsText() {
        return this.radarLabels.map(item => item.label);
    }

    // Estado editable para los valores del radar
    editableRadar = {
        communication: 50,
        teamwork: 50,
        leadership: 50,
        creativity: 50,
        responsibility: 50
    };

    ngOnInit(): void {
        // Inicializa editableRadar con los valores del estudiante si existen
        if (this.student?.radar) {
            this.editableRadar = { ...this.editableRadar, ...this.student.radar };
        }
        // Calcula las posiciones de los botones en pentágono, sumando offset x/y de cada label
        const center = 199; // centro del canvas
        const radius = 150; // radio del pentágono
        const n = this.radarLabels.length;
        this.buttonPositions = this.radarLabels.map((item, i) => {
            const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
            const offsetX = item.offsetX || 0;
            const offsetY = item.offsetY || 0;
            return {
                left: (center + radius * Math.cos(angle) + offsetX) + 'px',
                top: (center + radius * Math.sin(angle) + offsetY) + 'px'
            };
        });
    }

    get radarDatasets() {
        const data = [
            this.editableRadar.communication,
            this.editableRadar.teamwork,
            this.editableRadar.leadership,
            this.editableRadar.creativity,
            this.editableRadar.responsibility
        ];
        return [{
            label: this.student?.name || 'Estudiante',
            data,
            fill: true,
        }];
    }

    // Métodos para aumentar/disminuir valores
    incrementRadar(key: keyof typeof this.editableRadar) {
        if (this.editableRadar[key] < 100) {
            this.editableRadar[key] += 5;
        }
    }
    decrementRadar(key: keyof typeof this.editableRadar) {
        if (this.editableRadar[key] > 0) {
            this.editableRadar[key] -= 5;
        }
    }
}
