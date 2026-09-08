import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MealsPage} from './meals-page';
import {CartDrawer} from '../cart-drawer/cart-drawer';
import {FoodStore} from '../../services/food-store';
import {App} from '../../app';

describe('MealsPage Component Suite — فلو دقیق مرحله‌به‌مرحله روزها، حذف دکمه انتخاب، دکمه ادامه هوشمند و دایره تاریخ', () => {
  let component: MealsPage;
  let fixture: ComponentFixture<MealsPage>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealsPage, App, CartDrawer],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(MealsPage);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);
    foodStore.isAuthenticated.set(true);
    foodStore.activePage.set('meals');

    // روزهای انتخابی از مرحله تقویم: ۱۵، ۱۶ و ۱۷ شهریور
    foodStore.selectedCalendarDays.set([15, 16, 17]);
    foodStore.confirmedDays.set([]);
    foodStore.setSelectedDay(15);
    fixture.detectChanges();
  });

  it('باید کامپوننت و استور با موفقیت ایجاد شوند', () => {
    expect(component).toBeTruthy();
    expect(foodStore).toBeTruthy();
  });

  // ===========================================================================
  // ۱. تست شروع فلو همیشه از روز اول تقویم
  // ===========================================================================
  describe('۱. شروع فلو از روز اول و مقداردهی اولیه', () => {
    it('فلو انتخاب غذا باید همواره از اولین روز انتخاب‌شده (۱۵ شهریور) شروع شود', () => {
      expect(foodStore.selectedDay()).toBe(15);
      expect(component.selectedDateLabel()).toContain('۱۵ شهریور');

      const compiled = fixture.nativeElement as HTMLElement;
      const titleEl = compiled.querySelector('#meals-title');
      const subtitleEl = compiled.querySelector('#meals-subtitle');
      expect(titleEl?.textContent).toContain('انتخاب غذای ناهار');
      expect(subtitleEl).toBeNull();

      const selectedDateText = compiled.querySelector('#selected-date-text');
      expect(selectedDateText?.textContent).toContain('۱۵ شهریور');

      const backBtn = compiled.querySelector<HTMLButtonElement>('#btn-meals-back');
      expect(backBtn).toBeTruthy();
    });

    it('کلیک روی دکمه بازگشت در صفحه غذا کاربر را به صفحه تقویم هدایت می‌کند', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const backBtn = compiled.querySelector<HTMLButtonElement>('#btn-meals-back');
      expect(backBtn).toBeTruthy();

      foodStore.activePage.set('meals');
      backBtn?.click();
      fixture.detectChanges();
      expect(foodStore.activePage()).toBe('calendar');
    });

    it('در ابتدای ورود، هیچ روزی نباید نارنجی و تیک‌دار باشد', () => {
      expect(component.isDayCompleted(15)).toBe(false);
      expect(component.isDayCompleted(16)).toBe(false);
      expect(component.isDayCompleted(17)).toBe(false);

      const compiled = fixture.nativeElement as HTMLElement;
      const day15Btn = compiled.querySelector('#day-pill-15');
      // روز اول فعال است اما هنوز تایید/نارنجی نشده
      expect(day15Btn?.getAttribute('class')).not.toContain('bg-[#FF6B3D]');
      expect(day15Btn?.getAttribute('class')).toContain('ring-4');
    });
  });

  // ===========================================================================
  // ۲. تست حذف دکمه انتخاب از کارت و انتخاب با کلیک روی خود کارت
  // ===========================================================================
  describe('۲. حذف کامل دکمه «انتخاب» و فعال‌سازی لمس کارت غذا', () => {
    it('هیچ دکمه‌ای با متن «انتخاب» نباید روی کارت‌های سفید غذا وجود داشته باشد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = Array.from(compiled.querySelectorAll('button'));
      const selectButtons = buttons.filter((b) => b.textContent?.trim() === 'انتخاب');
      expect(selectButtons.length).toBe(0);
    });

    it('کلیک روی خود کارت غذا، غذا را انتخاب کرده و کارت را کاملاً مشکی می‌کند', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const food = component.displayedFoods()[0];
      const card = compiled.querySelector<HTMLElement>('#food-card-' + food.id);

      expect(card).toBeTruthy();
      expect(card?.getAttribute('class')).toContain('bg-white');
      expect(card?.getAttribute('class')).toContain('cursor-pointer');

      // کلیک روی کارت سفید غذا
      card?.click();
      fixture.detectChanges();

      // غذا انتخاب شده و کارت در DOM به المنت جدید کاملاً مشکی تبدیل می‌شود
      expect(component.isFoodSelected(food.id)).toBe(true);
      const updatedCard = compiled.querySelector('#food-card-' + food.id);
      expect(updatedCard?.getAttribute('class')).toContain('bg-[#111111]');
      expect(updatedCard?.getAttribute('class')).toContain('border-[#FF6B3D]');

      // تصویر و توضیحات غذا در کارت مشکی مخفی می‌شوند
      expect(compiled.querySelector('#food-visual-' + food.id)).toBeNull();
      expect(compiled.querySelector('#food-desc-' + food.id)).toBeNull();

      // بخش‌های پرس و تعداد ظاهر می‌شوند
      expect(compiled.querySelector('#selected-badge-' + food.id)?.textContent).toContain('✓ انتخاب شد');
      expect(compiled.querySelector('#portion-selector-' + food.id)).toBeTruthy();
      expect(compiled.querySelector('#qty-selector-' + food.id)).toBeTruthy();
    });

    it('امکان تغییر نوع پرس بین «کامل» و «نیم پرس» و تغییر تعداد در کارت مشکی فراهم است', () => {
      const food = component.displayedFoods()[0];
      component.selectFood(food.id);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const halfBtn = compiled.querySelector<HTMLButtonElement>('#btn-portion-half-' + food.id);
      halfBtn?.click();
      fixture.detectChanges();

      expect(component.getPortion(food.id)).toBe('نیم پرس');

      const plusBtn = compiled.querySelector<HTMLButtonElement>('#btn-qty-plus-' + food.id);
      plusBtn?.click();
      fixture.detectChanges();

      expect(component.getQuantity(food.id)).toBe(2);
    });
  });

  // ===========================================================================
  // ۳. تست دایره مشکی تاریخ روز انتخابی جاری
  // ===========================================================================
  describe('۳. دایره مشکی تاریخ روز انتخابی جاری', () => {
    it('دایره مشکی پایین باید تاریخ دقیق روز در حال انتخاب را نشان دهد (نه تعداد روز مانده)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const blackCircle = compiled.querySelector('#meals-black-circle-section');
      const dayNum = compiled.querySelector('#meals-circle-day-number');
      const monthName = compiled.querySelector('#meals-circle-month-name');

      expect(blackCircle).toBeTruthy();
      expect(dayNum?.textContent).toContain('۱۵');
      expect(monthName?.textContent).toContain('شهریور');
      expect(blackCircle?.textContent).not.toContain('روز مانده');
    });

    it('با رفتن به روز بعدی، عدد داخل دایره مشکی به روز جدید تغییر می‌کند', () => {
      component.selectDay(16);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const dayNum = compiled.querySelector('#meals-circle-day-number');
      expect(dayNum?.textContent).toContain('۱۶');
    });
  });

  // ===========================================================================
  // ۴. تست رفتار دکمه ادامه (خاکستری/غیرفعال تا قبل انتخاب، نارنجی/فعال پس از انتخاب)
  // ===========================================================================
  describe('۴. رفتار هوشمند دکمه ادامه در پایین صفحه', () => {
    it('تا زمانی که کاربر برای روز جاری غذا انتخاب نکرده، دکمه ادامه باید خاکستری و غیرفعال باشد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const ctaBtn = compiled.querySelector<HTMLButtonElement>('#btn-meals-cta-action');

      expect(ctaBtn).toBeTruthy();
      expect(component.hasMealForCurrentDay()).toBe(false);
      expect(ctaBtn?.disabled).toBe(true);
      expect(ctaBtn?.getAttribute('class')).toContain('bg-gray-200');
      expect(ctaBtn?.getAttribute('class')).toContain('cursor-not-allowed');
    });

    it('با انتخاب غذا برای روز جاری، دکمه ادامه بلافاصله نارنجی و فعال می‌شود', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const ctaBtn = compiled.querySelector<HTMLButtonElement>('#btn-meals-cta-action');
      const food = component.displayedFoods()[0];

      // انتخاب غذا
      component.selectFood(food.id);
      fixture.detectChanges();

      expect(component.hasMealForCurrentDay()).toBe(true);
      expect(ctaBtn?.disabled).toBe(false);
      expect(ctaBtn?.getAttribute('class')).toContain('bg-[#FF6B3D]');
      expect(ctaBtn?.getAttribute('class')).toContain('cursor-pointer');
    });

    it('اگر کاربر غذا را لغو کند، دکمه ادامه مجدداً خاکستری و غیرفعال می‌شود', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const ctaBtn = compiled.querySelector<HTMLButtonElement>('#btn-meals-cta-action');
      const food = component.displayedFoods()[0];

      component.selectFood(food.id);
      fixture.detectChanges();
      expect(ctaBtn?.disabled).toBe(false);

      component.cancelFoodSelection();
      fixture.detectChanges();

      expect(component.hasMealForCurrentDay()).toBe(false);
      expect(ctaBtn?.disabled).toBe(true);
      expect(ctaBtn?.getAttribute('class')).toContain('bg-gray-200');
    });
  });

  // ===========================================================================
  // ۵. تست فلو انتقال: کلیک روی ادامه -> روز نارنجی می‌شود -> انتقال به روز بعد
  // ===========================================================================
  describe('۵. فلو انتقال با زدن دکمه «ادامه»', () => {
    it('با زدن دکمه «ادامه»، روز جاری نارنجی و تیک‌دار شده و صفحه به روز بعد می‌رود', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const ctaBtn = compiled.querySelector<HTMLButtonElement>('#btn-meals-cta-action');
      const food15 = component.displayedFoods()[0];

      // ۱. انتخاب غذا در روز ۱۵
      component.selectFood(food15.id);
      fixture.detectChanges();

      // قبل از زدن ادامه، روز ۱۵ هنوز تایید نهایی و نارنجی نشده است
      expect(component.isDayCompleted(15)).toBe(false);

      // ۲. زدن دکمه ادامه
      ctaBtn?.click();
      fixture.detectChanges();

      // ۳. روز ۱۵ تایید شده و نارنجی با تیک می‌شود
      expect(component.isDayCompleted(15)).toBe(true);
      const day15Btn = compiled.querySelector('#day-pill-15');
      expect(day15Btn?.getAttribute('class')).toContain('bg-[#FF6B3D]');
      expect(day15Btn?.textContent).toContain('✓');

      // ۴. فلو به روز بعد (۱۶ شهریور) منتقل شده است
      expect(foodStore.selectedDay()).toBe(16);
      expect(component.selectedDateLabel()).toContain('۱۶ شهریور');

      // ۵. در روز جدید ۱۶، چون هنوز غذایی انتخاب نشده دکمه ادامه مجدداً خاکستری است
      expect(component.hasMealForCurrentDay()).toBe(false);
      expect(ctaBtn?.disabled).toBe(true);
      expect(ctaBtn?.getAttribute('class')).toContain('bg-gray-200');
    });

    it('با تکمیل تمام روزها، دکمه به «تکمیل سفارش» تغییر یافته و سبد خرید باز می‌شود', () => {
      // انتخاب و تایید روز ۱۵
      component.selectFood(component.displayedFoods()[0].id);
      component.handleCtaClick();
      fixture.detectChanges();

      expect(foodStore.selectedDay()).toBe(16);

      // انتخاب و تایید روز ۱۶
      component.selectFood(component.displayedFoods()[0].id);
      component.handleCtaClick();
      fixture.detectChanges();

      expect(foodStore.selectedDay()).toBe(17);

      // انتخاب غذای روز آخر (۱۷)
      component.selectFood(component.displayedFoods()[0].id);
      fixture.detectChanges();

      // دکمه باید به «تکمیل سفارش» تبدیل شود
      expect(component.isAllDaysCompleted()).toBe(true);
      const compiled = fixture.nativeElement as HTMLElement;
      const ctaBtn = compiled.querySelector<HTMLButtonElement>('#btn-meals-cta-action');
      expect(ctaBtn?.textContent).toContain('تکمیل سفارش');

      // کلیک نهایی تکمیل سفارش
      ctaBtn?.click();
      fixture.detectChanges();

      expect(component.isDayCompleted(17)).toBe(true);
      expect(component.showCompletionNotice()).toBe(true);
    });
  });
});
