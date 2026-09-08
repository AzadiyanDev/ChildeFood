import {ComponentFixture, TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {AuthPhone} from './auth-phone';
import {FoodStore} from '../../services/food-store';

describe('AuthPhone Component — تست صفحه دریافت شماره موبایل', () => {
  let component: AuthPhone;
  let fixture: ComponentFixture<AuthPhone>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPhone],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPhone);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);
    fixture.detectChanges();
  });

  it('باید کامپوننت دریافت شماره موبایل با موفقیت ایجاد شود', () => {
    expect(component).toBeTruthy();
  });

  it('باید فیلد شماره موبایل با placeholder فارسی و دکمه دریافت کد تایید رندر شود', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const phoneInput = compiled.querySelector('#input-mobile-number') as HTMLInputElement;
    const submitBtn = compiled.querySelector('#btn-request-otp');

    expect(phoneInput).toBeTruthy();
    expect(phoneInput.placeholder).toContain('۰۹۱۲۳۴۵۶۷۸۹');
    expect(submitBtn).toBeTruthy();
    expect(submitBtn?.textContent).toContain('دریافت کد تایید');
  });

  it('در صورت خالی بودن یا نامعتبر بودن شماره موبایل باید پیام خطای مناسب نمایش داده شود', async () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('لطفاً شماره تلفن همراه خود را وارد کنید');

    // شماره با فرمت نادرست
    component.phoneNumber.set('12345');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('شماره موبایل باید ۱۱ رقم بوده و با ۰۹ آغاز شود');
  });

  it('در صورت ارسال شماره معتبر، باید درخواست ارسال شده و کاربر به صفحه OTP هدایت شود', async () => {
    vi.spyOn(foodStore, 'requestOtp').mockResolvedValue({
      success: true,
      message: 'کد ارسال شد',
      otpCode: '12345',
      expirySeconds: 120,
    });

    component.phoneNumber.set('09123456789');
    await component.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(foodStore.requestOtp).toHaveBeenCalledWith('09123456789');
    expect(foodStore.activePage()).toBe('login-otp');
  });

  it('در وضعیت isLoading باید دکمه غیرفعال شده و فقط لودر اسپینر بدون متن نمایش یابد', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('#btn-request-otp') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.querySelector('.animate-spin')).toBeTruthy();
    expect(submitBtn.textContent?.trim()).toBe('');
  });
});
