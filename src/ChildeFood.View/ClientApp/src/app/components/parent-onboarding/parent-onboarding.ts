import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';

export interface ParentAvatarOption {
  id: string;
  name: string;
  url: string;
}

// کامپوننت گام اول آنبوردینگ: تکمیل اطلاعات سرپرست
// اینجا کاربر می‌تونه از بین ۶ تا SVG شیک و اختصاصی والدین انتخاب کنه یا عکس دلخواه خودشو آپلود کنه
@Component({
  selector: 'app-parent-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="parent-onboarding-view" class="px-5 pt-8 pb-16 select-none animate-in fade-in duration-300 min-h-screen flex flex-col justify-between" data-purpose="parent-onboarding-page">
      
      <div>
        <!-- ۱. سربرگ و نشانگر مرحله ۱ از ۲ -->
        <header class="mb-6 relative">
          <!-- هاله نوری ملایم پشت هدر -->
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-100/40 rounded-full blur-3xl pointer-events-none"></div>

          <div class="flex items-center justify-between mb-4 relative z-10">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF6B3D] border border-orange-200/60 text-[11px] font-black">
              <span>👤</span>
              <span>مرحله ۱ از ۲: مشخصات سرپرست</span>
            </span>

            <span class="text-xs font-bold text-gray-400 font-mono">
              ۵۰٪ تکمیل شده
            </span>
          </div>

          <h1 class="text-2xl font-black text-[#141517] tracking-tight leading-tight">
            تکمیل اطلاعات حساب والد
          </h1>
          <p class="text-xs text-gray-500 font-medium mt-1.5 leading-relaxed">
            جهت صدور کارت غذا، تحویل روزانه در بوفه مدرسه و اطلاع‌رسانی پیامکی، اطلاعاتت را تکمیل کن.
          </p>
        </header>

        <!-- ۲. کارت فرم مشخصات والد -->
        <main class="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] relative space-y-5">
          
          <!-- انتخاب آواتار یا آپلود چهره سرپرست -->
          <div class="bg-[#f8f9fa] rounded-2xl p-4 border border-gray-200/70 text-center">
            <span class="text-xs font-black text-gray-700 mb-2.5 block">
              انتخاب نمایه کاربری شما
            </span>

            <!-- کادر بزرگ پیش‌نمایش تصویر انتخابی با هاله پرتقالی -->
            <div class="w-20 h-20 mx-auto rounded-3xl bg-white border-2 border-[#FF6B3D]/40 shadow-md flex items-center justify-center mb-3.5 relative overflow-hidden p-1 transition-transform">
              @if (isUploadingAvatar()) {
                <div class="flex flex-col items-center justify-center gap-1 text-[#FF6B3D]">
                  <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-[9px] font-black">در حال آپلود...</span>
                </div>
              } @else if (isImageUrl(selectedAvatar())) {
                <img
                  [src]="selectedAvatar()"
                  alt="نمایه کاربری سرپرست"
                  class="w-full h-full object-cover rounded-2xl shadow-inner" />
              } @else {
                <span class="text-4xl">{{ selectedAvatar() }}</span>
              }
            </div>

            <!-- ردیف انتخاب از بین ۶ وکتور SVG اختصاصی یا دکمه آپلود تصویر دلخواه -->
            <div class="flex items-center justify-center gap-2 flex-wrap pt-1">
              @for (av of avatarOptions; track av.id) {
                <button
                  type="button"
                  (click)="selectPreset(av.url)"
                  [title]="av.name"
                  [class]="
                    selectedAvatar() === av.url
                      ? 'w-11 h-11 rounded-2xl bg-orange-100/70 border-2 border-[#141517] p-1 shadow-xs scale-110 transition cursor-pointer relative overflow-hidden ring-2 ring-[#FF6B3D]/30'
                      : 'w-11 h-11 rounded-2xl bg-white border border-gray-200 p-1 hover:bg-gray-100 hover:border-gray-300 active:scale-95 transition cursor-pointer relative overflow-hidden'
                  ">
                  <img [src]="av.url" [alt]="av.name" class="w-full h-full object-cover rounded-xl" />
                </button>
              }

              <!-- دکمه پیش‌نمایش تصویر آپلود شده کاربر در صورت وجود -->
              @if (uploadedCustomAvatar(); as customUrl) {
                <button
                  type="button"
                  (click)="selectPreset(customUrl)"
                  title="تصویر آپلود شده شما"
                  [class]="
                    selectedAvatar() === customUrl
                      ? 'w-11 h-11 rounded-2xl bg-orange-100/70 border-2 border-[#141517] p-1 shadow-xs scale-110 transition cursor-pointer relative overflow-hidden ring-2 ring-[#FF6B3D]/30'
                      : 'w-11 h-11 rounded-2xl bg-white border border-gray-200 p-1 hover:bg-gray-100 active:scale-95 transition cursor-pointer relative overflow-hidden'
                  ">
                  <img [src]="customUrl" alt="عکس آپلودی شما" class="w-full h-full object-cover rounded-xl" />
                  <span class="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold">✓</span>
                </button>
              }

              <!-- دکمه تعاملی آپلود عکس دلخواه با اینپوت مخفی -->
              <button
                type="button"
                id="btn-upload-parent-avatar"
                (click)="fileInput.click()"
                [disabled]="isUploadingAvatar()"
                title="آپلود عکس از گالری یا دوربین"
                class="w-11 h-11 rounded-2xl border-2 border-dashed border-[#FF6B3D]/70 bg-orange-50/70 hover:bg-orange-100 text-[#FF6B3D] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition cursor-pointer disabled:opacity-50">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </button>
              
              <!-- اینپوت فایل مخفی -->
              <input
                #fileInput
                id="input-avatar-file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                class="hidden"
                (change)="handleFileSelect($event)" />
            </div>

            <!-- راهنمای آپلود عکس -->
            <span class="text-[10px] text-gray-400 font-medium block mt-2.5">
              از وکتورهای بالا انتخاب کن یا با زدن روی دوربین، عکس دلخواهت را آپلود کن.
            </span>
          </div>

          <form (submit)="handleSubmit($event)" class="space-y-4">
            
            <!-- نام و نام خانوادگی والد -->
            <div>
              <label for="input-parent-name" class="text-xs font-black text-gray-800 block mb-1.5">
                نام و نام خانوادگی سرپرست <span class="text-rose-500">*</span>
              </label>
              <input
                id="input-parent-name"
                type="text"
                [value]="fullName()"
                (input)="fullName.set($any($event.target).value)"
                placeholder="مثال: مریم رضایی یا علی حسینی"
                class="w-full px-4 py-3.5 rounded-2xl bg-[#f8f9fa] border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF6B3D] focus:bg-white transition" />
            </div>

            <!-- نسبت با دانش‌آموز (مادر، پدر، سرپرست) -->
            <div>
              <span class="text-xs font-black text-gray-800 block mb-1.5">
                نسبت شما با دانش‌آموز
              </span>
              <div class="grid grid-cols-3 gap-2">
                @for (role of rolePresets; track role) {
                  <button
                    type="button"
                    (click)="selectedRole.set(role)"
                    [class]="
                      selectedRole() === role
                        ? 'py-2.5 rounded-xl bg-[#141517] text-white text-xs font-black shadow-xs transition cursor-pointer'
                        : 'py-2.5 rounded-xl bg-[#f8f9fa] text-gray-700 border border-gray-200 text-xs font-bold hover:bg-gray-100 transition cursor-pointer'
                    ">
                    {{ role }}
                  </button>
                }
              </div>
            </div>

            <!-- کدملی سرپرست -->
            <div>
              <label for="input-parent-national-id" class="text-xs font-black text-gray-800 block mb-1.5">
                کد ملی سرپرست (اختیاری جهت تطبیق با پرونده مدرسه)
              </label>
              <input
                id="input-parent-national-id"
                type="text"
                dir="ltr"
                inputmode="numeric"
                maxlength="10"
                [value]="nationalId()"
                (input)="nationalId.set($any($event.target).value)"
                placeholder="مثال: ۰۰۱۲۳۴۵۶۷۸"
                class="w-full px-4 py-3 rounded-2xl bg-[#f8f9fa] border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF6B3D] focus:bg-white text-left font-mono transition" />
            </div>

            <!-- نشانی منزل / محل کار -->
            <div>
              <label for="input-parent-address" class="text-xs font-black text-gray-800 block mb-1.5">
                نشانی یا محله سکونت (اختیاری)
              </label>
              <input
                id="input-parent-address"
                type="text"
                [value]="address()"
                (input)="address.set($any($event.target).value)"
                placeholder="مثال: تهران، سعادت‌آباد"
                class="w-full px-4 py-3 rounded-2xl bg-[#f8f9fa] border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF6B3D] focus:bg-white transition" />
            </div>

            <!-- نمایش خطا در صورت ناقص بودن فرم -->
            @if (errorMessage()) {
              <div class="text-rose-500 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                <span>⚠️</span>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- دکمه تایید و رفتن به مرحله بعد -->
            <div class="pt-2">
              <button
                type="submit"
                id="btn-submit-parent-profile"
                [disabled]="isLoading() || isUploadingAvatar()"
                class="w-full py-4 bg-[#FF6B3D] hover:bg-[#e05432] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none text-white font-black text-sm rounded-2xl shadow-lg shadow-[#FF6B3D]/30 flex items-center justify-center transition cursor-pointer">
                @if (isLoading()) {
                  <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                } @else {
                  <div class="flex items-center justify-center gap-2">
                    <span>تایید و مرحله بعد: افزودن فرزند</span>
                    <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                }
              </button>
            </div>

          </form>

        </main>
      </div>

      <footer class="mt-8 text-center">
        <p class="text-[11px] text-gray-400 font-medium">
          سامانه سفارش ناهار گرم مدارس چایلدفود
        </p>
      </footer>

    </div>
  `,
})
export class ParentOnboarding {
  readonly foodStore = inject(FoodStore);

  // گزینه‌های ۶ وکتور SVG اختصاصی برای والدین
  readonly avatarOptions: ParentAvatarOption[] = [
    { id: 'father-suit', name: 'پدر رسمی با کت و کراوات', url: '/assets/avatars/parent-father-1.svg' },
    { id: 'mother-hijab', name: 'مادر باوقار با شال و حجاب', url: '/assets/avatars/parent-mother-1.svg' },
    { id: 'father-casual', name: 'پدر کژوال با ریش مرتب', url: '/assets/avatars/parent-father-2.svg' },
    { id: 'mother-glasses', name: 'مادر شاغل با عینک مدرن', url: '/assets/avatars/parent-mother-2.svg' },
    { id: 'father-smile', name: 'پدر جوان و پرانرژی', url: '/assets/avatars/parent-father-3.svg' },
    { id: 'mother-warm', name: 'مادر مهربان با موهای موج‌دار', url: '/assets/avatars/parent-mother-3.svg' },
  ];

  readonly rolePresets = ['مادر', 'پدر', 'سرپرست خانواده'];

  readonly fullName = signal<string>('');
  readonly nationalId = signal<string>('');
  readonly address = signal<string>('');
  readonly selectedAvatar = signal<string>('/assets/avatars/parent-father-1.svg');
  readonly selectedRole = signal<string>('مادر');

  // استیت آپلود واقعی عکس دلخواه
  readonly uploadedCustomAvatar = signal<string | null>(null);
  readonly isUploadingAvatar = signal<boolean>(false);

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    const current = this.foodStore.currentUser();
    if (current?.fullName && current.fullName !== 'والد گرامی') {
      this.fullName.set(current.fullName);
    }
    if (current?.roleTitle) {
      this.selectedRole.set(current.roleTitle);
    }
    if (current?.nationalId) {
      this.nationalId.set(current.nationalId);
    }
    if (current?.avatarUrl) {
      this.selectedAvatar.set(current.avatarUrl);
      if (this.isImageUrl(current.avatarUrl) && !current.avatarUrl.includes('/assets/avatars/parent-')) {
        this.uploadedCustomAvatar.set(current.avatarUrl);
      }
    }
  }

  // بررسی اینکه آیا آواتار تصویر/SVG است یا ایموجی
  isImageUrl(val: string): boolean {
    if (!val) return false;
    return val.startsWith('/') || val.startsWith('http') || val.startsWith('data:image');
  }

  selectPreset(url: string): void {
    this.selectedAvatar.set(url);
  }

  // متد دریافت فایل و ارسال واقعی به بک‌اند جهت آپلود
  async handleFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage.set('حجم تصویر انتخابی نباید بیشتر از ۱۰ مگابایت باشد.');
      input.value = '';
      return;
    }

    this.isUploadingAvatar.set(true);
    this.errorMessage.set(null);

    try {
      const res = await this.foodStore.uploadAvatar(file);
      if (res.success && res.url) {
        this.uploadedCustomAvatar.set(res.url);
        this.selectedAvatar.set(res.url);
      } else {
        this.errorMessage.set(res.message || 'خطا در بارگذاری تصویر.');
      }
    } catch {
      this.errorMessage.set('خطا در برقراری ارتباط با سرور جهت آپلود عکس.');
    } finally {
      this.isUploadingAvatar.set(false);
      input.value = '';
    }
  }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const name = this.fullName().trim();

    if (!name) {
      this.errorMessage.set('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const res = await this.foodStore.saveParentProfileOnboarding({
        fullName: name,
        nationalId: this.nationalId().trim() || undefined,
        roleTitle: this.selectedRole(),
        address: this.address().trim() || undefined,
        avatarUrl: this.selectedAvatar(),
      });

      if (res.success) {
        // هدایت خودکار به گام دوم: ثبت فرزند
        this.foodStore.goToChildOnboarding();
      } else {
        this.errorMessage.set(res.message || 'خطا در ذخیره مشخصات والد.');
      }
    } catch {
      this.errorMessage.set('خطا در ارتباط با سرور. لطفاً مجدداً تلاش کنید.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
