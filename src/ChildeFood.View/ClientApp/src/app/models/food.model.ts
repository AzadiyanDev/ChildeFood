export interface ChildItem {
  id: string;
  name: string;
  grade: string;
  school: string;
  avatar: string;
  age: number;
  dietaryNote?: string;
  favoriteFood?: string;
  hasOrderToday?: boolean;
}

export interface ParentProfile {
  name: string;
  role: string;
  phone: string;
  avatar: string;
  walletBalance: number;
  activeChildrenCount: number;
}

export interface FoodItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeType: 'discount' | 'popular' | 'spicy' | 'grilled' | 'chef';
  price: number;
  emoji: string;
  transform: string;
  category: string;
}

export interface DateDayItem {
  dayNumber: number;
  label: string;
}

export interface CategoryItem {
  id: string;
  title: string;
  emoji: string;
  offsetY: number; // For the curved arc elevation
}

export type NavTabId = 'home' | 'wallet' | 'children' | 'orders' | 'profile';

export interface NavTabItem {
  id: NavTabId;
  label: string;
}

export interface WalletTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: 'deposit' | 'purchase';
  date: string;
  trackingCode: string;
  status: 'successful' | 'pending' | 'failed';
  childName?: string;
}

export interface SchoolOrder {
  id: string;
  childId?: string;
  childName: string;
  childAvatar: string;
  school: string;
  grade?: string;
  foodTitle: string;
  foodSubtitle?: string;
  foodEmoji: string;
  date: string;
  deliveryTime?: string;
  status: 'active' | 'delivered' | 'cancelled';
  statusText: string;
  price: number;
  trackingCode?: string;
}


