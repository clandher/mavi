import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { buildUrl } from '@app/core/base-http';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-technical.component.html',
  providers: []
})

export class StudentTechnicalComponent {
  studentId: string | null = null;

  technicalForm = {
    foot: '',
    position: '',
    height: null,
    weight: null,
    number: null,
    observations: '',
    strengths: '',
    weaknesses: ''
  };

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.studentId = this.route.parent!.snapshot.paramMap.get('id');
    this.getStudent();
  }

  getStudent() {
    if (!this.studentId) return;
    this.http.get<any>(buildUrl(`students/${this.studentId}`)).subscribe({
      next: (student) => {
        if (student.technical) {
          this.technicalForm = { ...this.technicalForm, ...student.technical };
        }
      },
      error: (err) => {
        console.error('Error al obtener datos del estudiante', err);
      }
    });
  }

  onSubmit() {
    if (!this.studentId) return;
    const body = { technical: { ...this.technicalForm } };
    this.http.patch(buildUrl(`students/${this.studentId}`), body).subscribe({
      next: () => {
        // Puedes mostrar un mensaje de éxito o redirigir
      },
      error: (err) => {
        // Manejo de error
        console.error('Error al guardar ficha técnica', err);
      }
    });
  }
}

