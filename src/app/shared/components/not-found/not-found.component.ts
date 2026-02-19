import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * 404 Not Found Component
 * 
 * Displays a friendly error page when user navigates to an invalid route.
 * Provides a link to return to the home page.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent {}
