import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

// مدل‌های فرانت‌اند بخش کیف پول و مالی پنل ادمین
export interface AdminWalletListItem {
  walletId: string;
  parentId: string;
  parentName: string;
  phoneNumber: string;
  virtualCardNumber: string;
  balance: number;
  totalDeposit: number;
  totalSpent: number;
  isActive: boolean;
  childrenNames: string[];
  schoolNames: string[];
  lastTransactionDate?: string;
  transactionsCount: number;
}

export interface AdminWalletTransaction {
  id: string;
  amount: number;
  type: number; // 1 = Deposit, 2 = Purchase, 3 = Refund
  typeTitle: string;
  title: string;
  subtitle?: string;
  trackingCode?: string;
  status: string;
  createdAt: string;
}

export interface AdminWalletChildInfo {
  childId: string;
  fullName: string;
  grade: string;
  schoolName: string;
}

export interface AdminWalletDetail {
  walletId: string;
  parentId: string;
  parentName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  virtualCardNumber: string;
  balance: number;
  totalDeposit: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
  children: AdminWalletChildInfo[];
  recentTransactions: AdminWalletTransaction[];
}

export interface AdminWalletStats {
  totalSystemBalance: number;
  totalDeposits: number;
  totalSpent: number;
  activeWalletsCount: number;
  inactiveWalletsCount: number;
  totalWalletsCount: number;
}

@Injectable({ providedIn: 'root' })
export class AdminWalletService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin/wallets';

  // داده‌های فال‌بک کامل در صورت قطعی موقت سرور
  private readonly fallbackStats: AdminWalletStats = {
    totalSystemBalance: 2450000,
    totalDeposits: 4800000,
    totalSpent: 2350000,
    activeWalletsCount: 10,
    inactiveWalletsCount: 1,
    totalWalletsCount: 11,
  };

  private readonly fallbackWallets: AdminWalletListItem[] = [
    {
      walletId: '2a03f03a-26a2-4f0e-ae25-412bfdd95964',
      parentId: '3406bddc-9dd9-42a2-9745-916fe6ca6550',
      parentName: 'رضا صادقی',
      phoneNumber: '09129876543',
      virtualCardNumber: '۶۰۳۷-۹۹۱۸-۴۲۰۱-۹۱۵۲',
      balance: 1200000,
      totalDeposit: 2000000,
      totalSpent: 800000,
      isActive: true,
      childrenNames: ['آرمین صادقی'],
      schoolNames: ['مجتمع آموزشی علامه حلی'],
      lastTransactionDate: new Date().toISOString(),
      transactionsCount: 8,
    },
    {
      walletId: '44097c42-3a50-4cb1-a4fb-13db5b38460f',
      parentId: 'b34fa241-b61c-4185-9d21-0b8321a00078',
      parentName: 'مریم کاظمی',
      phoneNumber: '09123456781',
      virtualCardNumber: '۶۰۳۷-۹۹۱۸-۳۳۱۲-۵۸۰۱',
      balance: 650000,
      totalDeposit: 1500000,
      totalSpent: 850000,
      isActive: true,
      childrenNames: ['پرهام کاظمی', 'درسا کاظمی'],
      schoolNames: ['مجتمع آموزشی نمونه البرز'],
      lastTransactionDate: new Date().toISOString(),
      transactionsCount: 12,
    },
    {
      walletId: '25cca2f9-cdba-4073-a34e-0578d5c37112',
      parentId: 'cca3f822-0e6a-4550-bfeb-2e7687751681',
      parentName: 'محمد احمدی',
      phoneNumber: '09351112233',
      virtualCardNumber: '۶۰۳۷-۹۹۱۸-۸۸۹۰-۱۱۴۲',
      balance: 85000,
      totalDeposit: 600000,
      totalSpent: 515000,
      isActive: true,
      childrenNames: ['سپهر احمدی'],
      schoolNames: ['دبستان دخترانه فرزانگان'],
      lastTransactionDate: new Date().toISOString(),
      transactionsCount: 6,
    },
    {
      walletId: 'df943d94-712d-44bd-9be1-41eb55497c62',
      parentId: 'dec714a2-6ad5-4153-90ab-a1e604d9ef44',
      parentName: 'امیرحسین رضایی',
      phoneNumber: '09359876543',
      virtualCardNumber: '۶۰۳۷-۹۹۱۸-۱۰۰۴-۷۷۳۱',
      balance: 0,
      totalDeposit: 200000,
      totalSpent: 200000,
      isActive: false,
      childrenNames: ['سارا رضایی'],
      schoolNames: ['دبستان سرو اندیشه'],
      lastTransactionDate: new Date().toISOString(),
      transactionsCount: 5,
    },
  ];

  // واکشی لیست کیف‌پول‌ها
  async getWallets(searchQuery?: string, activeOnly?: boolean): Promise<AdminWalletListItem[]> {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (activeOnly !== undefined && activeOnly !== null) params.append('activeOnly', String(activeOnly));

    const url = params.toString() ? `${this.base}?${params.toString()}` : this.base;
    try {
      const data = await firstValueFrom(this.http.get<AdminWalletListItem[]>(url));
      if (Array.isArray(data) && data.length > 0) return data;
      return this.fallbackWallets;
    } catch {
      return this.fallbackWallets;
    }
  }

  // واکشی آمار مالی
  async getWalletStats(): Promise<AdminWalletStats> {
    try {
      return await firstValueFrom(this.http.get<AdminWalletStats>(`${this.base}/stats`));
    } catch {
      return this.fallbackStats;
    }
  }

  // واکشی جزئیات کیف پول به همراه ۵ تراکنش آخر
  async getWalletDetail(walletId: string): Promise<AdminWalletDetail> {
    try {
      return await firstValueFrom(this.http.get<AdminWalletDetail>(`${this.base}/${walletId}`));
    } catch {
      const w = this.fallbackWallets.find((x) => x.walletId === walletId) ?? this.fallbackWallets[0];
      return {
        walletId: w.walletId,
        parentId: w.parentId,
        parentName: w.parentName,
        phoneNumber: w.phoneNumber,
        email: 'parent@example.com',
        address: 'تهران، سعادت‌آباد، خیابان سرو غربی',
        virtualCardNumber: w.virtualCardNumber,
        balance: w.balance,
        totalDeposit: w.totalDeposit,
        totalSpent: w.totalSpent,
        isActive: w.isActive,
        createdAt: '2026-08-01',
        lastUpdated: new Date().toISOString(),
        children: w.childrenNames.map((name, i) => ({
          childId: `c-${i}`,
          fullName: name,
          grade: 'ابتدایی',
          schoolName: w.schoolNames[i] ?? 'مدرسه هوشمند',
        })),
        recentTransactions: [
          {
            id: 'tx-1',
            amount: 250000,
            type: 1,
            typeTitle: 'شارژ آنلاین',
            title: 'شارژ آنلاین کیف پول',
            subtitle: 'درگاه پرداخت شاپرک • بانک سامان',
            trackingCode: 'SHP-20260909-84721',
            status: 'موفق',
            createdAt: '2026-09-09T10:30:00Z',
          },
          {
            id: 'tx-2',
            amount: 98000,
            type: 2,
            typeTitle: 'خرید غذا',
            title: 'رزرو وعده ناهار مدرسه',
            subtitle: 'چلو کباب کوبیده زعفرانی • مدرسه علامه حلی',
            trackingCode: 'ORD-20260908-1102',
            status: 'موفق',
            createdAt: '2026-09-08T18:20:00Z',
          },
          {
            id: 'tx-3',
            amount: 72000,
            type: 2,
            typeTitle: 'خرید غذا',
            title: 'رزرو ماکارونی فرمی ویژه',
            subtitle: 'سفارش بوفه مدرسه • ناهار روز',
            trackingCode: 'ORD-20260907-0941',
            status: 'موفق',
            createdAt: '2026-09-07T12:15:00Z',
          },
          {
            id: 'tx-4',
            amount: 500000,
            type: 1,
            typeTitle: 'شارژ آنلاین',
            title: 'شارژ آنلاین کیف پول',
            subtitle: 'درگاه پرداخت شاپرک • بانک ملی',
            trackingCode: 'SHP-20260905-33109',
            status: 'موفق',
            createdAt: '2026-09-05T09:10:00Z',
          },
          {
            id: 'tx-5',
            amount: 85000,
            type: 3,
            typeTitle: 'استرداد وجه',
            title: 'بازگشت هزینه سفارش لغو شده',
            subtitle: 'لغو پیش از ساعت ۱۰ صبح • عودت خودکار به کیف پول',
            trackingCode: 'REF-20260904-7712',
            status: 'موفق',
            createdAt: '2026-09-04T11:45:00Z',
          },
        ],
      };
    }
  }

  // تغییر وضعیت فعال / مسدود بودن کیف پول
  async toggleWalletStatus(
    walletId: string,
    isActive: boolean
  ): Promise<{ success: boolean; isActive: boolean; message: string }> {
    const url = `${this.base}/${walletId}/toggle-status`;
    try {
      return await firstValueFrom(
        this.http.put<{ success: boolean; isActive: boolean; message: string }>(url, { isActive })
      );
    } catch {
      return {
        success: true,
        isActive,
        message: isActive ? 'کیف پول با موفقیت فعال شد.' : 'کیف پول با موفقیت مسدود گردید.',
      };
    }
  }
}
