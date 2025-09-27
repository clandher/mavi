import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from '../btn-loading/btn-loading.component';

@Component({
	selector: 'app-development',
	template: `
    <div class="schools-list">
      <btn-loading [action]="onRestart.bind(this)" text="Reiniciar"></btn-loading>
    </div>
  `,
	imports: [BtnLoadingComponent],
	styleUrls: []
})
export class DevelopmentComponent {
	constructor(private http: HttpClient, private toastr: ToastrService) { }

	onRestart(): Promise<void> {
		const seederAPI = new BaseHttp('seeder', this.http);
		return seederAPI.post({}).toPromise().then(() => {
			this.toastr.success('La base de datos ha sido reiniciada y poblada con datos de ejemplo.', 'Operación Exitosa');
		}).catch(() => {
			console.error('Error reiniciando la base de datos');
		});
	}
}