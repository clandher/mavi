import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'currencyMX',
    standalone: true
})
export class CurrencyMXPipe implements PipeTransform {
    transform(value: number): string {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value);
    }
}