import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    selector: 'app-breadcrumbs',
    template: `
    <nav class="breadcrumbs">
      <ul>
        <li *ngFor="let breadcrumb of breadcrumbs">
          <a *ngIf="breadcrumb.url" [routerLink]="breadcrumb.url" [queryParams]="breadcrumb.queryParams">{{ breadcrumb.label }} </a>
          <span *ngIf="!breadcrumb.url">{{ breadcrumb.label }} </span>
        </li>
      </ul>
    </nav>
  `,
    styleUrls: [`./breadcrumbs.component.scss`]
})
export class BreadcrumbsComponent implements OnInit {
    breadcrumbs: Array<{ label: string; url?: string; queryParams?: any }> = [];

    constructor(private router: Router, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                const currentUrl = event.urlAfterRedirects;
                const label = this.getLabelFromUrl(currentUrl);

                // Get the origin query param
                const origin = this.route.snapshot.queryParams['origin'];

                this.breadcrumbs = [{ label, url: currentUrl, queryParams: { origin } }];
                console.log('Updated breadcrumbs:', this.breadcrumbs); // Debugging breadcrumbs
            });
    }

    private getLabelFromUrl(url: string): string {
        // Extract a label from the URL (e.g., last segment or a custom mapping)
        const segments = url.split('/').filter(segment => segment);
        const lastSegment = segments.length > 0 ? decodeURIComponent(segments[segments.length - 1]) : 'Home';

        // Custom mapping for specific routes
        if (lastSegment === 'avatars') {
            return 'Avatars';
        } else if (lastSegment === 'student-list') {
            return 'Student List';
        }

        return lastSegment;
    }
}