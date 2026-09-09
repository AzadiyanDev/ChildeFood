import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {AdminDashboardService} from '../services/admin-dashboard.service';
import {FoodStore} from '../../services/food-store';

// لی‌آوت اصلی ادمین با استایل هدر جزیره‌ای مدرن
// ۳ جزیره مجزا: ۱. لوگو و برند چسبیده به راست، ۲. منوهای پروژه چایلد فود کنار لوگو، ۳. نوتیف و کاربر چسبیده به چپ
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  readonly dashboardService = inject(AdminDashboardService);
  readonly foodStore = inject(FoodStore);
  readonly router = inject(Router);

  // وضعیت باز یا بسته بودن منوی کشویی اطلاعات و خروج کاربر
  readonly isProfileMenuOpen = signal<boolean>(false);

  // سوییچ باز و بسته کردن منوی کاربری سوپر ادمین
  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((open) => !open);
  }

  // خروج از حساب کاربری و هدایت به صفحه لاگین/اصلی
  logout(): void {
    this.isProfileMenuOpen.set(false);
    this.foodStore.logout();
    this.router.navigate(['/']);
  }

  // آیتم‌های ناوبری واقعی و اختصاصی سیستم سفارش غذای مدارس چایلد فود
  // هر آیتم یه روت مشخص داره — دیگه fake setActiveTab نیست
  readonly navItems = [
    { id: 'dashboard', label: 'داشبورد', route: '/admin/dashboard' },
    { id: 'orders', label: 'سفارش‌های مدارس', route: '/admin/orders' },
    { id: 'menu', label: 'برنامه غذایی و منو', route: '/admin/menu' },
    { id: 'schools', label: 'مدارس و بوفه‌ها', route: '/admin/schools' },
    { id: 'students', label: 'دانش‌آموزان و والدین', route: '/admin/students' },
    { id: 'wallet', label: 'کیف پول و مالی', route: '/admin/wallet' },
    { id: 'reports', label: 'آمار و گزارش‌ها', route: '/admin/reports' },
  ];
}

