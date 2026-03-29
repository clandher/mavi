import { CommonModule } from '@angular/common';
import { Component, ComponentRef, EventEmitter, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalConfig, ModalInjectable, ModalService } from '../../core/modal.service';
import { SubmitComponent } from '../submit/submit.component';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    imports: [CommonModule, SubmitComponent],
    standalone: true
})
export class ModalComponent {
    @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

    private _config: ModalConfig | null = null;
    private _component: ComponentRef<ModalInjectable> | null = null;
    private _modal: any | null = null;
    private _keydownListener: any;
    private _backdropListener: any;

    constructor(private modalService: ModalService) { }

    get config(): ModalConfig | null { return this._config; }
    get component(): ModalInjectable | null { return this._component?.instance ?? null; }

    ngAfterViewInit(): void {
        this.modalService.changes.subscribe((config) => {
            this._config = config;

            if (this._config.component) {
                this.container.clear();
                this._component = this.container.createComponent<ModalInjectable>(this._config.component);
                if (this._config.inputs) {
                    for (const [key, value] of Object.entries(this._config.inputs)) {
                        this._component.setInput(key, value);
                    }
                }
            }
            const modalElement = document.getElementById('modal');
            if (modalElement) {
                try {
                    this._modal = new (window as any).bootstrap.Modal(modalElement);
                    this._modal.show();

                    this._keydownListener = (event: KeyboardEvent) => {
                        if (event.key === 'Escape') {
                            this.onDiscard();
                        }
                    };
                    document.addEventListener('keydown', this._keydownListener);

                    this._backdropListener = (event: MouseEvent) => {
                        if (event.target === modalElement) {
                            this.onDiscard();
                        }
                    };
                    modalElement.addEventListener('click', this._backdropListener);

                } catch (error) {
                    console.error('ModalComponent - Error initializing Bootstrap modal', error);
                }
            } else {
                console.error('ModalComponent - modal element not found in DOM');
            }
        });
    }

    async onSubmit(): Promise<void> {
        await this.component!.onSubmit.bind(this.component)();
        this._modal?.hide();
        this.modalService.close(true);
        this.removeKeydownListener();
        this.removeBackdropListener();
    }

    onDiscard() {
        this._modal?.hide();
        this.modalService.close(false);
        this.removeKeydownListener();
        this.removeBackdropListener();
    }

    private removeKeydownListener() {
        if (this._keydownListener) {
            document.removeEventListener('keydown', this._keydownListener);
            this._keydownListener = null;
        }
    }

    private removeBackdropListener() {
        const modalElement = document.getElementById('modal');
        if (modalElement && this._backdropListener) {
            modalElement.removeEventListener('click', this._backdropListener);
            this._backdropListener = null;
        }
    }
}