
import { AbstractControl, ValidationErrors } from "@angular/forms";

export class MaviValidators {
    static maxDate(compareToKey: string, message: string): (control: AbstractControl) => ValidationErrors | null {
        return (control: AbstractControl) => {
            if (!control.parent) return null;
            const compareToValue = control.parent.get(compareToKey)?.value;
            if (compareToValue && control.value) {
                const dateValue = new Date(control.value);
                const compareDate = new Date(compareToValue);
                if (dateValue >= compareDate) {
                    return { message: message };
                }
            }
            return null;
        };
    }
    static minDate(compareToKey: string, message: string): (control: AbstractControl) => ValidationErrors | null {
        return (control: AbstractControl) => {
            if (!control.parent) return null;
            const compareToValue = control.parent.get(compareToKey)?.value;
            if (compareToValue && control.value) {
                const dateValue = new Date(control.value);
                const compareDate = new Date(compareToValue);
                if (dateValue <= compareDate) {
                    return { message: message };
                }
            }
            return null;
        };
    }
    static required(message: string = 'Campo requerido'): (control: AbstractControl) => ValidationErrors | null {
        return (control: AbstractControl) => {
            if (control.value === null || control.value === undefined || control.value === '') {
                return {
                    required: true,
                    message
                };
            }
            return null;
        };
    }

    static min(minValue: number, message: string = `El valor mínimo es ${minValue}`): (control: AbstractControl) => ValidationErrors | null {
        return (control: AbstractControl) => {
            if (control.value !== null && control.value !== undefined && control.value < minValue) {
                return {
                    message
                };
            }
            return null;
        };
    }
}
