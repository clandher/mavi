import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { CreateStudentDto, Student, UpdateStudentDto } from '@app/core/dto';
import { setFocus, uploadStudentPhoto } from '@app/core/helpers';
import { FormGroupComponent } from '../form-group/form-group.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SubmitComponent } from '../submit/submit.component';
import { ImageHttpClient } from '@app/core/image-http-client';
import { PaymentComponent } from '../payment/payment.component';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from '@app/core/student.service';

@Component({
    standalone: true,
    selector: 'app-student-edit',
    imports: [CommonModule, FormsModule, RouterModule, FormGroupComponent, ReactiveFormsModule, SubmitComponent, PaymentComponent],
    templateUrl: './student-edit.component.html',
    styleUrls: ['./student-edit.component.scss']
})
export class StudentEditComponent {

    @Output() complete = new EventEmitter<boolean>();

    private pendingPhotoFile: File | null = null;

    public studentForm: FormGroup;
    public student: Student | null = null;
    public showPaymentModal = false;

    private _origin: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private imageHttp: ImageHttpClient,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private studentService: StudentService
    ) {
        this.studentForm = this.fb.group({
            id: [''],
            name: [''],
            birthdate: [''],
            nick: [''],
            photo: [''],
            photoUrl: [''],
            curp: [''],
            phone: [''],
            placeOfBirth: [''],
        });


        const navigation = this.router.getCurrentNavigation();
        this._origin = navigation?.extras.state ? navigation.extras.state['origin'] : null;
        console.log('Origin:', this._origin);

        this.studentService.refreshNotifier.subscribe(() => {
            this.refreshStudentData();
        });
    }

    ngAfterViewInit(): void {
        const studentId = this.route.snapshot.paramMap.get('id') ?? 0;
        if (!studentId) {
            this.studentForm.patchValue({
                id: 0,
                birthdate: new Date().toISOString().slice(0, 10)
            });
            setFocus('name');
        } else {
            this._loadStudent(+studentId!);
        }
    }

    onBack() {
        if (this._origin) {
            this.router.navigateByUrl(this._origin);
        } else {
            this.router.navigate(['/app/estudiantes']);
        }
    }

    private _loadStudent(studentId: number): void {
        const studentsAPI = new BaseHttp(`students/${studentId}`, this.http);
        studentsAPI.get<Student>().subscribe({
            next: (student) => {
                this.student = student;
                this.studentForm.patchValue({
                    id: student.id,
                    name: student.name,
                    birthdate: new Date(student.birthdate).toISOString().slice(0, 10),
                    curp: student.curp,
                    phone: student.phone,
                    placeOfBirth: student.placeOfBirth,
                    nick: student.nick,
                    photo: student.photo,
                    photoUrl: null,
                });

                this.imageHttp.student(student).subscribe(photoUrl => {
                    this.studentForm.patchValue({ photoUrl });
                });

                setFocus('name', false);
            },
            error: (err) => {
                console.error('Error loading student', err);
                this.router.navigate(['/app/estudiantes']);
            }
        });
    }

    public async saveStudent(): Promise<void> {
        const studentId = this.route.snapshot.paramMap.get('id') ?? 0;
        if (studentId === 0) {
            await this._createStudent();
        } else {
            await this._updateStudent();
        }
    }

    private async _updateStudent(): Promise<void> {
        const studentId = this.route.snapshot.paramMap.get('id') ?? 0;
        const studentsAPI = new BaseHttp(`students`, this.http);
        const updateStudentDto: UpdateStudentDto = {
            name: this.studentForm.value.name,
            birthdate: new Date(this.studentForm.value.birthdate),
            curp: this.studentForm.value.curp,
            phone: this.studentForm.value.phone,
            placeOfBirth: this.studentForm.value.placeOfBirth,
            nick: this.studentForm.value.nick
        };

        await studentsAPI.patch(studentId, updateStudentDto).toPromise();
    }

    private async _createStudent(): Promise<void> {
        const studentsAPI = new BaseHttp('students', this.http);
        const createStudentDto: CreateStudentDto = {
            name: this.studentForm.value.name,
            birthdate: new Date(this.studentForm.value.birthdate),
            curp: this.studentForm.value.curp,
            phone: this.studentForm.value.phone,
            placeOfBirth: this.studentForm.value.placeOfBirth,
            nick: this.studentForm.value.nick
        };

        const student = await studentsAPI.post<CreateStudentDto, Student>(createStudentDto).toPromise();

        if (!student) {
            throw new Error('No se pudo crear el estudiante.');
        }

        this.studentForm.patchValue({
            id: student.id,
            photo: student.photo,
            // photoUrl: student.photoUrl
        });

        this.imageHttp.student(student).subscribe(photoUrl => {
            this.studentForm.patchValue({ photoUrl });
        });

        this._uploadPendingPhotoIfAny();
        this.router.navigate(['/app/estudiantes', student.id, 'editar']);
    }



    onPhotoSelected(event: Event) {
        const studentId = Number(this.route.snapshot.paramMap.get('id') ?? 0);
        if (studentId > 0) {
            uploadStudentPhoto(event, this.studentForm.value, this.http, this.toastr);
            return;
        }

        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                this.studentForm.patchValue({
                    photo: base64,
                    photoUrl: base64
                });
            };
            reader.readAsDataURL(file);
            this.pendingPhotoFile = file;
        }
    }

    private _uploadPendingPhotoIfAny() {
        if (!this.pendingPhotoFile) {
            return;
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(this.pendingPhotoFile);
        const fakeInput = document.createElement('input');
        fakeInput.type = 'file';
        fakeInput.files = dataTransfer.files;
        const event = { target: fakeInput } as unknown as Event;
        uploadStudentPhoto(event, this.studentForm.value, this.http, this.toastr);
        this.pendingPhotoFile = null;
    }

    closeModal(): void {
        this.complete.emit(false);
    }

    public onPaymentComplete(value: boolean) {
        console.log('Payment complete:', value);
        this.showPaymentModal = false;
        if (value) {
            this.refreshStudentData();
        }
    }

    refreshStudentData(): void {
        const studentsAPI = new BaseHttp(`students/${this.student?.id}`, this.http);
        studentsAPI.get<Student>().subscribe({
            next: (student) => {
                this.student = student;

            },
            error: (err) => {
                console.error('Error loading student', err);
                this.router.navigate(['/app/estudiantes']);
            }
        });

    }
}