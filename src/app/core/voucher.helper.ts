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
        const canvas = VoucherHelper.buildVoucherCanvas(studentPayment);
        return canvas ? canvas.toDataURL('image/png') : '';
    }

    // Nuevo método: retorna el canvas para previsualización
    static buildVoucherCanvas(studentPayment: StudentPayment): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Estilo voucher oscuro
            const width = 800;
            const baseHeight = 320;
            const chargeHeight = 50;
            const charges = studentPayment.paymentCharges.length;
            canvas.width = width;
            canvas.height = baseHeight + (charges * chargeHeight);

            // Fondo negro
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Borde claro
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

            // Header: logo cuadrado y título
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillRect(30, 30, 40, 40); // logo cuadrado
            ctx.fillStyle = '#111';
            ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
            ctx.fillText('SM', 40, 60);

            ctx.textAlign = 'left';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
            ctx.fillText('Centro Deportivo StudyManager', 90, 50);
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.fillText('RECIBO DE PAGO', 90, 70);

            // Folio y fecha
            ctx.textAlign = 'right';
            ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`REC-${studentPayment.id || 'XXXX'}-001`, width - 40, 50);
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`${new Date(studentPayment.paymentDate).toLocaleDateString()}`, width - 40, 70);

            // Estudiante
            ctx.textAlign = 'left';
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.fillText('Estudiante:', 40, 110);
            ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`${studentPayment.student.name} `, 160, 110);

            // Mensualidades
            let yPos = 190;
            studentPayment.paymentCharges.forEach((charge: PaymentCharge) => {
                ctx.font = '16px "Segoe UI", Arial, sans-serif';
                ctx.fillText('Categoría:', 40, 140);
                ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
                ctx.fillStyle = '#222';
                ctx.fillRect(160, 120, 90, 30);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
                ctx.fillText(`${charge.activity.categoryId || 'Deportes'}`, 170, yPos);

                ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
                ctx.fillStyle = '#fff';
                ctx.fillText(`${charge.activity.description}`, 40, yPos);
                ctx.font = '14px "Segoe UI", Arial, sans-serif';
                ctx.fillStyle = '#aaa';
                ctx.fillText(`(${charge.activity.description || 'Febrero 2025'})`, 250, yPos);
                ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
                ctx.fillStyle = '#fff';
                ctx.fillText(`$${charge.amount.toFixed(0)}`, width - 120, yPos);
                yPos += chargeHeight;
            });

            // Línea separadora
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(40, yPos);
            ctx.lineTo(width - 40, yPos);
            ctx.stroke();

            // TOTAL
            ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.fillText('TOTAL:', 60, yPos + 40);
            ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`$${studentPayment.amount.toFixed(0)}`, width - 120, yPos + 40);

            // Recibido por
            ctx.font = '14px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#aaa';
            ctx.fillText(`Recibido por: ${false || 'María González'}`, 40, yPos + 80);

            // PDF icono
            ctx.font = '16px "Segoe UI Symbol", Arial, sans-serif';
            ctx.fillStyle = '#aaa';
            ctx.fillText('⭳ PDF', width - 80, yPos + 80);

        }

        return canvas;
    }

}