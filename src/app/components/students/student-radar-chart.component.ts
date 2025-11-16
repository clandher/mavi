import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartOptions, ChartType } from 'chart.js';
import { CommonModule } from '@angular/common';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { StudentService } from '@app/core/student.service';
import { filter } from 'rxjs';
import { Student } from '@app/core/dto';
import { buildUrl } from '@app/core/base-http';
import { FormGroupComponent } from "../form-group/form-group.component";

export type Radars = { [key: string]: { label: string, key: string, offsetX?: number, offsetY?: number, value?: number }[] };

const radars: Radars = {
    soft: [
        { label: 'Comunicación', key: 'communication', offsetX: 0, offsetY: 0, value: 50 },
        { label: 'Trabajo en equipo', key: 'teamwork', offsetX: 60, offsetY: -5, value: 50 },
        { label: 'Liderazgo', key: 'leadership', offsetX: 50, offsetY: 0, value: 50 },
        { label: 'Creatividad', key: 'creativity', offsetX: -50, offsetY: 0, value: 50 },
        { label: 'Responsabilidad', key: 'responsibility', offsetX: -50, offsetY: -5, value: 50 }
    ],
    technical: [
        { label: 'Pase', key: 'pass', offsetX: 0, offsetY: 0, value: 50 },
        { label: 'Tiro', key: 'shoot', offsetX: 60, offsetY: -5, value: 50 },
        { label: 'Regate', key: 'dribble', offsetX: 50, offsetY: 0, value: 50 },
        { label: 'Defensa', key: 'defense', offsetX: -50, offsetY: 0, value: 50 },
        { label: 'Velocidad', key: 'speed', offsetX: -50, offsetY: -5, value: 50 }
    ]
};

export interface StudentView extends Student {
    radarsData: Radars
}

@Component({
    selector: 'app-student-radar-chart',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, FormGroupComponent],
    providers: [
        provideCharts(withDefaultRegisterables()),
    ],
    templateUrl: './student-radar-chart.component.html',
})
export class StudentRadarChartComponent {
    public students: StudentView[] = [];
    public selectedCompareStudentId: number | null = null;
    public compareStudent: StudentView | undefined = undefined;

    public student: StudentView | undefined = undefined;
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
    public radarKeys: string[] = Object.keys(radars);
    public selectedRadar: string = this.radarKeys[0];
    public buttons: { left: string, top: string }[] = [];

    constructor(private studentService: StudentService, private http: HttpClient) {
        // Fetch all students for comparison
        this.http.get<StudentView[]>(buildUrl('students')).subscribe(students => {
            this.students = students;
        });
    }

    get labels() {
        return this.student!.radarsData[this.selectedRadar].map(item => item.label);
    }


    get datasets() {
        const data = this.student!.radarsData[this.selectedRadar].map(item =>
            this.student?.radars?.[this.selectedRadar]?.[item.key] ?? 50
        );
        const datasets: any[] = [
            {
                label: this.student?.name || 'Estudiante',
                data,
                fill: true,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0,123,255,0.2)',
                pointBackgroundColor: '#007bff',
                pointBorderColor: '#007bff'
            }
        ];
        if (this.compareStudent && this.compareStudent.id !== this.student?.id) {
            const compareData = this.compareStudent.radarsData[this.selectedRadar].map(item =>
                this.compareStudent?.radars?.[this.selectedRadar]?.[item.key] ?? 50
            );
            datasets.push({
                label: this.compareStudent?.name || 'Comparación',
                data: compareData,
                fill: true,
                borderColor: 'red',
                backgroundColor: 'rgba(255,0,0,0.2)',
                pointBackgroundColor: 'red',
                pointBorderColor: 'red'
            });
        }
        return datasets;
    }


    ngAfterViewInit(): void {
        this.studentService.student().pipe(filter(student => !!student)).subscribe(student => {
            this.student = student as StudentView;


            if (!this.student.radars) {
                this.student.radars = {
                    soft: { communication: 50, teamwork: 50, leadership: 50, creativity: 50, responsibility: 50 },
                    technical: { pass: 50, shoot: 50, dribble: 50, defense: 50, speed: 50 }
                }
            }

            this.student.radarsData = radars;

            this._initRadars();
        });
    }


    public increment(key: string) {
        if (!this.student || !this.student.radars) return;
        const radar = this.student.radars[this.selectedRadar];
        if (radar && radar[key] < 100) {
            radar[key] += 5;
            this.patchStudentRadars();
        }
    }


    public decrement(key: string) {
        if (!this.student || !this.student.radars) return;
        const radar = this.student.radars[this.selectedRadar];
        if (radar && radar[key] > 0) {
            radar[key] -= 5;
            this.patchStudentRadars();
        }
    }
    /**
     * Realiza un PATCH al API de student mandando solo la propiedad radars
     */
    private patchStudentRadars() {
        if (!this.student || !this.student.id) return;
        this.http.patch(buildUrl(`students/${this.student.id}`), { radars: this.student.radars }).subscribe();
    }

    public selectRadar(radar: string) {
        this.selectedRadar = radar;
        this._initRadars();
    }

    public selectCompareStudent($event: Event) {
        const id = Number(($event.target as HTMLSelectElement).value);
        this.selectedCompareStudentId = id;
        if (id && this.students.length) {
            const found = this.students.find(s => s.id === id);
            if (found) {
                // Ensure radarsData is set for compare student
                if (!found.radarsData) {
                    found.radarsData = radars;
                }
                if (!found.radars) {
                    found.radars = {
                        soft: { communication: 50, teamwork: 50, leadership: 50, creativity: 50, responsibility: 50 },
                        technical: { pass: 50, shoot: 50, dribble: 50, defense: 50, speed: 50 }
                    };
                }
                this.compareStudent = found;
            } else {
                this.compareStudent = undefined;
            }
        } else {
            this.compareStudent = undefined;
        }
    }

    private _initRadars() {
        if (!this.student) { return; }

        const center = 180;
        const radius = 180;
        const items = this.student.radarsData[this.selectedRadar];
        const n = items.length;
        this.buttons = items.map((item, i) => {
            const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
            const offsetX = item.offsetX || 0;
            const offsetY = item.offsetY || 0;
            return {
                left: (center + radius * Math.cos(angle) + offsetX) + 'px',
                top: (center + radius * Math.sin(angle) + offsetY) + 'px'
            };
        });
    }
}
