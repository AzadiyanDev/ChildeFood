import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodService } from './services/food.service';
import { CreateFoodItem, FoodItem } from './models/food-item.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // سرویس غذا رو اینجکت می‌کنیم
  private readonly foodService = inject(FoodService);

  // استیت‌های کامپوننت با سیگنال‌های مدرن انگولار
  protected readonly foods = signal<FoodItem[]>([]);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showModal = signal<boolean>(false);

  // فرم ثبت غذای جدید
  protected newFood: CreateFoodItem = {
    title: '',
    description: '',
    price: 90000,
    minAgeMonths: 6,
    category: 1
  };

  ngOnInit(): void {
    this.loadFoods();
  }

  // لود کردن لیست غذاها از بک‌اند دات‌نت ۱۰
  protected loadFoods(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // سابسکریپشن ساده و بدون تودرتویی
    this.foodService.getFoods().subscribe({
      next: (data) => {
        this.foods.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('خطا در دریافت لیست غذاها:', err);
        this.errorMessage.set('در برقراری ارتباط با سرور دات‌نت مشکلی پیش آمد.');
        this.isLoading.set(false);
      }
    });
  }

  // ثبت غذای جدید
  protected submitFood(): void {
    if (!this.newFood.title.trim()) {
      alert('لطفاً عنوان غذا را وارد کنید.');
      return;
    }

    this.isLoading.set(true);
    this.foodService.createFood(this.newFood).subscribe({
      next: (created) => {
        // غذای جدید رو به لیست فعلی اضافه می‌کنیم
        this.foods.update((current) => [...current, created]);
        this.showModal.set(false);
        this.isLoading.set(false);
        // ریست کردن فرم
        this.newFood = {
          title: '',
          description: '',
          price: 90000,
          minAgeMonths: 6,
          category: 1
        };
      },
      error: (err) => {
        console.error('خطا در ثبت غذا:', err);
        alert('ثبت غذا با خطا مواجه شد.');
        this.isLoading.set(false);
      }
    });
  }

  protected openModal(): void {
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
  }
}