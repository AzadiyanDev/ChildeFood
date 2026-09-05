import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateFoodItem, FoodItem } from '../models/food-item.model';

// سرویس انگولار برای ارتباط مستقیم با کنترلر FoodsController دات‌نت
@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private readonly http = inject(HttpClient);
  // چون تنظیمات پروکسی رو ست کردیم، ریکوئست‌ها مستقیم به بک‌اند فوروارد میشن
  private readonly apiUrl = '/api/foods';

  // دریافت لیست همه غذاها
  getFoods(): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(this.apiUrl);
  }

  // ثبت یک آیتم غذای جدید
  createFood(food: CreateFoodItem): Observable<FoodItem> {
    return this.http.post<FoodItem>(this.apiUrl, food);
  }
}