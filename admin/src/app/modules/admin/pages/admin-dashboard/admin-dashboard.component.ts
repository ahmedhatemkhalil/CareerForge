import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DashboardStats } from '../../interfaces/admin.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
reactivateUser(_t79: any) {
throw new Error('Method not implemented.');
}
  private adminService = inject(AdminService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  users: any[] = [];
  stats: DashboardStats = { totalUsers: 0, activeUsers: 0, totalCvs: 0, bannedUsers: 0 };
  isDarkMode: boolean = true;

  adminName: string = 'Admin';
  adminInitial: string = 'AD';

  showRoleModal: boolean = false;
  showBanModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedUser: any = null;

  ngOnInit(): void {
    this.loadAdminData();
    this.loadAdminInfo();
  }

  loadAdminInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.adminName = user.name || 'Admin';
    this.adminInitial = this.adminName.substring(0, 2).toUpperCase();
  }

  loadAdminData(): void {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users.map((user: any) => ({
          ...user,
          role: user.role || 'User',
          status: user.status || 'active',
          createdAt: user.createdAt || new Date(),
          cvCount: user.cvCount || (user.cvs ? user.cvs.length : 0)
        }));
        this.updateStats();
      },
      error: (err) => {
        this.toastr.error("Failed to load users");
        console.error(err);
      }
    });
  }

  updateStats(): void {
    this.stats.totalUsers = this.users.length;
    this.stats.activeUsers = this.users.filter(u => u.status?.toLowerCase() === 'active').length;
    this.stats.bannedUsers = this.users.filter(u => u.status?.toLowerCase() === 'banned' || u.status?.toLowerCase() === 'suspended').length;
    this.stats.totalCvs = this.users.reduce((acc, user) => acc + (user.cvCount || 0), 0);
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  logout() {
    localStorage.clear();
    this.toastr.success("Logged out successfully");
    this.router.navigate(['/login']);
  }

  openRoleModal(user: any) { this.selectedUser = user; this.showRoleModal = true; }
  openBanModal(user: any) { this.selectedUser = user; this.showBanModal = true; }
  openDeleteModal(user: any) { this.selectedUser = user; this.showDeleteModal = true; }

  closeModals(): void {
    this.showRoleModal = false;
    this.showBanModal = false;
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  updateUserRole(newRole: string): void {
  if (!this.selectedUser) return;

  const userId = this.selectedUser._id;
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

  this.adminService.updateUserStatus(userId, this.selectedUser.status, newRole).subscribe({
    next: () => {
      if (loggedInUser._id === userId && newRole !== 'Admin') {
        this.toastr.warning("Your role has been changed. Logging out...");
        this.logout(); 
      } else {
        this.toastr.success("Role updated successfully");
        this.closeModals();
        this.loadAdminData();
      }
    }
  });
}

  confirmBanUser(): void {
    this.adminService.updateUserStatus(this.selectedUser._id, 'banned', this.selectedUser.role).subscribe(() => {
      this.toastr.warning("User banned");
      this.closeModals();
      this.loadAdminData();
    });
  }

  confirmDeleteUser(): void {
    this.adminService.deleteUser(this.selectedUser._id).subscribe(() => {
      this.toastr.error("User deleted");
      this.closeModals();
      this.loadAdminData();
    });
  }
}
