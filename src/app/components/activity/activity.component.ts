import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BaseHttp } from '@app/core/base-http';
import { Activity, ActivityType, CreateActivityDto, Category } from '@app/core/dto';
import { dateToDatetimeLocalString, setFocus } from '@app/core/helpers';
import { FormGroupComponent } from "../form-group/form-group.component";
import { NgxMaskDirective } from 'ngx-mask';
import { MaviValidators } from '@app/core/mavi-validators';
import { faker } from '@faker-js/faker';
import { ModalInjectable } from '@app/core/modal.service';

@Component({
    selector: 'app-activity',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent, NgxMaskDirective],
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements ModalInjectable {
    disabled: boolean = false;


    public todayDatetimeLocal: string = dateToDatetimeLocalString(new Date());
    @Input() activityId: number = 0;

    @Output() complete = new EventEmitter<boolean>();

    public activityTypes: ActivityType[] = [];
    public categories: Category[] = [];
    public form: FormGroup;
    private newCategoryId: number | null = null;

    public GRACE_PERIOD_OPTIONS = [
        { value: '15m', description: '15 minutos' },
        { value: '15d', description: '15 días' }
    ];


    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
        private route: ActivatedRoute
    ) {
        const savedGracePeriod = localStorage.getItem('activity.gracePeriod') || '15m';

        this.route.queryParams.subscribe(params => {
            const categoryId = params['category'];
            if (categoryId) {
                this.newCategoryId = +categoryId;
            }
        });

        this.form = this.fb.group({
            description: ['Nueva actividad...', MaviValidators.required()],
            startDate: [
                dateToDatetimeLocalString(new Date()),
                [
                    MaviValidators.required(),
                    MaviValidators.maxDate('endDate', 'La fecha de inicio debe ser menor a la fecha de fin.'),
                ],
            ],
            endDate: [
                dateToDatetimeLocalString(new Date(Date.now() + 60 * 60 * 1000)),
                [
                    MaviValidators.required(),
                    MaviValidators.minDate('startDate', 'La fecha debe ser mayor a la fecha de inicio.'),
                ],
            ],
            gracePeriod: [
                savedGracePeriod,
                [MaviValidators.required()]
            ],
            price: [200, [MaviValidators.required(), MaviValidators.min(0.01)]],
            categoryId: [0, [MaviValidators.required()]],
            typeId: [0, [MaviValidators.required()]],
            code: [faker.string.alphanumeric(10).toUpperCase(), [MaviValidators.required()]],
        }, { validators: [MaviValidators.gracePeriodValidator] });
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
                    this.form.patchValue({ categoryId: this.newCategoryId });
                } else {
                    this.form.patchValue({ categoryId: this.categories[0].id });
                }
                this.form.markAsDirty();
            }
        });
    }

    loadActivityTypes() {
        const activityTypesAPI = new BaseHttp('activity-types', this.http);
        activityTypesAPI.get<ActivityType[]>().subscribe(result => {
            this.activityTypes = result;
            if (this.activityTypes.length > 0) {
                this.form.patchValue({ typeId: this.activityTypes[0].id });
            }
        });
    }

    loadActivity(id: number) {

        if (this.activityId > 0) {
            const activityAPI = new BaseHttp(`activities/${id}`, this.http);
            activityAPI.get<Activity>().subscribe(result => {
                if (!this.GRACE_PERIOD_OPTIONS.some(option => option.value === result.gracePeriod)) {
                    this.GRACE_PERIOD_OPTIONS.push({
                        value: result.gracePeriod,
                        description: this.getGracePeriodDescription(result.gracePeriod)
                    });
                }

                this.form.patchValue({
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

            this.form.get('categoryId')?.disable({ emitEvent: false });
            this.form.get('typeId')?.disable({ emitEvent: false });
            this.form.get('startDate')?.disable({ emitEvent: false });
            this.form.get('endDate')?.disable({ emitEvent: false });
            this.form.get('gracePeriod')?.disable({ emitEvent: false });
            this.form.get('price')?.disable({ emitEvent: false });

        } else {
            setFocus('description');
        }
    }

    private getGracePeriodDescription(value: string): string {
        const descriptions: { [key: string]: string } = {
            'years': 'años', 'year': 'año', 'yrs': 'años', 'yr': 'año', 'y': 'año',
            'months': 'meses', 'month': 'mes', 'mo': 'mes',
            'weeks': 'semanas', 'week': 'semana', 'w': 'semana',
            'days': 'días', 'day': 'día', 'd': 'día',
            'hours': 'horas', 'hour': 'hora', 'hrs': 'horas', 'hr': 'hora', 'h': 'hora',
            'minutes': 'minutos', 'minute': 'minuto', 'mins': 'minutos', 'min': 'minuto', 'm': 'minuto',
            'seconds': 'segundos', 'second': 'segundo', 'secs': 'segundos', 'sec': 'segundo', 's': 'segundo',
            'milliseconds': 'milisegundos', 'millisecond': 'milisegundo', 'msecs': 'milisegundos', 'msec': 'milisegundo', 'ms': 'milisegundo'
        };

        const match = value.match(/^(\d+)([a-zA-Z]+)$/);
        if (match) {
            const [, numericValue, unit] = match;
            const translatedUnit = descriptions[unit] || unit;
            return `${numericValue} ${translatedUnit}`;
        }

        return value; // Fallback for unexpected formats
    }

    onSubmit(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.form.value;
            const activitiesAPI = new BaseHttp(`activities`, this.http);

            if (formValue.gracePeriod) {
                localStorage.setItem('activity.gracePeriod', formValue.gracePeriod);
            }

            const startDate = new Date(formValue.startDate);
            const endDate = new Date(formValue.endDate);


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
