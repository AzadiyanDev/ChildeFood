import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="profile-page-view" class="px-5 pt-3 pb-8 animate-in fade-in duration-200" data-purpose="profile-page">
      
      <!-- Top Bar: Back button & Page Title -->
      <div class="flex items-center justify-between mb-5">
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
          <div>
            <h1 class="text-lg font-black text-[#141517] tracking-tight">
              پروفایل و حساب کاربری
            </h1>
            <p class="text-xs text-gray-400 font-medium mt-0.5">
              مشخصات والد و تنظیمات سامانه
            </p>
          </div>
        </div>

        <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1.5 shadow-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>حساب فعال</span>
        </span>
      </div>

      <!-- TOP WALLET SECTION (بخش بالایی ولت) -->
      <div
        id="profile-wallet-card"
        class="bg-[#141517] text-white rounded-[28px] p-6 shadow-xl shadow-black/10 border border-white/10 relative overflow-hidden">
        
        <!-- Ambient warm glow -->
        <div class="absolute -top-20 -left-20 w-52 h-52 bg-[#f97352]/25 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Card Header: Title, Chip & Parent Avatar -->
        <div class="flex items-center justify-between relative z-10">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shadow-inner backdrop-blur-xs flex-shrink-0">
              {{ foodStore.parentProfile().avatar }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-black text-white block">
                  {{ foodStore.parentProfile().name }}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-orange-200 border border-white/15">
                  {{ foodStore.parentProfile().role }}
                </span>
              </div>
              <span class="text-[11px] text-gray-400 font-medium mt-0.5 block">
                {{ foodStore.parentProfile().phone }}
              </span>
            </div>
          </div>

          <!-- NFC / Chip symbol -->
          <div class="w-9 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-orange-200/80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.5 10.5C3.67 10.5 3 11.17 3 12s.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-15z"/>
            </svg>
          </div>
        </div>

        <!-- Balance Section -->
        <div class="mt-6 relative z-10">
          <span class="text-xs text-gray-400 font-medium block">
            موجودی قابل استفاده کیف پول
          </span>
          <div class="flex items-baseline gap-2 mt-1">
            <span id="profile-wallet-balance-display" class="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {{ foodStore.parentProfile().walletBalance.toLocaleString('fa-IR') }}
            </span>
            <span class="text-sm font-bold text-[#f97352]">
              تومان
            </span>
          </div>
        </div>

        <!-- Account Identifier & Connected Students -->
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 relative z-10">
          <span class="font-mono tracking-wider text-[11px] text-gray-300">
            IR-5820 • 4910 • 3820
          </span>
          <span class="text-[11px] text-gray-400">
            متصل به {{ foodStore.children().length }} دانش‌آموز
          </span>
        </div>

        <!-- Action Button inside Card: Instant Recharge -->
        <div class="mt-5 relative z-10 flex gap-2.5">
          <button
            id="btn-profile-recharge"
            type="button"
            (click)="foodStore.isWalletDrawerOpen.set(true)"
            class="flex-1 py-3.5 bg-[#f97352] hover:bg-[#e05432] active:scale-98 text-white font-black text-xs rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>شارژ آنی کیف پول</span>
          </button>
          
          <button
            id="btn-profile-wallet-details"
            type="button"
            (click)="foodStore.goToWallet()"
            class="px-4 py-3.5 bg-white/10 hover:bg-white/15 active:scale-98 text-white font-bold text-xs rounded-2xl border border-white/15 flex items-center justify-center transition cursor-pointer">
            <span>گردش حساب</span>
          </button>
        </div>

      </div>

      <!-- LOWER SECTION: SETTINGS OPTIONS (چند تا گزینه تنظیماتی و در نهایت لاگ‌اوت) -->
      <div class="mt-6 space-y-4">
        
        <!-- Group 1: General & Preferences -->
        <div class="bg-white rounded-[26px] p-4 border border-black/[0.05] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <h2 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5 px-2">
            تنظیمات حساب و فرزندان
          </h2>

          <div class="divide-y divide-gray-100">
            <!-- 1. Edit Profile Info -->
            <button
              type="button"
              (click)="showEditProfileModal.set(true)"
              class="w-full py-3 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-xl transition cursor-pointer text-right">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-orange-50 text-[#f97352] flex items-center justify-center text-lg flex-shrink-0">
                  👤
                </div>
                <div>
                  <span class="text-xs font-black text-gray-900 block">ویرایش مشخصات والد</span>
                  <span class="text-[10px] text-gray-400 font-medium">نام، شماره تماس و کد ملی</span>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-400 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <!-- 2. Manage Children & Schools -->
            <button
              type="button"
              (click)="foodStore.goToChildren()"
              class="w-full py-3 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-xl transition cursor-pointer text-right">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg flex-shrink-0">
                  🎒
                </div>
                <div>
                  <span class="text-xs font-black text-gray-900 block">مدیریت فرزندان و مدارس</span>
                  <span class="text-[10px] text-gray-400 font-medium">{{ foodStore.children().length }} دانش‌آموز ثبت شده در سامانه</span>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-400 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <!-- 3. SMS Delivery Alerts (Toggle) -->
            <div class="py-3 px-2 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg flex-shrink-0">
                  📲
                </div>
                <div>
                  <span class="text-xs font-black text-gray-900 block">پیامک تحویل ناهار به بوفه</span>
                  <span class="text-[10px] text-gray-400 font-medium">ارسال اعلان پیامکی لحظه رسیدن غذا</span>
                </div>
              </div>
              <button
                type="button"
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

            <!-- 4. Evening Reminder for next day lunch (Toggle) -->
            <div class="py-3 px-2 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg flex-shrink-0">
                  ⏰
                </div>
                <div>
                  <span class="text-xs font-black text-gray-900 block">یادآور رزرو ناهار فردا</span>
                  <span class="text-[10px] text-gray-400 font-medium">ساعت ۲۰:۰۰ شب برای بررسی منو</span>
                </div>
              </div>
              <button
                type="button"
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

        <!-- Group 2: Security & Support -->
        <div class="bg-white rounded-[26px] p-4 border border-black/[0.05] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <h2 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5 px-2">
            امنیت و ارتباط با پشتیبانی
          </h2>

          <div class="divide-y divide-gray-100">
            <!-- Security & Password -->
            <button
              type="button"
              (click)="showToast('تنظیمات امنیتی حساب در وضعیت فعال و امن قرار دارد.')"
              class="w-full py-3 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-xl transition cursor-pointer text-right">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg flex-shrink-0">
                  🔒
                </div>
                <div>
                  <span class="text-xs font-black text-gray-900 block">امنیت و ورود دوعاملی</span>
                  <span class="text-[10px] text-gray-400 font-medium">رمز یکبار مصرف و تایید شماره تماس</span>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-400 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <!-- Support & Hotline -->
            <button
              type="button"
              (click)="showSupportModal.set(true)"
              class="w-full py-3 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-xl transition cursor-pointer text-right">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg flex-shrink-0">
                  📞
                </div>
                <div>
                  <span class="text-xs font-black text-gray-900 block">پشتیبانی و ارتباط با کیترینگ مدارس</span>
                  <span class="text-[10px] text-gray-400 font-medium">پاسخگویی در ساعات توزیع غذا در مدارس</span>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-400 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <!-- Terms & Privacy -->
            <button
              type="button"
              (click)="showToast('نسخه سامانه تغذیه مدارس: v2.4.0 - تمامی حقوق محفوظ است.')"
              class="w-full py-3 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-xl transition cursor-pointer text-right">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center text-lg flex-shrink-0">
                  📄
                </div>
                <div>
                  <span class="text-xs font-black text-gray-900 block">قوانین و استانداردهای بهداشتی</span>
                  <span class="text-[10px] text-gray-400 font-medium">گواهی سلامت غذا و رعایت زنجیره سرد و گرم</span>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-400 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        <!-- LOGOUT SECTION (در نهایت لاگ‌اوت) -->
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
            نسخه سامانه ناهار گرم مدارس ۲.۴.۰ • ورود به عنوان سارا احمدی
          </p>
        </div>

      </div>

      <!-- EDIT PROFILE MODAL -->
      @if (showEditProfileModal()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div class="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-gray-100">
            <div class="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 class="text-xs font-black text-gray-900">ویرایش مشخصات والد</h3>
              <button
                type="button"
                (click)="showEditProfileModal.set(false)"
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer">
                ✕
              </button>
            </div>

            <div class="my-4 space-y-3">
              <div>
                <label for="profile-edit-name" class="text-[11px] font-bold text-gray-600 block mb-1">نام و نام خانوادگی</label>
                <input
                  #nameField
                  id="profile-edit-name"
                  type="text"
                  [value]="foodStore.parentProfile().name"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#f97352]" />
              </div>

              <div>
                <label for="profile-edit-phone" class="text-[11px] font-bold text-gray-600 block mb-1">شماره تلفن همراه</label>
                <input
                  #phoneField
                  id="profile-edit-phone"
                  type="tel"
                  dir="ltr"
                  [value]="foodStore.parentProfile().phone"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#f97352] text-left" />
              </div>
            </div>

            <button
              type="button"
              (click)="handleSaveProfile(nameField.value, phoneField.value)"
              class="w-full py-3 bg-[#f97352] text-white text-xs font-black rounded-xl hover:bg-[#e05432] active:scale-95 transition cursor-pointer">
              ذخیره تغییرات
            </button>
          </div>
        </div>
      }

      <!-- SUPPORT CONTACT MODAL -->
      @if (showSupportModal()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div class="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-gray-100">
            <div class="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 class="text-xs font-black text-gray-900">پشتیبانی ناهار مدارس</h3>
              <button
                type="button"
                (click)="showSupportModal.set(false)"
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer">
                ✕
              </button>
            </div>

            <div class="my-4 space-y-3">
              <div class="p-3 bg-teal-50 rounded-2xl border border-teal-200/50">
                <span class="text-xs font-black text-teal-800 block">مرکز ارتباط کیترینگ مدارس</span>
                <span class="text-xs text-teal-600 font-mono mt-1 block">۰۲۱-۸۸۸۸۴۵۶۷</span>
                <span class="text-[10px] text-teal-500 mt-1 block">پاسخگویی از ۷:۳۰ صبح تا ۱۵:۰۰ عصر</span>
              </div>
              <div class="p-3 bg-gray-50 rounded-2xl border border-gray-200/50">
                <span class="text-xs font-black text-gray-800 block">پشتیبانی آنلاین ایتا و شاد</span>
                <span class="text-xs text-gray-600 font-mono mt-1 block">&#64;Madrese_Lunch_Support</span>
              </div>
            </div>

            <button
              type="button"
              (click)="showSupportModal.set(false)"
              class="w-full py-3 bg-[#141517] text-white text-xs font-black rounded-xl hover:bg-black active:scale-95 transition cursor-pointer">
              بستن
            </button>
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
              آیا از خروج از حساب کاربری سارا احمدی اطمینان دارید؟ برای سفارش مجدد ناهار باید مجدداً وارد شوید.
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
export class ProfilePage {
  readonly foodStore = inject(FoodStore);

  readonly smsAlerts = signal<boolean>(true);
  readonly dailyReminder = signal<boolean>(true);
  readonly showEditProfileModal = signal<boolean>(false);
  readonly showSupportModal = signal<boolean>(false);
  readonly showLogoutConfirm = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

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

  handleSaveProfile(name: string, phone: string): void {
    if (!name.trim()) return;
    this.foodStore.parentProfile.update(profile => ({
      ...profile,
      name: name.trim(),
      phone: phone.trim() || profile.phone,
    }));
    this.showEditProfileModal.set(false);
    this.showToast('مشخصات حساب کاربری با موفقیت به‌روزرسانی شد.');
  }

  handleConfirmLogout(): void {
    this.showLogoutConfirm.set(false);
    this.showToast('با موفقیت از حساب کاربری خارج شدید.');
    setTimeout(() => {
      this.foodStore.goToHome();
    }, 1000);
  }
}
