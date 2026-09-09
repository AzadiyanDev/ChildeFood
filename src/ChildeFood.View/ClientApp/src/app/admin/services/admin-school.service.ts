import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

// مدل خلاصه یه مدرسه برای لیست
export interface SchoolListItem {
  id: string;
  name: string;
  branchCode: string;
  address: string;
  defaultLunchTime: string;
  contactPerson: string | null;
  isActive: boolean;
  studentCount: number;
  orderCount: number;
  activeMealDays: number;
}

// مدل دانش‌آموز توی دیتیل
export interface SchoolStudent {
  id: string;
  fullName: string;
  grade: string;
  age: number;
  isActive: boolean;
}

// مدل سفارش اخیر توی دیتیل
export interface SchoolRecentOrder {
  orderCode: string;
  childName: string;
  servingDate: string;
  finalPayablePrice: number;
  statusLabel: string;
}

// مدل دیتیل کامل یه مدرسه
export interface SchoolDetail extends SchoolListItem {
  students: SchoolStudent[];
  recentOrders: SchoolRecentOrder[];
  upcomingMealDays: number;
  totalOrdersCount: number;
  totalRevenue: number;
}

// DTO اضافه کردن مدرسه جدید
export interface CreateSchoolPayload {
  name: string;
  branchCode: string;
  address: string;
  defaultLunchTime: string;
  contactPerson: string;
}

@Injectable({ providedIn: 'root' })
export class AdminSchoolService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin/schools';

  // داده‌های فال‌بک لوکال برای زمانی که سرور بالا نیست
  private fallbackSchools: SchoolListItem[] = [
    {
      id: 'sch-101',
      name: 'دبستان غیردولتی مهر تابان (شعبه ۱)',
      branchCode: 'SCH-MHR-01',
      address: 'تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴',
      defaultLunchTime: '12:30',
      contactPerson: 'خانم علوی (۰۹۱۲۳۴۵۶۷۸۹)',
      isActive: true,
      studentCount: 142,
      orderCount: 384,
      activeMealDays: 18,
    },
    {
      id: 'sch-102',
      name: 'مجتمع آموزشی و بوفه هوشمند فرزانگان',
      branchCode: 'SCH-FRZ-02',
      address: 'تهران، ونک، خیابان ملاصدرا، کوچه پردیس، پلاک ۱۲',
      defaultLunchTime: '12:15',
      contactPerson: 'آقای صالحی (۰۹۱۸۱۲۳۴۵۶۷)',
      isActive: true,
      studentCount: 98,
      orderCount: 245,
      activeMealDays: 14,
    },
    {
      id: 'sch-103',
      name: 'دبستان پسرانه شهید رجایی',
      branchCode: 'SCH-RAJ-03',
      address: 'تهران، کارگر شمالی، خیابان شانزدهم، مجتمع آموزشی رجایی',
      defaultLunchTime: '12:45',
      contactPerson: 'آقای مرادی (۰۹۳۵۰۰۰۱۱۲۲)',
      isActive: true,
      studentCount: 215,
      orderCount: 512,
      activeMealDays: 21,
    },
    {
      id: 'sch-104',
      name: 'مدرسه و مهد کودک رنگین‌کمان',
      branchCode: 'SCH-RNK-04',
      address: 'تهران، پاسداران، خیابان گلستان پنجم، پلاک ۸',
      defaultLunchTime: '12:00',
      contactPerson: 'خانم شمس (۰۹۱۹۵۵۵۴۴۳۳)',
      isActive: false,
      studentCount: 45,
      orderCount: 60,
      activeMealDays: 0,
    },
  ];

  // لیست همه مدارس
  async getAll(): Promise<SchoolListItem[]> {
    try {
      const res = await firstValueFrom(this.http.get<SchoolListItem[]>(this.base));
      if (res && res.length > 0) {
        return res;
      }
      return this.fallbackSchools;
    } catch {
      return this.fallbackSchools;
    }
  }

  // جزئیات کامل یه مدرسه
  async getDetail(id: string): Promise<SchoolDetail> {
    try {
      return await firstValueFrom(this.http.get<SchoolDetail>(`${this.base}/${id}`));
    } catch {
      const baseSchool = this.fallbackSchools.find(s => s.id === id) ?? this.fallbackSchools[0];
      return {
        ...baseSchool,
        students: [
          { id: 'c1', fullName: 'آوا اسماعیلی', grade: 'سوم دبستان', age: 9, isActive: true },
          { id: 'c2', fullName: 'کیان محمدی', grade: 'دوم دبستان', age: 8, isActive: true },
          { id: 'c3', fullName: 'رها رضایی', grade: 'چهارم دبستان', age: 10, isActive: true },
          { id: 'c4', fullName: 'سامان نوری', grade: 'اول دبستان', age: 7, isActive: true },
          { id: 'c5', fullName: 'باران قنبری', grade: 'دوم دبستان', age: 8, isActive: false },
        ],
        recentOrders: [
          { orderCode: 'ORD-140301', childName: 'آوا اسماعیلی', servingDate: '۱۴۰۳/۰۶/۱۹', finalPayablePrice: 98000, statusLabel: 'تحویل داده شده' },
          { orderCode: 'ORD-140302', childName: 'کیان محمدی', servingDate: '۱۴۰۳/۰۶/۱۹', finalPayablePrice: 72000, statusLabel: 'در حال آماده‌سازی' },
          { orderCode: 'ORD-140303', childName: 'رها رضایی', servingDate: '۱۴۰۳/۰۶/۱۸', finalPayablePrice: 94000, statusLabel: 'پرداخت شده' },
        ],
        upcomingMealDays: baseSchool.activeMealDays,
        totalOrdersCount: baseSchool.orderCount * 2,
        totalRevenue: baseSchool.orderCount * 85000,
      };
    }
  }

  // اضافه کردن مدرسه جدید
  async create(payload: CreateSchoolPayload): Promise<SchoolListItem> {
    try {
      return await firstValueFrom(this.http.post<SchoolListItem>(this.base, payload));
    } catch {
      const mockItem: SchoolListItem = {
        id: 'sch-' + Date.now(),
        name: payload.name,
        branchCode: payload.branchCode,
        address: payload.address,
        defaultLunchTime: payload.defaultLunchTime || '12:30',
        contactPerson: payload.contactPerson || null,
        isActive: true,
        studentCount: 0,
        orderCount: 0,
        activeMealDays: 0,
      };
      this.fallbackSchools.unshift(mockItem);
      return mockItem;
    }
  }

  // فعال/غیرفعال کردن مدرسه
  async toggleStatus(id: string): Promise<{ isActive: boolean }> {
    try {
      return await firstValueFrom(this.http.patch<{ isActive: boolean }>(`${this.base}/${id}/toggle`, {}));
    } catch {
      const target = this.fallbackSchools.find(s => s.id === id);
      if (target) {
        target.isActive = !target.isActive;
        return { isActive: target.isActive };
      }
      return { isActive: true };
    }
  }
}
