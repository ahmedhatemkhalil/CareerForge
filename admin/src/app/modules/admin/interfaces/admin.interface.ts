export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  plan: string;
  cvCount?: number;
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;  }

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCvs: number;
  bannedUsers: number;
  totalRoadmaps:number;
  totalInterviews:number;
  totalAnalyses:number;
}
export interface RevenueStats {
  totalRevenue: number;
  activeProUsers: number;
  monthlyRevenue: number;
  newSubscriptions: number;
}
export interface Transaction {
  _id: string;
  userId?: string;
  stripeInvoiceId?: string;
  status:string;
  amount: number;
  plan?: string;
  paidAt?: string;
  userName?: string;
}
export interface Payment {
  _id: string;
  userId: string;
  stripeInvoiceId: string;
  amount: number;
  status: string;
  paidAt: string;
}
