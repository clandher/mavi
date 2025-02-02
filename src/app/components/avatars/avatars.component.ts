import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-avatars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avatars.component.html',
  styleUrl: './avatars.component.scss'
})
export class AvatarsComponent {

  private fakeAvatars = 57;

  // Función para generar un número aleatorio dentro de un rango
  public getRandomInRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Datos ficticios
  public fakeNames = ['Juan', 'Pedro', 'Maria', 'Ana', 'Carlos', 'Luis', 'Jose', 'Sofia', 'Jorge', 'Clara'];
  public fakePositions = ['Delantero', 'Defensor', 'Centrocampista', 'Portero'];
  public fakeNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];


  // Generar los datos falsos
  public generateFakeData() {
    return Array(this.fakeAvatars).fill(0).map((_, i) => ({
      id: i + 1,
      name: this.fakeNames[this.getRandomInRange(0, this.fakeNames.length - 1)],
      age: this.getRandomInRange(18, 35), // Edad aleatoria entre 18 y 35
      position: this.fakePositions[this.getRandomInRange(0, this.fakePositions.length - 1)],
      number: this.fakeNumbers[this.getRandomInRange(0, this.fakeNumbers.length - 1)],
    }));
  }

  // Definir las actividades con los avatares generados aleatoriamente
  public activities = [
    { id: 1, name: 'Entrenamiento (Marzo)', avatars: this.generateFakeData() },
    { id: 2, name: 'Liga X', avatars: this.generateFakeData() },
    { id: 3, name: 'Entrenamiento (Abril)', avatars: this.generateFakeData() },
    { id: 4, name: 'Entrenamiento (Mayo)', avatars: this.generateFakeData() },
    { id: 5, name: 'Entrenamiento (Junio)', avatars: this.generateFakeData() },
    { id: 6, name: 'Entrenamiento (Julio)', avatars: this.generateFakeData() },
    { id: 7, name: 'Torneo X', avatars: this.generateFakeData() },
    { id: 8, name: 'Entrenamiento (Agosto)', avatars: this.generateFakeData() },
  ];



  public selectedActivityId: number = this.activities[0].id;
  public selectedAvatar: any | null = null;
  public showSubmenu: { [key: string]: boolean } = {};
  public showModal: boolean = false;
  public mode: 'add' | 'update' = 'add';

  constructor() {
    this.selectActivity(this.activities[0].id, 0)
  }

  // Método para seleccionar una actividad
  selectActivity(activityId: number, index: number): void {
    this.selectedActivityId = activityId;
    this.selectedAvatar = null;


    // Encuentra el botón seleccionado
    setTimeout(() => {
      const buttons = document.querySelectorAll('button');
      const selectedButton = buttons[index] as HTMLElement;

      if (selectedButton) {
        this.highlightWidth = selectedButton.offsetWidth + 12; // Ajuste del tamaño
        this.highlightPosition = selectedButton.offsetLeft - 6; // Ajuste de posición
      }
    }, 50);
  }

  addNewAvatar() {
    this.mode = 'add';
    this.selectedAvatar = {

    };

    this.showModal = true;
    // Aquí puedes abrir un modal o formulario para agregar un nuevo avatar.
  }

  // Método para seleccionar un avatar
  selectAvatar(avatar: any | null): void {
    this.selectedAvatar = this.selectedAvatar === avatar ? null : avatar;
  }

  // Método para alternar la visibilidad de un submenú
  toggleSubmenu(option: string): void {
    this.showSubmenu[option] = !this.showSubmenu[option];
  }

  // Método para abrir el modal de edición
  openEditModal(avatar: any): void {
    this.mode = 'update';

    this.selectedAvatar = { ...avatar }; // Clonamos para no modificar directamente
    this.showModal = true;
  }

  // Método para cerrar el modal
  closeModal(): void {
    this.showModal = false;
  }

  // Método para guardar los cambios
  saveChanges(): void {
    const activity = this.activities.find(a => a.id === this.selectedActivityId);
    if (activity) {
      const index = activity.avatars.findIndex(a => a.id === this.selectedAvatar.id);
      if (index !== -1) {
        activity.avatars[index] = { ...this.selectedAvatar }; // Guardamos los cambios
      }
    }
    this.showModal = false;
  }

  highlightWidth = 0;
  highlightPosition = 0;

  public paymentAmount: number | null = null;
  public showPaymentModal: boolean = false;

  // Método para abrir el modal de pago
  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  // Método para cerrar el modal de pago
  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  // Método para guardar el pago
  savePayment(): void {
    if (this.paymentAmount != null && this.paymentAmount > 0) {
      // Simula el guardado del pago
      console.log(`Pago de ${this.paymentAmount} registrado.`);

      // Aquí podrías integrar la lógica de guardar el pago (por ejemplo, en una base de datos)

      // Después de guardar, generamos el voucher
      this.generateVoucher();

      // Cerrar el modal
      this.closePaymentModal();
    } else {
      alert('Por favor ingrese un monto válido.');
    }
  }

  // Método para simular la descarga de un voucher (generación de una imagen)
  generateVoucher(): void {
    const voucherImage = this.createVoucherImage();
    const a = document.createElement('a');
    a.href = voucherImage;
    a.download = 'voucher.png';
    a.click();
  }

  // Método para crear la imagen del voucher (simulación de descarga de imagen)
  createVoucherImage(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = 400;
      canvas.height = 200;

      // Fondo
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Título
      ctx.font = '24px Arial';
      ctx.fillStyle = '#000';
      ctx.fillText('Voucher de Pago', 120, 40);

      // Monto
      ctx.font = '20px Arial';
      ctx.fillText(`Monto: $${this.paymentAmount}`, 120, 80);

      // Fecha
      const date = new Date().toLocaleDateString();
      ctx.fillText(`Fecha: ${date}`, 120, 120);

      // Convertimos el canvas a una URL para la imagen
      return canvas.toDataURL('image/png');
    }

    return '';
  }


  public newEventModalVisible: boolean = false;
  public newEventName: string = '';
  public newEventStartDate: string = '';
  public newEventEndDate: string = '';
  public newEventCost: number | null = null;

  // Función para abrir el modal de nuevo evento
  openNewEventModal(): void {
    this.newEventModalVisible = true;
  }

  // Función para cerrar el modal de nuevo evento
  closeNewEventModal(): void {
    this.newEventModalVisible = false;
  }

  // Función para guardar el nuevo evento
  saveNewEvent(): void {
    if (this.newEventName && this.newEventStartDate && this.newEventEndDate && this.newEventCost != null) {
      // Aquí puedes agregar la lógica para guardar el evento
      const newEvent = {
        id: this.activities.length + 1, // Asignar un id único
        name: this.newEventName,
        startDate: this.newEventStartDate,
        endDate: this.newEventEndDate,
        cost: this.newEventCost,
        avatars: [], // Los avatares pueden ir vacíos inicialmente
      };

      // Agregar el nuevo evento a la lista de actividades
      this.activities.push(newEvent);

      // Cerrar el modal
      this.closeNewEventModal();
    } else {
      alert('Por favor, complete todos los campos.');
    }
  }

}
