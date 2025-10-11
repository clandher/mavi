import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BaseHttp } from '@app/core/base-http';
import { Activity, ActivityType, CreateActivityDto, Category } from '@app/core/dto';
import { dateToDatetimeLocalString, setFocus } from '@app/core/helpers';
import { FormGroupComponent } from "../form-group/form-group.component";
import { SubmitComponent } from '../submit/submit.component';
import { NgxMaskDirective } from 'ngx-mask';
import { MaviValidators } from '@app/core/mavi-validators';
import { faker } from '@faker-js/faker';


@Component({
    selector: 'app-activity',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent, NgxMaskDirective, SubmitComponent],
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
    public todayDatetimeLocal: string = dateToDatetimeLocalString(new Date());
    @Input() activityId: number = 0;

    @Output() complete = new EventEmitter<boolean>();

    public activityTypes: ActivityType[] = [];
    public categories: Category[] = [];
    public activityForm: FormGroup;
    private newCategoryId: number | null = null;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
        private route: ActivatedRoute
    ) {


        this.route.queryParams.subscribe(params => {
            const categoryId = params['category'];

            if (categoryId) {
                this.newCategoryId = +categoryId;
            }
        });

        this.activityForm = this.fb.group({
            description: ['Nueva actividad...', MaviValidators.required()],
            startDate: [
                dateToDatetimeLocalString(new Date()),
                [
                    MaviValidators.required(),
                    MaviValidators.maxDate('endDate', 'La fecha de inicio debe ser menor a la fecha de fin.')
                ]
            ],
            endDate: [
                dateToDatetimeLocalString(new Date(Date.now() + 60 * 60 * 1000)),
                [
                    MaviValidators.required(),
                    MaviValidators.minDate('startDate', 'La fecha debe ser mayor a la fecha de inicio.')
                ]
            ],
            gracePeriod: [15, [MaviValidators.required(), MaviValidators.min(0)]],
            price: [200, [MaviValidators.required(), MaviValidators.min(0.01)]],
            categoryId: [0, [MaviValidators.required()]],
            typeId: [0, [MaviValidators.required()]],
            code: [faker.string.alphanumeric(10).toUpperCase(), [MaviValidators.required()]],
        });
    }

    ngAfterViewInit(): void {
        this.loadCategories();
        this.loadActivityTypes();
        this.loadActivity(this.activityId);
    }

    loadCategories() {
        const categoriesAPI = new BaseHttp('categories', this.http);
        categoriesAPI.get<Category[]>().subscribe(result => {
            this.categories = result;
            if (this.activityId === 0 && this.categories.length > 0) {
                if (this.newCategoryId && this.categories.some(c => c.id === this.newCategoryId)) {
                    this.activityForm.patchValue({ categoryId: this.newCategoryId });
                } else {
                    this.activityForm.patchValue({ categoryId: this.categories[0].id });
                }
                this.activityForm.markAsDirty();
            }
        });
    }

    loadActivityTypes() {
        const activityTypesAPI = new BaseHttp('activity-types', this.http);
        activityTypesAPI.get<ActivityType[]>().subscribe(result => {
            this.activityTypes = result;
            if (this.activityTypes.length > 0) {
                this.activityForm.patchValue({ typeId: this.activityTypes[0].id });
            }
        });
    }

    loadActivity(id: number) {

        if (this.activityId > 0) {
            const activityAPI = new BaseHttp(`activities/${id}`, this.http);
            activityAPI.get<Activity>().subscribe(result => {
                this.activityForm.patchValue({
                    description: result.description,
                    startDate: dateToDatetimeLocalString(new Date(result.startDate)),
                    endDate: dateToDatetimeLocalString(new Date(result.endDate)),
                    gracePeriod: result.gracePeriod,
                    price: result.price,
                    categoryId: result.categoryId,
                    typeId: result.typeId,
                    code: result.code,
                });

                setFocus('description');

            });

            this.activityForm.get('categoryId')?.disable({ emitEvent: false });
            this.activityForm.get('typeId')?.disable({ emitEvent: false });
            this.activityForm.get('startDate')?.disable({ emitEvent: false });
            this.activityForm.get('endDate')?.disable({ emitEvent: false });
            this.activityForm.get('gracePeriod')?.disable({ emitEvent: false });
            this.activityForm.get('price')?.disable({ emitEvent: false });

        } else {
            setFocus('description');
        }
    }

    closeModal(): void {
        this.complete.emit(false);
    }

    saveActivity(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.activityForm.value;
            const activitiesAPI = new BaseHttp(`activities`, this.http);

            if (this.activityId !== 0) {
                const activityToSave = {
                    ...formValue,
                };

                activitiesAPI.patch<CreateActivityDto, Activity>(this.activityId, activityToSave).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error al actualizar la actividad:', err); reject(err); }
                });
            } else {

                const activityToSave = {
                    ...formValue,
                    typeId: Number(formValue.typeId),
                    categoryId: Number(formValue.categoryId),
                };

                activitiesAPI.post<CreateActivityDto, Activity>(activityToSave).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error al crear la actividad:', err); reject(err); }
                });
            }
        });
    }
}
