import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from "./components/menu/menu.component";
import { CommonModule } from '@angular/common';
import { AvatarsComponent } from "./components/avatars/avatars.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent, AvatarsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mavi';

  constructor(private toastr: ToastrService) { }

  ngOnInit() {

    setTimeout(() => {
      this.toastr.success('Hello world!', 'Toastr fun!', {
        // timeOut: 0,
        // extendedTimeOut: 0,
      });
    }, 0);
  }
}
