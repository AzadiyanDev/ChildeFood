// مدل دیتای غذای کودک در سمت انگولار، دقیقاً مطابق با FoodItemDto در دات‌نت
export interface FoodItem {
  id: number;
  title: string;
  description: string;
  price: number;
  minAgeMonths: number;
  category: number;
  categoryTitle: string;
  isAvailable: boolean;
}

// مدل برای ایجاد غذای جدید
export interface CreateFoodItem {
  title: string;
  description: string;
  price: number;
  minAgeMonths: number;
  category: number;
}