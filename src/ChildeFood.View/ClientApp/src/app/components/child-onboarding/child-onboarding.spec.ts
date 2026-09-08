import {ComponentFixture, TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {ChildOnboarding} from './child-onboarding';
import {FoodStore} from '../../services/food-store';

describe('ChildOnboarding Component — تست صفحه ثبت اولین فرزند دانش‌آموز', () => {
  let component: ChildOnboarding;
  let fixture: ComponentFixture<ChildOnboarding>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildOnboarding],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(ChildOnboarding);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);
    foodStore.schools.set([
      { id: 'sch-1', name: 'دبستان دخترانه فرزانگان (شعبه ۱)', branchCode: 'SCH-FARZ-01', address: 'تهران، شهرک غرب', defaultLunchTime: '12:30', isActive: true },
      { id: 'sch-2', name: 'مجموعه مدارس مفید (پسرانه)', branchCode: 'SCH-MOFID-02', address: 'تهران، یادگار امام', defaultLunchTime: '12:15', isActive: true },
    ]);
    fixture.detectChanges();
  });

  it('باید کامپوننت ثبت اولین فرزند با موفقیت ایجاد شود', () => {
    expect(component).toBeTruthy();
  });

  it('باید فیلدهای نام فرزند، سلکت‌باکس مدرسه، دکمه آپلود و گزینه‌های SVG کودک رندر شوند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nameInput = compiled.querySelector('#input-child-name') as HTMLInputElement;
    const schoolTrigger = compiled.querySelector('#school-select-trigger');
    const submitBtn = compiled.querySelector('#btn-submit-child-profile');
    const uploadBtn = compiled.querySelector('#btn-upload-child-avatar');

    expect(nameInput).toBeTruthy();
    expect(schoolTrigger).toBeTruthy();
    expect(submitBtn).toBeTruthy();
    expect(uploadBtn).toBeTruthy();
    expect(component.childAvatarOptions.length).toBe(8);
    expect(compiled.textContent).toContain('فرزندت در کدام مدرسه درس می‌خواند؟');
    expect(compiled.textContent).toContain('مرحله ۲ از ۲');
  });

  it('کلیک روی دکمه بازگشت باید متد goToParentOnboarding را صدا بزند', () => {
    const navSpy = vi.spyOn(foodStore, 'goToParentOnboarding');
    const backBtn = fixture.nativeElement.querySelector('#btn-back-to-parent-profile') as HTMLButtonElement;
    expect(backBtn).toBeTruthy();

    backBtn.click();
    expect(navSpy).toHaveBeenCalled();
  });

  it('کلیک روی سلکت‌باکس مدرسه باید منوی کشویی مدارس را باز کند و انتخاب مدرسه مقدار را آپدیت نماید', () => {
    const trigger = fixture.nativeElement.querySelector('#school-select-trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(component.isSchoolDropdownOpen()).toBe(true);

    const schoolToSelect = foodStore.schools()[1];
    component.selectSchool(schoolToSelect);
    fixture.detectChanges();

    expect(component.selectedSchoolId()).toBe('sch-2');
    expect(component.selectedSchoolName()).toBe('مجموعه مدارس مفید (پسرانه)');
    expect(component.isSchoolDropdownOpen()).toBe(false);
  });

  it('در هنگام انتخاب فایل عکس کودک، باید متد uploadAvatar استور صدا زده شده و تصویر ست شود', async () => {
    const uploadSpy = vi.spyOn(foodStore, 'uploadAvatar').mockResolvedValue({
      success: true,
      url: '/uploads/avatars/child-custom.jpg',
      message: 'عکس ذخیره شد',
    });

    const fakeFile = new File(['child-image'], 'child.jpg', {type: 'image/jpeg'});
    const event = {
      target: {
        files: [fakeFile],
        value: 'C:\\fake\\child.jpg',
      },
    } as unknown as Event;

    await component.handleFileSelect(event);
    fixture.detectChanges();

    expect(uploadSpy).toHaveBeenCalledWith(fakeFile);
    expect(component.selectedAvatar()).toBe('/uploads/avatars/child-custom.jpg');
    expect(component.uploadedCustomAvatar()).toBe('/uploads/avatars/child-custom.jpg');
  });

  it('در صورت خالی بودن نام فرزند باید خطای اعتبارسنجی فارسی نمایش داده شود', async () => {
    component.fullName.set('');
    component.selectedSchoolName.set('مجموعه مدارس مفید (پسرانه)');
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('نام و نام خانوادگی فرزند را وارد کنید');
  });

  it('در صورت خالی بودن نام مدرسه باید خطای اعتبارسنجی فارسی نمایش داده شود', async () => {
    component.fullName.set('کیان رضایی');
    component.selectedSchoolName.set('');
    component.customSchoolName.set('');
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('مدرسه محل تحصیل فرزند را از لیست انتخاب کنید');
  });

  it('با پر کردن مقادیر معتبر و ثبت موفق، باید استور صدا زده شده و کاربر به صفحه اصلی هدایت شود', async () => {
    const saveSpy = vi.spyOn(foodStore, 'saveChildOnboarding').mockResolvedValue({
      success: true,
    });
    const homeSpy = vi.spyOn(foodStore, 'goToHome');

    component.fullName.set('کیان رضایی');
    component.age.set(8);
    component.grade.set('پایه دوم ابتدایی');
    component.selectedSchoolId.set('sch-1');
    component.selectedSchoolName.set('دبستان دخترانه فرزانگان (شعبه ۱)');
    component.dietaryNotes.set('حساسیت به گوجه‌فرنگی');
    component.selectedAvatar.set('/assets/avatars/child-boy-glasses.svg');

    await component.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(saveSpy).toHaveBeenCalledWith({
      fullName: 'کیان رضایی',
      age: 8,
      grade: 'پایه دوم ابتدایی',
      schoolName: 'دبستان دخترانه فرزانگان (شعبه ۱)',
      schoolId: 'sch-1',
      dietaryNotes: 'حساسیت به گوجه‌فرنگی',
      avatarUrl: '/assets/avatars/child-boy-glasses.svg',
    });
    expect(homeSpy).toHaveBeenCalled();
  });

  it('در صورت بازگشت خطای سرور، متن خطا در صفحه نمایش داده می‌شود', async () => {
    vi.spyOn(foodStore, 'saveChildOnboarding').mockResolvedValue({
      success: false,
      message: 'ثبت فرزند با خطا مواجه شد.',
    });

    component.fullName.set('کیان رضایی');
    component.selectedSchoolName.set('دبستان فرهنگ');
    await component.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('ثبت فرزند با خطا مواجه شد.');
  });

  it('دکمه ثبت فرزند نباید هیچ آیکون یا ایموجی اضافی (مثل بنتو) داشته باشد', () => {
    const submitBtn = fixture.nativeElement.querySelector('#btn-submit-child-profile') as HTMLButtonElement;
    expect(submitBtn.textContent).toContain('ثبت فرزند و ورود به برنامه');
    expect(submitBtn.textContent).not.toContain('🍱');
  });

  it('در وضعیت isLoading باید دکمه غیرفعال شده و فقط اسپینر بدون هیچ متنی نمایش یابد تا از کلیک چندباره جلوگیری شود', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('#btn-submit-child-profile') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.querySelector('.animate-spin')).toBeTruthy();
    expect(submitBtn.textContent?.trim()).toBe('');
  });
});
