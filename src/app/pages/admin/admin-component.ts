import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth-service";

/**
 * Admin Component
 * 
 * Admin-only page with features:
 * - Admin dashboard information
 * - Links to inventory management
 * - Admin statistics and status
 */
@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./admin-component.html"
})
export class AdminComponent {
  private authService = inject(AuthService);
  
  currentUser = this.authService.currentUser;
  
  // Admin stats (can be extended with real data from a service)
  adminStats = signal({
    totalUsers: 2, // admin + demo user
    systemStatus: 'Operational',
    lastBackup: new Date().toLocaleDateString()
  });
}