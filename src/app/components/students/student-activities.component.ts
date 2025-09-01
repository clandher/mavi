import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentActivityHttp } from 'src/app/core/student-activity-http'; // importa tu nueva clase
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  templateUrl: './student-activities.component.html',
  imports: [CommonModule],
  providers: [HttpClient]
})
export class StudentActivitiesComponent implements OnInit {
  activities: any[] = [];
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
}
