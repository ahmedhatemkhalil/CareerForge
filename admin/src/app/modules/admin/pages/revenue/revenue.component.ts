import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Payment, RevenueStats, Transaction, User } from '../../interfaces/admin.interface';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, RouterModule ,FormsModule],
  templateUrl: './revenue.component.html',
  styleUrl: './revenue.component.css'
})
export class RevenueComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  plans: any[] = [];

  isDarkMode: boolean = false;
  adminName: string = 'Admin';
  adminInitial: string = 'AD';
  isModalOpen: boolean = false;
selectedPlan: string = '';
currentPlanData: any = null;

  stats: any = { totalRevenue: 0, monthRevenue: 0, totalPayments: 0, activeSubscribers: 0 };
  transactions: Transaction[] = [];

  ngOnInit() {
    this.loadAdminInfo();
    this.loadAllData();
   this.adminService.getPlans().subscribe(data => {

  if (Array.isArray(data)) {
    this.plans = data;
  } else if (data.plans && Array.isArray(data.plans)) {
    this.plans = data.plans;
  } else {
    this.plans = [];
  }
});
  }

  loadAllData() {
    forkJoin({
      payments: this.adminService.getAllPayments(),
      users: this.adminService.getUsers(),
      stats: this.adminService.getStats()
    }).subscribe({
      next: ({ payments, users, stats }) => {
        const userArray = Array.isArray(users) ? users : [users];

        this.transactions = payments.map((pay: any) => {
          const targetId = (pay.userId && typeof pay.userId === 'object') ? pay.userId._id : pay.userId;
          const user = userArray.find((u: any) => u._id === targetId);

          return {
            ...pay,
            userName: user?.name || 'Unknown User',
            plan: user?.plan || 'Free',
            stripeInvoiceId: pay.stripeInvoiceId || 'N/A',
            amount: pay.amount || 0,
            status: pay.status || 'paid',
            paidAt: pay.paidAt || pay.createdAt
          };
        });

        this.stats = stats;

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error(" Failed to fetch the data from DB   ");
        console.error(err);
      }
    });
  }

  loadAdminInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.adminName = user.name || 'Admin';
    this.adminInitial = this.adminName.substring(0, 2).toUpperCase();
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s === 'paid' || s === 'succeeded') return 'bg-green-100 text-green-700';
    if (s === 'failed') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  }

  toggleTheme(): void { this.isDarkMode = !this.isDarkMode; }

  logout() {
    localStorage.clear();
    this.toastr.success("Logged out successfully");
    this.router.navigate(['/login']);
  }

  get statsArray() {
    return [
      { label: 'Total Revenue', subtext: 'All time', value: `$${this.stats.totalRevenue || 0}`, icon: '💰' },
      { label: 'Monthly Revenue', subtext: 'Current Month', value: `$${this.stats.monthRevenue || 0}`, icon: '📈' },
      { label: 'Total Payments', subtext: 'Total transactions', value: this.stats.totalPayments || 0, icon: '💳' },
      { label: 'Active Subscribers', subtext: 'Current active', value: this.stats.activeSubscribers || 0, icon: '👥' }
    ];
  }

selectedStatus: string = 'All Statuses';

get filteredTransactions() {
  if (this.selectedStatus === 'All Statuses') {
    return this.transactions;
  }
  return this.transactions.filter(t =>
  t.status?.toString().toLowerCase().trim() === this.selectedStatus.toLowerCase().trim()
);
}

onStatusChange(event: any) {
  this.selectedStatus = event.target.value;
}


savePlanChanges() {
  if (!this.currentPlanData) return;

  this.adminService.updatePlan(
    this.currentPlanData.name,
    this.currentPlanData.limits
  ).subscribe({
    next: (response) => {
      this.toastr.success(`Plan ${this.currentPlanData.name} updated successfully!`);

      this.isModalOpen = false;

      console.log("Update Success:", response);
    },
    error: (err) => {
      this.toastr.error("Failed to update plan. Please try again.");

      console.error("Update Error:", err);
    }
  });
}

openEditModal() {
  this.adminService.getPlans().subscribe(response => {

    if (response && response.data) {
      this.plans = response.data;
    } else {
      console.error("لم يتم العثور على مصفوفة البيانات في الاستجابة!");
    }

    this.isModalOpen = true;
  });
}

loadPlanLimits() {
  this.currentPlanData = this.plans.find(p => p.name === this.selectedPlan);

  if (this.currentPlanData) {
  }
}


}
