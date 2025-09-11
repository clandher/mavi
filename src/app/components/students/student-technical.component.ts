import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { StudentObservation } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-technical.component.html',
  providers: []
})

export class StudentTechnicalComponent implements OnInit {
  studentId: number | null = null;

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
  selectedTab: 'observations' | 'timeObservations' = 'observations';
  studentCategoriesAPI: BaseHttp;
  timeObservations: StudentObservation[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.studentId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    const queryString = RequestQueryBuilder.create({
      search: { studentId: this.studentId },
    }).query();
    this.studentCategoriesAPI = new BaseHttp(`student-observations?${queryString}`, this.http);
    this.getStudent();
  }

  ngOnInit() {


    this.studentCategoriesAPI.get<StudentObservation[]>().subscribe((data: StudentObservation[]) => {
      this.timeObservations = data;
    });
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

  saveObservation(obs: StudentObservation) {
    // Guardar la observación individual
    this.http.patch(buildUrl(`student-observations/${obs.id}`), { observation: obs.observation }).subscribe({
      next: () => {
        // Puedes mostrar un mensaje de éxito
      },
      error: (err) => {
        console.error('Error al guardar observación', err);
      }
    });
  }

  deleteObservation(obs: StudentObservation) {
    // Eliminar la observación individual
    this.http.delete(buildUrl(`student-observations/${obs.id}`)).subscribe({
      next: () => {
        // Elimina la observación del arreglo local
        this.timeObservations = this.timeObservations.filter(o => o.id !== obs.id);
      },
      error: (err) => {
        console.error('Error al eliminar observación', err);
      }
    });
  }
}

