import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-technical.component.html',
  providers: []
})
export class StudentTechnicalComponent {

  studentId: string | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
  ) {

    this.studentId = this.route.parent!.snapshot.paramMap.get('id');

  }

}

