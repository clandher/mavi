import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@app/core/auth.service';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {


    constructor(
        public authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
    ) { }

    ngOnInit(): void {

        // const normalizedUrl = decodeURIComponent(this.router.url);
        // if (normalizedUrl.endsWith('/configuración')) {
        //     const lastRoute = localStorage.getItem('configuration.tab') || 'escuela';
        //     this.router.navigate([lastRoute], { relativeTo: this.route });
        // } else {
        //     const segments = this.router.url.split('/');
        //     const tab = segments[segments.length - 1];
        //     localStorage.setItem('configuration.tab', tab);
        // }

        // const segments = this.router.url.split('/');
        // const tab = segments[segments.length - 1];
        // localStorage.setItem('configuration.tab', tab);
    }

    onTabClick(tab: string) {
        localStorage.setItem('configuration.tab', tab);
    }
}