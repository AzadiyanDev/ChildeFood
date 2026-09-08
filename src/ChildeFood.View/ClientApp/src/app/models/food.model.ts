export type NavTabId = 'home' | 'meals' | 'calendar' | 'wallet' | 'children' | 'orders' | 'profile' | 'checkout' | 'login-phone' | 'login-otp' | 'parent-onboarding' | 'child-onboarding';

// مدل اطلاعات کاربر لاگین شده در فرانت
export interface AuthUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  nationalId?: string;
  address?: string;
  roleTitle?: string;
  avatarUrl?: string;
  walletBalance: number;
  childrenCount?: number;
  onboardingStatus?: 'NeedParentProfile' | 'NeedChild' | 'Completed';
}

// نتیجه درخواست ارسال کد یکبارمصرف
export interface SendOtpResponse {
  success: boolean;
  message: string;
  otpCode?: string;
  expirySeconds: number;
}

// نتیجه اعتبارسنجی کد اوتی‌پی و لاگین در فرانت
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  isNewUser: boolean;
  onboardingStatus?: 'NeedParentProfile' | 'NeedChild' | 'Completed';
  user?: AuthUser;
}

// درخواست تکمیل اطلاعات والد در مرحله اول آنبوردینگ
export interface UpdateParentProfileRequest {
  fullName: string;
  nationalId?: string;
  roleTitle?: string;
  address?: string;
  avatarUrl?: string;
}

// درخواست ثبت اولین فرزند در مرحله دوم آنبوردینگ
export interface AddChildRequest {
  fullName: string;
  age: number;
  grade: string;
  schoolName: string;
  schoolId?: string;
  dietaryNotes?: string;
  favoriteFood?: string;
  avatarUrl?: string;
}

// مدل مدرسه یا مجتمع آموزشی دریافتی از دیتابیس بک‌اند
export interface SchoolItem {
  id: string;
  name: string;
  branchCode: string;
  address: string;
  defaultLunchTime: string;
  isActive: boolean;
}

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

// خلاصه وضعیت کیف پول برگشتی از سرور
export interface WalletSummaryResponse {
  walletId: string;
  balance: number;
  virtualCardNumber: string;
  lastTransactionAmount?: number | null;
  lastTransactionType?: string | null;
  lastTransactionTitle?: string | null;
  lastTransactionDate?: string | null;
  monthOrdersCount: number;
}

// مدل سفارش امروز دریافتی مستقیم از دیتابیس
export interface TodayOrderResponse {
  id: string;
  orderCode: string;
  childId: string;
  childName: string;
  childAvatar?: string;
  schoolName: string;
  grade: string;
  foodTitle: string;
  foodSubtitle: string;
  foodEmoji: string;
  deliveryTime: string;
  dateLabel: string;
  servingDate: string;
  status: number;
  statusBadgeText: string;
  statusBadgeType: 'preparing' | 'delivered';
  totalPrice: number;
  trackingCode: string;
}

// مدل پیشنهاد ویژه غذای امروز دریافتی از دیتابیس
export interface FoodRecommendationResponse {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  badgeText?: string;
  badgeType?: string;
  emoji?: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: string;
  allergens?: string;
  ordersCount: number;
}

// مدل خلاصه و سبک سفارش در لیست سفارش‌های کاربر
export interface OrderSummaryItem {
  id: string;
  orderCode: string;
  childId: string;
  childName: string;
  childAvatar?: string;
  schoolName: string;
  grade: string;
  foodTitle: string;
  foodSubtitle: string;
  foodEmoji: string;
  deliveryTime: string;
  dateLabel: string;
  servingDate: string;
  status: 'active' | 'delivered';
  statusText: string;
  price: number;
  trackingCode: string;
}

// نتیجه صفحه‌بندی شده ۱۰تایی سفارش‌ها از بک‌اند
export interface PagedOrdersResponse {
  items: OrderSummaryItem[];
  totalCount: number;
  activeCount: number;
  deliveredCount: number;
  pageNumber: number;
  pageSize: number;
  hasMore: boolean;
}

// آیتم‌های ریز داخل یک سفارش
export interface OrderItemDetail {
  id: string;
  foodItemId: string;
  foodTitle: string;
  portion: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  emoji: string;
  imageUrl?: string;
  calories: number;
  ingredients?: string;
}

// مراحل تایم‌لاین پیگیری در مدال
export interface OrderTimelineStep {
  title: string;
  subtitle: string;
  time: string;
  isCompleted: boolean;
  isCurrent: boolean;
  icon: string;
}

// جزئیات کامل یک سفارش برای نمایش جامع در مدال
export interface OrderDetailResponse {
  id: string;
  orderCode: string;
  childId: string;
  childName: string;
  childAvatar?: string;
  schoolName: string;
  grade: string;
  dietaryNotes?: string;
  servingDate: string;
  dateLabel: string;
  deliveryTime: string;
  status: 'active' | 'delivered';
  statusText: string;
  totalRawPrice: number;
  discountAmount: number;
  finalPayablePrice: number;
  paymentMethod: string;
  trackingCode: string;
  couponCode?: string;
  createdAt: string;
  items: OrderItemDetail[];
  timelineSteps: OrderTimelineStep[];
}


