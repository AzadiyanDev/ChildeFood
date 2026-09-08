import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CheckoutPage} from './checkout-page';
import {FoodStore} from '../../services/food-store';

describe('CheckoutPage Component — صفحه اختصاصی و تمام‌صفحه بررسی و تکمیل سفارش', () => {
  let component: CheckoutPage;
  let fixture: ComponentFixture<CheckoutPage>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutPage);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);
    foodStore.isAuthenticated.set(true);
    foodStore.activePage.set('checkout');
    fixture.detectChanges();
  });

  it('باید کامپوننت صفحه بررسی سفارش به درستی ایجاد شود', () => {
    expect(component).toBeTruthy();
  });

  it('باید فقط عنوان بولد «بررسی و تکمیل سفارش» بدون زیرعنوان نمایش داده شود و نشانگر مرحله ۴ از ۵ در سمت چپ قرار گیرد', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('#checkout-title');
    const subtitle = compiled.querySelector('#checkout-subtitle');
    const progress = compiled.querySelector('#checkout-progress-indicator');

    expect(title?.textContent).toContain('بررسی و تکمیل سفارش');
    expect(subtitle).toBeNull();
    expect(progress?.textContent).toContain('مرحله ۴ از ۵');
  });

  it('دکمه بازگشت در سمت راست هدر رندر شده و با کلیک کاربر را به صفحه انتخاب غذا هدایت می‌کند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const backBtn = compiled.querySelector<HTMLButtonElement>('#btn-checkout-back');
    expect(backBtn).toBeTruthy();

    backBtn?.click();
    fixture.detectChanges();
    expect(foodStore.activePage()).toBe('meals');
  });

  it('باید مشخصات دانش‌آموز (آوا احمدی) و مدرسه و روزهای انتخابی در کارت نمایش داده شوند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const childName = compiled.querySelector('#checkout-child-name');
    const childGrade = compiled.querySelector('#checkout-child-grade');
    const datesBadge = compiled.querySelector('#checkout-selected-dates-badge');

    expect(childName?.textContent).toContain(component.activeChild().name);
    expect(childGrade?.textContent).toContain(component.activeChild().grade);
    expect(childGrade?.textContent).toContain(component.activeChild().school);
    expect(datesBadge?.textContent).toContain('شهریور');
  });

  it('باید اقلام سفارش ناهار با قیمت و پرس کامل/نیم پرس در لیست دیده شوند', () => {
    const items = component.orderItems();
    expect(items.length).toBeGreaterThan(0);

    const compiled = fixture.nativeElement as HTMLElement;
    const firstItemCard = compiled.querySelector('#order-item-card-' + items[0].dayNumber);
    expect(firstItemCard).toBeTruthy();
    expect(firstItemCard?.textContent).toContain(items[0].foodName);
    expect(firstItemCard?.textContent).toContain(items[0].portionLabel);
  });

  it('با وارد کردن کد تخفیف MADRESEH، تخفیف ۱۵ درصدی محاسبه و به فاکتور اعمال شود', () => {
    const subtotal = component.rawSubtotal();
    component.discountCodeInput.set('MADRESEH');
    component.applyDiscount();
    fixture.detectChanges();

    expect(component.isDiscountApplied()).toBe(true);
    expect(component.discountAmount()).toBe(Math.round(subtotal * 0.15));
    expect(component.finalPayableAmount()).toBe(subtotal - component.discountAmount());

    // با زدن دکمه حذف، تخفیف برداشته می‌شود
    component.removeDiscount();
    fixture.detectChanges();

    expect(component.isDiscountApplied()).toBe(false);
    expect(component.discountAmount()).toBe(0);
  });

  it('امکان سوئیچ بین پرداخت با کیف پول و درگاه شتاب وجود دارد', () => {
    expect(component.selectedPaymentMethod()).toBe('wallet');

    component.selectPaymentMethod('online');
    fixture.detectChanges();
    expect(component.selectedPaymentMethod()).toBe('online');

    component.selectPaymentMethod('wallet');
    fixture.detectChanges();
    expect(component.selectedPaymentMethod()).toBe('wallet');
  });

  it('نوار اکشن جزیره‌ای پایین شامل المان مشکی قیمت نهایی و دکمه نارنجی «تکمیل سفارش» نمایش داده شود', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const islandNav = compiled.querySelector('#checkout-island-nav');
    const blackBadge = compiled.querySelector('#checkout-black-price-section');
    const priceText = compiled.querySelector('#checkout-badge-price-number');
    const priceUnit = compiled.querySelector('#checkout-badge-price-unit');
    const ctaButton = compiled.querySelector('#btn-complete-checkout');
    const ctaLabel = compiled.querySelector('#btn-checkout-cta-label');

    expect(islandNav).toBeTruthy();
    expect(blackBadge).toBeTruthy();
    expect(priceText?.textContent).toContain(component.formatPrice(component.finalPayableAmount()));
    expect(priceUnit?.textContent).toContain('تومان');
    expect(ctaButton).toBeTruthy();
    expect(ctaLabel?.textContent).toContain('تکمیل سفارش');
  });

  it('عرض دایره مشکی قیمت بر اساس طول رقم قیمت به صورت داینامیک محاسبه شود', () => {
    // برای مبلغ جاری
    const widthWithCurrentPrice = component.blackPriceBadgeWidth();
    expect(widthWithCurrentPrice).toContain('px');
    expect(parseInt(widthWithCurrentPrice, 10)).toBeGreaterThanOrEqual(62);
  });
});
