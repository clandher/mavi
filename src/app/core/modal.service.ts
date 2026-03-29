import { Injectable, Type } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';

export interface ModalInjectable {
    submitText?: string;
    form: FormGroup;
    disabled: boolean;
    onSubmit(): Promise<void>;
}

export interface ModalConfig {
    inputs?: any;
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
    private _stack: Array<ModalConfig> = [];

    get changes(): Observable<ModalConfig> {
        return this._modalSubject.asObservable();
    }

    open(config: ModalConfig): Observable<boolean> {
        this._stack.push(config);
        this._modalSubject.next(config);
        return this._closeSubject.asObservable();
    }

    close(result: boolean): void {
        this._closeSubject.next(result);
        this._stack.pop();
        if (this._stack.length > 0) {
            const config = this._stack[this._stack.length - 1];
            setTimeout(() => {
                this._modalSubject.next(config);
            }, 0);
        } else {
            this._cleanupBackdrop();
        }
    }

    private _cleanupBackdrop() {
        setTimeout(() => {
            const modals = document.querySelectorAll('.modal.show');
            if (modals.length === 0) {
                document.body.classList.remove('modal-open');
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(bd => bd.parentNode?.removeChild(bd));
            }
        }, 0);
    }
}