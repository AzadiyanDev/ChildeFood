import {ComponentFixture, TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {AuthOtp} from './auth-otp';
import {FoodStore} from '../../services/food-store';

describe('AuthOtp Component — تست صفحه وارد کردن کد تایید OTP', () => {
  let component: AuthOtp;
  let fixture: ComponentFixture<AuthOtp>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthOtp],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthOtp);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);
    foodStore.pendingPhone.set('09123456789');
    fixture.detectChanges();
  });

  it('باید کامپوننت ورود کد اوتی‌پی با موفقیت ایجاد شود', () => {
    expect(component).toBeTruthy();
  });

  it('باید ۵ باکس مجزا برای ارقام کد تایید رندر شوند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const inputs = compiled.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBe(5);
  });

  it('در صورتی که کد ۵ رقمی ناقص باشد، دکمه ورود غیرفعال است', () => {
    component.otpValues.set(['1', '2', '3', '', '']);
    fixture.detectChanges();

    expect(component.isOtpIncomplete()).toBe(true);
    const btn = fixture.nativeElement.querySelector('#btn-submit-otp') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('با زدن دکمه جای‌گذاری خودکار در توستر، کد به صورت واکنشی در فیلدها پر می‌شود', () => {
    foodStore.autoFilledOtp.set('98765');
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.otpValues()).toEqual(['9', '8', '7', '6', '5']);
    expect(component.isOtpIncomplete()).toBe(false);
  });

  it('در صورت تایید موفق کد اوتی‌پی، کاربر باید لاگین شده و به صفحه اصلی هدایت شود', async () => {
    vi.spyOn(foodStore, 'verifyOtp').mockResolvedValue({
      success: true,
      message: 'ورود موفق',
      isNewUser: false,
      user: {
        id: 'user-1',
        fullName: 'والد گرامی',
        phoneNumber: '09123456789',
        roleTitle: 'Parent',
        walletBalance: 0,
      },
    });

    component.otpValues.set(['1', '2', '3', '4', '5']);
    fixture.detectChanges();

    await component.handleVerify(new Event('submit'));
    fixture.detectChanges();

    expect(foodStore.isAuthenticated()).toBe(true);
    expect(foodStore.activePage()).toBe('home');
  });

  it('در صورتی که کاربر جدید باشد و نیاز به تکمیل پروفایل داشته باشد، باید به صفحه تکمیل مشخصات والد هدایت شود', async () => {
    vi.spyOn(foodStore, 'verifyOtp').mockResolvedValue({
      success: true,
      message: 'ورود موفق کاربر جدید',
      isNewUser: true,
      user: {
        id: 'user-new',
        fullName: '',
        phoneNumber: '09123456789',
        roleTitle: 'والد',
        walletBalance: 0,
        onboardingStatus: 'NeedParentProfile',
      },
    });

    component.otpValues.set(['1', '2', '3', '4', '5']);
    fixture.detectChanges();

    await component.handleVerify(new Event('submit'));
    fixture.detectChanges();

    expect(foodStore.isAuthenticated()).toBe(true);
    expect(foodStore.activePage()).toBe('parent-onboarding');
  });

  it('در وضعیت isLoading باید دکمه ورود غیرفعال بوده و فقط لودر اسپینر بدون متن نمایش یابد', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('#btn-submit-otp') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.querySelector('.animate-spin')).toBeTruthy();
    expect(submitBtn.textContent?.trim()).toBe('');
  });
});

