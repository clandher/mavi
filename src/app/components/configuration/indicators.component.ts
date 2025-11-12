import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { buildUrl } from '@app/core/base-http';
import { CommonModule } from '@angular/common';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  imports: [CommonModule, BaseChartDirective],
  providers: [
    provideCharts(withDefaultRegisterables()),
  ],
})
export class IndicatorsComponent implements OnInit {
  activitiesByType: any[] = [];
  paymentsSummary: any = {};
  observationsByStudent: any[] = [];
  studentsByCategory: any[] = [];
  recurrentActivities: any[] = [];
  userGrowth: any[] = [];
  schoolsRegistered: any = {};

  chargesSummary: any = {};
  discountsSummary: any = {};
  financialSummaryByDate: any = {};

  financialChartLabels: string[] = [];
  financialChartData: any[] = [];
  financialChartOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Resumen financiero por fecha' }
    },
    scales: {
      y: {
        ticks: {
          callback: function(tickValue: string | number) {
            const num = typeof tickValue === 'number' ? tickValue : Number(tickValue);
            return '$' + num.toLocaleString('es-MX', { minimumFractionDigits: 2 });
          }
        }
      }
    }
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchActivitiesByType();
    this.fetchPaymentsSummary();
    this.fetchObservationsByStudent();
    this.fetchStudentsByCategory();
    this.fetchChargesSummary();
    this.fetchDiscountsSummary();
    this.fetchFinancialSummaryByDate();
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

  fetchChargesSummary() {
    this.http.get(buildUrl('indicators/charges-summary')).subscribe((data: any) => {
      this.chargesSummary = data;
    });
  }

  fetchDiscountsSummary() {
    this.http.get(buildUrl('indicators/discounts-summary')).subscribe((data: any) => {
      this.discountsSummary = data;
    });
  }

  fetchFinancialSummaryByDate() {
    this.http.get(buildUrl('indicators/financial-summary-by-date')).subscribe((data: any) => {
      this.financialSummaryByDate = data;
      this.prepareFinancialChartData();
    });
  }

  prepareFinancialChartData() {
    const payments = this.financialSummaryByDate.payments || [];
    const charges = this.financialSummaryByDate.charges || [];
    const discounts = this.financialSummaryByDate.discounts || [];

    // Unir todas las fechas únicas
    const allDates = Array.from(new Set([
      ...payments.map((p: any) => p.date),
      ...charges.map((c: any) => c.date),
      ...discounts.map((d: any) => d.date)
    ])).sort();

    this.financialChartLabels = allDates;

    // Mapear los totales por fecha
    const paymentsMap = Object.fromEntries(payments.map((p: any) => [p.date, p.paymentsTotal]));
    const chargesMap = Object.fromEntries(charges.map((c: any) => [c.date, c.chargesTotal]));
    const discountsMap = Object.fromEntries(discounts.map((d: any) => [d.date, d.discountsTotal]));

    this.financialChartData = [
      {
        label: 'Pagos',
        data: allDates.map(date => paymentsMap[date] || 0),
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66,165,245,0.2)',
        fill: false,
      },
      {
        label: 'Cargos',
        data: allDates.map(date => chargesMap[date] || 0),
        borderColor: '#66BB6A',
        backgroundColor: 'rgba(102,187,106,0.2)',
        fill: false,
      },
      {
        label: 'Descuentos',
        data: allDates.map(date => discountsMap[date] || 0),
        borderColor: '#FFA726',
        backgroundColor: 'rgba(255,167,38,0.2)',
        fill: false,
      }
    ];
  }


}