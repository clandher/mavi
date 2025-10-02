import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    selector: 'app-breadcrumbs',
    template: `
    <nav class="breadcrumbs">
      <ul>
        <li *ngFor="let breadcrumb of breadcrumbs">
          <a *ngIf="breadcrumb.url" [routerLink]="breadcrumb.url">{{ breadcrumb.label }} </a>
          <span *ngIf="!breadcrumb.url">{{ breadcrumb.label }} </span>
        </li>
      </ul>
    </nav>
  `,
    styleUrls: [`./breadcrumbs.component.scss`]
})
export class BreadcrumbsComponent implements OnInit {
    breadcrumbs: Array<{ label: string; url?: string }> = [];

    constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

    ngOnInit(): void {
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                map(() => this.buildBreadcrumbs(this.activatedRoute.root))
            )
            .subscribe(breadcrumbs => {
                this.breadcrumbs = breadcrumbs;
                console.log('Generated breadcrumbs:', breadcrumbs); // Debugging breadcrumbs
            });
    }

    private buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Array<{ label: string; url?: string }> = []): Array<{ label: string; url?: string }> {
        const children: ActivatedRoute[] = route.children;

        for (const child of children) {
            const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
            console.log('Processing route:', {
                routeURL,
                breadcrumb: child.snapshot.data['breadcrumb'],
                fullURL: url + `/${routeURL}`
            });

            if (routeURL) {
                url += `/${routeURL}`;
            }

            const label = child.snapshot.data['breadcrumb'] || routeURL;
            if (label) {
                breadcrumbs.push({
                    label,
                    url: child.snapshot.data['breadcrumb'] ? url : undefined
                });
            }

            this.buildBreadcrumbs(child, url, breadcrumbs);
        }

        return breadcrumbs;
    }
}