import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormsModule, FormBuilder, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { FormGroupComponent } from '../form-group/form-group.component';
import { GraphRadarComponent, Radar } from "../graph-radar/graph-radar.component";
import { faker } from '@faker-js/faker';
import { SubmitComponent } from "../submit/submit.component";
import { BaseHttp } from '@app/core/base-http';
import { HttpClient } from '@angular/common/http';
import { MaviValidators } from '@app/core/mavi-validators';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-radars',
    standalone: true,
    imports: [CommonModule, FormsModule, FormGroupComponent, ReactiveFormsModule, GraphRadarComponent, SubmitComponent],
    providers: [
        provideCharts(withDefaultRegisterables()),
    ],
    templateUrl: './radars.component.html',
    styleUrls: ['./radars.component.scss']
})
export class RadarsComponent {


    public form: FormGroup;
    public radars: Radar[] = [];
    public config = { max: 10, min: 3 };
    public radarHandler: RadarItemHandler | null = null;

    get items(): FormArray {
        return this.form.get('items') as FormArray;
    }

    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            description: ['', MaviValidators.required()],
            items: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this._fetch();
    }

    private _fetch(): void {
        const configAPI = new BaseHttp('radars', this.http);
        configAPI.get().subscribe((response: any) => {
            if (response && response.length > 0) {
                this.radars = response;
                this.onConfigChange(this.radars[0]);
            }
        });
    }

    onConfigChange(radar: Radar) {
        this.radarHandler = new RadarItemHandler(radar, this.items, this.fb);
        this.form.get('description')?.setValue(radar.description);
        this._patchItems(radar.items);
        this.form.markAsPristine();
    }

    ngOnDestroy(): void {

    }

    private _patchItems(items: any[]) {
        (this.form.get('items') as FormArray).clear();
        items.forEach(item => {
            (this.form.get('items') as FormArray).push(this.fb.group({
                key: [item.key],
                description: [item.description],
                value: [item.value]
            }));
        });
    }

    onSubmit(): Promise<void> {
        if (!this.radarHandler) {
            return Promise.reject('No configuration selected');
        }

        const configAPI = new BaseHttp('radars', this.http);
        return configAPI.patch<any, void>(this.radarHandler.radar.id, this.form.value).toPromise().then(() => {

            if (!this.radarHandler) {
                return;
            }

            this.radarHandler.radar.description = this.form.get('description')?.value;
            this.radarHandler.radar.items = this.form.get('items')?.value;
        });
    }

    onDiscard(): void {
        this.onConfigChange(this.radarHandler!.radar);
    }

    onDelete() {

        if (!this.radarHandler) {
            return;
        }

        const configAPI = new BaseHttp('radars', this.http);
        configAPI.delete<void>(this.radarHandler.radar.id).toPromise().then(() => {
            this.toastr.success('Configuración eliminada correctamente', 'Éxito');
            this._fetch();
        });
    }
}


export class RadarItemHandler {
    public items: FormArray;
    private fb: FormBuilder;

    constructor(public radar: Radar, items: FormArray, fb: FormBuilder) {
        this.items = items;
        this.fb = fb;
    }

    onAddItem() {
        if (this.items.length < 10) {
            let newKey: string;
            do {
                newKey = faker.string.alpha({ length: 6, casing: 'lower' });
            } while (this.items.controls.some(control => control.value.key === newKey));

            this.items.push(this.fb.group({
                key: [newKey],
                description: [this.items.length + 1 + ''],
                value: [50]
            }));
            this.items.markAsDirty();
        }
    }

    onRemoveItem(index: number) {
        if (this.items.length > 3) {
            this.items.removeAt(index);
            this.items.markAsDirty();
        }
    }

}