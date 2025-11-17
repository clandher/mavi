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
import { GraphRadarComponent } from '../graph-radar/graph-radar.component';

export type Radars = { [key: string]: { label: string, key: string, offsetX?: number, offsetY?: number, value?: number }[] };

const radars: Radars = {
    soft: [
        { label: 'Comunicación', key: 'communication', value: 50 },
        { label: 'Trabajo en equipo', key: 'teamwork', value: 50 },
        { label: 'Liderazgo', key: 'leadership', value: 50 },
        { label: 'Creatividad', key: 'creativity', value: 50 },
        { label: 'Responsabilidad', key: 'responsibility', value: 50 },
        { label: 'x', key: 'x', value: 500 },
    ],
    technical: [
        { label: 'Pase', key: 'pass', value: 50 },
        { label: 'Tiro', key: 'shoot', value: 50 },
        { label: 'Regate', key: 'dribble', value: 50 },
        { label: 'Defensa', key: 'defense', value: 50 },
        { label: 'Velocidad', key: 'speed', value: 50 }
    ]
};

export interface StudentView extends Student {
    radarsData: Radars
}

@Component({
    selector: 'app-student-radars',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, FormGroupComponent, GraphRadarComponent],
    providers: [
        provideCharts(withDefaultRegisterables()),
    ],
    templateUrl: './student-radars.component.html',
})
export class StudentRadarsComponent {
    public students: StudentView[] = [];
    public selectedCompareStudentId: number | null = null;
    public compareStudent: StudentView | undefined = undefined;

    public student: StudentView | undefined = undefined;
  
    public radarKeys: string[] = Object.keys(radars);
    public selectedRadar: string = this.radarKeys[0];

    constructor(private studentService: StudentService, private http: HttpClient) {
        // Fetch all students for comparison
        this.http.get<StudentView[]>(buildUrl('students')).subscribe(students => {
            this.students = students;
        });
    }




   


    ngAfterViewInit(): void {
        this.studentService.student().pipe(filter(student => !!student)).subscribe(student => {
            this.student = student as StudentView;


            if (!this.student.radars) {
                this.student.radars = {
                    soft: { communication: 50, teamwork: 50, leadership: 50, creativity: 50, responsibility: 50, x: 100 },
                    technical: { pass: 50, shoot: 50, dribble: 50, defense: 50, speed: 50 }
                }
            }

            this.student.radarsData = radars;

            // this._initRadars();
        });
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
        // this._initRadars();
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

   
}
