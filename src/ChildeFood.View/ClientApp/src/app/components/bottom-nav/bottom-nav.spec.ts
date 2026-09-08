import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BottomNav} from './bottom-nav';
import {FoodStore} from '../../services/food-store';

describe('BottomNav Component — تست نوار ناوبری جزیره‌ای و مورف شدن در صفحه تقویم', () => {
  let component: BottomNav;
  let fixture: ComponentFixture<BottomNav>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNav],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNav);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);
    fixture.detectChanges();
  });

  it('باید کامپوننت نوار ناوبری و استور با موفقیت ایجاد شوند', () => {
    expect(component).toBeTruthy();
    expect(foodStore).toBeTruthy();
  });

  describe('۱. حالت پیش‌فرض (صفحه اصلی - Home)', () => {
    beforeEach(() => {
      foodStore.activePage.set('home');
      fixture.detectChanges();
    });

    it('باید کپسول به صورت مشکی تمام‌عرض باشد و تب‌های اصلی را نشان دهد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const pillWrapper = compiled.querySelector('#nav-pill-wrapper');
      expect(pillWrapper).toBeTruthy();
      expect(pillWrapper?.getAttribute('class')).toContain('bg-[#111111]');

      // تب‌های ۴گانه باید موجود باشند
      expect(compiled.querySelector('#nav-tab-home')).toBeTruthy();
      expect(compiled.querySelector('#nav-tab-orders')).toBeTruthy();
      expect(compiled.querySelector('#nav-tab-wallet')).toBeTruthy();
      expect(compiled.querySelector('#nav-tab-profile')).toBeTruthy();
    });

    it('دکمه بزرگ ادامه در صفحه اصلی باید مخفی باشد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const ctaEl = compiled.querySelector('#nav-calendar-cta');
      expect(ctaEl).toBeTruthy();
      expect(ctaEl?.getAttribute('class')).toContain('opacity-0');
    });
  });

  describe('۲. حالت صفحه تقویم (مورف شدن به دکمه نارنجی ادامه و دایره مشکی شمارنده)', () => {
    beforeEach(() => {
      foodStore.activePage.set('calendar');
      foodStore.selectedCalendarDays.set([]);
      fixture.detectChanges();
    });

    it('کپسول اصلی باید به رنگ نارنجی گرم #FF6B3D تغییر کند و متن بزرگ «ادامه» نمایش یابد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const pillWrapper = compiled.querySelector('#nav-pill-wrapper');
      expect(pillWrapper).toBeTruthy();
      expect(pillWrapper?.getAttribute('class')).toContain('bg-[#FF6B3D]');

      const ctaEl = compiled.querySelector('#nav-calendar-cta');
      expect(ctaEl).toBeTruthy();
      expect(ctaEl?.getAttribute('class')).toContain('opacity-100');
      expect(ctaEl?.textContent).toContain('ادامه');

      // تب‌های ۴گانه در تقویم باید محو (opacity-0) شوند
      const tabsGroup = compiled.querySelector('#nav-tabs-group');
      expect(tabsGroup?.getAttribute('class')).toContain('opacity-0');
    });

    it('دایره مشکی باید باز شده و ۱۰ درصد فضا را پر کند و تعداد روزها را نمایش دهد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const circleEl = compiled.querySelector('#calendar-black-section');
      expect(circleEl).toBeTruthy();
      expect(circleEl?.getAttribute('class')).toContain('w-[62px]');
      expect(circleEl?.getAttribute('class')).toContain('bg-[#111111]');

      // در ابتدا هیچ روزی انتخاب نشده و باید ۰ باشد
      const counterNumber = compiled.querySelector('#counter-days-number');
      expect(counterNumber?.textContent?.trim()).toBe('۰');
    });

    it('با انتخاب روزها در تقویم، عدد داخل دایره مشکی به صورت زنده آپدیت می‌شود', () => {
      foodStore.selectedCalendarDays.set([15, 16, 17]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const counterNumber = compiled.querySelector('#counter-days-number');
      expect(counterNumber?.textContent?.trim()).toBe('۳');
    });

    it('اگر روزی انتخاب نشده باشد و کاربر روی ادامه کلیک کند، پیام هشدار نمایش می‌یابد', () => {
      foodStore.selectedCalendarDays.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const ctaBtn = compiled.querySelector<HTMLButtonElement>('#nav-calendar-cta');
      expect(ctaBtn).toBeTruthy();

      expect(component.showValidationToast()).toBe(false);
      ctaBtn?.click();
      fixture.detectChanges();

      expect(component.showValidationToast()).toBe(true);
      const toastEl = compiled.querySelector('#calendar-validation-toast');
      expect(toastEl).toBeTruthy();
      expect(toastEl?.textContent).toContain('حداقل یک روز');
    });

    it('اگر روزهایی انتخاب شده باشند و کاربر روی ادامه کلیک کند، روزها ثبت و به صفحه غذاها می‌رود', () => {
      foodStore.selectedCalendarDays.set([15, 16, 17, 18]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const ctaBtn = compiled.querySelector<HTMLButtonElement>('#nav-calendar-cta');
      expect(ctaBtn).toBeTruthy();

      ctaBtn?.click();
      fixture.detectChanges();

      expect(foodStore.activePage()).toBe('meals');
    });
  });

  describe('۳. قابلیت باز شدن افقی روزها و معکوس شدن نسبت‌ها (۹۰٪ مشکی و ۱۰٪ نارنجی)', () => {
    beforeEach(() => {
      foodStore.activePage.set('calendar');
      foodStore.selectedCalendarDays.set([15, 16, 17]);
      component.isDaysExpanded.set(false);
      fixture.detectChanges();
    });

    it('با کلیک روی دایره مشکی ۳ روز، بخش مشکی باز شده و ۹۰ درصد فضا را می‌گیرد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const circleBtn = compiled.querySelector<HTMLButtonElement>('#calendar-days-counter-circle');
      expect(circleBtn).toBeTruthy();

      circleBtn?.click();
      fixture.detectChanges();

      expect(component.isDaysExpanded()).toBe(true);

      // کانتینر باز شده مشکی باید حضور داشته باشد و کلاس flex-1 داشته باشد
      const expandedSection = compiled.querySelector('#calendar-black-section');
      expect(expandedSection).toBeTruthy();
      expect(expandedSection?.getAttribute('class')).toContain('flex-1');

      // دکمه نارنجی باید به ۱۰ درصد (w-[62px]) جمع شود
      const orangePill = compiled.querySelector('#nav-pill-wrapper');
      expect(orangePill?.getAttribute('class')).toContain('w-[62px]');
    });

    it('در حالت باز شده، فقط شماره روزها به صورت افقی بدون نام ماه نمایش داده می‌شوند', () => {
      component.isDaysExpanded.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const pill15 = compiled.querySelector('#expanded-pill-15');
      const pill16 = compiled.querySelector('#expanded-pill-16');
      const pill17 = compiled.querySelector('#expanded-pill-17');

      expect(pill15).toBeTruthy();
      expect(pill16).toBeTruthy();
      expect(pill17).toBeTruthy();

      // باید فقط عدد روز باشد بدون کلمه "شهریور"
      expect(pill15?.textContent).toContain('۱۵');
      expect(pill15?.textContent).not.toContain('شهریور');
    });

    it('با کلیک روی ضربدر حذف یک روز، آن روز از لیست حذف می‌شود', () => {
      component.isDaysExpanded.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const pill15 = compiled.querySelector('#expanded-pill-15');
      const removeBtn = pill15?.querySelector<HTMLButtonElement>('button');
      expect(removeBtn).toBeTruthy();

      removeBtn?.click();
      fixture.detectChanges();

      expect(foodStore.selectedCalendarDays()).toEqual([16, 17]);
    });

    it('با کلیک روی دکمه بستن ✕، لیست جمع شده و به حالت دایره ۱۰ درصدی برمی‌گردد', () => {
      component.isDaysExpanded.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const collapseBtn = compiled.querySelector<HTMLButtonElement>('#btn-collapse-days');
      expect(collapseBtn).toBeTruthy();

      collapseBtn?.click();
      fixture.detectChanges();

      expect(component.isDaysExpanded()).toBe(false);
      expect(compiled.querySelector('#calendar-days-counter-circle')).toBeTruthy();
    });

    it('در حالت باز شده نیز با کلیک روی دکمه نارنجی ادامه، کاربر به صفحه غذاها هدایت می‌شود', () => {
      component.isDaysExpanded.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const ctaBtn = compiled.querySelector<HTMLButtonElement>('#nav-calendar-cta');
      expect(ctaBtn).toBeTruthy();

      ctaBtn?.click();
      fixture.detectChanges();

      expect(foodStore.activePage()).toBe('meals');
    });
  });
});
