export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  cvCount?: number;   // <--- العمود الجديد
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;  // <--- العمود الجديد لـ Joined Date
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCvs: number;
  bannedUsers: number;
}
