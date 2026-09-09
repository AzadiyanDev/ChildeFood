import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {vi} from 'vitest';
import {ProfilePage} from './profile-page';
import {FoodStore} from '../../services/food-store';

describe('ProfilePage Component — تست صفحه تنظیمات پروفایل والد و آپلود تصویر', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [FoodStore, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);

    foodStore.parentProfile.set({
      name: 'علیرضا اسماعیلی',
      role: 'پدر',
      phone: '09179898057',
      avatar: '/uploads/avatars/avatar_test.png',
      walletBalance: 300000,
      activeChildrenCount: 1,
      nationalId: '5130120604',
      email: 'alireza@test.com',
      address: 'تهران، نیاوران',
      notes: '',
    });

    fixture.detectChanges();
  });

  it('باید کامپوننت پروفایل با موفقیت ساخته شده و نام و تلفن نمایش یابند', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('علیرضا اسماعیلی');
    expect(compiled.textContent).toContain('09179898057');
  });

  it('اگر تصویر پروفایل از نوع عکس آپلود شده باشد، تگ img برای آن رندر می‌شود', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const avatarImg = compiled.querySelector('#parent-profile-card img') as HTMLImageElement;
    expect(avatarImg).toBeTruthy();
    expect(avatarImg.src).toContain('/uploads/avatars/avatar_test.png');
  });

  it('کلیک روی تنظیمات حساب والد باید مدال ویرایش را باز کند و مقادیر اولیه را ست نماید', () => {
    component.openEditProfileModal();
    fixture.detectChanges();

    expect(component.showEditProfileModal()).toBe(true);
    expect(component.tempName()).toBe('علیرضا اسماعیلی');
    expect(component.tempPhone()).toBe('09179898057');
    expect(component.tempAvatar()).toBe('/uploads/avatars/avatar_test.png');
  });

  it('در هنگام انتخاب فایل عکس جدید، متد uploadAvatar استور فراخوانی شده و آدرس جدید در فرم ست می‌شود', async () => {
    const uploadSpy = vi.spyOn(foodStore, 'uploadAvatar').mockResolvedValue({
      success: true,
      url: '/uploads/avatars/avatar_new_saved.png',
      message: 'آپلود با موفقیت انجام شد',
    });

    const fakeFile = new File(['dummy-bytes'], 'new-avatar.png', {type: 'image/png'});
    const event = {
      target: {
        files: [fakeFile],
        value: 'C:\\fake\\new-avatar.png',
      },
    } as unknown as Event;

    await component.onAvatarFileSelected(event);
    fixture.detectChanges();

    expect(uploadSpy).toHaveBeenCalledWith(fakeFile);
    expect(component.tempAvatar()).toBe('/uploads/avatars/avatar_new_saved.png');
    expect(component.toastMessage()).toContain('با موفقیت آپلود شد');
  });

  it('با زدن دکمه ذخیره تغییرات، متد saveParentProfile استور صدا زده شده و مدال بسته می‌شود', async () => {
    const saveSpy = vi.spyOn(foodStore, 'saveParentProfile').mockResolvedValue({
      success: true,
    });

    component.openEditProfileModal();
    component.tempName.set('علیرضا رضایی');
    component.tempRole.set('پدر');
    component.tempAvatar.set('/uploads/avatars/avatar_new_saved.png');

    await component.handleSaveFullProfile();
    fixture.detectChanges();

    expect(saveSpy).toHaveBeenCalledWith({
      fullName: 'علیرضا رضایی',
      roleTitle: 'پدر',
      nationalId: '5130120604',
      address: 'تهران، نیاوران',
      avatarUrl: '/uploads/avatars/avatar_new_saved.png',
    });
    expect(component.showEditProfileModal()).toBe(false);
  });

  it('در وضعیت ارسال به سرور (isSavingProfile)، دکمه ذخیره باید غیرفعال شده و فقط لودر اسپینر بدون متن نشان داده شود', () => {
    component.openEditProfileModal();
    component.isSavingProfile.set(true);
    fixture.detectChanges();

    const saveBtn = fixture.nativeElement.querySelector('#btn-save-parent-profile') as HTMLButtonElement;
    expect(saveBtn).toBeTruthy();
    expect(saveBtn.disabled).toBe(true);
    expect(saveBtn.querySelector('.animate-spin')).toBeTruthy();
    expect(saveBtn.textContent?.trim()).toBe('');
  });
});
