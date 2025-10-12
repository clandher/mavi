import { Injectable, Type } from '@angular/core';
import { Observable, Subject } from 'rxjs';
// import { Modal } from 'bootstrap';
import { FormGroup } from '@angular/forms';

export interface ModalInjectable {
    form: FormGroup;
    disabled: boolean;
    onSubmit(): Promise<void>;
}

export interface ModalConfig {
    options?: Partial<any>
    component: Type<ModalInjectable> | null;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

@Injectable({
    providedIn: 'root'
})
export class ModalService {

    private _modalSubject = new Subject<ModalConfig>();
    private _closeSubject = new Subject<boolean>();

    get changes(): Observable<ModalConfig> {
        return this._modalSubject.asObservable();
    }

    open(config: ModalConfig): Observable<boolean> {
        this._modalSubject.next(config);
        return this._closeSubject.asObservable();
    }

    close(result: boolean): void {
        this._closeSubject.next(result);
    }
}