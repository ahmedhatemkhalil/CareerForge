export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
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
