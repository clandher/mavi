// Create a new Angular component for the link-help functionality
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-link-help',
  template: `
    <a [href]="href" target="_blank" class="hover-link-external underline d-flex align-items-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 me-2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
      </svg>
      {{ description }}
    </a>
  `,
  styles: [],
  standalone: true
})
export class LinkHelpComponent {
  @Input() href!: string;
  @Input() description!: string;
}