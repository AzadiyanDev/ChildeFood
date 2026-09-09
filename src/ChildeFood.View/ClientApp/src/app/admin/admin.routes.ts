import {Routes} from '@angular/router';
import {AdminLayout} from './layout/admin-layout';
import {AdminDashboard} from './pages/admin-dashboard/admin-dashboard';
import {AdminMealSchedule} from './pages/admin-meal-schedule/admin-meal-schedule';
import {AdminSchools} from './pages/admin-schools/admin-schools';
import {AdminOrders} from './pages/admin-orders/admin-orders';
import {AdminStudents} from './pages/admin-students/admin-students';
import {AdminWallet} from './pages/admin-wallet/admin-wallet';
import {AdminReports} from './pages/admin-reports/admin-reports';

// روت‌های داخلی پنل مدیریت
// همه زیرمجموعه AdminLayout هستن تا هدر و فریم شکیل پنل ادمین همیشه ثابت بمونه
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: AdminDashboard,
      },
      {
        path: 'menu',
        component: AdminMealSchedule,
      },
      {
        path: 'schools',
        component: AdminSchools,
      },
      {
        path: 'orders',
        component: AdminOrders,
      },
      {
        path: 'students',
        component: AdminStudents,
      },
      {
        path: 'wallet',
        component: AdminWallet,
      },
      {
        path: 'reports',
        component: AdminReports,
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
];
