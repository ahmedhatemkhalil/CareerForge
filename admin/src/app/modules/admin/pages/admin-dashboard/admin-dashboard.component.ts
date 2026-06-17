import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { HttpClient } from '@angular/common/http';
import { DashboardStats } from '../../interfaces/admin.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  stats: DashboardStats = { totalUsers: 0, activeUsers: 0, totalCvs: 0, bannedUsers: 0 };
  isDarkMode: boolean = true;

  // التحكم في الـ Modals الفيجما الجديدة
  showRoleModal: boolean = false;
  showBanModal: boolean = false;
  selectedUser: any = null;

  constructor(private adminService: AdminService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAdminData();
  }

loadAdminData(): void {
  this.adminService.getUsers().subscribe({
    next: (users) => {
      // بما أننا لا نستطيع جلب CVs، سنعتمد على البيانات القادمة مع المستخدم فقط
      this.users = users.map((user: any) => ({
        ...user,
        role: user.role || 'User',
        status: user.status || 'active',
        createdAt: user.createdAt || new Date(),
        // نستخدم حقل cvCount إذا كان موجوداً في بيانات المستخدم، وإلا نعتبره 0
        cvCount: user.cvCount || (user.cvs ? user.cvs.length : 0)
      }));

      // الآن نقوم بحساب الإحصائيات بناءً على بيانات المستخدمين فقط
      this.updateStats();
    },
    error: (err) => console.error("Error fetching users:", err)
  });
}

  updateStats(): void {
    this.stats.totalUsers = this.users.length;
    this.stats.activeUsers = this.users.filter(u => u.status?.toLowerCase() === 'active').length;
    this.stats.bannedUsers = this.users.filter(u => u.status?.toLowerCase() === 'banned' || u.status?.toLowerCase() === 'suspended').length;
    this.stats.totalCvs = this.users.reduce((acc, user) => acc + (user.cvCount || 0), 0);
  }

  loadTotalCvsCount(): void {
    this.http.get<any>('http://localhost:5000/api/cvs/').subscribe({
      next: (res) => {
        this.stats.totalCvs = res?.data?.pagination?.total || res?.data?.cvs?.length || 15;
      },
      error: (err) => {
        console.warn('CV API not responding, using fallback value for layout:', err);
        this.stats.totalCvs = 15;
      }
    });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  openRoleModal(user: any): void {
    this.selectedUser = user;
    this.showRoleModal = true;
  }

  openBanModal(user: any): void {
    this.selectedUser = user;
    this.showBanModal = true;
  }

  closeModals(): void {
    this.showRoleModal = false;
    this.showBanModal = false;
    this.selectedUser = null;
  }

  // 1. تعديل الـ Role وتحديث الجدول والداتابيز فوراً
  updateUserRole(newRole: string): void {
    if (!this.selectedUser) return;
    const userId = this.selectedUser._id || this.selectedUser.id;

    // تحديث فوري في الـ UI للجدول الحالي بدون انتظار الـ Response
    this.selectedUser.role = newRole;

    // إرسال الطلب للباك إند ليسمع في الداتابيز
    this.adminService.updateUserStatus(userId, this.selectedUser.status || 'active', newRole).subscribe({
      next: () => {
        this.closeModals();
        this.loadAdminData(); // جلب البيانات من السيرفر للتأكيد النهائي والمزامنة
      },
      error: (err) => {
        console.error('Error updating user role:', err);
        this.loadAdminData(); // في حال فشل السيرفر، نعيد تحميل الداتا القديمة لحماية الـ UI
      }
    });
  }

  // 2. عمل الـ Ban الفعلي، إخفاء الأيقونات، وتحديث الداتابيز والإحصائيات فوراً
  confirmBanUser(): void {
  if (!this.selectedUser) return;

  // تأكدي إنك بتبعتي الـ role الحالي
  this.adminService.updateUserStatus(
    this.selectedUser._id,
    'banned',
    this.selectedUser.role, // <-- تأكدي إن دي موجودة
    'Banned by Admin'
  ).subscribe({
    next: () => {
      this.closeModals();
      this.loadAdminData(); // دلوقتي الـ Load هتقرأ الـ status الجديد من الداتابيز
    }
  });
}
}
