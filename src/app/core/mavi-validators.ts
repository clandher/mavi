
import { AbstractControl, ValidationErrors, Validators } from "@angular/forms";

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

    static minLength(minLength: number, message: string = `La longitud mínima es ${minLength}`): (control: AbstractControl) => ValidationErrors | null {
        return (control: AbstractControl) => {
            if (control.value !== null && control.value !== undefined && control.value.length < minLength) {
                return {
                    message
                };
            }
            return null;
        };
    }
    static email(message: string = 'Email inválido'): (control: AbstractControl) => ValidationErrors | null {
        // Usa la lógica de Angular Validators.email
        // Importa Validators de @angular/forms
        // Si el valor no es válido, retorna el mensaje personalizado
        // Si es válido, retorna null
        // Si el valor está vacío, no valida (igual que Validators.email)
        // No retorna el error 'email', solo el mensaje personalizado

        // Asegúrate de importar Validators arriba:
        // import { AbstractControl, ValidationErrors, Validators } from "@angular/forms";

        return (control: AbstractControl) => {
            if (control.value === null || control.value === undefined || control.value === '') {
                return null;
            }
            const error = Validators.email(control);
            if (error) {
                return { message };
            }
            return null;
        };
    }
}
