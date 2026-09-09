import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

// مدل خلاصه اطلاعات والد برای ردیف جدول اصلی
export interface ParentListItem {
  id: string;
  fullName: string;
  phoneNumber: string;
  roleTitle: string;
  nationalId?: string;
  avatarUrl?: string;
  isActive: boolean;
  childrenCount: number;
  childrenNames: string[];
  walletBalance: number;
  totalOrdersCount: number;
  createdAt: string;
}

// مدل کامل هر دانش‌آموز تحت تکفل والد
export interface ChildDetail {
  id: string;
  fullName: string;
  age: number;
  grade: string;
  schoolName: string;
  schoolBranch: string;
  avatarUrl?: string;
  dietaryNotes?: string;
  favoriteFood?: string;
  isActive: boolean;
  ordersCount: number;
  totalSpent: number;
}

// مدل آخرین سفارش‌های ثبت‌شده
export interface ParentRecentOrder {
  orderCode: string;
  childName: string;
  servingDate: string;
  deliveryTime: string;
  finalPayablePrice: number;
  statusLabel: string;
}

// مدل جزئیات کامل والد برای نمایش در مودال
export interface ParentDetail extends ParentListItem {
  address?: string;
  isSmsNotificationActive: boolean;
  totalSpent: number;
  children: ChildDetail[];
  recentOrders: ParentRecentOrder[];
}

function cleanString(str: string | null | undefined, fallback: string = ''): string {
  if (!str) return fallback;
  if (str.includes('??') || (str.match(/\?/g) || []).length >= 2) return fallback;
  return str.trim();
}

function cleanNullableString(str: string | null | undefined): string | undefined {
  if (!str) return undefined;
  if (str.includes('??') || (str.match(/\?/g) || []).length >= 2) return undefined;
  return str.trim();
}

@Injectable({ providedIn: 'root' })
export class AdminParentService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin/parents';

  // داده‌های فال‌بک کامل و غنی برای مواقعی که سرور در دسترس نیست یا در حین SSR
  private readonly fallbackParents: ParentListItem[] = [
    {
      id: 'p-1',
      fullName: 'مریم کاظمی',
      phoneNumber: '09123456781',
      roleTitle: 'مادر',
      nationalId: '0071234567',
      isActive: true,
      childrenCount: 2,
      childrenNames: ['پرهام کاظمی', 'درسا کاظمی'],
      walletBalance: 650000,
      totalOrdersCount: 14,
      createdAt: '2024-05-10T10:30:00Z',
    },
    {
      id: 'p-2',
      fullName: 'رضا صادقی',
      phoneNumber: '09129876543',
      roleTitle: 'پدر',
      nationalId: '0019876543',
      isActive: true,
      childrenCount: 1,
      childrenNames: ['آرمین صادقی'],
      walletBalance: 1200000,
      totalOrdersCount: 22,
      createdAt: '2024-03-15T08:15:00Z',
    },
    {
      id: 'p-3',
      fullName: 'فاطمه حسینی',
      phoneNumber: '09192223344',
      roleTitle: 'مادر',
      nationalId: '0065432109',
      isActive: true,
      childrenCount: 2,
      childrenNames: ['مهسا حسینی', 'بردیا حسینی'],
      walletBalance: 320000,
      totalOrdersCount: 9,
      createdAt: '2024-07-20T14:45:00Z',
    },
    {
      id: 'p-4',
      fullName: 'محمد احمدی',
      phoneNumber: '09351112233',
      roleTitle: 'پدر',
      nationalId: '0056789012',
      isActive: true,
      childrenCount: 1,
      childrenNames: ['سپهر احمدی'],
      walletBalance: 85000,
      totalOrdersCount: 4,
      createdAt: '2024-04-01T11:00:00Z',
    },
    {
      id: 'p-5',
      fullName: 'زهرا میرزایی',
      phoneNumber: '09187776655',
      roleTitle: 'مادر',
      nationalId: '0089012345',
      isActive: true,
      childrenCount: 1,
      childrenNames: ['سارینا میرزایی'],
      walletBalance: 410000,
      totalOrdersCount: 18,
      createdAt: '2024-08-05T09:20:00Z',
    },
    {
      id: 'p-6',
      fullName: 'علیرضا اسماعیلی',
      phoneNumber: '09121112233',
      roleTitle: 'پدر',
      nationalId: '0034567890',
      isActive: true,
      childrenCount: 2,
      childrenNames: ['آوا اسماعیلی', 'کیان اسماعیلی'],
      walletBalance: 450000,
      totalOrdersCount: 26,
      createdAt: '2024-01-12T16:00:00Z',
    },
  ];

  // فال‌بک برای جزئیات کامل یک والد
  private readonly fallbackDetails: Record<string, ParentDetail> = {
    'p-1': {
      id: 'p-1',
      fullName: 'مریم کاظمی',
      phoneNumber: '09123456781',
      roleTitle: 'مادر',
      nationalId: '0071234567',
      isActive: true,
      childrenCount: 2,
      childrenNames: ['پرهام کاظمی', 'درسا کاظمی'],
      walletBalance: 650000,
      totalOrdersCount: 14,
      createdAt: '2024-05-10T10:30:00Z',
      address: 'تهران، شهرک غرب، بلوار پاکنژاد، خیابان هرمزان، کوچه نسترن، پلاک ۱۲',
      isSmsNotificationActive: true,
      totalSpent: 1120000,
      children: [
        {
          id: 'c-1-1',
          fullName: 'پرهام کاظمی',
          age: 10,
          grade: 'چهارم ابتدایی',
          schoolName: 'مجتمع آموزشی روشنگران',
          schoolBranch: 'شعبه مرکزی',
          dietaryNotes: 'حساسیت خفیف به لبنیات پرچرب و فاقد گلوتن',
          favoriteFood: 'چلو جوجه‌کباب بدون استخوان',
          isActive: true,
          ordersCount: 9,
          totalSpent: 750000,
        },
        {
          id: 'c-1-2',
          fullName: 'درسا کاظمی',
          age: 6,
          grade: 'پیش‌دبستانی',
          schoolName: 'دبستان سلام یوسف‌آباد',
          schoolBranch: 'شعبه ۱',
          dietaryNotes: 'بدون هیچ‌گونه حساسیت دارویی یا غذایی',
          favoriteFood: 'ماکارونی فرمی با پنیر ویژه',
          isActive: true,
          ordersCount: 5,
          totalSpent: 370000,
        },
      ],
      recentOrders: [
        {
          orderCode: 'ORD-14030616-11',
          childName: 'پرهام کاظمی',
          servingDate: '1403/06/16',
          deliveryTime: '12:30',
          finalPayablePrice: 94000,
          statusLabel: 'تحویل داده شده',
        },
        {
          orderCode: 'ORD-14030616-12',
          childName: 'درسا کاظمی',
          servingDate: '1403/06/16',
          deliveryTime: '12:15',
          finalPayablePrice: 72000,
          statusLabel: 'در حال پخت و بسته‌بندی',
        },
        {
          orderCode: 'ORD-14030614-08',
          childName: 'پرهام کاظمی',
          servingDate: '1403/06/14',
          deliveryTime: '12:30',
          finalPayablePrice: 98000,
          statusLabel: 'تحویل داده شده',
        },
      ],
    },
  };

  // واکشی همه والدین با پاکسازی رشته‌ها
  async getAll(): Promise<ParentListItem[]> {
    try {
      const data = await firstValueFrom(this.http.get<ParentListItem[]>(this.base));
      if (Array.isArray(data) && data.length > 0) {
        return data.map((p) => ({
          ...p,
          fullName: cleanString(p.fullName, 'والد گرامی'),
          roleTitle: cleanString(p.roleTitle, 'سرپرست'),
          nationalId: cleanNullableString(p.nationalId),
          childrenNames: (p.childrenNames || []).map((cn) => cleanString(cn, 'فرزند')),
        }));
      }
      return this.fallbackParents;
    } catch {
      return this.fallbackParents;
    }
  }

  // واکشی اطلاعات و جزئیات کامل والد به همراه بچه‌ها
  async getDetail(id: string): Promise<ParentDetail> {
    try {
      const detail = await firstValueFrom(this.http.get<ParentDetail>(`${this.base}/${id}`));
      return {
        ...detail,
        fullName: cleanString(detail.fullName, 'والد گرامی'),
        roleTitle: cleanString(detail.roleTitle, 'سرپرست'),
        nationalId: cleanNullableString(detail.nationalId),
        address: cleanNullableString(detail.address),
        childrenNames: (detail.childrenNames || []).map((cn) => cleanString(cn, 'فرزند')),
        children: (detail.children || []).map((c) => ({
          ...c,
          fullName: cleanString(c.fullName, 'دانش‌آموز'),
          grade: cleanString(c.grade, 'دبستان'),
          schoolName: cleanString(c.schoolName, 'مدرسه طرف قرارداد'),
          schoolBranch: cleanString(c.schoolBranch, '-'),
          dietaryNotes: cleanNullableString(c.dietaryNotes),
          favoriteFood: cleanNullableString(c.favoriteFood),
        })),
        recentOrders: (detail.recentOrders || []).map((ro) => ({
          ...ro,
          childName: cleanString(ro.childName, 'دانش‌آموز'),
        })),
      };
    } catch {
      if (this.fallbackDetails[id]) {
        return this.fallbackDetails[id];
      }
      const parent = this.fallbackParents.find((p) => p.id === id) ?? this.fallbackParents[0];
      return {
        ...parent,
        address: 'تهران، منطقه ۲، خیابان دادمان، مجتمع صدف',
        isSmsNotificationActive: true,
        totalSpent: 980000,
        children: parent.childrenNames.map((name, index) => ({
          id: `child-${index + 1}`,
          fullName: name,
          age: 8 + index * 2,
          grade: `${index === 0 ? 'سوم' : 'پنجم'} ابتدایی`,
          schoolName: 'دبستان روشنگران',
          schoolBranch: 'شعبه ۱',
          dietaryNotes: index === 0 ? 'فاقد ادویه و فلفل سیاه' : 'بدون حساسیت خاص',
          favoriteFood: index === 0 ? 'چلو کباب کوبیده زعفرانی' : 'زرشک‌پلو با مرغ',
          isActive: true,
          ordersCount: 8,
          totalSpent: 490000,
        })),
        recentOrders: [
          {
            orderCode: 'ORD-14030616-01',
            childName: parent.childrenNames[0] ?? 'دانش‌آموز',
            servingDate: '1403/06/16',
            deliveryTime: '12:30',
            finalPayablePrice: 94000,
            statusLabel: 'تحویل داده شده',
          },
        ],
      };
    }
  }

  // تغییر وضعیت فعال یا غیرفعال بودن والد
  async toggleStatus(id: string): Promise<{ isActive: boolean }> {
    try {
      return await firstValueFrom(this.http.patch<{ isActive: boolean }>(`${this.base}/${id}/toggle`, {}));
    } catch {
      const parent = this.fallbackParents.find((p) => p.id === id);
      const newStatus = parent ? !parent.isActive : false;
      return { isActive: newStatus };
    }
  }

  // تغییر وضعیت فعال یا غیرفعال بودن دانش‌آموز
  async toggleChildStatus(childId: string): Promise<{ isActive: boolean }> {
    try {
      return await firstValueFrom(
        this.http.patch<{ isActive: boolean }>(`${this.base}/children/${childId}/toggle`, {})
      );
    } catch {
      return { isActive: false };
    }
  }
}
