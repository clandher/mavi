import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private refreshSubject = new Subject<void>();

  get refreshNotifier() {
    return this.refreshSubject.asObservable();
  }

  notifyRefresh() {
    this.refreshSubject.next();
  }
}