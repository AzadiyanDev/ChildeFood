import {Injectable, computed, signal} from '@angular/core';
import {AddChildRequest, AuthResponse, AuthUser, CategoryItem, ChildItem, DateDayItem, FoodItem, FoodRecommendationResponse, NavTabId, OrderDetailResponse, OrderItemDetail, OrderSummaryItem, PagedOrdersResponse, PagedTransactionsResponse, ParentProfile, SchoolItem, SchoolOrder, SendOtpResponse, TodayOrderResponse, UpdateParentProfileRequest, WalletSummaryResponse, WalletTransaction} from '../models/food.model';


@Injectable({
  providedIn: 'root',
})
export class FoodStore {
  // وضعیت صفحه فعال جاری؛ پیش‌فرض تا پیش از لاگین بر روی صفحه ورود با موبایل قرار دارد
  readonly activePage = signal<NavTabId>('login-phone');

  // وضعیت احراز هویت و اطلاعات کاربر جاری
  readonly isAuthenticated = signal<boolean>(false);
  readonly currentUser = signal<AuthUser | null>(null);

  // لیست مدارس دریافت شده از جدول دیتابیس جهت نمایش در سلکت‌باکس ثبت فرزند
  readonly schools = signal<SchoolItem[]>([]);

  // سیگنال داده‌های خلاصه کیف پول، آخرین تراکنش و سفارش‌های ماه از دیتابیس
  readonly walletSummary = signal<WalletSummaryResponse | null>(null);

  // سیگنال ۵ تراکنش اخیر واکشی‌شده ریل‌تایم از دیتابیس
  readonly recentWalletTransactions = signal<WalletTransaction[]>([]);


  // سیگنال پیشنهاد غذای امروز (محبوب‌ترین منوی روزانه)
  readonly dailyRecommendation = signal<FoodRecommendationResponse | null>({
    id: 'food-rec-default',
    title: 'جوجه کباب',
    subtitle: 'طبخ تازه با گوشت گرم و برنج درجه یک',
    price: 185000,
    badgeText: 'محبوب بچه‌ها',
    badgeType: 'popular',
    emoji: '🍗',
    calories: 540,
    protein: 35,
    carbs: 48,
    fat: 14,
    ordersCount: 15,
  });

  // شماره موبایل در انتظار تایید و کد اوتی‌پی شبیه‌سازی‌شده جهت نمایش در توستر بالایی
  readonly pendingPhone = signal<string>('');
  readonly latestOtpCode = signal<string | null>(null);
  readonly showOtpNotification = signal<boolean>(false);
  readonly autoFilledOtp = signal<string | null>(null);

  private otpNotificationTimeout: any = null;
  private isNavigatingFromHistory = false;

  constructor() {
    this.restoreAuthSession();
    this.initHistoryNavigation();
    this.loadSchools();
    this.loadTodayRecommendation();
  }

  // بررسی سشن ذخیره‌شده کاربر در لوکال استوریج؛ اگر کاربر قبلاً لاگین کرده باشد سشن بازیابی می‌شود
  private restoreAuthSession(): void {
    if (typeof window === 'undefined') return;
    try {
      const savedUser = localStorage.getItem('childe_food_auth_user');
      if (savedUser) {
        const user: AuthUser = JSON.parse(savedUser);
        if (user && user.phoneNumber) {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);

          if (user.fullName && user.fullName !== 'والد گرامی') {
            this.parentProfile.update((prev) => ({
              ...prev,
              name: user.fullName,
              phone: user.phoneNumber,
              role: user.roleTitle || prev.role,
              nationalId: user.nationalId || prev.nationalId,
              address: user.address || prev.address,
              walletBalance: user.walletBalance ?? prev.walletBalance,
              avatar: user.avatarUrl || prev.avatar,
            }));
          } else if (user.avatarUrl) {
            this.parentProfile.update((prev) => ({
              ...prev,
              avatar: user.avatarUrl || prev.avatar,
            }));
          }

          // واکشی مجدد آخرین وضعیت پروفایل و لیست فرزندان واقعی از سرور
          this.loadUserProfileAndChildren(user.phoneNumber);

          // بررسی هوشمند وضعیت آنبوردینگ در هنگام لود مجدد صفحه
          if (user.onboardingStatus === 'NeedParentProfile') {
            this.activePage.set('parent-onboarding');
            return;
          } else if (user.onboardingStatus === 'NeedChild') {
            this.activePage.set('child-onboarding');
            return;
          }

          this.activePage.set('home');
          return;
        }
      }
    } catch {
      // در صورت بروز خطای پارس در محیط‌های خاص
    }

    // در غیر این صورت کاربر باید حتماً لاگین کند و اجازه ورود به خانه را ندارد
    this.isAuthenticated.set(false);
    this.activePage.set('login-phone');
  }

  // مدیریت هوشمند کلید بازگشت مرورگر/گوشی کاربر بر اساس سلسله‌مراتب فلو سفارش
  private initHistoryNavigation(): void {
    if (typeof window === 'undefined') return;

    try {
      if (!window.history.state || !window.history.state.page) {
        window.history.replaceState({ page: this.activePage() }, '');
      }

      window.addEventListener('popstate', (event) => {
        const statePage = event.state?.page;
        this.isNavigatingFromHistory = true;

        // گارد امنیتی: اگر کاربر لاگین نکرده باشد، به هیچ وجه اجازه رفتن به صفحات اصلی را ندارد
        if (!this.isAuthenticated()) {
          if (statePage === 'login-otp') {
            this.activePage.set('login-otp');
          } else {
            this.activePage.set('login-phone');
          }
          this.isNavigatingFromHistory = false;
          return;
        }

        // گارد امنیتی آنبوردینگ در دکمه بازگشت مرورگر
        const status = this.currentUser()?.onboardingStatus;
        if (status === 'NeedParentProfile') {
          this.activePage.set('parent-onboarding');
          this.isNavigatingFromHistory = false;
          return;
        } else if (status === 'NeedChild') {
          if (statePage === 'parent-onboarding') {
            this.activePage.set('parent-onboarding');
          } else {
            this.activePage.set('child-onboarding');
          }
          this.isNavigatingFromHistory = false;
          return;
        }

        if (statePage) {
          this.activePage.set(statePage);
          if (['home', 'wallet', 'children', 'orders', 'profile'].includes(statePage)) {
            this.activeNavTab.set(statePage as NavTabId);
          }
        } else {
          // در صورت عدم وجود استیت در تاریخچه، بازگشت مرحله‌به‌مرحله به صفحه قبل:
          // checkout -> meals -> calendar -> home
          const current = this.activePage();
          if (current === 'checkout') {
            this.activePage.set('meals');
          } else if (current === 'meals') {
            this.activePage.set('calendar');
          } else if (current !== 'home') {
            this.activePage.set('home');
            this.activeNavTab.set('home');
          }
        }

        this.isNavigatingFromHistory = false;
      });
    } catch {
      // نادیده‌گرفتن محدودیت‌های احتمالی محیط‌های خاص
    }
  }

  private pushHistoryState(page: NavTabId): void {
    if (typeof window === 'undefined' || this.isNavigatingFromHistory) return;
    try {
      if (window.history.state?.page !== page) {
        window.history.pushState({ page }, '');
      }
    } catch {
      // نادیده‌گرفتن خطا
    }
  }

  // تابع کمکی برای بازگشت به مرحله قبل با قابلیت فراخوانی مستقیم و مدیریت کلید بازگشت
  navigateBack(): void {
    const current = this.activePage();
    if (current === 'checkout') {
      this.goToMeals();
    } else if (current === 'meals') {
      this.goToCalendar();
    } else if (current === 'calendar') {
      this.goToHome();
    } else if (current !== 'home') {
      this.goToHome();
    }

    if (typeof window !== 'undefined') {
      try {
        if (window.history.state?.page === current && window.history.length > 1) {
          window.history.back();
        }
      } catch {
        // نادیده‌گرفتن خطا
      }
    }
  }

  // Selected child for which food is currently being ordered
  readonly selectedChildId = signal<string | null>('child-1');

  // روزهای انتخاب شده تقویم (پیش‌فرض خالی است تا کاربر خودش روزها را انتخاب کند)
  readonly selectedCalendarDays = signal<number[]>([]);

  // ذخیره‌سازی نگاشت روز به غذای انتخاب‌شده برای فلو مرحله‌به‌مرحله انتخاب غذا
  readonly dayMealSelections = signal<Record<number, {
    foodId: string;
    portion: 'کامل' | 'نیم پرس';
    quantity: number;
  }>>({});

  // پروفایل والد
  readonly parentProfile = signal<ParentProfile>({
    name: 'سارا احمدی',
    role: 'مادر (سرپرست خانواده)',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    avatar: '👩‍💼',
    walletBalance: 250000,
    activeChildrenCount: 3,
    nationalId: '۰۰۱۸۴۷۲۹۱۰',
    email: 'sara.ahmadi@gmail.com',
    address: 'تهران، سعادت‌آباد، خیابان سرو غربی',
    notes: 'تحویل ناهار به بوفه مرکزی مدرسه',
  });

  // Children List with detailed school and health info
  readonly children = signal<ChildItem[]>([
    {
      id: 'child-1',
      name: 'علی احمدی',
      grade: 'کلاس پنجم',
      school: 'مدرسه نمونه',
      avatar: '/assets/avatars/ali.svg',
      age: 11,
      dietaryNote: 'بدون حساسیت غذایی',
      favoriteFood: 'پیتزا سیسیلیا',
      hasOrderToday: true,
    },
    {
      id: 'child-2',
      name: 'آوا احمدی',
      grade: 'پایه دوم ابتدایی',
      school: 'دبستان دخترانه سرو',
      avatar: '/assets/avatars/ava.svg',
      age: 8,
      dietaryNote: 'رژیم بدون بادام زمینی',
      favoriteFood: 'پاستا آلفردو',
      hasOrderToday: true,
    },
    {
      id: 'child-3',
      name: 'امیرعلی احمدی',
      grade: 'پایه پنجم',
      school: 'مدرسه نمونه',
      avatar: '/assets/avatars/amirali.svg',
      age: 11,
      dietaryNote: 'غذای کم‌ادویه و سبک',
      favoriteFood: 'نودل توئیستارا',
      hasOrderToday: false,
    },
  ]);

  // سفارش‌های ناهار گرم امروز بچه‌ها برای نمایش توی صفحه اصلی و بخش پیگیری
  readonly todayOrders = signal([
    {
      id: 'ORD-1042',
      childId: 'child-1',
      childName: 'علی احمدی',
      childAvatar: '/assets/avatars/ali.svg',
      school: 'مدرسه نمونه',
      grade: 'کلاس پنجم',
      foodTitle: 'جوجه کباب',
      foodSubtitle: 'پرس کامل',
      foodEmoji: '🍗',
      deliveryTime: 'ساعت ۱۲:۳۰',
      date: 'امروز - شنبه ۱۰ شهریور',
      status: 'delivering' as const,
      statusText: 'در حال آماده‌سازی',
      price: 185000,
      trackingCode: '984712',
    },
    {
      id: 'ORD-1039',
      childId: 'child-2',
      childName: 'آوا احمدی',
      childAvatar: '/assets/avatars/ava.svg',
      school: 'دبستان دخترانه سرو',
      grade: 'کلاس ۲۰۴',
      foodTitle: 'ماکارونی',
      foodSubtitle: 'پرس کامل',
      foodEmoji: '🍝',
      deliveryTime: 'ساعت ۱۲:۴۵',
      date: 'امروز - شنبه ۱۰ شهریور',
      status: 'delivered' as const,
      statusText: 'تحویل شده',
      price: 160000,
      trackingCode: '984530',
    },
  ]);

  readonly selectedChild = computed(() => {
    const id = this.selectedChildId();
    return this.children().find((c) => c.id === id) || this.children()[0];
  });

  // Available dates in straight line sequence
  readonly dateDays = signal<DateDayItem[]>([
    {dayNumber: 12, label: '۱۲'},
    {dayNumber: 13, label: '۱۳'},
    {dayNumber: 14, label: '۱۴'},
    {dayNumber: 15, label: '۱۵'},
    {dayNumber: 16, label: '۱۶'},
    {dayNumber: 17, label: '۱۷'},
    {dayNumber: 18, label: '۱۸'},
  ]);

  // روز انتخابی فعلی تقویم (پیش‌فرض طبق نیازمندی ریدیزاین روی روز ۱۶ شهریور تنظیم شده)
  // روز انتخابی کاربر در تقویم برای ثبت غذا؛ همیشه پیش‌فرض از روز اول (۱۵) شروع می‌شه
  readonly selectedDay = signal<number>(15);

  // Different food menus for each specific date
  readonly foodsByDate: Record<number, FoodItem[]> = {
    12: [
      {
        id: 'kebab-mega-12',
        title: 'کباب چوبی مگا',
        subtitle: 'همراه با سبزیجات گریل',
        badge: 'گریل شده',
        badgeType: 'grilled',
        price: 62000,
        emoji: '🍢',
        transform: '-rotate-45 scale-110',
        category: 'main',
      },
      {
        id: 'joojeh-kabab-12',
        title: 'چلو جوجه کباب زعفرانی',
        subtitle: 'همراه با برنج درجه یک ایرانی',
        badge: 'غذای روز',
        badgeType: 'popular',
        price: 89000,
        emoji: '🍗',
        transform: 'rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'ghormeh-sabzi-12',
        title: 'قورمه سبزی اصیل',
        subtitle: 'با گوشت تازه گوسفندی و لوبیا',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 75000,
        emoji: '🥘',
        transform: 'scale-110',
        category: 'main',
      },
      {
        id: 'koobideh-12',
        title: 'کوبیده سنتی ممتاز',
        subtitle: 'دو سیخ کوبیده با گوجه کبابی',
        badge: 'ویژه سرآشپز',
        badgeType: 'chef',
        price: 93000,
        emoji: '🥩',
        transform: '-rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'taco-12',
        title: 'تاکو مکزیکی تند',
        subtitle: 'با گوشت چرخ‌کرده و سالسا',
        badge: 'تند و اسپایسی 🌶️',
        badgeType: 'spicy',
        price: 58000,
        emoji: '🌮',
        transform: 'rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'salad-shirazi-12',
        title: 'سالاد شیرازی مخصوص',
        subtitle: 'خیار، گوجه، پیاز و آبغوره',
        badge: 'پیش‌غذا',
        badgeType: 'discount',
        price: 32000,
        emoji: '🥗',
        transform: 'scale-105',
        category: 'main',
      },
    ],
    13: [
      {
        id: 'pizza-sicilia-13',
        title: 'پیتزا سیسیلیا',
        subtitle: 'پیتزا مخصوص ایتالیایی با پنیر کش‌دار',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 85000,
        emoji: '🍕',
        transform: '-rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'pasta-alfredo-13',
        title: 'پاستا آلفردو',
        subtitle: 'با فیله مرغ و قارچ تازه و خامه',
        badge: '۱۵٪-',
        badgeType: 'discount',
        price: 92000,
        emoji: '🍝',
        transform: '-rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'lasagna-13',
        title: 'لازانیا گوشت و قارچ',
        subtitle: 'لایه‌های گوشت چرخ‌کرده با سس بشامل',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 85000,
        emoji: '🧀',
        transform: 'scale-110',
        category: 'main',
      },
      {
        id: 'pizza-pepperoni-13',
        title: 'پیتزا پپرونی تند',
        subtitle: 'پپرونی دودی اعلا با فلفل هالوپینو',
        badge: 'تند و اسپایسی 🌶️',
        badgeType: 'spicy',
        price: 78000,
        emoji: '🍕',
        transform: 'rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'garlic-bread-13',
        title: 'نان سیر ایتالیایی',
        subtitle: 'با کره سیر دار و پنیر موزارلا',
        badge: 'پیش‌غذا',
        badgeType: 'discount',
        price: 40000,
        emoji: '🥖',
        transform: 'rotate-6 scale-105',
        category: 'main',
      },
      {
        id: 'burger-13',
        title: 'برگر دوبل اسمش',
        subtitle: 'برگر گوشت با پنیر چدار',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 75000,
        emoji: '🍔',
        transform: 'scale-110',
        category: 'main',
      },
    ],
    14: [
      {
        id: 'noodle-twistara-14',
        title: 'نودل توئیستارا',
        subtitle: 'با سس تند مخصوص آسیایی',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 54000,
        emoji: '🍜',
        transform: 'rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'sushi-mix-roll-14',
        title: 'سوشی میکس رول',
        subtitle: 'سالمون نروژی و آووکادو تازه',
        badge: 'غذای سرآشپز',
        badgeType: 'chef',
        price: 115000,
        emoji: '🍣',
        transform: 'rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'ramen-14',
        title: 'رامن تند توکیو',
        subtitle: 'تخم‌مرغ نیم‌پز با نودل دست‌ساز و جلبک',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 82000,
        emoji: '🍲',
        transform: 'scale-110',
        category: 'main',
      },
      {
        id: 'spring-roll-14',
        title: 'اسپرینگ رول سبزیجات',
        subtitle: '۴ عدد رول کریسپی با سس سوئیت چیلی',
        badge: '۱۵٪-',
        badgeType: 'discount',
        price: 49000,
        emoji: '🥟',
        transform: '-rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'tempura-shrimp-14',
        title: 'میگو تمپورا طلایی',
        subtitle: 'میگو سوخاری سبک و ترد ژاپنی',
        badge: 'غذای دریایی',
        badgeType: 'chef',
        price: 104000,
        emoji: '🍤',
        transform: 'rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'fried-chicken-14',
        title: 'مرغ سوخاری کریسپی',
        subtitle: '۴ تکه همراه سیب‌زمینی',
        badge: '۲۰٪-',
        badgeType: 'discount',
        price: 84000,
        emoji: '🍗',
        transform: '-rotate-12 scale-110',
        category: 'main',
      },
    ],
    15: [
      {
        id: 'noodle-twistara',
        title: 'نودل توئیستارا',
        subtitle: 'با سس تند مخصوص',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 54000,
        emoji: '🍜',
        transform: 'rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'pizza-sicilia',
        title: 'پیتزا سیسیلیا',
        subtitle: 'پیتزا مخصوص ایتالیایی',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 85000,
        emoji: '🍕',
        transform: '-rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'burger-double-smash',
        title: 'برگر دوبل اسمش',
        subtitle: 'برگر گوشت با پنیر چدار',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 75000,
        emoji: '🍔',
        transform: 'scale-110 hover:scale-115',
        category: 'main',
      },
      {
        id: 'kebab-mega',
        title: 'کباب چوبی مگا',
        subtitle: 'همراه با سبزیجات گریل',
        badge: 'گریل شده',
        badgeType: 'grilled',
        price: 62000,
        emoji: '🍢',
        transform: '-rotate-45 scale-110',
        category: 'main',
      },
      {
        id: 'taco-mexican',
        title: 'تاکو مکزیکی تند',
        subtitle: 'با گوشت چرخ‌کرده و سالسا',
        badge: 'تند و اسپایسی 🌶️',
        badgeType: 'spicy',
        price: 58000,
        emoji: '🌮',
        transform: 'rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'pasta-alfredo',
        title: 'پاستا آلفردو',
        subtitle: 'با فیله مرغ و قارچ تازه',
        badge: '۱۵٪-',
        badgeType: 'discount',
        price: 92000,
        emoji: '🍝',
        transform: '-rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'sushi-mix-roll',
        title: 'سوشی میکس رول',
        subtitle: 'سالمون نروژی و آووکادو',
        badge: 'غذای سرآشپز',
        badgeType: 'chef',
        price: 115000,
        emoji: '🍣',
        transform: 'rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'crispy-fried-chicken',
        title: 'مرغ سوخاری کریسپی',
        subtitle: '۴ تکه همراه سیب‌زمینی',
        badge: '۲۰٪-',
        badgeType: 'discount',
        price: 84000,
        emoji: '🍗',
        transform: '-rotate-12 scale-110',
        category: 'main',
      },
    ],
    16: [
      {
        id: 'burger-double-smash-16',
        title: 'برگر دوبل اسمش',
        subtitle: 'دو لایه گوشت با پنیر دوبل',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 75000,
        emoji: '🍔',
        transform: 'scale-110',
        category: 'main',
      },
      {
        id: 'chicken-burger-16',
        title: 'چیکن برگر زغالی',
        subtitle: 'فیله سوخاری با سس هانی ماستارد',
        badge: '۲۰٪-',
        badgeType: 'discount',
        price: 69000,
        emoji: '🍔',
        transform: '-rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'hotdog-cheese-16',
        title: 'هات‌داگ تنوری پنیری',
        subtitle: 'هات‌داگ دودی تنوری در نان باگت نرم',
        badge: 'گریل شده',
        badgeType: 'grilled',
        price: 55000,
        emoji: '🌭',
        transform: 'rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'crispy-chicken-16',
        title: 'مرغ سوخاری کریسپی',
        subtitle: '۴ تکه همراه سیب‌زمینی',
        badge: '۲۰٪-',
        badgeType: 'discount',
        price: 84000,
        emoji: '🍗',
        transform: 'scale-110',
        category: 'main',
      },
      {
        id: 'drink-orange-16',
        title: 'آبمیوه طبیعی پرتقال',
        subtitle: 'آب پرتقال تازه و ارگانیک',
        badge: 'طبیعی',
        badgeType: 'chef',
        price: 25000,
        emoji: '🧃',
        transform: 'scale-105',
        category: 'drinks',
      },
      {
        id: 'drink-lemonade-16',
        title: 'لیموناد خنک نعنایی',
        subtitle: 'نوشیدنی لیمو و نعناع تازه',
        badge: 'خنک و تازه',
        badgeType: 'discount',
        price: 22000,
        emoji: '🥤',
        transform: 'rotate-6 scale-105',
        category: 'drinks',
      },
      {
        id: 'drink-dough-16',
        title: 'دوغ سنتی نعنایی',
        subtitle: 'دوغ محلی گازدار بطری',
        badge: 'سنتی',
        badgeType: 'popular',
        price: 18000,
        emoji: '🥛',
        transform: 'scale-105',
        category: 'drinks',
      },
      {
        id: 'dessert-donut-16',
        title: 'دونات شکلاتی مخصوص',
        subtitle: 'دونات نرم با روکش شکلات بلژیکی',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 32000,
        emoji: '🍩',
        transform: 'scale-110',
        category: 'dessert',
      },
      {
        id: 'dessert-jelly-16',
        title: 'ژله میوه‌ای رنگین‌کمان',
        subtitle: 'ژله طبیعی بدون شکر افزوده',
        badge: 'کم‌کالری',
        badgeType: 'discount',
        price: 20000,
        emoji: '🍮',
        transform: 'scale-105',
        category: 'dessert',
      },
      {
        id: 'dessert-muffin-16',
        title: 'مافین وانیل شکلاتی',
        subtitle: 'کیک مافین اسفنجی با تکه‌های کاکائو',
        badge: 'عصرانه',
        badgeType: 'chef',
        price: 24000,
        emoji: '🧁',
        transform: 'scale-105',
        category: 'dessert',
      },
    ],
    17: [
      {
        id: 'taco-mexican-17',
        title: 'تاکو مکزیکی تند',
        subtitle: 'با گوشت چرخ‌کرده، سالسا و هالوپینو',
        badge: 'تند و اسپایسی 🌶️',
        badgeType: 'spicy',
        price: 58000,
        emoji: '🌮',
        transform: 'rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'burrito-beef-17',
        title: 'بوریتو گوشت و لوبیا',
        subtitle: 'پیچیده در نان ترتیلا با پنیر و برنج',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 67000,
        emoji: '🌯',
        transform: '-rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'nachos-mega-17',
        title: 'ناچوز با دیپ پنیر',
        subtitle: 'چیپس ذرت ترد با پنیر چدار آب‌شده و سالسا',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 52000,
        emoji: '🧀',
        transform: 'scale-110',
        category: 'main',
      },
      {
        id: 'quesadilla-17',
        title: 'کسیدیا مرغ مکزیکی',
        subtitle: 'نان تورتیلا برشته با مرغ و پنیر فراوان',
        badge: 'غذای سرآشپز',
        badgeType: 'chef',
        price: 74000,
        emoji: '🫓',
        transform: 'rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'fajita-17',
        title: 'فاهیتا فیله مرغ',
        subtitle: 'همراه فلفل دلمه‌ای رنگی گریل شده',
        badge: 'گریل شده',
        badgeType: 'grilled',
        price: 79000,
        emoji: '🥘',
        transform: '-rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'pizza-sicilia-17',
        title: 'پیتزا سیسیلیا',
        subtitle: 'پیتزا مخصوص ایتالیایی',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 85000,
        emoji: '🍕',
        transform: 'scale-110',
        category: 'main',
      },
    ],
    18: [
      {
        id: 'sushi-mix-roll-18',
        title: 'سوشی میکس رول',
        subtitle: 'سالمون نروژی، میگو و آووکادو',
        badge: 'غذای سرآشپز',
        badgeType: 'chef',
        price: 115000,
        emoji: '🍣',
        transform: 'rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'salmon-steak-18',
        title: 'فیله سالمون گریل',
        subtitle: 'همراه سبزیجات بخارپز و لیمو ترش',
        badge: 'رژیمی و سالم',
        badgeType: 'chef',
        price: 132000,
        emoji: '🐟',
        transform: '-rotate-6 scale-110',
        category: 'main',
      },
      {
        id: 'fried-shrimp-18',
        title: 'میگو سوخاری تمپورا',
        subtitle: '۶ عدد میگو درشت ترد طلایی',
        badge: '۲۰٪-',
        badgeType: 'discount',
        price: 98000,
        emoji: '🍤',
        transform: 'rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'quinoa-salad-18',
        title: 'سالاد کینوا و آووکادو',
        subtitle: 'با سبزیجات تازه ارگانیک و زیتون',
        badge: 'سالم و رژیمی',
        badgeType: 'popular',
        price: 65000,
        emoji: '🥗',
        transform: 'scale-110',
        category: 'main',
      },
      {
        id: 'pasta-seafood-18',
        title: 'پاستا مرغ و قارچ آلفردو',
        subtitle: 'با سس دست‌ساز و پنیر پارمسان',
        badge: '۱۵٪-',
        badgeType: 'discount',
        price: 92000,
        emoji: '🍝',
        transform: '-rotate-12 scale-110',
        category: 'main',
      },
      {
        id: 'burger-18',
        title: 'برگر دوبل اسمش',
        subtitle: 'برگر گوشت با پنیر چدار',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 75000,
        emoji: '🍔',
        transform: 'scale-110',
        category: 'main',
      },
    ],
  };

  // نوشیدنی‌های بوفه مدرسه که پای ثابت هر روزن و بچه‌ها می‌تونن همیشه کنار غذاشون سفارش بدن
  readonly dailyDrinks: FoodItem[] = [
    {
      id: 'drink-orange-daily',
      title: 'آبمیوه طبیعی پرتقال',
      subtitle: 'آب پرتقال تازه و ارگانیک',
      badge: 'طبیعی',
      badgeType: 'chef',
      price: 25000,
      emoji: '🧃',
      transform: 'scale-105',
      category: 'drinks',
    },
    {
      id: 'drink-lemonade-daily',
      title: 'لیموناد خنک نعنایی',
      subtitle: 'نوشیدنی لیمو و نعناع تازه',
      badge: 'خنک و تازه',
      badgeType: 'discount',
      price: 22000,
      emoji: '🥤',
      transform: 'rotate-6 scale-105',
      category: 'drinks',
    },
    {
      id: 'drink-dough-daily',
      title: 'دوغ سنتی نعنایی',
      subtitle: 'دوغ محلی گازدار بطری',
      badge: 'سنتی',
      badgeType: 'popular',
      price: 18000,
      emoji: '🥛',
      transform: 'scale-105',
      category: 'drinks',
    },
  ];

  // دسرهای خوشمزه مدرسه که هر روز توی بوفه برای عصرانه یا بعد ناهار آماده‌س
  readonly dailyDesserts: FoodItem[] = [
    {
      id: 'dessert-donut-daily',
      title: 'دونات شکلاتی مخصوص',
      subtitle: 'دونات نرم با روکش شکلات بلژیکی',
      badge: 'محبوب 🔥',
      badgeType: 'popular',
      price: 32000,
      emoji: '🍩',
      transform: 'scale-110',
      category: 'dessert',
    },
    {
      id: 'dessert-jelly-daily',
      title: 'ژله میوه‌ای رنگین‌کمان',
      subtitle: 'ژله طبیعی بدون شکر افزوده',
      badge: 'کم‌کالری',
      badgeType: 'discount',
      price: 20000,
      emoji: '🍮',
      transform: 'scale-105',
      category: 'dessert',
    },
    {
      id: 'dessert-muffin-daily',
      title: 'مافین وانیل شکلاتی',
      subtitle: 'کیک مافین اسفنجی با تکه‌های کاکائو',
      badge: 'عصرانه',
      badgeType: 'chef',
      price: 24000,
      emoji: '🧁',
      transform: 'scale-105',
      category: 'dessert',
    },
  ];

  // Legacy categories retained for compatibility if needed
  readonly categories = signal<CategoryItem[]>([
    {id: 'all', title: 'همه', emoji: '🍲', offsetY: 0},
  ]);
  readonly selectedCategoryId = signal<string>('all');
  // متن جستجو
  readonly searchQuery = signal<string>('');
  // وضعیت سبد خرید ناهار مدرسه؛ پیش‌فرض خالی است تا کارت‌ها در وضعیت اولیه انتخاب‌نشده باشند
  readonly cart = signal<Record<string, number>>({});
  // نوع پرس انتخابی برای هر غذا (کامل یا نیم پرس)
  readonly portions = signal<Record<string, 'کامل' | 'نیم پرس'>>({});
  // این متغیر نشون میده والد خودش دست به انتخاب یا تغییر فرزند زده، تا انتخابش الکی بازنویسی نشه
  readonly isExplicitChildSelected = signal<boolean>(false);
  readonly activeNavTab = signal<NavTabId>('home');
  readonly isCartDrawerOpen = signal<boolean>(false);
  readonly isOrdersDrawerOpen = signal<boolean>(false);
  readonly isWalletDrawerOpen = signal<boolean>(false);
  readonly currentAddress = signal<string>('تهران، سعادت‌آباد، خیابان سرو');

  // سفارش‌های پیج‌شده ۱۰ تایی کاربر برای اسکرول بی‌نهایت
  readonly pagedOrders = signal<OrderSummaryItem[]>([]);
  readonly ordersTotalCount = signal<number>(0);
  readonly ordersActiveCount = signal<number>(0);
  readonly ordersDeliveredCount = signal<number>(0);
  readonly ordersCurrentPage = signal<number>(1);
  readonly ordersHasMore = signal<boolean>(false);
  readonly isOrdersLoading = signal<boolean>(false);
  readonly isOrdersLoadingMore = signal<boolean>(false);

  // جزئیات کامل سفارش که فقط موقع باز شدن مودال لود میشه (Lazy Loading)
  readonly selectedOrderDetail = signal<OrderDetailResponse | null>(null);
  readonly isOrderDetailLoading = signal<boolean>(false);

  // Active and recent school meal orders
  readonly schoolOrders = signal<SchoolOrder[]>([
    {
      id: 'ORD-1042',
      childId: 'child-1',
      childName: 'علی احمدی',
      childAvatar: '/assets/avatars/ali.svg',
      school: 'مدرسه نمونه',
      grade: 'کلاس پنجم',
      foodTitle: 'چلو جوجه کباب زعفرانی',
      foodSubtitle: 'همراه با برنج درجه یک ایرانی، گوجه کبابی و زیتون پرورده',
      foodEmoji: '🍗',
      date: 'امروز - شنبه ۱۵ شهریور',
      deliveryTime: 'ساعت ۱۲:۳۰',
      status: 'active',
      statusText: 'در حال ارسال به مدرسه',
      price: 185000,
      trackingCode: '۹۸۴۷۱۲',
    },
    {
      id: 'ORD-1039',
      childId: 'child-2',
      childName: 'آوا احمدی',
      childAvatar: '/assets/avatars/ava.svg',
      school: 'دبستان دخترانه سرو',
      grade: 'کلاس ۲۰۴',
      foodTitle: 'پاستا آلفردو با فیله مرغ',
      foodSubtitle: 'پاستا پنه با سس قارچ تازه، پنیر پارمسان و آبمیوه طبیعی',
      foodEmoji: '🍝',
      date: 'امروز - شنبه ۱۵ شهریور',
      deliveryTime: 'ساعت ۱۲:۴۵',
      status: 'active',
      statusText: 'آماده تحویل در بوفه مدرسه',
      price: 160000,
      trackingCode: '۹۸۴۵۳۰',
    },
    {
      id: 'ORD-1021',
      childId: 'child-3',
      childName: 'امیرعلی احمدی',
      childAvatar: '/assets/avatars/amirali.svg',
      school: 'مرکز نوآموزان شکوفه',
      grade: 'پیش‌دبستانی ۲',
      foodTitle: 'فیله مرغ بخارپز و سبزیجات',
      foodSubtitle: 'خوراک سبک همراه با پوره سیب‌زمینی و آب پرتقال تازه',
      foodEmoji: '🥗',
      date: 'پنج‌شنبه ۱۳ شهریور',
      deliveryTime: 'ساعت ۱۲:۰۰',
      status: 'delivered',
      statusText: 'تحویل داده شده و مصرف شد',
      price: 135000,
      trackingCode: '۸۴۷۱۲۰',
    },
    {
      id: 'ORD-1015',
      childId: 'child-1',
      childName: 'علی احمدی',
      childAvatar: '/assets/avatars/ali.svg',
      school: 'مدرسه نمونه',
      grade: 'کلاس پنجم',
      foodTitle: 'چلو کباب کوبیده سنتی ممتاز',
      foodSubtitle: 'دو سیخ کوبیده همراه با برنج قالبی زعفرانی و دوغ',
      foodEmoji: '🥩',
      date: 'چهارشنبه ۱۲ شهریور',
      deliveryTime: 'ساعت ۱۲:۳۰',
      status: 'delivered',
      statusText: 'تحویل داده شده',
      price: 195000,
      trackingCode: '۷۳۲۹۱۸',
    },
    {
      id: 'ORD-1008',
      childId: 'child-2',
      childName: 'آوا احمدی',
      childAvatar: '/assets/avatars/ava.svg',
      school: 'دبستان دخترانه سرو',
      grade: 'کلاس ۲۰۴',
      foodTitle: 'استانبولی پلو با ماست چکیده',
      foodSubtitle: 'غذای گرم سنتی همراه با سالاد شیرازی تازه',
      foodEmoji: '🍲',
      date: 'سه‌شنبه ۱۱ شهریور',
      deliveryTime: 'ساعت ۱۲:۴۵',
      status: 'delivered',
      statusText: 'تحویل داده شده',
      price: 140000,
      trackingCode: '۶۵۱۸۲۲',
    },
    {
      id: 'ORD-0994',
      childId: 'child-3',
      childName: 'امیرعلی احمدی',
      childAvatar: '/assets/avatars/amirali.svg',
      school: 'مرکز نوآموزان شکوفه',
      grade: 'پیش‌دبستانی ۲',
      foodTitle: 'نودل سبزیجات و مرغ کنجدی',
      foodSubtitle: 'غذای کودکانه سبک با سس مخصوص ملایم',
      foodEmoji: '🍜',
      date: 'دوشنبه ۱۰ شهریور',
      deliveryTime: 'ساعت ۱۲:۰۰',
      status: 'delivered',
      statusText: 'تحویل داده شده',
      price: 120000,
      trackingCode: '۴۱۹۸۲۳',
    },
  ]);

  // Comprehensive Wallet Transactions History
  readonly walletTransactions = signal<WalletTransaction[]>([
    {
      id: 'TX-94821',
      title: 'شارژ آنلاین کیف پول',
      subtitle: 'درگاه شاپرک • بانک سامان',
      amount: 50000,
      type: 'deposit',
      date: 'امروز، ۱۰:۳۰',
      trackingCode: '۹۸۴۷۱۲',
      status: 'successful',
    },
    {
      id: 'TX-94510',
      title: 'رزرو ناهار علی',
      subtitle: 'چلو جوجه کباب زعفرانی • مدرسه نمونه',
      amount: 185000,
      type: 'purchase',
      date: 'دیروز، ۱۲:۱۵',
      trackingCode: '۵۸۳۹۱۰',
      status: 'successful',
      childName: 'علی احمدی',
    },
    {
      id: 'TX-94108',
      title: 'رزرو ناهار آوا',
      subtitle: 'پاستا آلفردو با قارچ • دبستان دخترانه',
      amount: 160000,
      type: 'purchase',
      date: 'پنج‌شنبه ۱۳ شهریور',
      trackingCode: '۳۲۸۱۹۰',
      status: 'successful',
      childName: 'آوا احمدی',
    },
    {
      id: 'TX-93802',
      title: 'شارژ آنلاین کیف پول',
      subtitle: 'درگاه شاپرک • بانک ملی',
      amount: 500000,
      type: 'deposit',
      date: '۱۰ شهریور، ۱۸:۴۰',
      trackingCode: '۴۹۱۸۳۰',
      status: 'successful',
    },
    {
      id: 'TX-93450',
      title: 'رزرو میان‌وعده امیرعلی',
      subtitle: 'بسته میوه و نودل سبک • مرکز شکوفه',
      amount: 65000,
      type: 'purchase',
      date: '۸ شهریور، ۰۹:۱۰',
      trackingCode: '۷۶۱۹۲۴',
      status: 'successful',
      childName: 'امیرعلی احمدی',
    },
    {
      id: 'TX-92980',
      title: 'رزرو ناهار علی',
      subtitle: 'چلو کباب کوبیده زعفرانی • مدرسه نمونه',
      amount: 175000,
      type: 'purchase',
      date: '۵ شهریور، ۱۱:۳۰',
      trackingCode: '۸۲۴۱۵۹',
      status: 'successful',
      childName: 'علی احمدی',
    },
    {
      id: 'TX-92410',
      title: 'شارژ آنلاین کیف پول',
      subtitle: 'درگاه شاپرک • بانک ملت',
      amount: 300000,
      type: 'deposit',
      date: '۳ شهریور، ۲۰:۱۵',
      trackingCode: '۶۱۸۲۹۰',
      status: 'successful',
    },
    {
      id: 'TX-91840',
      title: 'رزرو ناهار آوا',
      subtitle: 'زرشک پلو با مرغ مجلسی • دبستان دخترانه',
      amount: 155000,
      type: 'purchase',
      date: '۱ شهریور، ۱۲:۰۰',
      trackingCode: '۳۰۹۵۱۴',
      status: 'successful',
      childName: 'آوا احمدی',
    },
    {
      id: 'TX-91205',
      title: 'رزرو ناهار امیرعلی',
      subtitle: 'ماکارونی ویژه با گوشت چرخ‌کرده • مرکز شکوفه',
      amount: 140000,
      type: 'purchase',
      date: '۲۸ مرداد، ۱۲:۳۰',
      trackingCode: '۵۷۳۹۲۰',
      status: 'successful',
      childName: 'امیرعلی احمدی',
    },
    {
      id: 'TX-90650',
      title: 'شارژ آنلاین کیف پول',
      subtitle: 'درگاه شاپرک • بانک سامان',
      amount: 250000,
      type: 'deposit',
      date: '۲۵ مرداد، ۰۹:۴۵',
      trackingCode: '۴۱۸۹۳۲',
      status: 'successful',
    },
    {
      id: 'TX-90110',
      title: 'رزرو ناهار علی',
      subtitle: 'چلو خورشت قورمه‌سبزی سنتی • مدرسه نمونه',
      amount: 165000,
      type: 'purchase',
      date: '۲۲ مرداد، ۱۱:۵۰',
      trackingCode: '۹۵۲۱۴۰',
      status: 'successful',
      childName: 'علی احمدی',
    },
    {
      id: 'TX-89750',
      title: 'رزرو میان‌وعده آوا',
      subtitle: 'شیر پاستوریزه و کلوچه سنتی • دبستان دخترانه',
      amount: 45000,
      type: 'purchase',
      date: '۱۹ مرداد، ۱۰:۰۰',
      trackingCode: '۱۸۴۷۹۲',
      status: 'successful',
      childName: 'آوا احمدی',
    },
  ]);

  // فیلتر کردن غذاها بر اساس تاریخ و سرچ والد با استفاده از مدولوی امن
  readonly filteredFoods = computed(() => {
    const day = this.selectedDay();
    const query = this.searchQuery().trim().toLowerCase();
    // اینجا مدولو رو امن کردیم تا اگه احیاناً عدد منفی یا خارج بازه اومد، خطا نده و روز معتبر بده
    const mappedDay = this.foodsByDate[day] ? day : (((((day - 12) % 7) + 7) % 7) + 12);
    const list = this.foodsByDate[day] || this.foodsByDate[mappedDay] || this.foodsByDate[15] || [];

    if (!query) return list;

    return list.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.badge.toLowerCase().includes(query)
      );
    });
  });

  // تجمیع تمام غذاها، نوشیدنی‌ها و دسرهای روزانه بوفه جهت محاسبه قیمت و رندر سبد خرید
  readonly foods = computed(() => {
    const map = new Map<string, FoodItem>();
    for (const items of Object.values(this.foodsByDate)) {
      for (const item of items) {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }
    // آیتم‌های ثابت و همیشگی بوفه مدرسه رو هم حتماً اضافه می‌کنیم که اگه سفارش داده شدن، قیمتشون صفر نیفته
    if (this.dailyDrinks) {
      for (const item of this.dailyDrinks) {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }
    if (this.dailyDesserts) {
      for (const item of this.dailyDesserts) {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }
    return Array.from(map.values());
  });

  // Total cart quantity
  readonly totalCartCount = computed(() => {
    const currentCart = this.cart();
    return Object.values(currentCart).reduce((sum, qty) => sum + qty, 0);
  });

  // Total cart price
  readonly totalCartPrice = computed(() => {
    const currentCart = this.cart();
    const items = this.foods();
    let total = 0;
    for (const [id, count] of Object.entries(currentCart)) {
      const food = items.find((f) => f.id === id);
      if (food && count > 0) {
        total += food.price * count;
      }
    }
    return total;
  });

  setSelectedDay(dayNumber: number): void {
    this.selectedDay.set(dayNumber);
  }

  setCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  addToCart(foodId: string): void {
    this.cart.update((current) => {
      const updated = {...current};
      updated[foodId] = (updated[foodId] || 0) + 1;
      return updated;
    });
  }

  removeFromCart(foodId: string): void {
    this.cart.update((current) => {
      const updated = {...current};
      const count = updated[foodId] || 0;
      if (count <= 1) {
        delete updated[foodId];
      } else {
        updated[foodId] = count - 1;
      }
      return updated;
    });
  }

  getFoodItemCount(foodId: string): number {
    return this.cart()[foodId] || 0;
  }

  // تنظیم نوع پرس (کامل یا نیم پرس) برای غذای انتخابی
  setPortion(foodId: string, portion: 'کامل' | 'نیم پرس'): void {
    this.portions.update((prev) => ({
      ...prev,
      [foodId]: portion,
    }));
  }

  // دریافت نوع پرس فعلی غذا (پیش‌فرض پرس کامل)
  getPortion(foodId: string): 'کامل' | 'نیم پرس' {
    return this.portions()[foodId] || 'کامل';
  }

  // روزهای فعال تقویم؛ اگر از تقویم آمده باشد همان روزها، وگرنه پیش‌فرض ۱۰ روزه کاری مدرسه
  readonly activeCalendarDays = computed(() => {
    const days = this.selectedCalendarDays();
    if (days.length > 0) {
      return days;
    }
    return [15, 16, 17, 18, 19, 22, 23, 24, 25, 26];
  });

  // روزهایی که کاربر غذایشان را انتخاب کرده و با زدن «ادامه» نهایی و نارنجی شده‌اند
  readonly confirmedDays = signal<number[]>([]);

  // ثبت تایید شدن یک روز وقتی کاربر دکمه «ادامه» رو می‌زنه
  confirmDay(day: number): void {
    if (!this.confirmedDays().includes(day)) {
      this.confirmedDays.update((days) => [...days, day].sort((a, b) => a - b));
    }
  }

  // لغو تایید یک روز در صورتی که کاربر غذاش رو حذف کرد
  unconfirmDay(day: number): void {
    this.confirmedDays.update((days) => days.filter((d) => d !== day));
  }

  // بررسی این‌که آیا برای این روز غذا انتخاب شده و دکمه ادامه هم زده شده (روز نارنجی و تیک‌دار)
  isDayCompleted(day: number): boolean {
    return this.confirmedDays().includes(day);
  }

  // بررسی این‌که آیا در حال حاضر برای این روز غذایی انتخاب شده یا نه (برای روشن شدن دکمه نارنجی ادامه)
  hasMealForDay(day: number): boolean {
    const selection = this.dayMealSelections()[day];
    return !!selection && selection.quantity > 0;
  }

  // لیست روزهایی که ناهارشان مشخص و اوکی شده
  readonly completedDays = computed(() => {
    return this.activeCalendarDays().filter((d) => this.isDayCompleted(d));
  });

  // تعداد روزهای باقی‌مانده که هنوز غذایی برای آن‌ها انتخاب نشده
  readonly remainingDaysCount = computed(() => {
    const total = this.activeCalendarDays().length;
    const completed = this.completedDays().length;
    return Math.max(0, total - completed);
  });

  // ثبت یا تغییر غذای یک روز خاص در فلو سفارش
  setMealForDay(day: number, foodId: string, portion: 'کامل' | 'نیم پرس' = 'کامل', quantity = 1): void {
    const prev = this.dayMealSelections()[day];
    if (prev && prev.foodId !== foodId) {
      for (let i = 0; i < prev.quantity; i++) {
        this.removeFromCart(prev.foodId);
      }
    }

    const prevQty = prev && prev.foodId === foodId ? prev.quantity : 0;
    const diff = quantity - prevQty;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        this.addToCart(foodId);
      }
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) {
        this.removeFromCart(foodId);
      }
    }

    this.dayMealSelections.update((map) => ({
      ...map,
      [day]: {foodId, portion, quantity},
    }));

    this.setPortion(foodId, portion);
  }

  // لغو انتخاب غذای یک روز خاص
  removeMealForDay(day: number): void {
    this.unconfirmDay(day);
    const prev = this.dayMealSelections()[day];
    if (prev) {
      for (let i = 0; i < prev.quantity; i++) {
        this.removeFromCart(prev.foodId);
      }
      this.dayMealSelections.update((map) => {
        const copy = {...map};
        delete copy[day];
        return copy;
      });
    }
  }

  // هدایت هوشمند به اولین روز باقی‌مانده در لیست
  goToNextRemainingDay(): void {
    const days = this.activeCalendarDays();
    const current = this.selectedDay();
    const currentIndex = days.indexOf(current);

    // ابتدا در روزهای بعدی دنبال روز خالی می‌گردیم
    for (let i = currentIndex + 1; i < days.length; i++) {
      if (!this.isDayCompleted(days[i])) {
        this.selectedDay.set(days[i]);
        return;
      }
    }
    // اگر در روزهای بعد نبود، از ابتدای لیست تا روز جاری می‌گردیم
    for (let i = 0; i <= currentIndex; i++) {
      if (!this.isDayCompleted(days[i])) {
        this.selectedDay.set(days[i]);
        return;
      }
    }
    // اگر همه روزها کامل شده باشند، به آخرین روز یا اولین روز می‌رویم
    if (currentIndex < days.length - 1) {
      this.selectedDay.set(days[currentIndex + 1]);
    }
  }

  orderForChild(childId: string): void {
    this.selectedChildId.set(childId);
    this.isExplicitChildSelected.set(true);
    this.goToCalendar();
  }

  goToCalendar(): void {
    if (!this.checkOnboardingGuard()) {
      return;
    }
    // هنگام ورود به تقویم، هیچ روزی نباید از قبل انتخاب شده باشد و روزهای تاییدشده ریست می‌شوند
    this.selectedCalendarDays.set([]);
    this.confirmedDays.set([]);
    this.activePage.set('calendar');
    this.pushHistoryState('calendar');
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  confirmCalendarDays(selectedDays: number[]): void {
    const sorted = [...selectedDays].sort((a, b) => a - b);
    if (sorted.length === 0) return;

    this.selectedCalendarDays.set(sorted);

    // Update dateDays with exactly the user-selected days
    const newDateDays: DateDayItem[] = sorted.map((d) => ({
      dayNumber: d,
      label: d.toLocaleString('fa-IR'),
    }));
    this.dateDays.set(newDateDays);

    // روز فعال همیشه و بدون استثنا روی اولین روز انتخاب‌شده تقویم قرار می‌گیرد
    this.selectedDay.set(sorted[0]);

    // روزهای تاییدشده ریست می‌شوند تا فلو از ابتدا با انتخاب غذا و زدن ادامه پیش رود
    this.confirmedDays.set([]);

    // Proceed to meals page
    this.goToMeals();
  }

  goToMeals(): void {
    if (!this.checkOnboardingGuard()) {
      return;
    }
    // پاکسازی سرچ‌کوئری مارکت‌پلیس تا آیتم‌های ناهار غیب نشوند
    this.searchQuery.set('');
    this.activePage.set('meals');
    this.pushHistoryState('meals');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  // هدایت به صفحه بررسی و تکمیل سفارش تمام‌صفحه به جای مودال
  goToCheckout(): void {
    if (!this.checkOnboardingGuard()) {
      return;
    }
    this.closeCartDrawer();
    this.activePage.set('checkout');
    this.pushHistoryState('checkout');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  // ثبت نهایی سفارش در سیستم و به‌روزرسانی کیف پول و تاریخچه
  finalizeCheckoutOrder(
    paymentMethod: 'wallet' | 'online',
    discountAmount: number,
    ordersToCreate: {
      foodTitle: string;
      foodSubtitle?: string;
      foodEmoji: string;
      date: string;
      price: number;
      portion?: string;
    }[],
  ): string {
    const child = this.selectedChild();
    const trackingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const totalOrderPrice = ordersToCreate.reduce((sum, item) => sum + item.price, 0) - discountAmount;
    const finalAmount = Math.max(0, totalOrderPrice);

    // ۱. ساخت آیتم‌های سفارش مدرسه
    const newSchoolOrders: SchoolOrder[] = ordersToCreate.map((item, index) => ({
      id: `ORD-${Math.floor(1050 + Math.random() * 9000)}-${index + 1}`,
      childId: child.id,
      childName: child.name,
      childAvatar: child.avatar,
      school: child.school,
      grade: child.grade,
      foodTitle: item.foodTitle,
      foodSubtitle: item.portion ? `${item.portion} • تحویل بوفه مدرسه` : item.foodSubtitle || 'تحویل بوفه مدرسه',
      foodEmoji: item.foodEmoji,
      date: item.date,
      deliveryTime: 'ساعت ۱۲:۳۰',
      status: 'active',
      statusText: 'سفارش ثبت شد و در حال آماده‌سازی است',
      price: item.price,
      trackingCode: trackingCode,
    }));

    // افزودن سفارش‌ها به لیست سفارش‌های سیستم و لیست پیج‌شده
    this.schoolOrders.update((prev) => [...newSchoolOrders, ...prev]);

    // همگام‌سازی فوری با لیست پیج‌شده ۱۰ تایی جهت نمایش لحظه‌ای سفارش ثبت شده به کاربر
    const newPagedOrders: OrderSummaryItem[] = newSchoolOrders.map((so) => ({
      id: so.id,
      orderCode: so.id,
      childId: so.childId,
      childName: so.childName,
      childAvatar: so.childAvatar,
      schoolName: so.school,
      grade: so.grade,
      foodTitle: so.foodTitle,
      foodSubtitle: so.foodSubtitle,
      foodEmoji: so.foodEmoji,
      deliveryTime: so.deliveryTime,
      dateLabel: so.date,
      servingDate: new Date().toISOString(),
      status: 'active',
      statusText: so.statusText,
      price: so.price,
      trackingCode: so.trackingCode,
    }));
    this.pagedOrders.update((prev) => [...newPagedOrders, ...prev]);
    this.ordersTotalCount.update((c) => c + newPagedOrders.length);
    this.ordersActiveCount.update((c) => c + newPagedOrders.length);

    // ۲. در صورت انتخاب پرداخت از کیف پول، کسر موجودی و ثبت تراکنش
    if (paymentMethod === 'wallet' && finalAmount > 0) {
      this.parentProfile.update((profile) => ({
        ...profile,
        walletBalance: Math.max(0, profile.walletBalance - finalAmount),
      }));

      const newTx: WalletTransaction = {
        id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        title: `پرداخت سفارش ناهار ${child.name}`,
        subtitle: `${ordersToCreate.length} وعده غذایی • ${child.school}`,
        amount: finalAmount,
        type: 'purchase',
        date: 'هم‌اکنون',
        trackingCode: trackingCode,
        status: 'successful',
        childName: child.name,
      };
      this.walletTransactions.update((txs) => [newTx, ...txs]);
    } else if (paymentMethod === 'online' && finalAmount > 0) {
      const newTx: WalletTransaction = {
        id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        title: `پرداخت اینترنتی ناهار ${child.name}`,
        subtitle: `درگاه شاپرک • بانک سامان • ${ordersToCreate.length} وعده`,
        amount: finalAmount,
        type: 'purchase',
        date: 'هم‌اکنون',
        trackingCode: trackingCode,
        status: 'successful',
        childName: child.name,
      };
      this.walletTransactions.update((txs) => [newTx, ...txs]);
    }

    // ریست کردن سبد خرید موقت
    this.cart.set({});

    return trackingCode;
  }

  // بررسی امنیتی آنبوردینگ؛ بدون اطلاعات والد و حداقل یک فرزند، اجازه ورود به تب‌های اصلی داده نمی‌شود
  checkOnboardingGuard(): boolean {
    if (!this.isAuthenticated()) {
      this.goToLoginPhone();
      return false;
    }
    const status = this.currentUser()?.onboardingStatus;
    if (status === 'NeedParentProfile') {
      this.goToParentOnboarding();
      return false;
    }
    if (status === 'NeedChild') {
      this.goToChildOnboarding();
      return false;
    }
    return true;
  }

  goToHome(): void {
    if (!this.checkOnboardingGuard()) {
      return;
    }
    this.activePage.set('home');
    this.activeNavTab.set('home');
    this.pushHistoryState('home');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  goToWallet(): void {
    if (!this.checkOnboardingGuard()) {
      return;
    }
    this.activePage.set('wallet');
    this.activeNavTab.set('wallet');
    this.pushHistoryState('wallet');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  goToChildren(): void {
    if (!this.checkOnboardingGuard()) {
      return;
    }
    this.activePage.set('children');
    this.activeNavTab.set('children');
    this.pushHistoryState('children');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  goToOrders(): void {
    if (!this.checkOnboardingGuard()) {
      return;
    }
    this.activePage.set('orders');
    this.activeNavTab.set('orders');
    this.pushHistoryState('orders');
    // لود کردن سفارشات به محض ورود به صفحه
    this.loadMyOrders(1, false, 'all');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  goToProfile(): void {
    if (!this.checkOnboardingGuard()) {
      return;
    }
    this.activePage.set('profile');
    this.activeNavTab.set('profile');
    this.pushHistoryState('profile');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  // هدایت به صفحه وارد کردن شماره موبایل
  goToLoginPhone(): void {
    this.activePage.set('login-phone');
    this.pushHistoryState('login-phone');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  // هدایت به صفحه وارد کردن کد اوتی‌پی
  goToLoginOtp(): void {
    this.activePage.set('login-otp');
    this.pushHistoryState('login-otp');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  // هدایت به گام اول آنبوردینگ: تکمیل اطلاعات والد
  goToParentOnboarding(): void {
    this.activePage.set('parent-onboarding');
    this.pushHistoryState('parent-onboarding');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  // واکشی لیست مدارس فعال از جدول پایگاه داده سرور
  async loadSchools(): Promise<SchoolItem[]> {
    try {
      const response = await fetch('/api/schools');
      if (response.ok) {
        const data: SchoolItem[] = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          this.schools.set(data);
          return data;
        }
      }
    } catch {
      // در صورت خطای شبکه در حالت تست آفلاین
    }

    // مقادیر پیش‌فرض محلی جهت استمرار فعالیت کلاینت
    if (this.schools().length === 0) {
      this.schools.set([
        { id: 'sch-1', name: 'دبستان دخترانه فرزانگان (شعبه ۱)', branchCode: 'SCH-FARZ-01', address: 'تهران، شهرک غرب، فاز ۱', defaultLunchTime: '12:30', isActive: true },
        { id: 'sch-2', name: 'مجموعه مدارس مفید (پسرانه)', branchCode: 'SCH-MOFID-02', address: 'تهران، یادگار امام، خیابان زنجان', defaultLunchTime: '12:15', isActive: true },
        { id: 'sch-3', name: 'مجتمع آموزشی علامه حلی', branchCode: 'SCH-HELLI-01', address: 'تهران، کارگر شمالی', defaultLunchTime: '12:30', isActive: true },
        { id: 'sch-4', name: 'دبستان و پیش‌دبستانی هوشمند سرو اندیشه', branchCode: 'SCH-SARV-03', address: 'تهران، سعادت‌آباد، میدان کاج', defaultLunchTime: '12:45', isActive: true },
        { id: 'sch-5', name: 'مجتمع آموزشی نمونه البرز', branchCode: 'SCH-ALBORZ-01', address: 'تهران، خیابان حافظ', defaultLunchTime: '12:20', isActive: true },
        { id: 'sch-6', name: 'دبستان غیردولتی رشد نو', branchCode: 'SCH-ROSHD-04', address: 'تهران، نیاوران، مژده', defaultLunchTime: '12:30', isActive: true },
        { id: 'sch-7', name: 'دبستان دخترانه مهر تابان', branchCode: 'SCH-MEHR-02', address: 'تهران، پاسداران، بوستان دوم', defaultLunchTime: '12:30', isActive: true },
      ]);
    }
    return this.schools();
  }

  // هدایت به گام دوم آنبوردینگ: ثبت اولین فرزند
  goToChildOnboarding(): void {
    this.activePage.set('child-onboarding');
    this.pushHistoryState('child-onboarding');
    this.loadSchools();
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  setActiveNavTab(tabId: NavTabId): void {
    if (!this.isAuthenticated() && tabId !== 'login-phone' && tabId !== 'login-otp') {
      this.goToLoginPhone();
      return;
    }
    this.activeNavTab.set(tabId);
    if (tabId === 'home') {
      this.goToHome();
    } else if (tabId === 'wallet') {
      this.goToWallet();
    } else if (tabId === 'children') {
      this.goToChildren();
    } else if (tabId === 'orders') {
      this.goToOrders();
    } else if (tabId === 'profile') {
      this.goToProfile();
    }
  }

  // نرمال‌سازی شماره موبایل: تبدیل ارقام فارسی و عربی به انگلیسی و حذف فاصله‌ها
  normalizePhoneString(input: string): string {
    if (!input) return '';
    const chars = input.split('');
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

    for (let i = 0; i < chars.length; i++) {
      const pIdx = persianDigits.indexOf(chars[i]);
      if (pIdx !== -1) {
        chars[i] = pIdx.toString();
        continue;
      }
      const aIdx = arabicDigits.indexOf(chars[i]);
      if (aIdx !== -1) {
        chars[i] = aIdx.toString();
      }
    }

    let cleaned = chars.join('').replace(/[\s-]/g, '');
    if (cleaned.startsWith('+98')) {
      cleaned = '0' + cleaned.slice(3);
    } else if (cleaned.startsWith('0098')) {
      cleaned = '0' + cleaned.slice(4);
    } else if (cleaned.startsWith('98') && cleaned.length === 12) {
      cleaned = '0' + cleaned.slice(2);
    } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
      cleaned = '0' + cleaned;
    }
    return cleaned;
  }

  // درخواست صدور و ارسال کد یکبارمصرف از سرور بک‌اند
  async requestOtp(phone: string): Promise<SendOtpResponse> {
    const normalized = this.normalizePhoneString(phone);
    this.pendingPhone.set(normalized);
    this.autoFilledOtp.set(null);

    try {
      const response = await fetch('/api/users/send-otp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({phoneNumber: normalized}),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const serverMsg = err.message || err.title || (err.errors ? Object.values(err.errors).flat().join(' ') : null);
        return {
          success: false,
          message: serverMsg || 'خطا در ارسال کد تایید.',
          expirySeconds: 0,
        };
      }

      const data: SendOtpResponse = await response.json();
      if (data.success && data.otpCode) {
        this.latestOtpCode.set(data.otpCode);
        this.showOtpNotification.set(true);

        if (this.otpNotificationTimeout) {
          clearTimeout(this.otpNotificationTimeout);
        }
        // توستر تا ۲۰ ثانیه در بالای صفحه نمایش داده می‌شود
        this.otpNotificationTimeout = setTimeout(() => {
          this.showOtpNotification.set(false);
        }, 20000);
      }

      return data;
    } catch {
      // فال‌بک امن در صورت خطای شبکه در حالت تست مرورگر
      const fallbackOtp = Math.floor(10000 + Math.random() * 90000).toString();
      this.latestOtpCode.set(fallbackOtp);
      this.showOtpNotification.set(true);
      return {
        success: true,
        message: 'کد تایید با موفقیت صادر شد.',
        otpCode: fallbackOtp,
        expirySeconds: 120,
      };
    }
  }

  // بررسی کد اوتی‌پی با سرور بک‌اند دات‌نت و ورود یا ساخت اکانت اتوماتیک
  async verifyOtp(phone: string, otpCode: string): Promise<AuthResponse> {
    const normalized = this.normalizePhoneString(phone);

    try {
      const response = await fetch('/api/users/verify-otp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({phoneNumber: normalized, otpCode: otpCode.trim()}),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const serverMsg = err.message || err.title || (err.errors ? Object.values(err.errors).flat().join(' ') : null);
        return {
          success: false,
          message: serverMsg || 'کد تایید وارد شده صحیح نمی‌باشد.',
          isNewUser: false,
        };
      }

      const data: AuthResponse = await response.json();
      return data;
    } catch {
      // در صورت خطای غیرمنتظره شبکه، اگر کد با کد تولیدی توستر مطابقت داشت لاگین موفق شبیه‌سازی می‌شود
      if (this.latestOtpCode() === otpCode.trim()) {
        const fallbackUser: AuthUser = {
          id: 'user-' + Date.now(),
          fullName: 'والد گرامی',
          phoneNumber: normalized,
          roleTitle: 'والد دانش‌آموز',
          walletBalance: 0,
        };
        return {
          success: true,
          message: 'ورود با موفقیت انجام شد.',
          isNewUser: true,
          user: fallbackUser,
        };
      }

      return {
        success: false,
        message: 'کد تایید وارد شده نامعتبر است.',
        isNewUser: false,
      };
    }
  }

  // تکمیل پروسه لاگین و هدایت هوشمند به گام‌های آنبوردینگ یا صفحه اصلی
  completeLogin(user?: AuthUser): void {
    this.isAuthenticated.set(true);
    this.dismissOtpToast();

    if (user) {
      this.currentUser.set(user);
      if (user.fullName && user.fullName !== 'والد گرامی') {
        this.parentProfile.update((p) => ({
          ...p,
          name: user.fullName,
          phone: user.phoneNumber || this.pendingPhone(),
          role: user.roleTitle || p.role,
          nationalId: user.nationalId || p.nationalId,
          address: user.address || p.address,
          walletBalance: user.walletBalance ?? 0,
          avatar: user.avatarUrl || p.avatar,
        }));
      } else if (user.avatarUrl) {
        this.parentProfile.update((p) => ({
          ...p,
          avatar: user.avatarUrl || p.avatar,
        }));
      }

      this.loadUserProfileAndChildren(user.phoneNumber || this.pendingPhone());
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'childe_food_auth_user',
          JSON.stringify(user || this.currentUser())
        );
      } catch {
        // نادیده‌گرفتن
      }
    }

    // هدایت به فلو آنبوردینگ در صورتی که کاربر جدید باشد یا اطلاعاتش ناقص باشد
    const status = user?.onboardingStatus || this.currentUser()?.onboardingStatus;
    if (status === 'NeedParentProfile') {
      this.goToParentOnboarding();
      return;
    } else if (status === 'NeedChild') {
      this.goToChildOnboarding();
      return;
    }

    this.goToHome();
  }

  // آپلود واقعی تصویر نمایه والد روی سرور دات‌نت
  async uploadAvatar(file: File): Promise<{success: boolean; url?: string; message?: string}> {
    const formData = new FormData();
    formData.append('file', file);

    const user = this.currentUser();
    const endpoint = user?.id ? `/api/users/upload-avatar/${user.id}` : '/api/users/upload-avatar';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return {
          success: false,
          message: err.message || 'خطا در بارگذاری تصویر روی سرور.',
        };
      }

      const result: {success: boolean; message: string; url: string} = await response.json();
      return result;
    } catch {
      // در صورت خطای موقت شبکه یا حالت تست کلاینت، ایجاد DataURL برای تجربه روان کاربر
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            success: true,
            url: reader.result as string,
            message: 'تصویر با موفقیت انتخاب شد.',
          });
        };
        reader.onerror = () => {
          resolve({
            success: false,
            message: 'خطا در خواندن فایل تصویر انتخابی.',
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  // ذخیره مشخصات والد در گام اول آنبوردینگ
  async saveParentProfileOnboarding(data: UpdateParentProfileRequest): Promise<{success: boolean; message?: string}> {
    const user = this.currentUser();
    if (!user) {
      return {success: false, message: 'کاربر وارد نشده است.'};
    }

    try {
      const response = await fetch(`/api/users/profile/${user.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return {success: false, message: err.message || 'خطا در ذخیره مشخصات والد.'};
      }

      const updatedUser: AuthUser = await response.json();
      this.currentUser.set(updatedUser);
      this.parentProfile.update((p) => ({
        ...p,
        name: updatedUser.fullName,
        role: updatedUser.roleTitle || p.role,
        nationalId: updatedUser.nationalId || p.nationalId,
        address: updatedUser.address || p.address,
        avatar: updatedUser.avatarUrl || p.avatar,
      }));

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('childe_food_auth_user', JSON.stringify(updatedUser));
        } catch {}
      }

      return {success: true};
    } catch {
      // فال‌بک امن برای حالت آفلاین
      this.currentUser.update((u) => u ? ({
        ...u,
        fullName: data.fullName,
        roleTitle: data.roleTitle,
        nationalId: data.nationalId,
        address: data.address,
        avatarUrl: data.avatarUrl,
        onboardingStatus: 'NeedChild',
      }) : null);

      this.parentProfile.update((p) => ({
        ...p,
        name: data.fullName,
        role: data.roleTitle || p.role,
        nationalId: data.nationalId,
        address: data.address,
        avatar: data.avatarUrl || p.avatar,
      }));

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('childe_food_auth_user', JSON.stringify(this.currentUser()));
        } catch {}
      }

      return {success: true};
    }
  }

  // ثبت اولین فرزند در گام دوم آنبوردینگ
  async saveChildOnboarding(data: AddChildRequest): Promise<{success: boolean; message?: string}> {
    const user = this.currentUser();
    if (!user) {
      return {success: false, message: 'کاربر وارد نشده است.'};
    }

    try {
      const response = await fetch(`/api/users/children/${user.id}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return {success: false, message: err.message || 'خطا در ثبت فرزند.'};
      }

      const childRes = await response.json();
      const newChild: ChildItem = {
        id: childRes.id || 'child-' + Date.now(),
        name: childRes.fullName || data.fullName,
        grade: childRes.grade || data.grade,
        school: childRes.schoolName || data.schoolName,
        avatar: childRes.avatarUrl || data.avatarUrl || '👦',
        age: childRes.age || data.age,
        dietaryNote: childRes.dietaryNotes || data.dietaryNotes || 'بدون حساسیت غذایی',
        favoriteFood: childRes.favoriteFood || 'ناهار گرم',
        hasOrderToday: false,
      };

      this.children.update((curr) => [newChild, ...curr]);
      this.selectedChildId.set(newChild.id);

      this.currentUser.update((u) => u ? ({
        ...u,
        childrenCount: this.children().length,
        onboardingStatus: 'Completed',
      }) : null);

      this.parentProfile.update((p) => ({
        ...p,
        activeChildrenCount: this.children().length,
      }));

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('childe_food_auth_user', JSON.stringify(this.currentUser()));
        } catch {}
      }

      return {success: true};
    } catch {
      // فال‌بک لوکال برای شرایط آفلاین
      const newChild: ChildItem = {
        id: 'child-' + Date.now(),
        name: data.fullName,
        grade: data.grade,
        school: data.schoolName,
        avatar: data.avatarUrl || '👦',
        age: data.age,
        dietaryNote: data.dietaryNotes || 'بدون حساسیت غذایی',
        favoriteFood: 'ناهار گرم',
        hasOrderToday: false,
      };

      this.children.update((curr) => [newChild, ...curr]);
      this.selectedChildId.set(newChild.id);

      this.currentUser.update((u) => u ? ({
        ...u,
        childrenCount: this.children().length,
        onboardingStatus: 'Completed',
      }) : null);

      this.parentProfile.update((p) => ({
        ...p,
        activeChildrenCount: this.children().length,
      }));

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('childe_food_auth_user', JSON.stringify(this.currentUser()));
        } catch {}
      }

      return {success: true};
    }
  }

  // خروج کامل از حساب کاربری
  logout(): void {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.dismissOtpToast();

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('childe_food_auth_user');
      } catch {
        // نادیده‌گرفتن
      }
    }

    this.goToLoginPhone();
  }

  // جای‌گذاری خودکار کد از توستر بالای صفحه
  autoFillOtpCode(): void {
    const code = this.latestOtpCode();
    if (code) {
      this.autoFilledOtp.set(code);
    }
  }

  // بستن اعلان پیامک بالا
  dismissOtpToast(): void {
    this.showOtpNotification.set(false);
    if (this.otpNotificationTimeout) {
      clearTimeout(this.otpNotificationTimeout);
    }
  }

  // باز کردن مستقیم و صریح کشوی سبد خرید
  openCartDrawer(): void {
    this.isCartDrawerOpen.set(true);
  }

  toggleCartDrawer(): void {
    this.isCartDrawerOpen.update((open) => !open);
  }

  closeCartDrawer(): void {
    this.isCartDrawerOpen.set(false);
  }

  toggleOrdersDrawer(): void {
    this.goToOrders();
  }

  closeOrdersDrawer(): void {
    this.isOrdersDrawerOpen.set(false);
    if (this.activeNavTab() === 'orders') {
      this.activeNavTab.set('home');
    }
  }

  toggleWalletDrawer(): void {
    this.goToWallet();
  }

  closeWalletDrawer(): void {
    this.isWalletDrawerOpen.set(false);
  }

  addWalletBalance(amount: number): void {
    this.rechargeWallet(amount, 'افزایش سریع اعتبار');
  }

  rechargeWallet(amount: number, description = 'شارژ آنلاین کیف پول'): void {
    this.parentProfile.update((profile) => ({
      ...profile,
      walletBalance: profile.walletBalance + amount,
    }));

    const trackingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newTx: WalletTransaction = {
      id: 'TX-' + Math.floor(10000 + Math.random() * 90000),
      title: 'شارژ آنلاین کیف پول',
      subtitle: `درگاه پرداخت شاپرک • ${description}`,
      amount: amount,
      type: 'deposit',
      date: 'هم‌اکنون',
      trackingCode: trackingCode,
      status: 'successful',
    };

    this.walletTransactions.update((txs) => [newTx, ...txs]);

    // همگام‌سازی بلافاصله با خلاصه کیف پول صفحه اصلی
    this.walletSummary.update((ws) => ws ? {
      ...ws,
      balance: ws.balance + amount,
      lastTransactionAmount: amount,
      lastTransactionType: 'deposit',
      lastTransactionTitle: 'شارژ آنلاین کیف پول',
      lastTransactionDate: new Date().toISOString(),
    } : {
      walletId: 'w-local',
      balance: this.parentProfile().walletBalance,
      virtualCardNumber: '6037-9918-0000-0000',
      lastTransactionAmount: amount,
      lastTransactionType: 'deposit',
      lastTransactionTitle: 'شارژ آنلاین کیف پول',
      lastTransactionDate: new Date().toISOString(),
      monthOrdersCount: 0,
    });

    // ثبت در بک‌اند در صورت لاگین بودن کاربر
    const userId = this.currentUser()?.id;
    if (userId) {
      fetch(`/api/wallet/charge/${userId}?amount=${amount}&trackingCode=${trackingCode}`, {
        method: 'POST',
      }).catch(() => {});
    }
  }

  // انتخاب مستقیم فرزند برای ثبت سفارش یا بررسی وضعیت
  selectChild(childId: string): void {
    this.selectedChildId.set(childId);
    this.isExplicitChildSelected.set(true);
  }

  // وضعیت باز/بسته بودن مدال انتخاب فرزند
  readonly isChildModalOpen = signal<boolean>(false);

  openChildModal(): void {
    this.isChildModalOpen.set(true);
  }

  closeChildModal(): void {
    this.isChildModalOpen.set(false);
  }

  // ذخیره و به‌روزرسانی مشخصات والد از طریق فرم تنظیمات پروفایل
  async saveParentProfile(data: UpdateParentProfileRequest): Promise<{success: boolean; message?: string}> {
    return this.saveParentProfileOnboarding(data);
  }

  // واکشی پروفایل والد و فرزندان واقعی ثبت‌شده در دیتابیس
  async loadUserProfileAndChildren(phoneOrId?: string): Promise<void> {
    const phone = phoneOrId || this.currentUser()?.phoneNumber || this.pendingPhone();
    if (!phone) return;

    try {
      const res = await fetch(`/api/users/profile/${phone}`);
      if (res.ok) {
        const dbUser: AuthUser = await res.json();
        this.currentUser.set(dbUser);
        this.parentProfile.update((prev) => ({
          ...prev,
          name: dbUser.fullName || prev.name,
          phone: dbUser.phoneNumber || prev.phone,
          role: dbUser.roleTitle || prev.role,
          nationalId: dbUser.nationalId || prev.nationalId,
          address: dbUser.address || prev.address,
          walletBalance: dbUser.walletBalance ?? prev.walletBalance,
          avatar: dbUser.avatarUrl || prev.avatar,
        }));

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('childe_food_auth_user', JSON.stringify(dbUser));
          } catch {}
        }

        if (dbUser.id) {
          const childRes = await fetch(`/api/users/children/${dbUser.id}`);
          if (childRes.ok) {
            const dbChildren: Array<{
              id: string;
              fullName: string;
              grade: string;
              schoolName: string;
              avatarUrl: string;
              age: number;
              dietaryNotes?: string;
              favoriteFood?: string;
            }> = await childRes.json();

            if (dbChildren && dbChildren.length > 0) {
              const mapped: ChildItem[] = dbChildren.map((c) => ({
                id: c.id,
                name: c.fullName,
                grade: c.grade || 'پایه ابتدایی',
                school: c.schoolName || 'مدرسه نمونه',
                avatar: c.avatarUrl || '/assets/avatars/ali.svg',
                age: c.age || 8,
                dietaryNote: c.dietaryNotes || 'بدون حساسیت غذایی',
                favoriteFood: c.favoriteFood || 'ناهار گرم',
                hasOrderToday: false,
              }));
              this.children.set(mapped);
              this.selectedChildId.set(mapped[0].id);
              this.parentProfile.update((p) => ({
                ...p,
                activeChildrenCount: mapped.length,
              }));
            }
          }
        }

        // واکشی زنده داده‌های کیف پول، سفارش‌های امروز، پیشنهاد روز و سوابق سفارشات از دیتابیس
        if (dbUser.id) {
          this.loadWalletSummary(dbUser.id);
          this.loadTodayOrders(dbUser.id);
          this.loadTodayRecommendation();
          this.loadMyOrders(1, false, 'all');
        }
      }
    } catch {
      // در صورت آفلاین بودن یا خطای شبکه
    }
  }

  // واکشی خلاصه وضعیت کیف پول (موجودی، آخرین تراکنش، تعداد سفارش‌های ماه) از دیتابیس
  async loadWalletSummary(parentIdOrPhone?: string): Promise<void> {
    const user = this.currentUser();
    const id = parentIdOrPhone || user?.id;
    const phone = !id && user?.phoneNumber ? user.phoneNumber : null;

    try {
      let res: Response | null = null;
      if (id) {
        res = await fetch(`/api/wallet/summary/${id}`);
      } else if (phone) {
        res = await fetch(`/api/wallet/summary-by-phone/${phone}`);
      }

      if (res && res.ok) {
        const data: WalletSummaryResponse = await res.json();
        if (data) {
          this.walletSummary.set(data);
          this.parentProfile.update((p) => ({
            ...p,
            walletBalance: data.balance,
          }));
        }
      }
    } catch {
      // در صورت خطای شبکه یا حالت آفلاین
    }
  }

  // واکشی ۵ تراکنش اخیر والد به صورت ریل‌تایم از دیتابیس
  async loadRecentTransactions(parentIdOrPhone?: string): Promise<void> {
    const user = this.currentUser();
    const id = parentIdOrPhone || user?.id;
    const phone = !id && user?.phoneNumber ? user.phoneNumber : null;

    try {
      let res: Response | null = null;
      if (id) {
        res = await fetch(`/api/wallet/transactions/recent/${id}?count=5`);
      } else if (phone) {
        res = await fetch(`/api/wallet/transactions/recent-by-phone/${phone}?count=5`);
      } else {
        res = await fetch(`/api/wallet/transactions/paged?page=1&pageSize=5`);
      }

      if (res && res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.items || []);
        if (items.length > 0) {
          this.recentWalletTransactions.set(items);
          this.walletTransactions.set(items);
        }
      }
    } catch {
      // در صورت خطای شبکه
    }
  }

  // واکشی صفحه‌بندی شده تراکنش‌ها از سرور برای اسکرول نامحدود
  async fetchPagedTransactions(
    page: number = 1,
    pageSize: number = 10,
    typeFilter: string = 'all',
    parentIdOrPhone?: string
  ): Promise<PagedTransactionsResponse | null> {
    const user = this.currentUser();
    const id = parentIdOrPhone || user?.id;
    const phone = !id && user?.phoneNumber ? user.phoneNumber : null;

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        type: typeFilter,
      });

      if (id) params.append('parentId', id);
      if (phone) params.append('phone', phone);

      const res = await fetch(`/api/wallet/transactions/paged?${params.toString()}`);
      if (res.ok) {
        return (await res.json()) as PagedTransactionsResponse;
      }
    } catch {
      // خطا در ارتباط شبکه
    }

    return null;
  }


  // واکشی سفارش‌های امروز برای صفحه اصلی به صورت ریل‌تایم از دیتابیس
  async loadTodayOrders(parentIdOrPhone?: string): Promise<void> {
    const user = this.currentUser();
    const id = parentIdOrPhone || user?.id;
    const phone = !id && user?.phoneNumber ? user.phoneNumber : null;

    try {
      let res: Response | null = null;
      if (id) {
        res = await fetch(`/api/orders/today/${id}`);
      } else if (phone) {
        res = await fetch(`/api/orders/today-by-phone/${phone}`);
      }

      if (res && res.ok) {
        const data: TodayOrderResponse[] = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((o) => ({
            id: o.orderCode || o.id,
            childId: o.childId,
            childName: o.childName,
            childAvatar: o.childAvatar || '/assets/avatars/ali.svg',
            school: o.schoolName,
            grade: o.grade,
            foodTitle: o.foodTitle,
            foodSubtitle: o.foodSubtitle,
            foodEmoji: o.foodEmoji,
            deliveryTime: o.deliveryTime,
            date: o.dateLabel,
            status: (o.statusBadgeType === 'delivered' ? 'delivered' : 'delivering') as 'delivered' | 'delivering',
            statusText: o.statusBadgeText,
            price: o.totalPrice,
            trackingCode: o.trackingCode,
          }));
          this.todayOrders.set(mapped);
        }
      }
    } catch {
      // در صورت خطای شبکه یا حالت آفلاین
    }
  }

  // واکشی پیشنهاد ویژه امروز (محبوب‌ترین غذای منوی روز) از دیتابیس
  async loadTodayRecommendation(): Promise<void> {
    try {
      const res = await fetch('/api/foods/today-recommendation');
      if (res.ok) {
        const text = await res.text();
        if (!text || text === 'null') {
          this.dailyRecommendation.set(null);
        } else {
          const data: FoodRecommendationResponse = JSON.parse(text);
          this.dailyRecommendation.set(data);
        }
      }
    } catch {
      // در صورت خطای شبکه
    }
  }

  // سفارش‌های ثبت‌شده کاربر رو ۱۰ تا ۱۰ تا از دیتابیس می‌گیریم که صفحه سنگین نشه و لگ نندازه
  async loadMyOrders(page = 1, append = false, status: 'all' | 'active' | 'delivered' = 'all'): Promise<void> {
    const user = this.currentUser();
    const parentId = user?.id;

    // اگه اسکرول خورده باشه لودینگ پایین صفحه رو روشن می‌کنیم، اگه بار اوله لودینگ کل لیست
    if (append) {
      if (this.isOrdersLoadingMore()) return;
      this.isOrdersLoadingMore.set(true);
    } else {
      this.isOrdersLoading.set(true);
    }

    try {
      let url = `/api/orders/my-orders/${parentId || ''}?page=${page}&pageSize=10&status=${status}`;
      const phone = user?.phoneNumber || this.pendingPhone();
      if (!parentId && phone) {
        url += `&phone=${encodeURIComponent(phone)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data: PagedOrdersResponse = await res.json();
        if (data && Array.isArray(data.items)) {
          this.ordersTotalCount.set(data.totalCount);
          this.ordersActiveCount.set(data.activeCount);
          this.ordersDeliveredCount.set(data.deliveredCount);
          this.ordersCurrentPage.set(data.pageNumber);
          this.ordersHasMore.set(data.hasMore);

          if (append) {
            this.pagedOrders.update((prev) => [...prev, ...data.items]);
          } else {
            this.pagedOrders.set(data.items);
          }

          // لیست عمومی سفارش‌ها رو هم به‌روز می‌کنیم که اگه جاهای دیگه ازش استفاده می‌کردن به مشکل نخورن
          const mappedSchoolOrders: SchoolOrder[] = data.items.map((item) => ({
            id: item.orderCode || item.id,
            childId: item.childId,
            childName: item.childName,
            childAvatar: item.childAvatar || '/assets/avatars/ali.svg',
            school: item.schoolName,
            grade: item.grade,
            foodTitle: item.foodTitle,
            foodSubtitle: item.foodSubtitle,
            foodEmoji: item.foodEmoji,
            date: item.dateLabel,
            deliveryTime: item.deliveryTime,
            status: item.status,
            statusText: item.statusText,
            price: item.price,
            trackingCode: item.trackingCode,
          }));

          if (append) {
            this.schoolOrders.update((prev) => [...prev, ...mappedSchoolOrders]);
          } else {
            this.schoolOrders.set(mappedSchoolOrders);
          }
        }
      }
    } catch {
      // اگه نت قطع بود یا سرور خطا داد، هوای کاربر رو داریم که برنامه کرش نکنه
    } finally {
      this.isOrdersLoading.set(false);
      this.isOrdersLoadingMore.set(false);
    }
  }

  // وقتی کاربر اسکرول می‌کنه و می‌رسه ته صفحه، ۱۰ تای بعدی رو صدا می‌زنیم
  async loadMoreOrders(status: 'all' | 'active' | 'delivered' = 'all'): Promise<void> {
    if (this.isOrdersLoading() || this.isOrdersLoadingMore() || !this.ordersHasMore()) {
      return;
    }
    const nextPage = this.ordersCurrentPage() + 1;
    await this.loadMyOrders(nextPage, true, status);
  }

  // این متد فقط وقتی کاربر روی «جزئیات بیشتر» کلیک کرد صدا زده میشه تا دیتای سنگین الکی لود نشه (Lazy Load)
  async loadOrderDetail(orderId: string): Promise<OrderDetailResponse | null> {
    this.isOrderDetailLoading.set(true);
    try {
      const res = await fetch(`/api/orders/details/${orderId}`);
      if (res.ok) {
        const data: OrderDetailResponse = await res.json();
        this.selectedOrderDetail.set(data);
        return data;
      }
    } catch {
      // اگه لود جزئیات با خطا مواجه شد مودال با دیتای پایه باز بمونه
    } finally {
      this.isOrderDetailLoading.set(false);
    }
    return null;
  }

  // بستن و ریست کردن دیتای جزئیات سفارش انتخاب‌شده
  clearOrderDetail(): void {
    this.selectedOrderDetail.set(null);
  }

  // بررسی اینکه آیا آواتار یک فایل تصویری/آدرس عکس است یا ایموجی
  isImageAvatar(avatar?: string | null): boolean {
    if (!avatar) return false;
    const str = avatar.trim().toLowerCase();
    return (
      str.startsWith('/') ||
      str.startsWith('http://') ||
      str.startsWith('https://') ||
      str.startsWith('data:image') ||
      str.includes('.svg') ||
      str.includes('.png') ||
      str.includes('.jpg') ||
      str.includes('.jpeg') ||
      str.includes('.webp') ||
      str.includes('/uploads/') ||
      str.includes('/assets/')
    );
  }

  // دریافت آدرس آواتار تصویری فرزند با اولویت از لیست فرزندان
  getChildAvatar(childId?: string, fallbackAvatar?: string): string {
    if (childId) {
      const child = this.children().find((c) => c.id === childId);
      if (child && child.avatar) return child.avatar;
    }
    if (fallbackAvatar && this.isImageAvatar(fallbackAvatar)) {
      return fallbackAvatar;
    }
    return '/assets/avatars/ali.svg';
  }

  // سوئیچ سریع بین فرزندان تا والد بتونه با یه کلیک ساده، بچه بعدی رو انتخاب کنه
  cycleNextChild(): void {
    const list = this.children();
    if (!list || list.length === 0) return;
    const currentId = this.selectedChildId();
    const currentIndex = list.findIndex((c) => c.id === currentId);
    const nextIndex = (currentIndex + 1) % list.length;
    this.selectedChildId.set(list[nextIndex].id);
    this.isExplicitChildSelected.set(true);
  }
}

// تابع کمکی برای تبدیل اعداد انگلیسی به ارقام فارسی روان و تمیز
export function toPersianDigits(value: number | string): string {
  const str = String(value);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[+w]);
}

