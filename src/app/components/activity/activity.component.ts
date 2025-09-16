import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { Activity, ActivityType, CreateActivityDto, Category } from '@app/core/dto';
import { dateToDatetimeLocalString } from '@app/core/helpers';
import { FormGroupComponent } from "../form-group/form-group.component";
import { SubmitComponent } from '../submit/submit.component';
import { NgxMaskDirective } from 'ngx-mask';
import { MaviValidators } from '@app/core/mavi-validators';

@Component({
    selector: 'app-activity',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent, NgxMaskDirective, SubmitComponent],
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
    public todayDatetimeLocal: string = dateToDatetimeLocalString(new Date());
    @Input() activityId: number | null = 0;

    @Output() complete = new EventEmitter<boolean>();

    public activityTypes: ActivityType[] = [];
    public categories: Category[] = [];
    public activityForm: FormGroup;

    constructor(private http: HttpClient, private fb: FormBuilder) {
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
            typeId: [2, [MaviValidators.required()]],
        });
    }

    ngOnInit(): void {
        this.loadCategories();
        this.loadActivityTypes();

        if (this.activityId && this.activityId > 0) {
            this.loadActivity(this.activityId);
        }

        if (this.activityId !== 0) {
            this.activityForm.get('categoryId')?.disable();
            this.activityForm.get('typeId')?.disable();
            this.activityForm.get('startDate')?.disable();
            this.activityForm.get('endDate')?.disable();
            this.activityForm.get('gracePeriod')?.disable();
            this.activityForm.get('price')?.disable();
        }
    }

    loadCategories() {
        const categoriesAPI = new BaseHttp('categories', this.http);
        categoriesAPI.get<Category[]>().subscribe(result => {
            this.categories = result;
            if (this.activityId === 0 && this.categories.length > 0) {
                this.activityForm.patchValue({ categoryId: this.categories[0].id });
            }
        });
    }

    loadActivityTypes() {
        const activityTypesAPI = new BaseHttp('activity-types', this.http);
        activityTypesAPI.get<ActivityType[]>().subscribe(result => {
            this.activityTypes = result;
        });
    }

    loadActivity(id: number) {
        const activityAPI = new BaseHttp(`activities/${id}`, this.http);
        activityAPI.get<Activity>().subscribe(result => {
            this.activityForm.patchValue({
                description: result.description,
                startDate: dateToDatetimeLocalString(new Date(result.startDate)),
                endDate: dateToDatetimeLocalString(new Date(result.endDate)),
                gracePeriod: result.gracePeriod,
                price: result.price,
                categoryId: result.categoryId,
                typeId: result.typeId
            });
        });
    }

    closeModal(): void {
        this.complete.emit(true);
    }


    saveActivity(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.activityForm.value;

            if (this.activityId !== 0) {
                const activityToSave = {
                    ...formValue,
                };

                const activitiesAPI = new BaseHttp(`activities/${this.activityId}`, this.http);
                activitiesAPI.patch<CreateActivityDto, Activity>(activityToSave).subscribe({
                    next: () => { this.closeModal(); resolve(); },
                    error: (err) => { console.error('Error al actualizar la actividad:', err); reject(err); }
                });
            } else {

                const activityToSave = {
                    ...formValue,
                    typeId: Number(formValue.typeId),
                    categoryId: Number(formValue.categoryId)
                };

                const activitiesAPI = new BaseHttp('activities', this.http);
                activitiesAPI.post<CreateActivityDto, Activity>(activityToSave).subscribe({
                    next: () => { this.closeModal(); resolve(); },
                    error: (err) => { console.error('Error al crear la actividad:', err); reject(err); }
                });
            }
        });
    }
}
