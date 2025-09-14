import { PaymentCharge, School, StudentPayment } from "./dto";

export class VoucherHelper {

    static async download(studentPayment: StudentPayment, school: School): Promise<void> {
        const voucherImage = await VoucherHelper.buildVoucherImage(studentPayment, school);
        const a = document.createElement('a');
        a.href = voucherImage;
        a.download = 'voucher.png';
        a.click();
    }

    // Método para crear la imagen del voucher (minimalista) - versión async para esperar el logo
    static async buildVoucherImage(studentPayment: StudentPayment, school: School): Promise<string> {
        const canvas = await VoucherHelper.buildVoucherCanvas(studentPayment, school);
        return canvas ? canvas.toDataURL('image/png') : '';
    }

    // Nuevo método: retorna el canvas para previsualización y espera el logo si es necesario
    static async buildVoucherCanvas(studentPayment: StudentPayment, school: School): Promise<HTMLCanvasElement> {

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;

        // Estilo voucher oscuro
        const width = 800;
        const baseHeight = 250; // altura mínima profesional
        const chargeHeight = 30;
        const charges = studentPayment.paymentCharges.length;
        canvas.width = width;
        canvas.height = Math.max(baseHeight, baseHeight + (charges * chargeHeight));

        // Fondo negro
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Marca de agua: logo centrado, proporcional y translúcido
        if (school.logoUrl) {
            await new Promise<void>((resolve) => {
                const img = new window.Image();
                img.crossOrigin = 'anonymous';
                img.src = school.logoUrl || '';
                img.onload = () => {
                    // Calcular tamaño máximo permitido
                    const maxW = Math.min(canvas.width * 0.7, 500); // más grande
                    const maxH = Math.min(canvas.height * 0.7, 220); // más alto
                    // Mantener proporción
                    let drawW = img.width;
                    let drawH = img.height;
                    const ratio = drawW / drawH;
                    if (drawW > maxW) {
                        drawW = maxW;
                        drawH = drawW / ratio;
                    }
                    if (drawH > maxH) {
                        drawH = maxH;
                        drawW = drawH * ratio;
                    }
                    const dx = (canvas.width - drawW) / 2;
                    const dy = (canvas.height - drawH) / 2;
                    ctx.save();
                    ctx.globalAlpha = 0.06; // opacidad más sutil
                    ctx.drawImage(img, dx, dy, drawW, drawH);
                    ctx.restore();
                    // Logo normal en header (sin proporción, tamaño fijo)
                    ctx.drawImage(img, 30, 30, 40, 40);
                    resolve();
                };
                img.onerror = () => {
                    // Marca de agua cuadrada por defecto
                    ctx.save();
                    ctx.globalAlpha = 0.06;
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(canvas.width/2-140, canvas.height/2-70, 280, 140);
                    ctx.restore();
                    // Logo normal en header
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(30, 30, 40, 40);
                    resolve();
                };
            });
        } else {
            // Marca de agua cuadrada por defecto
            ctx.save();
            ctx.globalAlpha = 0.08;
            ctx.fillStyle = '#fff';
            ctx.fillRect(canvas.width/2-140, canvas.height/2-70, 280, 140);
            ctx.restore();
            // Logo normal en header
            ctx.fillStyle = '#fff';
            ctx.fillRect(30, 30, 40, 40);
        }

    // Borde blanco profesional alrededor del voucher
    ctx.save();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    ctx.restore();

        ctx.fillStyle = '#111';
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.fillText('', 40, 60);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
        ctx.fillText(school.description, 90, 50);
        ctx.font = '16px "Segoe UI", Arial, sans-serif';
        ctx.fillText('RECIBO DE PAGO', 90, 70);

        // Folio y fecha
        ctx.textAlign = 'right';
        ctx.font = '16px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`${new Date(studentPayment.paymentDate).toLocaleString()}`, width - 40, 50);

        // Estudiante
        ctx.textAlign = 'left';
        ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Estudiante:', 30, 110);
        
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${studentPayment.student.name} `, 130, 110);

        // Mensualidades
        let yPos = 170;
        // Encabezados de la tabla
        ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'left';
        ctx.fillText('Actividades:', 30, yPos - 30);
        ctx.fillText('Monto', 705, yPos - 30);
        // ctx.fillText('Restante', 670, yPos - 30);

        studentPayment.paymentCharges.forEach((charge: PaymentCharge) => {
            // Categoría
            ctx.font = '14px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            const categoryText = `${charge.activity.category.type || ''}`;
            const textMetrics = ctx.measureText(categoryText);
            const rectX = 30;
            const rectY = yPos - 16;
            const rectHeight = 22;
            const rectWidth = Math.max(textMetrics.width + 10, 40); // Minimum width 40
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
            ctx.fillText(categoryText, 35, yPos);

            ctx.font = '14px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`${charge.activity.description || ''} (${charge.collection.concept})`, 80, yPos);

            ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`$${charge.amount.toFixed(2)}`, 750, yPos);

            // if (charge.collection.amountRemaining && charge.collection.amountRemaining > 0) {
            //     ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
            //     ctx.textAlign = 'right';
            //     ctx.fillStyle = '#ffb300';
            //     ctx.fillText(`$${(charge.collection.amountRemaining).toFixed(2)}`, 760, yPos);
            // }

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
        ctx.fillText('TOTAL:', 80, yPos + 40);
        ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`$${studentPayment.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, width - 30, yPos + 40);

        // Recibido por
        // ctx.font = '14px "Segoe UI", Arial, sans-serif';
        // ctx.fillStyle = '#aaa';
        // ctx.fillText(`Recibido por: ${false || 'María González'}`, 40, yPos + 80);

        return canvas;
    }

}