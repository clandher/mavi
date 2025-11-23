import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { StudentService } from '@app/core/student.service';
import { filter, switchMap } from 'rxjs';
import { Student } from '@app/core/dto';
import { buildUrl } from '@app/core/base-http';
import { FormGroupComponent } from "../form-group/form-group.component";
import { GraphRadarComponent, Radar } from '../graph-radar/graph-radar.component';
import { FormArray, FormBuilder } from '@angular/forms';

@Component({
    selector: 'app-student-radars',
    standalone: true,
    imports: [CommonModule, FormGroupComponent, GraphRadarComponent],
    providers: [
        provideCharts(withDefaultRegisterables()),
    ],
    templateUrl: './student-radars.component.html',
})
export class StudentRadarsComponent {

    public students: Student[] = [];
    public selectedCompareStudentId: number | null = null;
    public compareStudent: Student | undefined = undefined;

    public student: Student | undefined = undefined;
    public radars: Radar[] = [];
    public selectedRadar: Radar | null = null;

    public items: FormArray | null = null;

    constructor(
        private studentService: StudentService,
        private http: HttpClient,
        private fb: FormBuilder,
    ) {

        this.items = this.fb.array([]);

        this.http.get<Student[]>(buildUrl('students')).subscribe(students => {
            this.students = students;
        });

        this.http.get<Radar[]>(buildUrl('radars')).pipe(switchMap(radars => {
            this.radars = radars;
            return this.studentService.student().pipe(filter(student => !!student));
        })).subscribe(student => {
            this.student = student;
            this.selectRadar(this.radars[0]);
        });
    }

    onRadarValueChanged(event: { item: any, action: 'increment' | 'decrement' }) {
        if (!this.student || !this.student.id || !this.selectedRadar || !this.items) return;

        const updatedRadar: any = {};
        this.items.controls.forEach((group: any) => {
            const key = group.get('key')?.value;
            const value = group.get('value')?.value;
            updatedRadar[key] = value;
        });

        if (!this.student.radars) {
            this.student.radars = {};
        }

        this.student.radars[this.selectedRadar.key] = updatedRadar;
        const radarsPayload = this.student.radars;
        this.http.patch(buildUrl(`students/${this.student.id}`), { radars: radarsPayload }).subscribe();
    }


    public selectRadar(radar: Radar) {

        if (!this.student) { return };

        this.selectedRadar = radar;
        this.items?.clear();

        const studentRadar = this.student.radars?.[radar.key as keyof typeof this.student.radars];

        radar.items.forEach(item => {
            let value = item.value;
            if (studentRadar && studentRadar[item.key as keyof typeof studentRadar] !== undefined) {
                value = studentRadar[item.key as keyof typeof studentRadar];
            }

            this.items?.push(this.fb.group({
                key: [item.key],
                description: [item.description],
                value: [value]
            }));
        });
    }

    public selectCompareStudent($event: Event) {
        const id = Number(($event.target as HTMLSelectElement).value);
        this.selectedCompareStudentId = id;
        if (id && this.students.length) {
            const found = this.students.find(s => s.id === id);
            if (found) {
                // Si el estudiante no tiene radars, inicialízalos si es necesario
                if (!found.radars) {
                    found.radars = {};
                }
                this.compareStudent = found;
            } else {
                this.compareStudent = undefined;
            }
        } else {
            this.compareStudent = undefined;
        }
    }

    public getCompareDatasets(): any[] {
        if (this.compareStudent && this.selectedRadar) {
            const radarKey = this.selectedRadar ? this.selectedRadar.key : '';
            const compareData = this.selectedRadar.items.map(item => {
                const radars = this.compareStudent && this.compareStudent.radars ? this.compareStudent.radars : {};
                const radarObj = radarKey ? radars[radarKey] ?? {} : {};
                return radarObj[item.key] !== undefined ? radarObj[item.key] : 50;
            });
            return [{
                label: this.compareStudent.name,
                data: compareData,
                borderColor: 'red',
                backgroundColor: 'rgba(255,0,0,0.2)',
                pointBackgroundColor: 'red',
                pointBorderColor: 'red',
                fill: true
            }];
        }
        return [];
    }

}
