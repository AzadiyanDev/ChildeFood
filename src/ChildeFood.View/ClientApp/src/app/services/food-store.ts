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

  // Currently selected days in calendar view (default remaining school days of current week: 15, 16, 17, 18)
  readonly selectedCalendarDays = signal<number[]>([15, 16, 17, 18]);

  // Parent Profile Data
  readonly parentProfile = signal<ParentProfile>({
    name: 'سارا احمدی',
    role: 'والد دانش‌آموز',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    avatar: '👩‍💼',
    walletBalance: 450000,
    activeChildrenCount: 3,
  });

  // Children List with detailed school and health info
  readonly children = signal<ChildItem[]>([
    {
      id: 'child-1',
      name: 'آرتین احمدی',
      grade: 'پایه پنجم ابتدایی',
      school: 'دبستان غیردولتی سرو',
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
      grade: 'پیش‌دبستانی ۲',
      school: 'مرکز نوآموزان شکوفه',
      avatar: '🧒',
      age: 6,
      dietaryNote: 'غذای کم‌ادویه و سبک',
      favoriteFood: 'نودل توئیستارا',
      hasOrderToday: false,
    },
  ]);

  // Today's active school meal orders for home page
  readonly todayOrders = signal([
    {
      id: 'ORD-1042',
      childId: 'child-1',
      childName: 'آرتین احمدی',
      childAvatar: '👦',
      school: 'دبستان غیردولتی سرو',
      grade: 'کلاس ۵۰۲',
      foodTitle: 'چلو جوجه کباب زعفرانی',
      foodSubtitle: 'همراه با برنج ایرانی، گوجه کبابی و زیتون پرورده',
      foodEmoji: '🍗',
      deliveryTime: 'ساعت ۱۲:۳۰',
      date: 'امروز - شنبه ۱۵ شهریور',
      status: 'delivering' as const,
      statusText: 'در حال ارسال به مدرسه',
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
      foodTitle: 'پاستا آلفردو با فیله مرغ',
      foodSubtitle: 'پاستا پنه با سس قارچ تازه، پنیر پارمسان و نوشیدنی',
      foodEmoji: '🍝',
      deliveryTime: 'ساعت ۱۲:۴۵',
      date: 'امروز - شنبه ۱۵ شهریور',
      status: 'buffet_ready' as const,
      statusText: 'آماده تحویل در بوفه مدرسه',
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

  // Currently selected date day (default: 15)
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
        price: 6.20,
        emoji: '🍢',
        transform: '-rotate-45 scale-110',
        category: 'food',
      },
      {
        id: 'joojeh-kabab-12',
        title: 'چلو جوجه کباب زعفرانی',
        subtitle: 'همراه با برنج درجه یک ایرانی',
        badge: 'غذای روز',
        badgeType: 'popular',
        price: 8.90,
        emoji: '🍗',
        transform: 'rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'ghormeh-sabzi-12',
        title: 'قورمه سبزی اصیل',
        subtitle: 'با گوشت تازه گوسفندی و لوبیا',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 7.50,
        emoji: '🥘',
        transform: 'scale-110',
        category: 'food',
      },
      {
        id: 'koobideh-12',
        title: 'کوبیده سنتی ممتاز',
        subtitle: 'دو سیخ کوبیده با گوجه کبابی',
        badge: 'ویژه سرآشپز',
        badgeType: 'chef',
        price: 9.30,
        emoji: '🥩',
        transform: '-rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'taco-12',
        title: 'تاکو مکزیکی تند',
        subtitle: 'با گوشت چرخ‌کرده و سالسا',
        badge: 'تند و اسپایسی 🌶️',
        badgeType: 'spicy',
        price: 5.80,
        emoji: '🌮',
        transform: 'rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'salad-shirazi-12',
        title: 'سالاد شیرازی مخصوص',
        subtitle: 'خیار، گوجه، پیاز و آبغوره',
        badge: 'پیش‌غذا',
        badgeType: 'discount',
        price: 3.20,
        emoji: '🥗',
        transform: 'scale-105',
        category: 'food',
      },
    ],
    13: [
      {
        id: 'pizza-sicilia-13',
        title: 'پیتزا سیسیلیا',
        subtitle: 'پیتزا مخصوص ایتالیایی با پنیر کش‌دار',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 8.99,
        emoji: '🍕',
        transform: '-rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'pasta-alfredo-13',
        title: 'پاستا آلفردو',
        subtitle: 'با فیله مرغ و قارچ تازه و خامه',
        badge: '۱۵٪-',
        badgeType: 'discount',
        price: 9.15,
        emoji: '🍝',
        transform: '-rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'lasagna-13',
        title: 'لازانیا گوشت و قارچ',
        subtitle: 'لایه‌های گوشت چرخ‌کرده با سس بشامل',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 8.50,
        emoji: '🧀',
        transform: 'scale-110',
        category: 'food',
      },
      {
        id: 'pizza-pepperoni-13',
        title: 'پیتزا پپرونی تند',
        subtitle: 'پپرونی دودی اعلا با فلفل هالوپینو',
        badge: 'تند و اسپایسی 🌶️',
        badgeType: 'spicy',
        price: 7.80,
        emoji: '🍕',
        transform: 'rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'garlic-bread-13',
        title: 'نان سیر ایتالیایی',
        subtitle: 'با کره سیر دار و پنیر موزارلا',
        badge: 'پیش‌غذا',
        badgeType: 'discount',
        price: 4.10,
        emoji: '🥖',
        transform: 'rotate-6 scale-105',
        category: 'food',
      },
      {
        id: 'burger-13',
        title: 'برگر دوبل اسمش',
        subtitle: 'برگر گوشت با پنیر چدار',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 7.50,
        emoji: '🍔',
        transform: 'scale-110',
        category: 'food',
      },
    ],
    14: [
      {
        id: 'noodle-twistara-14',
        title: 'نودل توئیستارا',
        subtitle: 'با سس تند مخصوص آسیایی',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 5.33,
        emoji: '🍜',
        transform: 'rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'sushi-mix-roll-14',
        title: 'سوشی میکس رول',
        subtitle: 'سالمون نروژی و آووکادو تازه',
        badge: 'غذای سرآشپز',
        badgeType: 'chef',
        price: 11.50,
        emoji: '🍣',
        transform: 'rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'ramen-14',
        title: 'رامن تند توکیو',
        subtitle: 'تخم‌مرغ نیم‌پز با نودل دست‌ساز و جلبک',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 8.20,
        emoji: '🍲',
        transform: 'scale-110',
        category: 'food',
      },
      {
        id: 'spring-roll-14',
        title: 'اسپرینگ رول سبزیجات',
        subtitle: '۴ عدد رول کریسپی با سس سوئیت چیلی',
        badge: '۱۵٪-',
        badgeType: 'discount',
        price: 4.90,
        emoji: '🥟',
        transform: '-rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'tempura-shrimp-14',
        title: 'میگو تمپورا طلایی',
        subtitle: 'میگو سوخاری سبک و ترد ژاپنی',
        badge: 'غذای دریایی',
        badgeType: 'chef',
        price: 10.40,
        emoji: '🍤',
        transform: 'rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'fried-chicken-14',
        title: 'مرغ سوخاری کریسپی',
        subtitle: '۴ تکه همراه سیب‌زمینی',
        badge: '۲۰٪-',
        badgeType: 'discount',
        price: 8.40,
        emoji: '🍗',
        transform: '-rotate-12 scale-110',
        category: 'food',
      },
    ],
    15: [
      {
        id: 'noodle-twistara',
        title: 'نودل توئیستارا',
        subtitle: 'با سس تند مخصوص',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 5.33,
        emoji: '🍜',
        transform: 'rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'pizza-sicilia',
        title: 'پیتزا سیسیلیا',
        subtitle: 'پیتزا مخصوص ایتالیایی',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 8.99,
        emoji: '🍕',
        transform: '-rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'burger-double-smash',
        title: 'برگر دوبل اسمش',
        subtitle: 'برگر گوشت با پنیر چدار',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 7.50,
        emoji: '🍔',
        transform: 'scale-110 hover:scale-115',
        category: 'food',
      },
      {
        id: 'kebab-mega',
        title: 'کباب چوبی مگا',
        subtitle: 'همراه با سبزیجات گریل',
        badge: 'گریل شده',
        badgeType: 'grilled',
        price: 6.20,
        emoji: '🍢',
        transform: '-rotate-45 scale-110',
        category: 'food',
      },
      {
        id: 'taco-mexican',
        title: 'تاکو مکزیکی تند',
        subtitle: 'با گوشت چرخ‌کرده و سالسا',
        badge: 'تند و اسپایسی 🌶️',
        badgeType: 'spicy',
        price: 5.80,
        emoji: '🌮',
        transform: 'rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'pasta-alfredo',
        title: 'پاستا آلفردو',
        subtitle: 'با فیله مرغ و قارچ تازه',
        badge: '۱۵٪-',
        badgeType: 'discount',
        price: 9.15,
        emoji: '🍝',
        transform: '-rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'sushi-mix-roll',
        title: 'سوشی میکس رول',
        subtitle: 'سالمون نروژی و آووکادو',
        badge: 'غذای سرآشپز',
        badgeType: 'chef',
        price: 11.50,
        emoji: '🍣',
        transform: 'rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'crispy-fried-chicken',
        title: 'مرغ سوخاری کریسپی',
        subtitle: '۴ تکه همراه سیب‌زمینی',
        badge: '۲۰٪-',
        badgeType: 'discount',
        price: 8.40,
        emoji: '🍗',
        transform: '-rotate-12 scale-110',
        category: 'food',
      },
    ],
    16: [
      {
        id: 'burger-double-smash-16',
        title: 'برگر دوبل اسمش',
        subtitle: 'دو پتی گوشت گوساله با پنیر دوبل',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 7.50,
        emoji: '🍔',
        transform: 'scale-110',
        category: 'food',
      },
      {
        id: 'chicken-burger-16',
        title: 'چیکن برگر زغالی',
        subtitle: 'فیله سوخاری با سس هانی ماستارد',
        badge: '۲۰٪-',
        badgeType: 'discount',
        price: 6.90,
        emoji: '🍔',
        transform: '-rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'hotdog-cheese-16',
        title: 'هات‌داگ تنوری پنیری',
        subtitle: 'هات‌داگ دودی تنوری در نان باگت نرم',
        badge: 'گریل شده',
        badgeType: 'grilled',
        price: 5.50,
        emoji: '🌭',
        transform: 'rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'fries-loaded-16',
        title: 'سیب‌زمینی سوپریم پنیری',
        subtitle: 'با دیپ پنیر چدار و بیکن گریل',
        badge: 'پیش‌غذا',
        badgeType: 'discount',
        price: 4.60,
        emoji: '🍟',
        transform: 'scale-110',
        category: 'food',
      },
      {
        id: 'onion-rings-16',
        title: 'پیاز سوخاری ترد',
        subtitle: 'حلقه‌های پیاز ترد با سس باربیکیو',
        badge: '۱۵٪-',
        badgeType: 'discount',
        price: 3.80,
        emoji: '🧅',
        transform: '-rotate-12 scale-105',
        category: 'food',
      },
      {
        id: 'crispy-chicken-16',
        title: 'مرغ سوخاری کریسپی',
        subtitle: '۴ تکه همراه سیب‌زمینی',
        badge: '۲۰٪-',
        badgeType: 'discount',
        price: 8.40,
        emoji: '🍗',
        transform: 'scale-110',
        category: 'food',
      },
    ],
    17: [
      {
        id: 'taco-mexican-17',
        title: 'تاکو مکزیکی تند',
        subtitle: 'با گوشت چرخ‌کرده، سالسا و هالوپینو',
        badge: 'تند و اسپایسی 🌶️',
        badgeType: 'spicy',
        price: 5.80,
        emoji: '🌮',
        transform: 'rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'burrito-beef-17',
        title: 'بوریتو گوشت و لوبیا',
        subtitle: 'پیچیده در نان ترتیلا با پنیر و برنج',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 6.70,
        emoji: '🌯',
        transform: '-rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'nachos-mega-17',
        title: 'ناچوز با دیپ پنیر',
        subtitle: 'چیپس ذرت ترد با پنیر چدار آب‌شده و سالسا',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 5.20,
        emoji: '🧀',
        transform: 'scale-110',
        category: 'food',
      },
      {
        id: 'quesadilla-17',
        title: 'کسیدیا مرغ مکزیکی',
        subtitle: 'نان تورتیلا برشته با مرغ و پنیر فراوان',
        badge: 'غذای سرآشپز',
        badgeType: 'chef',
        price: 7.40,
        emoji: '🫓',
        transform: 'rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'fajita-17',
        title: 'فاهیتا فیله مرغ',
        subtitle: 'همراه فلفل دلمه‌ای رنگی گریل شده',
        badge: 'گریل شده',
        badgeType: 'grilled',
        price: 7.90,
        emoji: '🥘',
        transform: '-rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'pizza-sicilia-17',
        title: 'پیتزا سیسیلیا',
        subtitle: 'پیتزا مخصوص ایتالیایی',
        badge: '۲۵٪-',
        badgeType: 'discount',
        price: 8.99,
        emoji: '🍕',
        transform: 'scale-110',
        category: 'food',
      },
    ],
    18: [
      {
        id: 'sushi-mix-roll-18',
        title: 'سوشی میکس رول',
        subtitle: 'سالمون نروژی، میگو و آووکادو',
        badge: 'غذای سرآشپز',
        badgeType: 'chef',
        price: 11.50,
        emoji: '🍣',
        transform: 'rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'salmon-steak-18',
        title: 'فیله سالمون گریل',
        subtitle: 'همراه سبزیجات بخارپز و لیمو ترش',
        badge: 'رژیمی و سالم',
        badgeType: 'chef',
        price: 13.20,
        emoji: '🐟',
        transform: '-rotate-6 scale-110',
        category: 'food',
      },
      {
        id: 'fried-shrimp-18',
        title: 'میگو سوخاری تمپورا',
        subtitle: '۶ عدد میگو درشت ترد طلایی',
        badge: '۲۰٪-',
        badgeType: 'discount',
        price: 9.80,
        emoji: '🍤',
        transform: 'rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'quinoa-salad-18',
        title: 'سالاد کینوا و آووکادو',
        subtitle: 'با سبزیجات تازه ارگانیک و زیتون',
        badge: 'سالم و رژیمی',
        badgeType: 'popular',
        price: 6.50,
        emoji: '🥗',
        transform: 'scale-110',
        category: 'food',
      },
      {
        id: 'pasta-seafood-18',
        title: 'پاستا مرغ و قارچ آلفردو',
        subtitle: 'با سس دست‌ساز و پنیر پارمسان',
        badge: '۱۵٪-',
        badgeType: 'discount',
        price: 9.15,
        emoji: '🍝',
        transform: '-rotate-12 scale-110',
        category: 'food',
      },
      {
        id: 'burger-18',
        title: 'برگر دوبل اسمش',
        subtitle: 'برگر گوشت با پنیر چدار',
        badge: 'محبوب 🔥',
        badgeType: 'popular',
        price: 7.50,
        emoji: '🍔',
        transform: 'scale-110',
        category: 'food',
      },
    ],
  };

  // Legacy categories retained for compatibility if needed
  readonly categories = signal<CategoryItem[]>([
    {id: 'all', title: 'همه', emoji: '🍲', offsetY: 0},
  ]);
  readonly selectedCategoryId = signal<string>('all');

  // Reactive state
  readonly searchQuery = signal<string>('');
  readonly cart = signal<Record<string, number>>({
    'pizza-sicilia': 1,
  });
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
      childName: 'آرتین احمدی',
      childAvatar: '👦',
      school: 'دبستان غیردولتی سرو',
      grade: 'کلاس ۵۰۲',
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
      childName: 'آرتین احمدی',
      childAvatar: '👦',
      school: 'دبستان غیردولتی سرو',
      grade: 'کلاس ۵۰۲',
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
      amount: 200000,
      type: 'deposit',
      date: 'امروز، ۱۰:۳۰',
      trackingCode: '۹۸۴۷۱۲',
      status: 'successful',
    },
    {
      id: 'TX-94510',
      title: 'رزرو ناهار آرتین',
      subtitle: 'چلو جوجه کباب زعفرانی • دبستان سرو',
      amount: 185000,
      type: 'purchase',
      date: 'دیروز، ۱۲:۱۵',
      trackingCode: '۵۸۳۹۱۰',
      status: 'successful',
      childName: 'آرتین احمدی',
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

  // Filtered food items based on selected date and search query
  readonly filteredFoods = computed(() => {
    const day = this.selectedDay();
    const query = this.searchQuery().trim().toLowerCase();
    // Use modulo fallback if this exact date is not keyed, so any chosen day has full meal options
    const mappedDay = this.foodsByDate[day] ? day : (((day - 12) % 7) + 12);
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

  // All foods flattened for cart lookup
  readonly foods = computed(() => {
    const map = new Map<string, FoodItem>();
    for (const items of Object.values(this.foodsByDate)) {
      for (const item of items) {
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

  orderForChild(childId: string): void {
    this.selectedChildId.set(childId);
    this.goToCalendar();
  }

  goToCalendar(): void {
    this.activePage.set('calendar');
    if (typeof window !== 'undefined') {
      window.scrollTo({top: 0, behavior: 'smooth'});
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

    // Set selected active day to first selected day if current is not in list
    if (!sorted.includes(this.selectedDay())) {
      this.selectedDay.set(sorted[0]);
    }

    // Proceed to meals page
    this.goToMeals();
  }

  goToMeals(): void {
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
}
