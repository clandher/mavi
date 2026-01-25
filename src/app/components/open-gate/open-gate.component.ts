import { Component } from '@angular/core';
import { BaseHttp } from '@app/core/base-http';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-open-gate',
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <button (click)="openGate()" style="font-size: 2rem; padding: 1rem 2rem;">Abrir</button>
    </div>
  `,
  standalone: true
})
export class OpenGateComponent {
  private opsAPI: BaseHttp;

  constructor(private http: HttpClient, private toastr: ToastrService) {
    this.opsAPI = new BaseHttp('gate-control-operations', this.http);
  }

  async openGate() {
    try {
      // Consultar usuarios y usar el primero
      const usersAPI = new BaseHttp('gate-control-users', this.http);
      const users = await usersAPI.get<any[]>().toPromise();
      const firstUserId = users && users.length > 0 ? users[0].id : null;
      if (!firstUserId) {
        this.toastr.error('No hay usuarios disponibles para abrir el portón.');
        return;
      }
      await this.opsAPI.post<any, any>({ gateControlUserId: Number(firstUserId), operation: 'OPEN' }).toPromise();
      this.toastr.success('¡Solicitud para abrir el portón enviada exitosamente!');
    } catch (err) {
      this.toastr.error('Error al enviar la solicitud para abrir el portón.');
    }
  }
}
