import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, of, tap} from 'rxjs';

export interface AdminProfile {
  fullName: string;
  roleTitle: string;
  avatarUrl: string;
  unreadNotificationsCount: number;
}

export interface AdminKpiSummary {
  monthlyRevenueAmount: number;
  monthlyRevenueGrowthPercent: string;
  monthlyOrdersCount: number;
  todayOrdersCount: number;
  averageOrderPrice: number;
  activeSchoolsCount: number;
  totalStudentsCount: number;
}

export interface AdminDonutAnalytics {
  deliveredOrdersPercent: number;
  preparingOrdersPercent: number;
  pendingOrdersPercent: number;
  walletDepositPercent: number;
  mealPurchasePercent: number;
}

export interface AdminSchoolsSummary {
  totalSchoolsCount: number;
  activeCanteensCount: number;
  totalStudentsCount: number;
  todayServedMealsCount: number;
  topSchoolName: string;
}

export interface AdminCanteenSummary {
  todayMenuCapacity: number;
  todayReservedMeals: number;
  capacityUtilizationPercent: number;
  topSellingMealName: string;
}

export interface AdminRecentOrder {
  id: string;
  orderCode: string;
  studentName: string;
  schoolName: string;
  foodTitle: string;
  amount: number;
  deliveryTime: string;
  status: 'delivered' | 'preparing' | 'pending' | 'cancelled';
  statusTitle: string;
  timeAgo: string;
}

export interface AdminRecentWalletTransaction {
  id: string;
  trackingCode: string;
  parentName: string;
  childName: string;
  title: string;
  amount: number;
  type: 'deposit' | 'purchase';
  status: string;
  timeAgo: string;
}

export interface AdminDashboardState {
  adminProfile: AdminProfile;
  kpiSummary: AdminKpiSummary;
  donutAnalytics: AdminDonutAnalytics;
  schoolsSummary: AdminSchoolsSummary;
  canteenSummary: AdminCanteenSummary;
  recentOrders: AdminRecentOrder[];
  recentWalletTransactions: AdminRecentWalletTransaction[];
}

// سرویس مدیریت داده‌ها و ارتباط ریل‌تایم با کنترلر دات‌نت ادمین چایلد فود
@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private readonly http = inject(HttpClient);

  // داده‌های اولیه واقعی مخصوص چایلد فود برای زمان لود یا قطعی موقت سرور
  private readonly initialData: AdminDashboardState = {
    adminProfile: {
      fullName: 'علیرضا آزادیان',
      roleTitle: 'سوپر ادمین',
      avatarUrl: '',
      unreadNotificationsCount: 4,
    },
    kpiSummary: {
      monthlyRevenueAmount: 48500000,
      monthlyRevenueGrowthPercent: '+18.4%',
      monthlyOrdersCount: 574,
      todayOrdersCount: 48,
      averageOrderPrice: 84500,
      activeSchoolsCount: 6,
      totalStudentsCount: 430,
    },
    donutAnalytics: {
      deliveredOrdersPercent: 74,
      preparingOrdersPercent: 19,
      pendingOrdersPercent: 7,
      walletDepositPercent: 38,
      mealPurchasePercent: 62,
    },
    schoolsSummary: {
      totalSchoolsCount: 6,
      activeCanteensCount: 6,
      totalStudentsCount: 430,
      todayServedMealsCount: 48,
      topSchoolName: 'دبستان دخترانه روشنگران',
    },
    canteenSummary: {
      todayMenuCapacity: 600,
      todayReservedMeals: 48,
      capacityUtilizationPercent: 82,
      topSellingMealName: 'چلو جوجه‌کباب زعفرانی با برنج ایرانی',
    },
    recentOrders: [
      {
        id: '1',
        orderCode: 'ORD-14030616-01',
        studentName: 'آوا اسماعیلی',
        schoolName: 'دبستان دخترانه روشنگران',
        foodTitle: 'چلو کباب کوبیده زعفرانی + سالاد فصل',
        amount: 98000,
        deliveryTime: '۱۲:۳۰',
        status: 'delivered',
        statusTitle: 'تحویل به بوفه',
        timeAgo: '۵ دقیقه پیش',
      },
      {
        id: '2',
        orderCode: 'ORD-14030616-02',
        studentName: 'کیان محمدی',
        schoolName: 'دبستان دخترانه روشنگران',
        foodTitle: 'ماکارونی ویژه با گوشت چرخ‌کرده',
        amount: 72000,
        deliveryTime: '۱۲:۳۰',
        status: 'preparing',
        statusTitle: 'در حال طبخ',
        timeAgo: '۱۸ دقیقه پیش',
      },
      {
        id: '3',
        orderCode: 'ORD-14030616-03',
        studentName: 'رها رضایی',
        schoolName: 'مجتمع آموزشی فرزانگان',
        foodTitle: 'چلو جوجه‌کباب بدون استخوان',
        amount: 94000,
        deliveryTime: '۱۲:۴۵',
        status: 'pending',
        statusTitle: 'در صف ارسال',
        timeAgo: '۳۵ دقیقه پیش',
      },
      {
        id: '4',
        orderCode: 'ORD-14030616-04',
        studentName: 'امیرعلی پارسا',
        schoolName: 'دبیرستان ماندگار البرز',
        foodTitle: 'چلو خورشت قورمه‌سبزی جاافتاده',
        amount: 88000,
        deliveryTime: '۱۳:۰۰',
        status: 'delivered',
        statusTitle: 'تحویل به بوفه',
        timeAgo: '۱ ساعت پیش',
      },
      {
        id: '5',
        orderCode: 'ORD-14030616-05',
        studentName: 'باران ابراهیمی',
        schoolName: 'دبستان هوشمند روشنگران',
        foodTitle: 'شنیسل مرغ سوخاری با دورچین سبزیجات',
        amount: 82000,
        deliveryTime: '۱۲:۳۰',
        status: 'preparing',
        statusTitle: 'در حال طبخ',
        timeAgo: '۲ ساعت پیش',
      },
    ],
    recentWalletTransactions: [
      {
        id: '101',
        trackingCode: 'TRX-ZP-90412',
        parentName: 'علیرضا اسماعیلی',
        childName: 'آوا اسماعیلی',
        title: 'شارژ آنلاین کیف پول',
        amount: 500000,
        type: 'deposit',
        status: 'موفق',
        timeAgo: '۳ ساعت پیش',
      },
      {
        id: '102',
        trackingCode: 'TRX-ORD-140301',
        parentName: 'علیرضا اسماعیلی',
        childName: 'آوا اسماعیلی',
        title: 'رزرو ناهار چلوکباب کوبیده',
        amount: 98000,
        type: 'purchase',
        status: 'موفق',
        timeAgo: '۵ دقیقه پیش',
      },
      {
        id: '103',
        trackingCode: 'TRX-ORD-140302',
        parentName: 'مریم کاظمی',
        childName: 'کیان محمدی',
        title: 'رزرو ناهار ماکارونی ویژه',
        amount: 72000,
        type: 'purchase',
        status: 'موفق',
        timeAgo: '۱۸ دقیقه پیش',
      },
      {
        id: '104',
        trackingCode: 'TRX-ZP-90408',
        parentName: 'محسن رضایی',
        childName: 'رها رضایی',
        title: 'شارژ آنلاین کیف پول',
        amount: 300000,
        type: 'deposit',
        status: 'موفق',
        timeAgo: 'دیروز',
      },
      {
        id: '105',
        trackingCode: 'TRX-ORD-140303',
        parentName: 'محسن رضایی',
        childName: 'رها رضایی',
        title: 'رزرو ناهار چلو جوجه‌کباب',
        amount: 94000,
        type: 'purchase',
        status: 'موفق',
        timeAgo: 'دیروز',
      },
    ],
  };

  readonly dashboardState = signal<AdminDashboardState>(this.initialData);
  readonly isLoading = signal<boolean>(false);
  readonly activeTab = signal<string>('dashboard');
  readonly orderFilter = signal<'all' | 'delivered' | 'preparing' | 'pending'>('all');

  constructor() {
    this.fetchDashboardData();
  }

  // واکشی داده‌های ریل‌تایم از کنترلر دات‌نت
  fetchDashboardData(): void {
    this.isLoading.set(true);
    this.http.get<AdminDashboardState>('/api/admin/dashboard').pipe(
      tap((res) => {
        if (res && res.kpiSummary) {
          this.dashboardState.set(res);
        }
      }),
      catchError((err) => {
        console.warn('استفاده از داده‌های چایلدفود محلی:', err.message);
        return of(this.initialData);
      }),
      tap(() => this.isLoading.set(false))
    ).subscribe();
  }

  setOrderFilter(filter: 'all' | 'delivered' | 'preparing' | 'pending'): void {
    this.orderFilter.set(filter);
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }
}
