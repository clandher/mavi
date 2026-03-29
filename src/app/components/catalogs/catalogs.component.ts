import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-catalogs',
  standalone: true,
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class CatalogsComponent { }
