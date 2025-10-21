import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { buildUrl } from '@app/core/base-http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  imports: [CommonModule],
})
export class IndicatorsComponent implements OnInit {
  activitiesByType: any[] = [];
  paymentsSummary: any = {};
  observationsByStudent: any[] = [];
  studentsByCategory: any[] = [];
  recurrentActivities: any[] = [];
  userGrowth: any[] = [];
  schoolsRegistered: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchActivitiesByType();
    this.fetchPaymentsSummary();
    this.fetchObservationsByStudent();
    this.fetchStudentsByCategory();
  }

  fetchActivitiesByType() {
    this.http.get(buildUrl('indicators/activities-by-type')).subscribe((data: any) => {
      this.activitiesByType = data;

      console.log('Activities by Type:', this.activitiesByType);
    });
  }

  fetchPaymentsSummary() {
    this.http.get(buildUrl('indicators/payments-summary')).subscribe((data: any) => {
      this.paymentsSummary = data;
    });
  }

  fetchObservationsByStudent() {
    this.http.get(buildUrl('indicators/observations-by-student')).subscribe((data: any) => {
      this.observationsByStudent = data;
    });
  }

  fetchStudentsByCategory() {
    this.http.get(buildUrl('indicators/students-by-category')).subscribe((data: any) => {
      this.studentsByCategory = data;
    });
  }


}