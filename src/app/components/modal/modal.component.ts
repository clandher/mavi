import { CommonModule } from '@angular/common';
import { Component, ComponentRef, Input, Output, EventEmitter, Type, ViewChild, ViewContainerRef, OnInit } from '@angular/core';
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

    constructor(private modalService: ModalService) { }

    get config(): ModalConfig | null { return this._config; }
    get component(): ModalInjectable | null { return this._component?.instance ?? null; }

    ngAfterViewInit(): void {
        this.modalService.changes.subscribe((config: ModalConfig) => {
            console.log('ModalComponent - changes', config);
            this._config = config;

            if (config.component) {
                this.container.clear();
                this._component = this.container.createComponent<ModalInjectable>(config.component);

                if (config.inputs) {
                    for (const [key, value] of Object.entries(config.inputs)) {
                        this._component.setInput(key, value);
                    }
                }
            }

            const modalElement = document.getElementById('modal');
            if (modalElement) {
                try {
                    this._modal = new (window as any).bootstrap.Modal(modalElement);
                    this._modal.show();
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
    }

    onDiscard() {
        this._modal?.hide();
        this.modalService.close(false);
    }

}