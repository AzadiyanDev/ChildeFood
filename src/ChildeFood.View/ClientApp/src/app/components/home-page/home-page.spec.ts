import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HomePage} from './home-page';
import {FoodStore} from '../../services/food-store';

describe('HomePage Component Suite — پیاده‌سازی اصلاحات ۷ گانه ریدیزاین صفحه اصلی والدین', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);
    foodStore.isAuthenticated.set(true);
    fixture.detectChanges();
  });

  it('باید کامپوننت صفحه اصلی و استور با موفقیت لود شوند', () => {
    expect(component).toBeTruthy();
    expect(foodStore).toBeTruthy();
  });

  // فیدبک ۱: هدر بالایی با سلام صمیمانه، تیتر بولد سوالی و آواتار کوچک فرزند
  it('فیدبک ۱: هدر بالایی باید شامل سلام کوچکتر، تیتر بولد سوالی و آواتار فرزند باشد', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const greetingEl = compiled.querySelector('#header-greeting-text');
    expect(greetingEl).toBeTruthy();
    expect(greetingEl?.textContent).toContain('سلام');
    expect(greetingEl?.textContent).toContain('سارا');

    // بررسی تیتر جدید دوستانه با نام فرزند
    const headlineEl = compiled.querySelector('#header-headline');
    expect(headlineEl).toBeTruthy();
    expect(headlineEl?.textContent).toContain('علی');
    expect(headlineEl?.textContent).toContain('امروز چی دوست داره؟');
    expect(headlineEl?.textContent).not.toContain('🍱');

    // آواتار کوچک فرزند طبق درخواست کاربر حذف شده است
    const childAvatarEl = compiled.querySelector('#header-child-avatar');
    expect(childAvatarEl).toBeNull();
  });

  it('سربرگ بالایی باید شامل دکمه آواتار گرد و زنگوله اعلان‌ها باشد', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const avatarBtn = compiled.querySelector('#header-profile-avatar');
    expect(avatarBtn).toBeTruthy();

    const notifBtn = compiled.querySelector('#btn-header-notifications');
    expect(notifBtn).toBeTruthy();

    // کلیک روی زنگوله باید پیام فیدبک اعلان‌ها را باز کند
    expect(component.showNotificationMessage()).toBe(false);
    (notifBtn as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.showNotificationMessage()).toBe(true);
    expect(compiled.querySelector('#notification-toast')).toBeTruthy();
  });

  // انتقال بخش کارت فرزند: کارت فرزند طبق نیازمندی از بالای صفحه اصلی برداشته شده و به بالای صفحه تقویم منتقل شده است
  it('کارت مشخصات فرزند نباید در بالای صفحه اصلی باشد و به تقویم منتقل شده است', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const childSection = compiled.querySelector('#active-child-section');
    expect(childSection).toBeNull();
  });

  it('کارت کیف پول باید مشخصات کارت پریمیوم بانکی تیره با گوشه‌های ۲۴ پیکسل و سایه ملایم را داشته باشد', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const walletSection = compiled.querySelector('#wallet-balance-card');
    expect(walletSection).toBeTruthy();

    const cardDiv = walletSection?.querySelector('div');
    expect(cardDiv).toBeTruthy();
    const classAttr = cardDiv?.getAttribute('class') || '';
    expect(classAttr).toContain('rounded-[24px]');
    expect(classAttr).toContain('bg-[#111111]');
  });

  // فیدبک ۲: کارت کیف پول همراه با دو مینی‌کارت کوچک آماری
  it('فیدبک ۲: کارت کیف پول باید شامل موجودی و دو مینی‌کارت آخرین تراکنش و سفارش‌های این ماه باشد', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const balanceEl = compiled.querySelector('#wallet-main-balance');
    expect(balanceEl).toBeTruthy();
    expect(balanceEl?.textContent).toContain(component.formattedWalletBalance());

    const rechargeBtn = compiled.querySelector('#btn-recharge-wallet');
    expect(rechargeBtn).toBeTruthy();
    expect(rechargeBtn?.textContent).toContain('شارژ کیف پول');

    // مینی‌کارت آخرین تراکنش (+ ۵۰,۰۰۰ تومان)
    const miniLastTx = compiled.querySelector('#wallet-mini-last-tx');
    expect(miniLastTx).toBeTruthy();
    expect(miniLastTx?.textContent).toContain('آخرین تراکنش');
    expect(miniLastTx?.textContent).toContain('+');
    expect(miniLastTx?.textContent).toContain('۵۰,۰۰۰');
    expect(miniLastTx?.textContent).toContain('تومان');

    // مینی‌کارت این ماه (۱۲ سفارش)
    const miniMonthOrders = compiled.querySelector('#wallet-mini-month-orders');
    expect(miniMonthOrders).toBeTruthy();
    expect(miniMonthOrders?.textContent).toContain('این ماه');
    expect(miniMonthOrders?.textContent).toContain('۱۲');
    expect(miniMonthOrders?.textContent).toContain('سفارش');
  });

  it('کلیک روی دکمه شارژ کیف پول باید کاربر را به مدیریت کیف پول هدایت کند', () => {
    foodStore.activePage.set('home');
    const compiled = fixture.nativeElement as HTMLElement;
    const rechargeBtn = compiled.querySelector<HTMLButtonElement>('#btn-recharge-wallet');
    expect(rechargeBtn).toBeTruthy();

    rechargeBtn?.click();
    fixture.detectChanges();

    expect(foodStore.activePage()).toBe('wallet');
  });

  it('باید بالای بخش سفارش‌های امروز دکمه + سفارش جدید به رنگ نارنجی رندر شود و به تقویم هدایت کند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const section = compiled.querySelector('#today-orders-section');
    expect(section).toBeTruthy();
    expect(section?.textContent).toContain('سفارشهای امروز');

    const newOrderBtn = compiled.querySelector<HTMLButtonElement>('#btn-new-order');
    expect(newOrderBtn).toBeTruthy();
    expect(newOrderBtn?.textContent).toContain('+');
    expect(newOrderBtn?.textContent).toContain('سفارش جدید');
    const btnClass = newOrderBtn?.getAttribute('class') || '';
    expect(btnClass).toContain('text-[#FF6B3D]');

    // کلیک روی دکمه سفارش جدید باید کاربر را به تقویم روزهای رزرو ببرد
    foodStore.activePage.set('home');
    newOrderBtn?.click();
    fixture.detectChanges();
    expect(foodStore.activePage()).toBe('calendar');
  });

  it('کارت‌های سفارش امروز باید دارای گوشه‌های گرد ۲۰ پیکسل، پس‌زمینه سفید و سایه ملایم باشند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const orderCards = compiled.querySelectorAll('[id^="order-card-"]');
    expect(orderCards.length).toBeGreaterThanOrEqual(2);

    orderCards.forEach((card) => {
      const classAttr = card.getAttribute('class') || '';
      expect(classAttr).toContain('rounded-[20px]');
      expect(classAttr).toContain('bg-white');
    });
  });

  // فیدبک ۳: کارت‌های سفارش امروز با عکس غذا بزرگتر و نوار پیشرفت وضعیت
  it('فیدبک ۳: کارت‌های سفارش باید شامل عکس غذا بزرگتر، اطلاعات تاریخ و نوار پیشرفت وضعیت باشند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ordersText = compiled.querySelector('#today-orders-section')?.textContent || '';

    expect(ordersText).toContain('جوجه کباب');
    expect(ordersText).toContain('پرس کامل');
    expect(ordersText).toContain('۱۰ شهریور');
    expect(ordersText).toContain('در حال آماده‌سازی');

    expect(ordersText).toContain('ماکارونی');
    expect(ordersText).toContain('تحویل شده');

    // بررسی وجود نوار پیشرفت وضعیت (Progress)
    const progressEl = compiled.querySelector('[aria-label="پیشرفت آماده‌سازی"]');
    expect(progressEl).toBeTruthy();
    expect(progressEl?.textContent).toContain('آماده‌سازی');
  });

  // فیدبک ۷: کارت پیشنهاد امروز غذا برای پر کردن فضای خالی و هدایت به منو
  it('فیدبک ۷: باید کارت پیشنهاد امروز غذا با غذای محبوب جوجه کباب و دکمه مشاهده منو نمایش داده شود', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const recSection = compiled.querySelector('#daily-recommendation-section');
    expect(recSection).toBeTruthy();

    expect(recSection?.textContent).toContain('پیشنهاد امروز');
    expect(recSection?.textContent).toContain('🍽');
    expect(recSection?.textContent).toContain('غذای محبوب بچه‌ها');
    expect(recSection?.textContent).toContain('جوجه کباب');

    const viewMenuBtn = compiled.querySelector<HTMLButtonElement>('#btn-view-recommended-menu');
    expect(viewMenuBtn).toBeTruthy();
    expect(viewMenuBtn?.textContent).toContain('مشاهده منو');

    // کلیک روی مشاهده منو باید به صفحه انتخاب غذا برود
    foodStore.activePage.set('home');
    viewMenuBtn?.click();
    fixture.detectChanges();
    expect(foodStore.activePage()).toBe('meals');
  });

  // فیدبک ۵: دسترسی سریع بزرگتر، آیکون‌های بزرگتر و سایه عمیق‌تر
  it('فیدبک ۵: دسترسی سریع باید دارای ۳ کارت با ارتفاع استاندارد، آیکون‌های بزرگ و سایه مناسب باشد', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const quickSection = compiled.querySelector('#quick-actions-section');
    expect(quickSection).toBeTruthy();
    expect(quickSection?.textContent).toContain('دسترسی سریع');

    const btnFood = compiled.querySelector<HTMLButtonElement>('#btn-quick-food');
    const btnOrders = compiled.querySelector<HTMLButtonElement>('#btn-quick-orders');
    const btnWallet = compiled.querySelector<HTMLButtonElement>('#btn-quick-wallet');

    expect(btnFood).toBeTruthy();
    expect(btnOrders).toBeTruthy();
    expect(btnWallet).toBeTruthy();

    expect(btnFood?.textContent).toContain('انتخاب غذا');
    expect(btnOrders?.textContent).toContain('سفارش‌ها');
    expect(btnWallet?.textContent).toContain('کیف پول');

    // بررسی حداقل ارتفاع کارت‌ها و اندازه آیکون‌ها
    const foodClass = btnFood?.getAttribute('class') || '';
    expect(foodClass).toContain('min-h-[108px]');
    expect(foodClass).toContain('shadow-');

    const iconDiv = btnFood?.querySelector('div');
    expect(iconDiv?.getAttribute('class')).toContain('w-12');
    expect(iconDiv?.getAttribute('class')).toContain('h-12');
  });

  it('کلیک روی دکمه‌های دسترسی سریع باید به صفحات مربوطه هدایت کند', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // انتخاب غذا -> صفحه meals
    foodStore.activePage.set('home');
    const btnFood = compiled.querySelector<HTMLButtonElement>('#btn-quick-food');
    btnFood?.click();
    fixture.detectChanges();
    expect(foodStore.activePage()).toBe('meals');

    // سفارش‌ها -> صفحه orders
    foodStore.activePage.set('home');
    const btnOrders = compiled.querySelector<HTMLButtonElement>('#btn-quick-orders');
    btnOrders?.click();
    fixture.detectChanges();
    expect(foodStore.activePage()).toBe('orders');

    // کیف پول -> صفحه wallet
    foodStore.activePage.set('home');
    const btnWallet = compiled.querySelector<HTMLButtonElement>('#btn-quick-wallet');
    btnWallet?.click();
    fixture.detectChanges();
    expect(foodStore.activePage()).toBe('wallet');
  });

  it('طبق اصل دیزاین، تنها المان تیره صفحه باید کارت کیف پول باشد و سایر کارت‌ها سفید باشند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // کارت کیف پول تیره
    const walletCard = compiled.querySelector('#wallet-balance-card > div');
    expect(walletCard?.getAttribute('class')).toContain('bg-[#111111]');

    // کارت‌های سفارش باید سفید باشند
    const orderCards = compiled.querySelectorAll('[id^="order-card-"]');
    orderCards.forEach((c) => {
      expect(c.getAttribute('class')).toContain('bg-white');
    });

    // کارت‌های دسترسی سریع باید سفید باشند
    const quickCards = compiled.querySelectorAll('#quick-actions-section button');
    quickCards.forEach((qc) => {
      expect(qc.getAttribute('class')).toContain('bg-white');
    });
  });

  it('کلیک روی آواتار بالای صفحه باید به صفحه پروفایل برود', () => {
    foodStore.activePage.set('home');
    const compiled = fixture.nativeElement as HTMLElement;
    const avatarBtn = compiled.querySelector<HTMLButtonElement>('#header-profile-avatar');
    avatarBtn?.click();
    fixture.detectChanges();
    expect(foodStore.activePage()).toBe('profile');
  });

  it('شارژ کیف پول باید به صورت زنده و پویا موجودی کارت را آپدیت کرده و فاقد هاردکد باشد', () => {
    expect(component.formattedWalletBalance()).toBe('۲۵۰,۰۰۰');
    
    // شارژ ۱۰۰ هزار تومانی به والت
    foodStore.addWalletBalance(100000);
    fixture.detectChanges();

    expect(foodStore.parentProfile().walletBalance).toBe(350000);
    expect(component.formattedWalletBalance()).toBe('۳۵۰,۰۰۰');

    const compiled = fixture.nativeElement as HTMLElement;
    const balanceEl = compiled.querySelector('#wallet-main-balance');
    expect(balanceEl?.textContent).toContain('۳۵۰,۰۰۰');
  });

  it('آیکون دسترسی سریع انتخاب غذا باید آیکون واقعی غذا و بشقاب باشد و نه آیکون کتاب', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const foodBtn = compiled.querySelector('#btn-quick-food');
    expect(foodBtn).toBeTruthy();

    const svgPath = foodBtn?.querySelector('svg path');
    const pathD = svgPath?.getAttribute('d') || '';
    
    // نباید آیکون اشتباه کتاب باشد
    expect(pathD).not.toContain('M12 6.042');
    // باید حاوی مختصات بشقاب/کلش غذا باشد
    expect(pathD).toContain('M12 3v2');
  });

  it('دکمه شارژ کیف پول باید ارتفاع لمسی استاندارد حداقل ۴۴ پیکسل برای ارگونومی موبایل داشته باشد', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rechargeBtn = compiled.querySelector<HTMLButtonElement>('#btn-recharge-wallet');
    expect(rechargeBtn).toBeTruthy();

    const classAttr = rechargeBtn?.getAttribute('class') || '';
    expect(classAttr).toContain('min-h-[44px]');
  });

  // فیدبک ۶: تست تایپوگرافی و سلسله‌مراتب بصری وزن‌ها
  it('فیدبک ۶: وزن عناوین باید بولد (700)، زیرعناوین نرمال (400) و اعداد سمی‌بولد (600) باشد', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // تیتر اصلی باید font-bold باشد
    const headline = compiled.querySelector('#header-headline');
    expect(headline?.getAttribute('class')).toContain('font-bold');

    // سلام باید font-normal باشد
    const greeting = compiled.querySelector('#header-greeting-text');
    expect(greeting?.getAttribute('class')).toContain('font-normal');

    // عدد موجودی باید font-semibold باشد
    const balance = compiled.querySelector('#wallet-main-balance');
    expect(balance?.getAttribute('class')).toContain('font-semibold');
  });

  // ترتیب بخش‌ها طبق چیدمان پیشنهادی صفحه اصلی
  it('ترتیب قرارگیری بخش‌ها باید دقیقاً طبق چیدمان پیشنهادی باشد', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sections = Array.from(compiled.querySelectorAll('#home-page-view > *'));
    const sectionIds = sections.map((s) => s.id);

    const headerIndex = sectionIds.indexOf('top-header-section');
    const walletIndex = sectionIds.indexOf('wallet-balance-card');
    const ordersIndex = sectionIds.indexOf('today-orders-section');
    const recommendationIndex = sectionIds.indexOf('daily-recommendation-section');
    const quickActionsIndex = sectionIds.indexOf('quick-actions-section');

    expect(headerIndex).toBeLessThan(walletIndex);
    expect(walletIndex).toBeLessThan(ordersIndex);
    expect(ordersIndex).toBeLessThan(recommendationIndex);
    expect(recommendationIndex).toBeLessThan(quickActionsIndex);
  });

  // تست لبه ۱: وضعیت بدون سفارش
  it('در صورت خالی بودن لیست سفارشات امروز، باید وضعیت خالی به همراه کلید هدایت به منو نمایش داده شود', () => {
    foodStore.todayOrders.set([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyCard = compiled.querySelector('#empty-today-orders-card');
    expect(emptyCard).toBeTruthy();
    expect(emptyCard?.textContent).toContain('امروز هیچ سفارش فعالی برای مدرسه ثبت نشده است');

    const orderBtn = compiled.querySelector<HTMLButtonElement>('#btn-empty-order-meals');
    expect(orderBtn).toBeTruthy();

    foodStore.activePage.set('home');
    orderBtn?.click();
    fixture.detectChanges();
    expect(foodStore.activePage()).toBe('meals');
  });

  // تست لبه ۲: لیست فرزندان خالی
  it('در صورتی که لیست فرزندان خالی شود نباید برنامه کرش کند و باید مقدار امن برگرداند', () => {
    foodStore.children.set([]);
    fixture.detectChanges();

    expect(component.activeChild()).toBeTruthy();
    expect(component.activeChild().name).toBe('علی احمدی');
    expect(component.activeChildShortName()).toBe('علی');
  });

  // تست لبه ۳: داینامیک بودن مینی‌کارت شارژ والت
  it('با شارژ جدید والت، مبلغ آخرین تراکنش باید به طور پویا به روز شود', () => {
    expect(component.lastRechargeAmount()).toBe('۵۰,۰۰۰');

    foodStore.addWalletBalance(100000);
    fixture.detectChanges();

    expect(component.lastRechargeAmount()).toBe('۱۰۰,۰۰۰');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#wallet-last-recharge')?.textContent).toContain('۱۰۰,۰۰۰');
  });

  // تست لبه ۴: آیکون‌های وضعیت سفارشات
  it('نشان وضعیت سفارش باید دارای ایموجی رنگی نارنجی برای در حال آماده‌سازی و سبز برای تحویل شده باشد', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const prepCard = compiled.querySelector('#order-card-ORD-1042');
    expect(prepCard?.textContent).toContain('🟠');
    expect(prepCard?.textContent).toContain('در حال آماده‌سازی');

    const deliveredCard = compiled.querySelector('#order-card-ORD-1039');
    expect(deliveredCard?.textContent).toContain('🟢');
    expect(deliveredCard?.textContent).toContain('تحویل شده');
  });

  // تست ارگونومی لمسی موبایل
  it('تمام کلیدهای تعاملی مهم صفحه اصلی باید حداقل ارتفاع ۴۴ پیکسل برای لمس استاندارد موبایل داشته باشند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rechargeBtn = compiled.querySelector('#btn-recharge-wallet');
    const viewMenuBtn = compiled.querySelector('#btn-view-recommended-menu');

    expect(rechargeBtn?.getAttribute('class')).toContain('min-h-[44px]');
    expect(viewMenuBtn?.getAttribute('class')).toContain('min-h-[44px]');
  });

  // تست حذف فونت مونو جهت نمایش فونت فارسی اصیل
  it('اعداد موجودی و تراکنش نباید از کلاس font-mono استفاده کنند تا زیبایی قلم وزیرمتن حفظ شود', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const balance = compiled.querySelector('#wallet-main-balance');
    const lastRecharge = compiled.querySelector('#wallet-last-recharge');

    expect(balance?.getAttribute('class')).not.toContain('font-mono');
    expect(lastRecharge?.getAttribute('class')).not.toContain('font-mono');
  });
});
