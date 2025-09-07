import { Component, Input, OnInit } from '@angular/core';


import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentActivityHttp } from 'src/app/core/student-activity-http'; // importa tu nueva clase
import { HttpClient } from '@angular/common/http';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";
import { StudentActivity } from '@app/core/dto';

@Component({
  standalone: true,
  templateUrl: './student-activities.component.html',
  imports: [CommonModule, CurrencyMXPipe],
  providers: [HttpClient]
})
export class StudentActivitiesComponent implements OnInit {
  activities: StudentActivity[] = [];
  loading = true;
  private studentActivityHttp: StudentActivityHttp;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.studentActivityHttp = new StudentActivityHttp(this.http);
  }

  ngOnInit() {
    const studentId = this.route.parent!.snapshot.paramMap.get('id');
    this.studentActivityHttp.getByStudent(+studentId!)
      .subscribe({
        next: (data) => {
          this.activities = data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  unsubscribeActivity(studentActivity: StudentActivity) {
    this.studentActivityHttp.unsubscribe(studentActivity.id).subscribe({
      next: () => {
        // this.activities = this.activities.filter(act => act.id !== studentActivityId);
        studentActivity.unsubscribed = true;
        studentActivity.unsubscribedDate = new Date();

      },
      error: () => {
        // Aquí podrías mostrar un toastr de error si lo deseas
      }
    });
  }
}
