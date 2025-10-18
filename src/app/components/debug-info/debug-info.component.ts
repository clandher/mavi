import { Component } from '@angular/core';

@Component({
  selector: 'app-debug-info',
  imports: [],
  standalone: true,
  templateUrl: './debug-info.component.html',
  styleUrl: './debug-info.component.scss'
})
export class DebugInfoComponent {

  debug: boolean = localStorage.getItem('debug') === 'true';
}
