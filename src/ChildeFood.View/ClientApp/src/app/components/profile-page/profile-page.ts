import {DOCUMENT} from '@angular/common';
import {ChangeDetectionStrategy, Component, effect, inject, OnDestroy, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="profile-page-view" class="px-5 pt-3 pb-8 animate-in fade-in duration-200" data-purpose="profile-page">
      
      <!-- Top Bar: Back button & Page Title -->
      <div class="flex items-center mb-5">
        <div class="flex items-center gap-3">
          <button
            id="btn-profile-back"
            type="button"
            (click)="foodStore.goToHome()"
            aria-label="بازگشت به خانه"
            class="w-10 h-10 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-center text-gray-800 shadow-xs hover:bg-gray-50 active:scale-95 transition cursor-pointer">
            <svg class="w-5 h-5 transform rotate-0 text-gray-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <h1 class="text-lg font-black text-[#141517] tracking-tight">
            پروفایل و حساب کاربری
          </h1>
        </div>
      </div>

      <!-- PARENT PROFILE CARD (کارت ساده و شکیل پروفایل والد) -->
      <div
        id="parent-profile-card"
        class="bg-white rounded-[28px] p-6 border border-black/[0.05] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] text-center relative overflow-hidden mb-5">
        
        <!-- Subtle warm glow background -->
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-orange-100/40 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50/40 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col items-center">
          <!-- Profile Avatar Box (باکس پروفایل والد با پشتیبانی از عکس آپلودی) -->
          <div class="w-20 h-20 rounded-3xl bg-[#f7f7f8] border border-black/[0.06] flex items-center justify-center text-4xl shadow-inner relative mb-3 overflow-hidden">
            @if (foodStore.isImageAvatar(foodStore.parentProfile().avatar)) {
              <img [src]="foodStore.parentProfile().avatar" alt="Avatar" class="w-full h-full object-cover" />
            } @else {
              <span>{{ foodStore.parentProfile().avatar }}</span>
            }
            <span class="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-black shadow-2xs z-10">
              ✓
            </span>
          </div>

          <!-- Parent Name (اسم والد) -->
          <h2 class="text-base sm:text-lg font-black text-[#141517] tracking-tight">
            {{ foodStore.parentProfile().name }}
          </h2>

          <!-- Parent Role / Phone Subtitle -->
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-gray-400 font-medium">
              {{ foodStore.parentProfile().phone }}
            </span>
            <span class="text-gray-300">•</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#f97352] border border-orange-200/50">
              {{ foodStore.parentProfile().role }}
            </span>
          </div>
        </div>

      </div>

      <!-- SETTINGS OPTIONS: فقط تنظیمات حساب والد، تنظیمات فرزندان، دو تا تیکه و خروج -->
      <div class="space-y-4">
        
        <div class="bg-white rounded-[26px] p-4 border border-black/[0.05] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div class="divide-y divide-gray-100">
            <!-- 1. تنظیمات حساب والد -->
            <button
              type="button"
              id="btn-parent-account-settings"
              (click)="openEditProfileModal()"
              class="w-full py-3.5 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-xl transition cursor-pointer text-right">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-orange-50 text-[#f97352] flex items-center justify-center text-lg flex-shrink-0">
                  👤
                </div>
                <div>
                  <span class="text-xs font-black text-gray-900 block">تنظیمات حساب والد</span>
                  <span class="text-[10px] text-gray-400 font-medium">ویرایش تصویر پروفایل و اطلاعات کامل</span>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-400 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <!-- 2. تنظیمات فرزندان -->
            <button
              type="button"
              id="btn-children-settings"
              (click)="foodStore.goToChildren()"
              class="w-full py-3.5 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-xl transition cursor-pointer text-right">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg flex-shrink-0">
                  🎒
                </div>
                <div>
                  <span class="text-xs font-black text-gray-900 block">تنظیمات فرزندان</span>
                  <span class="text-[10px] text-gray-400 font-medium">{{ foodStore.children().length }} دانش‌آموز ثبت شده</span>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-400 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <!-- 3. تیکه اول: پیامک تحویل ناهار به بوفه -->
            <div class="py-3.5 px-2 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg flex-shrink-0">
                  📲
                </div>
                <div>
                  <span class="text-xs font-black text-gray-900 block">پیامک تحویل ناهار به بوفه</span>
                  <span class="text-[10px] text-gray-400 font-medium">ارسال اعلان پیامکی لحظه رسیدن غذا</span>
                </div>
              </div>
              <button
                type="button"
                id="toggle-sms-alerts"
                [attr.aria-label]="smsAlerts() ? 'غیرفعال‌سازی پیامک تحویل' : 'فعال‌سازی پیامک تحویل'"
                (click)="toggleSmsAlerts()"
                [class]="
                  smsAlerts()
                    ? 'w-11 h-6 rounded-full bg-[#f97352] p-0.5 transition-colors cursor-pointer relative'
                    : 'w-11 h-6 rounded-full bg-gray-200 p-0.5 transition-colors cursor-pointer relative'
                ">
                <div
                  [class]="
                    smsAlerts()
                      ? 'w-5 h-5 rounded-full bg-white shadow-xs transform -translate-x-5 transition-transform'
                      : 'w-5 h-5 rounded-full bg-white shadow-xs transform translate-x-0 transition-transform'
                  "></div>
              </button>
            </div>

            <!-- 4. تیکه دوم: یادآور رزرو ناهار فردا -->
            <div class="py-3.5 px-2 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg flex-shrink-0">
                  ⏰
                </div>
                <div>
                  <span class="text-xs font-black text-gray-900 block">یادآور رزرو ناهار فردا</span>
                  <span class="text-[10px] text-gray-400 font-medium">ساعت ۲۰:۰۰ برای بررسی منو</span>
                </div>
              </div>
              <button
                type="button"
                id="toggle-daily-reminder"
                [attr.aria-label]="dailyReminder() ? 'غیرفعال‌سازی یادآور' : 'فعال‌سازی یادآور'"
                (click)="toggleDailyReminder()"
                [class]="
                  dailyReminder()
                    ? 'w-11 h-6 rounded-full bg-[#f97352] p-0.5 transition-colors cursor-pointer relative'
                    : 'w-11 h-6 rounded-full bg-gray-200 p-0.5 transition-colors cursor-pointer relative'
                ">
                <div
                  [class]="
                    dailyReminder()
                      ? 'w-5 h-5 rounded-full bg-white shadow-xs transform -translate-x-5 transition-transform'
                      : 'w-5 h-5 rounded-full bg-white shadow-xs transform translate-x-0 transition-transform'
                  "></div>
              </button>
            </div>
          </div>
        </div>

        <!-- LOGOUT SECTION (در نهایت خروج از حساب) -->
        <div class="pt-2">
          <button
            id="btn-profile-logout"
            type="button"
            (click)="showLogoutConfirm.set(true)"
            class="w-full py-3.5 bg-rose-50 hover:bg-rose-100/90 active:scale-98 text-rose-600 font-black text-xs rounded-2xl border border-rose-200/60 flex items-center justify-center gap-2 shadow-xs transition cursor-pointer">
            <svg class="w-4 h-4 text-rose-600 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>خروج از حساب کاربری</span>
          </button>
          <p class="text-[11px] text-gray-400 text-center mt-2 font-medium">
            سامانه سفارش ناهار مدارس • {{ foodStore.parentProfile().name }}
          </p>
        </div>

      </div>

      <!-- EDIT PROFILE FULL BOTTOM-SHEET MODAL (مودال از پایین تا بالای صفحه ۸۸-۹۰ درصد با آپلود عکس و اطلاعات کامل) -->
      @if (showEditProfileModal()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end backdrop-blur-xs overscroll-contain animate-in fade-in duration-200">
          
          <!-- Sheet Panel (ارتفاع ۸۸٪ صفحه با اسکرول مستقل و هدر و فوتر ثابت) -->
          <div
            class="bg-white w-full max-w-lg mx-auto rounded-t-[36px] shadow-2xl flex flex-col h-[88vh] max-h-[90vh] overflow-hidden overscroll-contain transition-transform duration-300 ease-out">
            
            <!-- Top Handle Bar -->
            <div class="pt-3 pb-2 px-6 flex flex-col items-center border-b border-gray-100 flex-shrink-0 bg-white">
              <div class="w-12 h-1.5 bg-gray-300 rounded-full mb-3"></div>
              
              <div class="w-full flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-black text-gray-900 tracking-tight">
                    تنظیمات و اطلاعات حساب والد
                  </h3>
                  <p class="text-[11px] text-gray-400 font-medium mt-0.5">
                    ویرایش مشخصات فردی و تصویر پروفایل
                  </p>
                </div>

                <button
                  type="button"
                  (click)="closeEditProfileModal()"
                  class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-95 transition cursor-pointer">
                  ✕
                </button>
              </div>
            </div>

            <!-- Scrollable Form Body -->
            <div class="flex-1 overflow-y-auto overscroll-contain p-5 space-y-5">
              
              <!-- 1. AVATAR / PROFILE PHOTO UPLOAD SECTION -->
              <div class="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/60 flex flex-col items-center text-center">
                <span class="text-xs font-black text-gray-700 mb-3 block">
                  تصویر پروفایل والد
                </span>

                <!-- Avatar Preview with Camera Overlay -->
                <div class="relative mb-3">
                  <div class="w-24 h-24 rounded-full bg-white border-2 border-[#f97352]/30 shadow-md flex items-center justify-center text-4xl overflow-hidden relative">
                    @if (isUploadingAvatar()) {
                      <svg class="animate-spin h-8 w-8 text-[#f97352]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    } @else if (foodStore.isImageAvatar(tempAvatar())) {
                      <img [src]="tempAvatar()" alt="Parent Avatar" class="w-full h-full object-cover" />
                    } @else {
                      <span>{{ tempAvatar() }}</span>
                    }
                  </div>

                  <!-- Camera Button for Triggering File Input -->
                  <button
                    type="button"
                    (click)="avatarFileInput.click()"
                    [disabled]="isUploadingAvatar()"
                    aria-label="تغییر یا آپلود عکس پروفایل"
                    class="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-[#f97352] text-white flex items-center justify-center shadow-md hover:bg-[#e05432] active:scale-95 transition cursor-pointer border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </button>
                </div>

                <!-- Hidden Native File Input -->
                <input
                  #avatarFileInput
                  type="file"
                  accept="image/*"
                  (change)="onAvatarFileSelected($event)"
                  class="hidden" />

                <!-- Action Buttons: Upload or Reset -->
                <div class="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    (click)="avatarFileInput.click()"
                    [disabled]="isUploadingAvatar()"
                    class="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-[#f97352] text-xs font-bold shadow-2xs hover:bg-orange-50 active:scale-95 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span>{{ isUploadingAvatar() ? 'در حال آپلود عکس...' : 'آپلود عکس از گوشی / سیستم' }}</span>
                  </button>

                  @if (foodStore.isImageAvatar(tempAvatar())) {
                    <button
                      type="button"
                      (click)="tempAvatar.set('/assets/avatars/parent-mother-1.svg')"
                      class="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-rose-600 text-xs font-bold hover:bg-rose-50 active:scale-95 transition cursor-pointer">
                      حذف عکس
                    </button>
                  }
                </div>

                <!-- Quick Avatar Presets: SVG & Classic -->
                <div class="w-full pt-2 border-t border-gray-200/50">
                  <span class="text-[10px] text-gray-400 font-bold block mb-1.5">یا انتخاب از وکتورهای اختصاصی والد:</span>
                  <div class="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
                    @for (preset of avatarSvgPresets; track preset.url) {
                      <button
                        type="button"
                        (click)="tempAvatar.set(preset.url)"
                        [class]="
                          tempAvatar() === preset.url
                            ? 'w-11 h-11 rounded-2xl bg-orange-50 border-2 border-[#f97352] p-1 flex items-center justify-center shadow-xs transition transform scale-110 cursor-pointer overflow-hidden'
                            : 'w-11 h-11 rounded-2xl bg-white border border-gray-200 p-1 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition cursor-pointer overflow-hidden'
                        ">
                        <img [src]="preset.url" [alt]="preset.title" class="w-full h-full object-cover" />
                      </button>
                    }
                  </div>
                </div>

              </div>

              <!-- 2. FULL PROFILE FORM FIELDS -->
              <div class="space-y-4">
                
                <!-- Full Name -->
                <div>
                  <label for="profile-edit-name" class="text-xs font-black text-gray-700 block mb-1.5">
                    نام و نام خانوادگی والد <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="profile-edit-name"
                    type="text"
                    [value]="tempName()"
                    (input)="tempName.set($any($event.target).value)"
                    placeholder="مثال: سارا احمدی"
                    class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#f97352] focus:bg-white transition" />
                </div>

                <!-- Phone Number -->
                <div>
                  <label for="profile-edit-phone" class="text-xs font-black text-gray-700 block mb-1.5">
                    شماره تلفن همراه (جهت پیامک ناهار) <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="profile-edit-phone"
                    type="tel"
                    dir="ltr"
                    [value]="tempPhone()"
                    (input)="tempPhone.set($any($event.target).value)"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#f97352] focus:bg-white text-left transition font-mono" />
                </div>

                <!-- Role Selector (نسبت با دانش‌آموز) -->
                <div>
                  <span class="text-xs font-black text-gray-700 block mb-1.5">
                    نسبت با دانش‌آموزان
                  </span>
                  <div class="grid grid-cols-3 gap-2">
                    @for (roleItem of rolesList; track roleItem) {
                      <button
                        type="button"
                        (click)="tempRole.set(roleItem)"
                        [class]="
                          tempRole() === roleItem
                            ? 'py-2.5 rounded-xl bg-[#141517] text-white text-xs font-black shadow-xs transition cursor-pointer'
                            : 'py-2.5 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold hover:bg-gray-100 transition cursor-pointer'
                        ">
                        {{ roleItem }}
                      </button>
                    }
                  </div>
                </div>

                <!-- National ID -->
                <div>
                  <label for="profile-edit-national-id" class="text-xs font-black text-gray-700 block mb-1.5">
                    کد ملی سرپرست (جهت احراز هویت در سامانه مدارس)
                  </label>
                  <input
                    id="profile-edit-national-id"
                    type="text"
                    dir="ltr"
                    [value]="tempNationalId()"
                    (input)="tempNationalId.set($any($event.target).value)"
                    placeholder="مثال: ۰۰۱۴۸۲۹۵۱۳"
                    class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#f97352] focus:bg-white text-left transition font-mono" />
                </div>

                <!-- Email Address -->
                <div>
                  <label for="profile-edit-email" class="text-xs font-black text-gray-700 block mb-1.5">
                    آدرس ایمیل (اختیاری جهت ارسال صورتحساب و فاکتور)
                  </label>
                  <input
                    id="profile-edit-email"
                    type="email"
                    dir="ltr"
                    [value]="tempEmail()"
                    (input)="tempEmail.set($any($event.target).value)"
                    placeholder="sara.ahmadi@gmail.com"
                    class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#f97352] focus:bg-white text-left transition" />
                </div>

                <!-- Info Notice -->
                <div class="p-3 rounded-2xl bg-orange-50/70 border border-orange-200/50 flex items-start gap-2.5">
                  <span class="text-base leading-none">💡</span>
                  <p class="text-[11px] text-gray-600 font-medium leading-relaxed">
                    این اطلاعات برای پیگیری وضعیت ناهار گرم، ارسال پیامک تایید تحویل در بوفه و هماهنگی با کادر تغذیه مدارس استفاده خواهد شد.
                  </p>
                </div>

              </div>

            </div>

            <!-- Fixed Bottom Action Bar -->
            <div class="p-4 bg-white border-t border-gray-100 flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                (click)="closeEditProfileModal()"
                class="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-700 text-xs font-black rounded-2xl transition cursor-pointer">
                انصراف
              </button>

              <button
                type="button"
                id="btn-save-parent-profile"
                [disabled]="isSavingProfile() || isUploadingAvatar()"
                (click)="handleSaveFullProfile()"
                class="flex-[2] py-3.5 bg-[#f97352] hover:bg-[#e05432] active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none text-white text-xs font-black rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center transition cursor-pointer">
                @if (isSavingProfile()) {
                  <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                } @else {
                  <div class="flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>ذخیره تغییرات حساب</span>
                  </div>
                }
              </button>
            </div>

          </div>
        </div>
      }

      <!-- LOGOUT CONFIRMATION MODAL -->
      @if (showLogoutConfirm()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div class="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-gray-100 text-center">
            <div class="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-2xl mx-auto mb-3">
              🚪
            </div>
            <h3 class="text-sm font-black text-gray-900">خروج از حساب کاربری</h3>
            <p class="text-xs text-gray-500 font-medium mt-1 mb-5">
              آیا از خروج از حساب کاربری {{ foodStore.parentProfile().name }} اطمینان دارید؟ برای سفارش مجدد ناهار باید مجدداً وارد شوید.
            </p>

            <div class="flex gap-2.5">
              <button
                type="button"
                (click)="showLogoutConfirm.set(false)"
                class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 text-xs font-black rounded-xl transition cursor-pointer">
                انصراف
              </button>
              <button
                type="button"
                (click)="handleConfirmLogout()"
                class="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer">
                بله، خروج
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Toast Feedback Message -->
      @if (toastMessage()) {
        <div class="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[#141517] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg z-50 animate-in fade-in duration-150 flex items-center gap-2">
          <span>✓</span>
          <span>{{ toastMessage() }}</span>
        </div>
      }

    </div>
  `,
})
export class ProfilePage implements OnDestroy {
  readonly foodStore = inject(FoodStore);
  private readonly document = inject(DOCUMENT);

  readonly smsAlerts = signal<boolean>(true);
  readonly dailyReminder = signal<boolean>(true);
  readonly showEditProfileModal = signal<boolean>(false);
  readonly showLogoutConfirm = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // Editable temporary signals for modal
  readonly tempName = signal<string>('');
  readonly tempPhone = signal<string>('');
  readonly tempRole = signal<string>('مادر');
  readonly tempNationalId = signal<string>('');
  readonly tempEmail = signal<string>('');
  readonly tempAvatar = signal<string>('👩‍💼');

  readonly isUploadingAvatar = signal<boolean>(false);
  readonly isSavingProfile = signal<boolean>(false);

  readonly avatarSvgPresets = [
    { url: '/assets/avatars/parent-mother-1.svg', title: 'مادر با مقنعه' },
    { url: '/assets/avatars/parent-father-1.svg', title: 'پدر رسمی' },
    { url: '/assets/avatars/parent-mother-2.svg', title: 'مادر شاد' },
    { url: '/assets/avatars/parent-father-2.svg', title: 'پدر پرانرژی' },
    { url: '/assets/avatars/parent-mother-3.svg', title: 'مادر مدرن' },
    { url: '/assets/avatars/parent-father-3.svg', title: 'پدر کت و شلواری' },
  ];

  readonly avatarPresets = ['👩‍💼', '👨‍💼', '👩', '👨', '🧑‍💼', '🧕', '🧑‍🏫', '🎒'];
  readonly rolesList = ['مادر', 'پدر', 'سرپرست قانونی'];

  constructor() {
    // Lock body scroll when any modal is open
    effect(() => {
      const isAnyModalOpen = this.showEditProfileModal() || this.showLogoutConfirm();
      if (typeof window !== 'undefined') {
        if (isAnyModalOpen) {
          this.document.body.style.overflow = 'hidden';
          this.document.body.style.touchAction = 'none';
        } else {
          this.document.body.style.overflow = '';
          this.document.body.style.touchAction = '';
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      this.document.body.style.overflow = '';
      this.document.body.style.touchAction = '';
    }
  }

  openEditProfileModal(): void {
    const p = this.foodStore.parentProfile();
    this.tempName.set(p.name);
    this.tempPhone.set(p.phone);
    this.tempRole.set(p.role || 'مادر');
    this.tempNationalId.set(p.nationalId || '۰۰۱۴۸۲۹۵۱۳');
    this.tempEmail.set(p.email || 'sara.ahmadi@gmail.com');
    this.tempAvatar.set(p.avatar || '👩‍💼');
    this.showEditProfileModal.set(true);
  }

  closeEditProfileModal(): void {
    this.showEditProfileModal.set(false);
  }

  async onAvatarFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.showToast('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.');
      input.value = '';
      return;
    }

    this.isUploadingAvatar.set(true);
    this.showToast('در حال بارگذاری عکس روی سرور...');

    try {
      const res = await this.foodStore.uploadAvatar(file);
      if (res.success && res.url) {
        this.tempAvatar.set(res.url);
        this.showToast('تصویر پروفایل با موفقیت آپلود شد.');
      } else {
        this.showToast(res.message || 'خطا در بارگذاری عکس.');
      }
    } catch {
      this.showToast('خطا در ارتباط با سرور برای آپلود تصویر.');
    } finally {
      this.isUploadingAvatar.set(false);
      input.value = '';
    }
  }

  async handleSaveFullProfile(): Promise<void> {
    const name = this.tempName().trim();
    if (!name) {
      this.showToast('لطفاً نام و نام خانوادگی را وارد کنید');
      return;
    }

    const phone = this.tempPhone().trim();
    if (!phone) {
      this.showToast('لطفاً شماره تلفن همراه را وارد کنید');
      return;
    }

    this.isSavingProfile.set(true);

    try {
      const res = await this.foodStore.saveParentProfile({
        fullName: name,
        roleTitle: this.tempRole(),
        nationalId: this.tempNationalId().trim(),
        address: this.foodStore.parentProfile().address,
        avatarUrl: this.tempAvatar(),
      });

      if (res.success) {
        this.showEditProfileModal.set(false);
        this.showToast('مشخصات حساب کاربری با موفقیت در سرور ذخیره شد.');
      } else {
        this.showToast(res.message || 'خطا در ذخیره مشخصات در سرور.');
      }
    } catch {
      this.showToast('خطا در برقراری ارتباط با سرور.');
    } finally {
      this.isSavingProfile.set(false);
    }
  }

  toggleSmsAlerts(): void {
    this.smsAlerts.update((v) => !v);
  }

  toggleDailyReminder(): void {
    this.dailyReminder.update((v) => !v);
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 2500);
  }

  handleConfirmLogout(): void {
    this.showLogoutConfirm.set(false);
    this.showToast('با موفقیت از حساب کاربری خارج شدید.');
    setTimeout(() => {
      this.foodStore.logout();
    }, 800);
  }
}

