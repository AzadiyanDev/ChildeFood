import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdminDashboardService} from '../../services/admin-dashboard.service';
import {DonutChart} from '../../components/donut-chart/donut-chart';

// کامپوننت صفحه داشبورد مدیریتی چایلد فود؛
// کلیه کارت‌های KPI، نمودارهای دوناتی وضعیت توزیع غذا و شارژ والت، و جداول سفارش‌های مدارس رو مدیریت می‌کنه
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DonutChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard {
  readonly dashboardService = inject(AdminDashboardService);

  readonly state = this.dashboardService.dashboardState;
  readonly orderFilter = this.dashboardService.orderFilter;

  // فیلتر کردن سفارش‌های ناهار اخیر بر اساس تب وضعیت (همه، تحویل به بوفه، در حال طبخ، در صف ارسال)
  readonly filteredOrders = computed(() => {
    const list = this.state().recentOrders;
    const currentFilter = this.orderFilter();
    if (currentFilter === 'all') return list;
    return list.filter((o) => o.status === currentFilter);
  });

  setFilter(f: 'all' | 'delivered' | 'preparing' | 'pending'): void {
    this.dashboardService.setOrderFilter(f);
  }

  // متد ۳ رقم ۳ رقم جدا کردن ارقام برای قیمت‌ها و مبالغ تومانی
  formatNumber(value: number | undefined): string {
    if (value === undefined || value === null) return '۰';
    return new Intl.NumberFormat('fa-IR').format(value);
  }
}
