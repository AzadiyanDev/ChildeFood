import {Injectable, computed, signal} from '@angular/core';
import {CategoryItem, ChildItem, DateDayItem, FoodItem, NavTabId, ParentProfile, SchoolOrder, WalletTransaction} from '../models/food.model';

@Injectable({
  providedIn: 'root',
})
export class FoodStore {
  // Page view state: 'home' (Home page), 'meals' (Food selection page), 'calendar' (Calendar selection page), 'wallet' (Dedicated wallet page), 'children' (Dedicated children page), 'orders' (Dedicated orders page), or 'profile' (Dedicated profile page)
  readonly activePage = signal<'home' | 'meals' | 'calendar' | 'wallet' | 'children' | 'orders' | 'profile'>('home');

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

  // پروفایل والد؛ نام روی «محمد» و موجودی اولیه طبق نیازمندی پرامپت روی ۲۵۰,۰۰۰ تومان تنظیم شده
  readonly parentProfile = signal<ParentProfile>({
    name: 'محمد',
    role: 'والد دانش‌آموز',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    avatar: '👨‍💼',
    walletBalance: 250000,
    activeChildrenCount: 3,
  });

  // Children List with detailed school and health info
  readonly children = signal<ChildItem[]>([
    {
      id: 'child-1',
      name: 'علی احمدی',
      grade: 'کلاس پنجم',
      school: 'مدرسه نمونه',
      avatar: '👦',
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
      avatar: '👧',
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
      avatar: '🧒',
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
      childAvatar: '👦',
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
      childAvatar: '👧',
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

  // Active and recent school meal orders
  readonly schoolOrders = signal<SchoolOrder[]>([
    {
      id: 'ORD-1042',
      childId: 'child-1',
      childName: 'علی احمدی',
      childAvatar: '👦',
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
      childAvatar: '👧',
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
      childAvatar: '🧒',
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
      childAvatar: '👦',
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
      childAvatar: '👧',
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
      childAvatar: '🧒',
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
    // هنگام ورود به تقویم، هیچ روزی نباید از قبل انتخاب شده باشد و روزهای تاییدشده ریست می‌شوند
    this.selectedCalendarDays.set([]);
    this.confirmedDays.set([]);
    this.activePage.set('calendar');
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
    // پاکسازی سرچ‌کوئری مارکت‌پلیس تا آیتم‌های ناهار غیب نشوند
    this.searchQuery.set('');
    this.activePage.set('meals');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  goToHome(): void {
    this.activePage.set('home');
    this.activeNavTab.set('home');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  goToWallet(): void {
    this.activePage.set('wallet');
    this.activeNavTab.set('wallet');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  goToChildren(): void {
    this.activePage.set('children');
    this.activeNavTab.set('children');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  goToOrders(): void {
    this.activePage.set('orders');
    this.activeNavTab.set('orders');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  goToProfile(): void {
    this.activePage.set('profile');
    this.activeNavTab.set('profile');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  setActiveNavTab(tabId: NavTabId): void {
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
  }

  // انتخاب مستقیم فرزند برای ثبت سفارش یا بررسی وضعیت
  selectChild(childId: string): void {
    this.selectedChildId.set(childId);
    this.isExplicitChildSelected.set(true);
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

