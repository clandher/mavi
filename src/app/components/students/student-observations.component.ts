import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { StudentObservation } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { SubmitComponent } from "../submit/submit.component";
import { ObservationsComponent } from '../observations';
import { ModalService } from '@app/core/modal.service';

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, SubmitComponent],
	templateUrl: './student-observations.component.html',
	providers: []
})

export class StudentObservationsComponent implements OnInit {

	studentId: number | null = null;
	selectedTab: 'observations' | 'timeObservations' = 'observations';
	studentObservationsAPI: BaseHttp;
	timeObservations: StudentObservation[] = [];

	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private modalService: ModalService,
	) {
		this.studentId = Number(this.route.parent!.snapshot.paramMap.get('id'));
		const queryString = RequestQueryBuilder.create({
			search: { studentId: this.studentId },
		}).query();


		this.studentObservationsAPI = new BaseHttp(`student-observations?${queryString}`, this.http);

	}

	ngOnInit() {
		this.studentObservationsAPI.get<StudentObservation[]>().subscribe((data: StudentObservation[]) => {
			this.timeObservations = data.map(obs => ({ ...obs, originalObservation: obs.observation }));
		});
	}
	saveObservation(obs: StudentObservation): Promise<void> {
		return this.http.patch(buildUrl(`student-observations/${obs.id}`), { observation: obs.observation })
			.toPromise()
			.then(() => {
				obs.originalObservation = obs.observation;
			})
			.catch((err) => {
				// Manejo de errores
			});
	}

	resetObservation(obs: StudentObservation) {
		obs.observation = obs.originalObservation || '';
	}

	deleteObservation(obs: StudentObservation) {
		this.http.delete(buildUrl(`student-observations/${obs.id}`)).subscribe({
			next: () => {
				this.timeObservations = this.timeObservations.filter(o => o.id !== obs.id);
			},
			error: (err) => {
				console.error('Error al eliminar observación', err);
			}
		});
	}

	public showObservations() {
		this.modalService.open({
			component: ObservationsComponent, title: 'Observaciones', size: 'xl',
			inputs: { studentId: this.studentId }
		}).subscribe((result: boolean) => {
			if (result) {
				this.studentObservationsAPI.get<StudentObservation[]>().subscribe((data: StudentObservation[]) => {
					this.timeObservations = data.map(obs => ({ ...obs, originalObservation: obs.observation }));
				});
			}
		});
	}
}
