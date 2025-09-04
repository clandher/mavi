import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttp, buildUrl } from './base-http';

export class StudentPaymentHttp extends BaseHttp {
    constructor(http: HttpClient) {
        super('payments', http);
    }

    getByStudentWithChargers(studentId: number): Observable<any> {
        const url = buildUrl(`payments/by-student/${studentId}/with-chargers`);
        return this.http.get(url);
    }
}