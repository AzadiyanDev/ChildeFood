import {Routes} from '@angular/router';

// روت‌های اصلی اپلیکیشن؛
// روت /admin مستقیماً به بخش مدیریت هدایت می‌کنه و روت اصلی پنل کاربر (والدین و دانش‌آموزان) رو لود می‌کنه
export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/user-panel/user-panel').then((m) => m.UserPanel),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
