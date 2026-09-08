import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CalendarPage} from './calendar-page';
import {FoodStore} from '../../services/food-store';

describe('CalendarPage Component — تست‌های ریدیزاین صفحه انتخاب تقویم رزرو ناهار', () => {
  let component: CalendarPage;
  let fixture: ComponentFixture<CalendarPage>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarPage],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarPage);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);
    foodStore.isAuthenticated.set(true);
    fixture.detectChanges();
  });

  it('باید کامپوننت تقویم و استور با موفقیت ایجاد شوند', () => {
    expect(component).toBeTruthy();
    expect(foodStore).toBeTruthy();
  });

  it('طبق درخواست، هنگام ورود اولیه به تقویم نباید هیچ روزی انتخاب شده باشد', () => {
    expect(component.selectedDays()).toEqual([]);
    expect(foodStore.selectedCalendarDays()).toEqual([]);
  });

  // تست هدر مینیمال
  describe('۱. سربرگ (HEADER)', () => {
    it('باید فقط شامل عنوان بزرگ "رزرو ناهار مدرسه" بدون زیرعنوان باشد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const titleEl = compiled.querySelector('#calendar-title');
      expect(titleEl).toBeTruthy();
      expect(titleEl?.textContent?.trim()).toBe('رزرو ناهار مدرسه');

      const subtitleEl = compiled.querySelector('#calendar-subtitle');
      expect(subtitleEl).toBeNull();
    });

    it('دکمه بازگشت در سمت راست قرار دارد و کلیک روی آن کاربر را به خانه هدایت می‌کند', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const backBtn = compiled.querySelector<HTMLButtonElement>('#btn-calendar-back');
      expect(backBtn).toBeTruthy();

      const progress = compiled.querySelector('#calendar-progress-indicator');
      expect(progress?.textContent).toContain('مرحله ۲ از ۵');

      foodStore.activePage.set('calendar');
      backBtn?.click();
      fixture.detectChanges();
      expect(foodStore.activePage()).toBe('home');
    });

    it('نباید بج‌های متعدد یا المان‌های اضافه در هدر وجود داشته باشد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('#calendar-header-section');
      expect(header).toBeTruthy();
    });
  });

  // تست کارت مشخصات فرزند
  describe('۲. کارت انتخاب فرزند (CHILD SELECTOR CARD)', () => {
    it('باید کارت سفید با مشخصات فرزند، آواتار گرد و دکمه تغییر را نمایش دهد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const card = compiled.querySelector('#child-selector-card');
      expect(card).toBeTruthy();

      const avatarEl = compiled.querySelector('#child-card-avatar');
      expect(avatarEl).toBeTruthy();

      const nameEl = compiled.querySelector('#child-card-name');
      expect(nameEl).toBeTruthy();
      expect(nameEl?.textContent).toContain(component.activeChild().name);

      const detailsEl = compiled.querySelector('#child-card-details');
      expect(detailsEl).toBeTruthy();
      expect(detailsEl?.textContent).toContain(component.activeChild().school);

      const changeBtn = compiled.querySelector<HTMLButtonElement>('#btn-change-child');
      expect(changeBtn).toBeTruthy();
      expect(changeBtn?.textContent).toContain('تغییر');
    });

    it('کلیک روی دکمه تغییر باید دراپ‌داون لیست فرزندان را باز و بسته کند', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const changeBtn = compiled.querySelector<HTMLButtonElement>('#btn-change-child');

      expect(component.showChildPicker()).toBe(false);
      expect(compiled.querySelector('#child-picker-dropdown')).toBeNull();

      changeBtn?.click();
      fixture.detectChanges();

      expect(component.showChildPicker()).toBe(true);
      expect(compiled.querySelector('#child-picker-dropdown')).toBeTruthy();

      // انتخاب فرزند دیگر
      const secondChild = foodStore.children()[1];
      const childBtn = compiled.querySelector<HTMLButtonElement>(`#picker-child-${secondChild.id}`);
      expect(childBtn).toBeTruthy();
      childBtn?.click();
      fixture.detectChanges();

      expect(foodStore.selectedChildId()).toBe(secondChild.id);
      expect(component.showChildPicker()).toBe(false);
    });

    it('طبق درخواست کاربر، تگ «فرزند فعال» نباید داخل کارت وجود داشته باشد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const card = compiled.querySelector('#child-selector-card');
      expect(card?.textContent).not.toContain('فرزند فعال');
    });

    it('اگر فقط یک فرزند وجود داشته باشد، دکمه تغییر نباید رندر شود', () => {
      const singleChild = foodStore.children().slice(0, 1);
      foodStore.children.set(singleChild);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const changeBtn = compiled.querySelector('#btn-change-child');
      expect(changeBtn).toBeNull();
    });

    it('اگر بیش از یک فرزند وجود داشته باشد، دکمه تغییر رندر می‌شود', () => {
      expect(foodStore.children().length).toBeGreaterThan(1);
      const compiled = fixture.nativeElement as HTMLElement;
      const changeBtn = compiled.querySelector('#btn-change-child');
      expect(changeBtn).toBeTruthy();
    });
  });

  // تست کارت تقویم ماه
  describe('۳. کارت ماه و تقویم (MONTH CALENDAR CARD)', () => {
    it('باید عنوان "شهریور ۱۴۰۵" و دکمه‌های ناوبری ماه قبل و بعد را نمایش دهد', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const monthTitle = compiled.querySelector('#calendar-month-title');
      expect(monthTitle).toBeTruthy();
      expect(monthTitle?.textContent).toContain('شهریور ۱۴۰۵');

      const prevBtn = compiled.querySelector('#btn-prev-month');
      const nextBtn = compiled.querySelector('#btn-next-month');
      expect(prevBtn).toBeTruthy();
      expect(nextBtn).toBeTruthy();
    });

    it('باید روزهای هفته با حروف ش، ی، د، س، چ، پ، ج نمایش داده شوند', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const card = compiled.querySelector('#month-calendar-card');
      const weekdays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

      weekdays.forEach((dayChar) => {
        expect(card?.textContent).toContain(dayChar);
      });
    });
  });

  // تست گرید روزهای تقویم و وضعیت‌ها
  describe('۴. گرید روزهای تقویم و وضعیت‌ها (CALENDAR DAYS)', () => {
    it('باید ۳۱ روز ماه شهریور را در گرید تقویم ایجاد کند', () => {
      expect(component.monthDays().length).toBe(31);
      const compiled = fixture.nativeElement as HTMLElement;
      const dayCells = compiled.querySelectorAll('[id^="calendar-day-"]');
      expect(dayCells.length).toBe(31);
    });

    it('روزهای گذشته (۱ تا ۱۴) باید غیرفعال (disabled) و با رنگ خاکستری باشند', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const pastDayCell = compiled.querySelector('#calendar-day-10');
      expect(pastDayCell).toBeTruthy();
      expect(pastDayCell?.getAttribute('aria-disabled')).toBe('true');

      // کلیک روی روز گذشته نباید آن را به لیست انتخابی‌ها اضافه کند
      component.toggleDay(10);
      expect(component.selectedDays()).toEqual([]);
    });

    it('روزهای انتخاب شده باید پس‌زمینه نارنجی #FF6B3D داشته باشند و متن اضافی "انتخاب شده" نداشته باشند', () => {
      component.toggleDay(15);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const selectedCell = compiled.querySelector<HTMLButtonElement>('#calendar-day-15');
      expect(selectedCell).toBeTruthy();
      const cellClass = selectedCell?.getAttribute('class') || '';
      expect(cellClass).toContain('bg-[#FF6B3D]');
      expect(selectedCell?.textContent?.trim()).toBe('۱۵');
      expect(selectedCell?.textContent).not.toContain('انتخاب شده');
    });

    it('کلیک روی یک روز فعال باید وضعیت انتخاب آن را تاگل کند و در استور همگام شود', () => {
      expect(component.selectedDays()).not.toContain(16);
      expect(foodStore.selectedCalendarDays()).not.toContain(16);

      const compiled = fixture.nativeElement as HTMLElement;
      const day16 = compiled.querySelector<HTMLButtonElement>('#calendar-day-16');
      expect(day16).toBeTruthy();

      // کلیک برای انتخاب روز ۱۶
      day16?.click();
      fixture.detectChanges();
      expect(component.selectedDays()).toContain(16);
      expect(foodStore.selectedCalendarDays()).toContain(16);

      // کلیک مجدد برای لغو انتخاب روز ۱۶
      day16?.click();
      fixture.detectChanges();
      expect(component.selectedDays()).not.toContain(16);
      expect(foodStore.selectedCalendarDays()).not.toContain(16);
    });

    it('روزهای جمعه باید نشانگر قرمز رنگ روز تعطیل داشته باشند', () => {
      const fridayDay = component.monthDays().find((d) => d.dayNumber === 21); // ۲۱ شهریور جمعه است
      expect(fridayDay?.isHoliday).toBe(true);

      const compiled = fixture.nativeElement as HTMLElement;
      const fridayCell = compiled.querySelector('#calendar-day-21');
      expect(fridayCell).toBeTruthy();
      const redDot = fridayCell?.querySelector('.bg-rose-500');
      expect(redDot).toBeTruthy();
    });
  });

  // تست حذف بخش پیل‌های انتخاب تاریخ از صفحه طبق فیدبک کاربر
  describe('۵. حذف بخش پیل‌های بالای صفحه (حذف به نفع نوار پایین)', () => {
    it('کارت پیل‌های بالای صفحه باید طبق درخواست کاربر از این کامپوننت حذف شده باشد', () => {
      foodStore.selectedCalendarDays.set([15, 16, 17]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('#selected-days-pills-section')).toBeNull();
    });

    it('متد clearAllDays باید روزهای انتخاب شده را در استور خالی کند', () => {
      foodStore.selectedCalendarDays.set([15, 16]);
      expect(component.selectedDays()).toEqual([15, 16]);

      component.clearAllDays();
      expect(component.selectedDays()).toEqual([]);
      expect(foodStore.selectedCalendarDays()).toEqual([]);
    });
  });
});
