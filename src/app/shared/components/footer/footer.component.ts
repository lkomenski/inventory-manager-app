import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * footer.component.ts
 *
 * Application-wide footer rendered at the bottom of every page via the root
 * app shell. Contains three columns: an about blurb, quick navigation links,
 * and a technology stack summary.
 *
 * This is a purely presentational component — no inputs, outputs, or injected
 * services. If dynamic content (e.g. current year or API status) is needed in
 * the future, inject the appropriate service here without changing the template
 * structure.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html'
})
export class FooterComponent {}
