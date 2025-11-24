import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor } from '@angular/common';
import { TutorComponent } from '../tutor/tutor.component';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Student, Tutor } from '@app/core/dto';

@Component({
	selector: 'app-tutors',
	templateUrl: './tutors.component.html',
	styleUrls: ['./tutors.component.scss'],
	imports: [NgIf, NgFor]
})
export class TutorsComponent implements OnDestroy {
	tutors: Tutor[] = [];

	private tutorAPI: BaseHttp;
	private destroy$ = new Subject<void>();

	constructor(
		private modalService: ModalService,
		private http: HttpClient,
	) {
		this.tutorAPI = new BaseHttp('tutors', this.http);
	}

	ngOnInit() {
		this.loadTutors();
	}

	loadTutors(): void {
		this.tutorAPI.get<Tutor[]>().subscribe(
			(data) => {
				this.tutors = data;
			},
			(error) => {
				console.error('Error loading tutors:', error);
			}
		);
	}

	deleteTutor(tutorId: number): void {
		this.tutorAPI.delete<void>(tutorId).subscribe({
			next: () => {
				this.tutors = this.tutors.filter((tut) => tut.id !== tutorId);
			},
			error: (error) => {
				console.error('Error deleting tutor:', error);
			}
		});
	}

	showModal(tutorId: number, title: string) {
		this.modalService.open({
			component: TutorComponent, title: title, size: 'md',
			inputs: { tutorId: tutorId },
		}).pipe(takeUntil(this.destroy$)).subscribe((result) => {
			if (result) {
				this.loadTutors();
			}
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
