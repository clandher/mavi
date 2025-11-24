import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor } from '@angular/common';
import { EmployeeComponent } from '../employee/employee.component';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Employee } from '@app/core/dto';


@Component({
	selector: 'app-employees',
	templateUrl: './employees.component.html',
	styleUrls: ['./employees.component.scss'],
	imports: [NgIf, NgFor]
})
export class EmployeesComponent implements OnDestroy {
	employees: Employee[] = [];

	private employeeAPI: BaseHttp;
	private destroy$ = new Subject<void>();

	constructor(
		private modalService: ModalService,
		private http: HttpClient,
	) {
		this.employeeAPI = new BaseHttp('employees', this.http);
	}

	ngOnInit() {
		this.loadEmployees();
	}

	loadEmployees(): void {
		this.employeeAPI.get<Employee[]>().subscribe(
			(data) => {
				this.employees = data;
			},
			(error) => {
				console.error('Error loading employees:', error);
			}
		);
	}

	deleteEmployee(employeeId: number): void {
		this.employeeAPI.delete<void>(employeeId).subscribe({
			next: () => {
				this.employees = this.employees.filter((emp) => emp.id !== employeeId);
			},
			error: (error) => {
				console.error('Error deleting employee:', error);
			}
		});
	}

	showModal(employeeId: number, title: string) {
		this.modalService.open({
			component: EmployeeComponent, title: title, size: 'md',
			inputs: { employeeId: employeeId },
		}).pipe(takeUntil(this.destroy$)).subscribe((result) => {
			if (result) {
				this.loadEmployees();
			}
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
