import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-short-button',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './short-button.component.html',
	styleUrls: ['./short-button.component.scss']
})
export class ShortButtonComponent {
	@Input() icon: boolean = true;
	@Output() clicked = new EventEmitter<void>();

	onClick() {
		this.clicked.emit();
	}
}
