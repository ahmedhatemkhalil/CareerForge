import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DashboardStats } from '../../interfaces/admin.interface';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule ,RouterModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
reactivateUser(_t79: any) {
throw new Error('Method not implemented.');
}
  private adminService = inject(AdminService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  users: any[] = [];
  stats: DashboardStats = {
    totalUsers: 0, activeUsers: 0, totalCvs: 0, bannedUsers: 0,
    totalRoadmaps: 0,
    totalInterviews: 0,
    totalAnalyses: 0
  };
  isDarkMode: boolean = false;

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


loadAdminData() {
  // نستخدم الدالة الجديدة التي أنشأناها في السيرفس
  this.adminService.getDashboardReport().subscribe({
    next: (response) => {
      // 1. تحديث جدول المستخدمين (البيانات جاهزة وبها كل الـ Counts)
      this.users = response.data;

      // 2. تحديث الـ Cards (الإحصائيات العامة)
      // نقوم بجمع كل الكاونتات من مصفوفة المستخدمين
      this.stats = {
        totalUsers: this.users.length,
        activeUsers: this.users.filter(u => u.status === 'active').length,
        bannedUsers: this.users.filter(u => u.status === 'banned' || u.status === 'suspended').length,
        totalCvs: this.users.reduce((acc, u) => acc + (u.cvCount || 0), 0),
        totalAnalyses: this.users.reduce((acc, u) => acc + (u.analysisCount || 0), 0),
        totalInterviews: this.users.reduce((acc, u) => acc + (u.interviewCount || 0), 0),
        totalRoadmaps: this.users.reduce((acc, u) => acc + (u.roadmapCount || 0), 0)
      };
    },
    error: (err) => {
      this.toastr.error("Failed to load dashboard data");
      console.error(err);
    }
  });
}
 updateStats(data?: any): void {
  this.stats.totalUsers = this.users.length;
  this.stats.activeUsers = this.users.filter(u => u.status?.toLowerCase() === 'active').length;
  this.stats.bannedUsers = this.users.filter(u => u.status?.toLowerCase() === 'banned' || u.status?.toLowerCase() === 'suspended').length;
  this.stats.totalCvs = this.users.reduce((acc, user) => acc + (user.cvCount || 0), 0);

  // تحديث الإحصائيات الجديدة (إذا كانت البيانات موجودة)
  if (data) {
    this.stats.totalAnalyses = data.analyses.length;
    this.stats.totalInterviews = data.interviews.length;
    this.stats.totalRoadmaps = data.roadmaps.length;
  }
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
