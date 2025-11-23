import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { CreateStudentDto, Student, UpdateStudentDto } from '@app/core/dto';
import { formatDateForDisplay, setFocus, uploadStudentPhoto } from '@app/core/helpers';
import { FormGroupComponent } from '../form-group/form-group.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SubmitComponent } from '../submit/submit.component';
import { ImageHttpClient } from '@app/core/image-http-client';
import { PaymentComponent } from '../payment/payment.component';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from '@app/core/student.service';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
    standalone: true,
    selector: 'app-student-edit',
    imports: [CommonModule, FormsModule, RouterModule, FormGroupComponent, ReactiveFormsModule, SubmitComponent, NgxMaskDirective],
    templateUrl: './student-edit.component.html',
})
export class StudentEditComponent {

    @Output() complete = new EventEmitter<boolean>();

    private pendingPhotoFile: File | null = null;

    public studentForm: FormGroup;
    public student: Student | null = null;
    public studentId: number = 0;
    public previousStudent: Student | null = null;
    public nextStudent: Student | null = null;

    private _origin: string | null = null;
    private destroy$ = new Subject<void>();

    maxBirthdate: string = formatDateForDisplay(new Date());
    //    this.maxBirthdate = ;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private imageHttp: ImageHttpClient,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private studentService: StudentService,
        private modalService: ModalService,
    ) {
        this.studentForm = this.fb.group({
            id: [''],
            name: [''],
            birthdate: [''],
            photo: [''],
            photoUrl: [''],
        });


        const navigation = this.router.getCurrentNavigation();
        this._origin = navigation?.extras.state ? navigation.extras.state['origin'] : null;

        this.studentService.refreshNotifier.subscribe(() => {
            this.refreshStudentData();
        });
    }

    ngAfterViewInit(): void {
        this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
            const studentIdParam = params.get('id');
            this.studentId = studentIdParam ? Number(studentIdParam) : 0;

            if (!this.studentId) {
                this.studentForm.patchValue({
                    id: 0,
                    birthdate: formatDateForDisplay(new Date())
                });
                setFocus('name');
            } else {
                this._loadStudent(this.studentId);
            }
        });
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
                this.studentService.setStudent(student);
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

                if (!student.curp) {
                    this.studentForm.patchValue({ curp: 'AAAA000000AAAAAAAA' });
                }

                this.imageHttp.student(student).subscribe(photoUrl => {
                    this.studentForm.patchValue({ photoUrl });
                });

                setFocus('name', false);

                this._loadAdjacentStudents();
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
        this.router.navigate(['/app/estudiantes', student.id]);
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

    public openPaymentModal(student: Student) {
        this.modalService.open({
            component: PaymentComponent, title: 'Realizar pago', size: 'md',
            inputs: { studentId: student.id }
        }).pipe(takeUntil(this.destroy$)).subscribe((result: boolean) => {
            if (result) {
                this.refreshStudentData();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    refreshStudentData(): void {

        if (!this.student?.id) {
            return;
        }

        const studentsAPI = new BaseHttp(`students/${this.student.id}`, this.http);
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

    async navigateToStudent(studentId: number): Promise<void> {
        const currentSubroute = this.route.snapshot.firstChild?.url.map(segment => segment.path).join('/') || '';
        this.studentForm.get('id')?.setValue(0);
        await this.router.navigate([`/app/estudiantes/${studentId}`, currentSubroute], { replaceUrl: true });
    }

    private _loadAdjacentStudents(): void {
        const studentId = this.student?.id ?? 0;

        if (!studentId) {
            this.previousStudent = null;
            this.nextStudent = null;
            return;
        }

        const adjacentStudentsAPI = new BaseHttp(`students/${studentId}/adjacent`, this.http);
        adjacentStudentsAPI.get<{ previous: number | null; next: number | null }>().subscribe({
            next: (response) => {
                if (response.previous) {
                    const previousStudentAPI = new BaseHttp(`students/${response.previous}`, this.http);
                    previousStudentAPI.get<Student>().subscribe({
                        next: (student) => {
                            this.previousStudent = student;
                            this.imageHttp.student(student).subscribe(photoUrl => {
                                this.previousStudent!.photoUrl = photoUrl;
                            });
                        },
                        error: () => {
                            this.previousStudent = null;
                        }
                    });
                } else {
                    this.previousStudent = null;
                }

                if (response.next) {
                    const nextStudentAPI = new BaseHttp(`students/${response.next}`, this.http);
                    nextStudentAPI.get<Student>().subscribe({
                        next: (student) => {
                            this.nextStudent = student;
                            this.imageHttp.student(student).subscribe(photoUrl => {
                                this.nextStudent!.photoUrl = photoUrl;
                            });
                        },
                        error: () => {
                            this.nextStudent = null;
                        }
                    });
                } else {
                    this.nextStudent = null;
                }
            },
            error: (err) => {
                console.error('Error loading adjacent students', err);
                this.previousStudent = null;
                this.nextStudent = null;
            }
        });
    }
}