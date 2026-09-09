import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

// مدل روز تقویم برای نوار بالایی
export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  hasSchedule: boolean;
  scheduledItemCount: number;
}

// مدل یه آیتم غذایی برنامه‌ریزی شده برای یه روز
export interface ScheduledMealItem {
  scheduleId: string;
  foodItemId: string;
  title: string;
  emoji: string | null;
  price: number;
  maxCapacity: number;
  category: string;
}

// مدل غذا در مودال سلکت
export interface FoodItemPicker {
  id: string;
  title: string;
  emoji: string | null;
  price: number;
  category: string;
  isAvailable: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminMealScheduleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/admin/meal-schedule';

  // میگیره ۳۱ روز برای نوار تقویم
  async getCalendarDays(): Promise<CalendarDay[]> {
    return firstValueFrom(
      this.http.get<CalendarDay[]>(`${this.baseUrl}/calendar`)
    );
  }

  // برنامه غذایی یه روز خاص
  async getDaySchedule(date: string, schoolId?: string): Promise<ScheduledMealItem[]> {
    let url = `${this.baseUrl}/day?date=${date}`;
    if (schoolId) url += `&schoolId=${schoolId}`;
    return firstValueFrom(this.http.get<ScheduledMealItem[]>(url));
  }

  // همه غذاها برای مودال
  async getAllFoodItems(): Promise<FoodItemPicker[]> {
    return firstValueFrom(
      this.http.get<FoodItemPicker[]>(`${this.baseUrl}/food-items`)
    );
  }

  // اضافه کردن غذاها به یه روز
  async addMeals(date: string, foodItemIds: string[], maxCapacity = 100): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/add`, { date, foodItemIds, maxCapacity })
    );
  }

  // حذف یه آیتم از برنامه
  async removeMeal(scheduleId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/${scheduleId}`)
    );
  }
}
