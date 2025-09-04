import { PaymentCharge, StudentPayment } from "@app/components/students/student-payments.component";

export class VoucherHelper {

    static download(studentPayment: StudentPayment): void {
        const voucherImage = VoucherHelper.buildVoucherImage(studentPayment);
        const a = document.createElement('a');
        a.href = voucherImage;
        a.download = 'voucher.png';
        a.click();
    }

    // Método para crear la imagen del voucher (minimalista)
    static buildVoucherImage(studentPayment: StudentPayment): string {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Minimalista: blanco, negro y gris
            canvas.width = 600;
            canvas.height = 350 + (studentPayment.paymentCharges.length * 80);

            // Fondo blanco
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Borde negro fino
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

            // Header minimalista
            ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#222';
            ctx.textAlign = 'center';
            ctx.fillText('COMPROBANTE DE PAGO', canvas.width / 2, 50);

            // Línea gris debajo del header
            ctx.strokeStyle = '#bbb';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(60, 70);
            ctx.lineTo(canvas.width - 60, 70);
            ctx.stroke();

            // Detalles principales
            ctx.textAlign = 'left';
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#222';
            ctx.fillText(`Estudiante:`, 40, 110);
            ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`${studentPayment.student.name}`, 160, 110);

            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`Fecha de pago:`, 40, 140);
            ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`${new Date(studentPayment.paymentDate).toLocaleString()}`, 160, 140);

            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`Monto total:`, 40, 170);
            ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`$${studentPayment.amount.toFixed(2)}`, 160, 170);

            // Subtítulo de cargos
            ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#222';
            ctx.fillText('Detalle de cargos', 40, 210);

            // Línea gris debajo del subtítulo
            ctx.strokeStyle = '#eee';
            ctx.beginPath();
            ctx.moveTo(40, 220);
            ctx.lineTo(canvas.width - 40, 220);
            ctx.stroke();

            // Listado de cargos
            let yPos = 250;
            studentPayment.paymentCharges.forEach((charge: PaymentCharge) => {
                ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
                ctx.fillStyle = '#222';
                ctx.fillText(`${charge.activity.description}`, 50, yPos);

                ctx.font = '14px "Segoe UI", Arial, sans-serif';
                ctx.fillStyle = '#444';
                ctx.fillText(`Pagado: $${charge.amount.toFixed(2)}`, 70, yPos + 22);
                ctx.fillText(`Original: $${charge.collection.amountToBePaid.toFixed(2)}`, 220, yPos + 22);
                ctx.fillText(`Pendiente: $${charge.collection.amountRemaining.toFixed(2)}`, 370, yPos + 22);

                // Línea separadora
                ctx.strokeStyle = '#f0f0f0';
                ctx.beginPath();
                ctx.moveTo(50, yPos + 35);
                ctx.lineTo(canvas.width - 50, yPos + 35);
                ctx.stroke();

                yPos += 55;
            });

            // Footer minimalista
            ctx.font = 'italic 13px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#888';
            ctx.textAlign = 'center';
            ctx.fillText('Gracias por su pago', canvas.width / 2, yPos + 40);

            return canvas.toDataURL('image/png');
        }

        return '';
    }

}