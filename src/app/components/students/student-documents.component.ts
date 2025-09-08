import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { buildUrl } from '@app/core/base-http';
import { RequestQueryBuilder } from '@dataui/crud-request';

@Component({
	standalone: true,
	imports: [CommonModule],
	templateUrl: './student-documents.component.html',
	styleUrls: ['./student-documents.component.scss'],
	providers: []
})
export class StudentDocumentsComponent {

	studentId: string | null = null;
	@ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
	documents: StudentDocument[] = [];
	dragging = false;

	typeLabels = ['Sin categoría', 'CURP', 'Acta de nacimiento'];

	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private router: Router,
	) {

		this.studentId = this.route.parent!.snapshot.paramMap.get('id');
		this.getStudentDocuments(this.studentId!);
	}

	onDragOver(event: DragEvent) {
		event.preventDefault();
		this.dragging = true;
	}

	onDragLeave(event: DragEvent) {
		event.preventDefault();
		this.dragging = false;
	}

	onDrop(event: DragEvent) {
		event.preventDefault();
		this.dragging = false;
		if (event.dataTransfer?.files) {
			this.uploadFiles(event.dataTransfer.files);
		}
	}

	isImage(document: any): boolean {
		const ext = document.name?.split('.').pop()?.toLowerCase();
		return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext ?? '');
	}

	onFileSelect(event: any) {
		const files = event.target.files;
		for (let file of files) {
			const doc: any = {
				name: file.name,
				file: file
			};
		}

		this.uploadFiles(files);
	}

	uploadFiles(files: FileList) {
		const formData = new FormData();
		Array.from(files).forEach(file => {
			formData.append('files', file);
		});

		this.http.post(buildUrl(`student-documents/${this.studentId}/uploads`), formData)
			.subscribe((res: any) => {
				if (res.documents) {
					const mappedNewDocs = res.documents.map((doc: StudentDocument) => ({
						...doc,
						previewUrl: this.isImage(doc)
							? buildUrl(`student-documents/${this.studentId}/document/${doc.id}`)
							: undefined
					}));
					this.documents = [...this.documents, ...mappedNewDocs];
				}
			});
	}

	getTypeLabel(type?: number) {
		return this.typeLabels[type ?? 0];
	}

	removeDocument(index: number, $event?: Event) {
		$event?.stopPropagation();
		if (confirm('¿Deseas eliminar este documento?')) {
			const doc = this.documents[index];
			this.http.post(buildUrl(`student-documents/${this.studentId}/document/${doc.id}/delete`), {})
				.subscribe(() => {
					this.documents.splice(index, 1);
				});
		}
	}

	getStudentDocuments(studentId: string) {
		const qb = RequestQueryBuilder.create({
			search: { studentId: Number(studentId) },
		}).query();

		this.http.get<StudentDocument[]>(buildUrl(`student-documents?${qb}`))
			.subscribe(result => {
				this.documents = result.map(doc => ({
					...doc,
					previewUrl: this.isImage(doc)
						? buildUrl(`student-documents/${this.studentId}/document/${doc.id}`)
						: undefined
				}));
			});
	}

	downloadDocument(event: MouseEvent, doc: StudentDocument) {
		event.stopPropagation();
		const url = buildUrl(`student-documents/${this.studentId}/document/${doc.id}`);
		this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
			const a = document.createElement('a');
			a.href = window.URL.createObjectURL(blob);
			a.download = doc.name;
			a.click();
			window.URL.revokeObjectURL(a.href);
		});
	}
}

interface StudentDocument {
	id: string;
	name: string;
	previewUrl?: string;
}

