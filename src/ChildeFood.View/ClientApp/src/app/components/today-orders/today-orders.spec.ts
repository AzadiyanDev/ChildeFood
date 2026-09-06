import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TodayOrders} from './today-orders';
import {FoodStore} from '../../services/food-store';

describe('TodayOrders Component Suite', () => {
  let component: TodayOrders;
  let fixture: ComponentFixture<TodayOrders>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayOrders],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(TodayOrders);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);
    fixture.detectChanges();
  });

  it('باید کامپوننت سفارشات امروز با موفقیت لود شود', () => {
    expect(component).toBeTruthy();
    expect(foodStore.todayOrders().length).toBe(2);
  });

  it('باید فرزندی که امروز ناهار ندارد (امیرعلی) به طور خودکار شناسایی شود', () => {
    const unattended = component.childWithoutOrder();
    expect(unattended).toBeTruthy();
    expect(unattended?.name).toContain('امیرعلی');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#child-no-order-notice')).toBeTruthy();
    expect(compiled.textContent).toContain('امیرعلی احمدی');
  });

  it('در صورت خالی بودن لیست سفارشات امروز باید پیام وضعیت خالی نشان داده شود', () => {
    foodStore.todayOrders.set([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('امروز هیچ سفارش فعالی ثبت نشده است');
    expect(compiled.querySelector('#today-order-card-ORD-1042')).toBeFalsy();
  });

  it('اگر همه فرزندان ناهار داشته باشند نباید هشدار عدم سفارش نمایش داده شود', () => {
    foodStore.children.update((children) =>
      children.map((c) => ({...c, hasOrderToday: true}))
    );
    fixture.detectChanges();

    expect(component.childWithoutOrder()).toBeUndefined();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#child-no-order-notice')).toBeFalsy();
  });

  it('تمامی کلیدهای تعاملی بخش سفارشات باید حداقل ارتفاع لمسی ۴۴ پیکسل را داشته باشند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);

    buttons.forEach((btn) => {
      const classAttr = btn.getAttribute('class') || '';
      expect(classAttr).toContain('min-h-[44px]');
      expect(classAttr).not.toContain('bg-gradient-');
      expect(classAttr).not.toContain('backdrop-blur-');
    });
  });

  it('وقتی سفارشی برای فرزند بدون غذا ثبت شود، هشدار باید بلافاصله مخفی شود', () => {
    expect(component.childWithoutOrder()?.id).toBe('child-3');

    // ثبت سفارش برای امیرعلی
    foodStore.children.update((children) =>
      children.map((c) => (c.id === 'child-3' ? {...c, hasOrderToday: true} : c))
    );
    fixture.detectChanges();

    expect(component.childWithoutOrder()).toBeUndefined();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#child-no-order-notice')).toBeFalsy();
  });

  it('کلیک روی دکمه سفارش سریع باید فرزند مربوطه را درجا انتخاب کند و کاربر را از صفحه اصلی خارج نکند', () => {
    foodStore.activePage.set('home');
    foodStore.selectedChildId.set('child-1');

    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector<HTMLButtonElement>('#btn-quick-order-amirali');
    expect(btn).toBeTruthy();

    btn?.click();
    fixture.detectChanges();

    // باید فرزند امیرعلی (child-3) انتخاب شده باشد
    expect(foodStore.selectedChildId()).toBe('child-3');
    // صفحه همچنان باید روی همان home باقی بماند و به صفحه تقویم قدیمی هدایت نشود
    expect(foodStore.activePage()).toBe('home');
  });
});
