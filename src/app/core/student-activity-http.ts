import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttp, buildUrl } from './base-http';

export class StudentActivityHttp extends BaseHttp {
    constructor(http: HttpClient) {
        super('student-activities', http);
    }

    getWithChargers(id: number): Observable<any> {
        const url = buildUrl(`student-activities/${id}/with-chargers`);
        return this.http.get(url);
    }

    getByStudent(studentId: number): Observable<any> {
        const url = buildUrl(`student-activities/by-student/${studentId}`);
        return this.http.get(url);
    }
}