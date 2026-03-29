import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { Student } from './dto';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private refreshSubject = new Subject<void>();
  private studentSubject = new BehaviorSubject<Student | undefined>(undefined);

  get refreshNotifier() {
    return this.refreshSubject.asObservable();
  }

  notifyRefresh() {
    this.refreshSubject.next();
  }

  setStudent(student: Student | undefined) {
    this.studentSubject.next(student);
  }

  student() {
    return this.studentSubject.asObservable();
  }
}