import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from "./components/menu/menu.component";
import { CommonModule } from '@angular/common';
import { AvatarsComponent } from "./components/avatars/avatars.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent,  AvatarsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mavi';

}
