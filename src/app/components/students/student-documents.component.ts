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

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadFiles(input.files);
    }
  }

  uploadFiles(files: FileList) {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    this.http.post(buildUrl(`student-documents/${this.studentId}/uploads`), formData)
      .subscribe((res: any) => {
        if (res.documents) {
            const existingIds = new Set(this.documents.map(doc => doc.id));
            const newDocs = res.documents.filter((doc: StudentDocument) => !existingIds.has(doc.id));
            this.documents = [...this.documents, ...newDocs];
        }
      });
  }

  getTypeLabel(type?: number) {
    return this.typeLabels[type ?? 0];
  }

  onDocDragStart(index: number) {
    (window as any).draggedDocIndex = index;
  }

  removeDocument(index: number, $event?: Event) {
    $event?.stopPropagation();
    const doc = this.documents[index];
    this.http.post(buildUrl(`student-documents/${this.studentId}/document/${doc.id}/delete`), {})
      .subscribe(() => {
      this.documents.splice(index, 1);
      });
  }

  getStudentDocuments(studentId: string) {
    const qb = RequestQueryBuilder.create({
      search: { studentId: Number(studentId) },
    }).query();

    this.http.get<StudentDocument[]>(buildUrl(`student-documents?${qb}`))
      .subscribe(result => {
        this.documents = result;
      });
  }

  downloadDocument( event: MouseEvent, doc: StudentDocument) {
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
  type?: number;
}

