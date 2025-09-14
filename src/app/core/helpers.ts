import { HttpClient } from "@angular/common/http";
import { Student, School } from "./dto";
import { BaseHttp, buildUrl } from "./base-http";

export function formatDateForDisplay(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}

// Convierte Date a string para input type="datetime-local"
export function dateToDatetimeLocalString(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const hours = ('0' + d.getHours()).slice(-2);
    const minutes = ('0' + d.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Convierte string de input type="datetime-local" a Date
export function datetimeLocalStringToDate(value: string): Date {
    return value ? new Date(value) : new Date;
}

export function uploadStudentPhoto(event: Event, student: Student, http: HttpClient): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file || !student.id) return;

    const formData = new FormData();
    formData.append('file', file);

    const studentsAPI = new BaseHttp(`students/${student.id}/upload`, http);
    studentsAPI.post<FormData, any>(formData).subscribe({
        next: (res) => {
            const timestamp = new Date().getTime();

            student.photoUrl = buildUrl(`students/${student.id}/photo`) + `?t=${timestamp}`;
        },
        error: (err) => {
            console.error('Error uploading photo', err);
        }
    });

    const reader = new FileReader();
    reader.onload = () => {
        student.photo = reader.result as string;
    };
    reader.readAsDataURL(file);
}