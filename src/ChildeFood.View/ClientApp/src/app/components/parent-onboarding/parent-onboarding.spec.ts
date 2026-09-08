import {ComponentFixture, TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {ParentOnboarding} from './parent-onboarding';
import {FoodStore} from '../../services/food-store';

describe('ParentOnboarding Component — تست صفحه تکمیل اطلاعات سرپرست', () => {
  let component: ParentOnboarding;
  let fixture: ComponentFixture<ParentOnboarding>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentOnboarding],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(ParentOnboarding);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);
    fixture.detectChanges();
  });

  it('باید کامپوننت تکمیل مشخصات سرپرست به درستی لود شود', () => {
    expect(component).toBeTruthy();
  });

  it('باید عناصر کلیدی فرم شامل عنوان، فیلد نام، گزینه‌های آواتار SVG و دکمه آپلود وجود داشته باشند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nameInput = compiled.querySelector('#input-parent-name') as HTMLInputElement;
    const submitBtn = compiled.querySelector('#btn-submit-parent-profile');
    const uploadBtn = compiled.querySelector('#btn-upload-parent-avatar');

    expect(nameInput).toBeTruthy();
    expect(submitBtn).toBeTruthy();
    expect(uploadBtn).toBeTruthy();
    expect(component.avatarOptions.length).toBe(6);
    expect(compiled.textContent).toContain('تکمیل اطلاعات حساب والد');
    expect(compiled.textContent).toContain('مرحله ۱ از ۲');
  });

  it('اگر نام سرپرست خالی باشد، هنگام سابمیت باید خطای اعتبارسنجی فارسی نمایش داده شود', async () => {
    component.fullName.set('');
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('لطفاً نام و نام خانوادگی خود را وارد کنید');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('لطفاً نام و نام خانوادگی خود را وارد کنید');
  });

  it('کلیک روی وکتورهای SVG باید نمایه انتخابی را به آن آدرس تغییر دهد', () => {
    component.selectPreset('/assets/avatars/parent-mother-1.svg');
    fixture.detectChanges();

    expect(component.selectedAvatar()).toBe('/assets/avatars/parent-mother-1.svg');
  });

  it('در هنگام انتخاب فایل عکس برای آپلود، باید متد uploadAvatar استور صدا زده شده و آدرس عکس به عنوان آواتار ست شود', async () => {
    const uploadSpy = vi.spyOn(foodStore, 'uploadAvatar').mockResolvedValue({
      success: true,
      url: '/uploads/avatars/avatar-custom.jpg',
      message: 'عکس ذخیره شد',
    });

    const fakeFile = new File(['dummy-image-bytes'], 'avatar.jpg', {type: 'image/jpeg'});
    const event = {
      target: {
        files: [fakeFile],
        value: 'C:\\fake\\avatar.jpg',
      },
    } as unknown as Event;

    await component.handleFileSelect(event);
    fixture.detectChanges();

    expect(uploadSpy).toHaveBeenCalledWith(fakeFile);
    expect(component.selectedAvatar()).toBe('/uploads/avatars/avatar-custom.jpg');
    expect(component.uploadedCustomAvatar()).toBe('/uploads/avatars/avatar-custom.jpg');
  });

  it('با پر کردن اطلاعات معتبر و ارسال موفق، باید متد ذخیره استور صدا زده شده و کاربر به مرحله ثبت فرزند برود', async () => {
    const saveSpy = vi.spyOn(foodStore, 'saveParentProfileOnboarding').mockResolvedValue({
      success: true,
    });
    const navSpy = vi.spyOn(foodStore, 'goToChildOnboarding');

    component.fullName.set('مریم احمدی');
    component.nationalId.set('0012345678');
    component.selectedRole.set('مادر');
    component.address.set('تهران، سعادت‌آباد');
    component.selectedAvatar.set('/assets/avatars/parent-mother-2.svg');

    await component.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(saveSpy).toHaveBeenCalledWith({
      fullName: 'مریم احمدی',
      nationalId: '0012345678',
      roleTitle: 'مادر',
      address: 'تهران، سعادت‌آباد',
      avatarUrl: '/assets/avatars/parent-mother-2.svg',
    });
    expect(navSpy).toHaveBeenCalled();
  });

  it('در صورت بروز خطا در سرور، باید پیام خطا در کامپوننت ست شود', async () => {
    vi.spyOn(foodStore, 'saveParentProfileOnboarding').mockResolvedValue({
      success: false,
      message: 'کد ملی قبلاً ثبت شده است.',
    });

    component.fullName.set('علی رضایی');
    await component.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('کد ملی قبلاً ثبت شده است.');
  });

  it('در وضعیت isLoading باید دکمه غیرفعال شده و فقط لودر اسپینر بدون متن نمایش یابد تا از کلیک مکرر جلوگیری شود', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('#btn-submit-parent-profile') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.querySelector('.animate-spin')).toBeTruthy();
    expect(submitBtn.textContent?.trim()).toBe('');
  });
});
