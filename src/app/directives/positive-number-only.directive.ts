import { Directive, HostListener, ElementRef, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[positiveNumberOnly]'
})
export class PositiveNumberOnlyDirective {
    constructor(private el: ElementRef<HTMLInputElement>, @Optional() private control?: NgControl) { }

    @HostListener('input')
    onChange() {

        let value = this.el.nativeElement.value;
        value = value.replace(/[^0-9.]/g, '');

        const decimalCount = value.split('.').length - 1;
        if (decimalCount > 1) {
            const parts = value.split('.');
            value = parts[0] + '.' + parts.slice(1).join('');
        }

        if (value !== this.el.nativeElement.value) {
            this.el.nativeElement.value = value;
            this.control?.control?.setValue(value);
        }
    }
}
