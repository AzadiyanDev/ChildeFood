export type NavTabId = 'home' | 'meals' | 'calendar' | 'wallet' | 'children' | 'orders' | 'profile' | 'checkout';

export interface DateDayItem {
  dayNumber: number;
  label: string;
}

export interface CategoryItem {
  id: string;
  name?: string;
  title?: string;
  emoji: string;
  count?: number;
  offsetY?: number;
}

export interface ParentProfile {
  name: string;
  role: string;
  phone: string;
  avatar: string;
  walletBalance: number;
  activeChildrenCount: number;
  nationalId?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface ChildItem {
  id: string;
  name: string;
  grade: string;
  school: string;
  avatar: string;
  age: number;
  dietaryNote: string;
  favoriteFood: string;
  hasOrderToday: boolean;
}

export interface FoodItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeType: 'popular' | 'chef' | 'discount' | 'grilled' | 'spicy' | 'special';
  price: number;
  emoji: string;
  transform?: string;
  category?: 'main' | 'drinks' | 'dessert' | 'snack';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  ingredients?: string[];
  allergens?: string[];
}

export interface SchoolOrder {
  id: string;
  childId: string;
  childName: string;
  childAvatar: string;
  school: string;
  grade: string;
  foodTitle: string;
  foodSubtitle: string;
  foodEmoji: string;
  date: string;
  deliveryTime: string;
  status: 'active' | 'delivered' | 'cancelled' | 'delivering';
  statusText: string;
  price: number;
  trackingCode: string;
}

export interface WalletTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: 'deposit' | 'purchase' | 'refund';
  date: string;
  trackingCode: string;
  status: 'successful' | 'failed' | 'pending';
  childName?: string;
}
