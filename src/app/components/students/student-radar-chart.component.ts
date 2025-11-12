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
    public student: Student | undefined = undefined;


    constructor(private studentService: StudentService) { }


    ngAfterViewInit(): void {
        this.studentService.student().pipe(filter(student => !!student)).subscribe(student => {
            this.student = student;
        });
    }

    radarType: ChartType = 'radar';
    radarOptions: ChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: '#fff', } },
            title: { display: true, text: 'Desempeño del estudiante', color: '#fff' }
        },
        scales: {
            r: {
                angleLines: { color: '#fff' }, // líneas radiales
                grid: { color: '#fff' }, // líneas de fondo
                pointLabels: { color: '#fff', font: { size: 14 }, display: true }, // etiquetas
                ticks: {
                        font: { size: 11 },
                        color: '#1cf100ff',
                        backdropColor: 'rgba(0, 0, 0, 0.9)',
                        stepSize: 10,
                }, // valores sin fondo
            }
        }
    };

    radarLabels: string[] = [
        'Comunicación',
        'Trabajo en equipo',
        'Liderazgo',
        'Creatividad',
        'Responsabilidad'
    ];

    get radarDatasets() {
        // Valores default en punto medio (ejemplo: 50)
        const defaultRadar = {
            communication: 50,
            teamwork: 50,
            leadership: 50,
            creativity: 50,
            responsibility: 50
        };
        const radar = this.student?.radar ?? defaultRadar;
        const data = [
            radar.communication ?? defaultRadar.communication,
            radar.teamwork ?? defaultRadar.teamwork,
            radar.leadership ?? defaultRadar.leadership,
            radar.creativity ?? defaultRadar.creativity,
            radar.responsibility ?? defaultRadar.responsibility
        ];
        return [{
            label: this.student?.name || 'Estudiante',
            data,
            fill: true,
        }];
    }
}
