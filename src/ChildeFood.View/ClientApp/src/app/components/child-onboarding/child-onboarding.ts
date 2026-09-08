import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';
import {SchoolItem} from '../../models/food.model';

export interface ChildAvatarOption {
  id: string;
  name: string;
  url: string;
}

// کامپوننت گام دوم آنبوردینگ: ثبت اولین فرزند دانش‌آموز متصل به والد و مدرسه
// دارای انتخابگر SVGهای متنوع کودکان، آپلود واقعی عکس و سلکت‌باکس شیک انتخاب مدرسه از دیتابیس
@Component({
  selector: 'app-child-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="child-onboarding-view" class="px-5 pt-8 pb-16 select-none animate-in fade-in duration-300 min-h-screen flex flex-col justify-between" data-purpose="child-onboarding-page">
      
      <div>
        <!-- ۱. سربرگ و نشانگر مرحله ۲ از ۲ -->
        <header class="mb-6 relative">
          <!-- هاله نوری ملایم -->
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-100/40 rounded-full blur-3xl pointer-events-none"></div>

          <div class="flex items-center justify-between mb-4 relative z-10">
            <button
              type="button"
              id="btn-back-to-parent-profile"
              (click)="foodStore.goToParentOnboarding()"
              aria-label="بازگشت به ویرایش مشخصات والد"
              class="w-9 h-9 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 transition cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF6B3D] border border-orange-200/60 text-[11px] font-black">
              <span>🎒</span>
              <span>مرحله ۲ از ۲: ثبت اولین دانش‌آموز</span>
            </span>

            <span class="text-xs font-bold text-[#FF6B3D] font-mono">
              ۱۰۰٪
            </span>
          </div>

          <h1 class="text-2xl font-black text-[#141517] tracking-tight leading-tight">
            فرزندت در کدام مدرسه درس می‌خواند؟
          </h1>
          <p class="text-xs text-gray-500 font-medium mt-1.5 leading-relaxed">
            با انتخاب مدرسه و ثبت مشخصات دانش‌آموز، برنامه غذایی و توزیع گرم روزانه برای او فعال می‌شود.
          </p>
        </header>

        <!-- ۲. کارت فرم ثبت مشخصات فرزند -->
        <main class="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] relative space-y-4">
          
          <!-- انتخاب آواتار یا آپلود چهره کودک -->
          <div class="bg-[#f8f9fa] rounded-2xl p-4 border border-gray-200/70 text-center">
            <span class="text-xs font-black text-gray-700 mb-2.5 block">
              انتخاب آواتار شاد برای فرزند
            </span>

            <!-- کادر بزرگ پیش‌نمایش تصویر با حاشیه پرتقالی شیک -->
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
                  alt="نمایه دانش‌آموز"
                  class="w-full h-full object-cover rounded-2xl shadow-inner" />
              } @else {
                <span class="text-4xl">{{ selectedAvatar() }}</span>
              }
            </div>

            <!-- ردیف گزینه‌های وکتور SVG کودک با تنوع بالا یا آپلود تصویر واقعی -->
            <div class="flex items-center justify-center gap-2 flex-wrap pt-1">
              @for (av of childAvatarOptions; track av.id) {
                <button
                  type="button"
                  (click)="selectPreset(av.url)"
                  [title]="av.name"
                  [class]="
                    selectedAvatar() === av.url
                      ? 'w-10 h-10 rounded-2xl bg-orange-100/70 border-2 border-[#141517] p-1 shadow-xs scale-110 transition cursor-pointer relative overflow-hidden ring-2 ring-[#FF6B3D]/30'
                      : 'w-10 h-10 rounded-2xl bg-white border border-gray-200 p-1 hover:bg-gray-100 hover:border-gray-300 active:scale-95 transition cursor-pointer relative overflow-hidden'
                  ">
                  <img [src]="av.url" [alt]="av.name" class="w-full h-full object-cover rounded-xl" />
                </button>
              }

              <!-- دکمه عکس آپلود شده کودک در صورت وجود -->
              @if (uploadedCustomAvatar(); as customUrl) {
                <button
                  type="button"
                  (click)="selectPreset(customUrl)"
                  title="تصویر آپلود شده فرزند شما"
                  [class]="
                    selectedAvatar() === customUrl
                      ? 'w-10 h-10 rounded-2xl bg-orange-100/70 border-2 border-[#141517] p-0.5 shadow-xs scale-110 transition cursor-pointer relative overflow-hidden ring-2 ring-[#FF6B3D]/30'
                      : 'w-10 h-10 rounded-2xl bg-white border border-gray-200 p-0.5 hover:bg-gray-100 active:scale-95 transition cursor-pointer relative overflow-hidden'
                  ">
                  <img [src]="customUrl" alt="عکس آپلودی فرزند" class="w-full h-full object-cover rounded-xl" />
                  <span class="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold">✓</span>
                </button>
              }

              <!-- دکمه آپلود عکس از دوربین یا گالری -->
              <button
                type="button"
                id="btn-upload-child-avatar"
                (click)="fileInput.click()"
                [disabled]="isUploadingAvatar()"
                title="آپلود عکس فرزند از گالری یا دوربین"
                class="w-10 h-10 rounded-2xl border-2 border-dashed border-[#FF6B3D]/70 bg-orange-50/70 hover:bg-orange-100 text-[#FF6B3D] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition cursor-pointer disabled:opacity-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </button>

              <input
                #fileInput
                id="input-child-avatar-file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                class="hidden"
                (change)="handleFileSelect($event)" />
            </div>

            <span class="text-[10px] text-gray-400 font-medium block mt-2.5">
              از بین وکتورهای بامزه انتخاب کن یا با دوربین عکس دانش‌آموز را آپلود کن.
            </span>
          </div>

          <form (submit)="handleSubmit($event)" class="space-y-4">
            
            <!-- نام و نام خانوادگی فرزند -->
            <div>
              <label for="input-child-name" class="text-xs font-black text-gray-800 block mb-1.5">
                نام و نام خانوادگی دانش‌آموز <span class="text-rose-500">*</span>
              </label>
              <input
                id="input-child-name"
                type="text"
                [value]="fullName()"
                (input)="fullName.set($any($event.target).value)"
                placeholder="مثال: علی رضایی یا سارا حسینی"
                class="w-full px-4 py-3.5 rounded-2xl bg-[#f8f9fa] border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF6B3D] focus:bg-white transition" />
            </div>

            <!-- ردیف سن و پایه تحصیلی -->
            <div class="grid grid-cols-2 gap-3">
              <!-- سن -->
              <div>
                <label for="input-child-age" class="text-xs font-black text-gray-800 block mb-1.5">
                  سن (سال)
                </label>
                <input
                  id="input-child-age"
                  type="number"
                  min="5"
                  max="18"
                  [value]="age()"
                  (input)="age.set(+$any($event.target).value)"
                  class="w-full px-4 py-3 rounded-2xl bg-[#f8f9fa] border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF6B3D] focus:bg-white text-center font-mono transition" />
              </div>

              <!-- پایه تحصیلی -->
              <div>
                <label for="input-child-grade" class="text-xs font-black text-gray-800 block mb-1.5">
                  پایه تحصیلی <span class="text-rose-500">*</span>
                </label>
                <select
                  id="input-child-grade"
                  [value]="grade()"
                  (change)="grade.set($any($event.target).value)"
                  class="w-full px-3 py-3 rounded-2xl bg-[#f8f9fa] border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF6B3D] focus:bg-white transition cursor-pointer">
                  <option value="پیش‌دبستانی">پیش‌دبستانی</option>
                  <option value="پایه اول ابتدایی">پایه اول ابتدایی</option>
                  <option value="پایه دوم ابتدایی">پایه دوم ابتدایی</option>
                  <option value="پایه سوم ابتدایی">پایه سوم ابتدایی</option>
                  <option value="پایه چهارم ابتدایی">پایه چهارم ابتدایی</option>
                  <option value="پایه پنجم ابتدایی">پایه پنجم ابتدایی</option>
                  <option value="پایه ششم ابتدایی">پایه ششم ابتدایی</option>
                  <option value="متوسطه اول (هفتم تا نهم)">متوسطه اول</option>
                </select>
              </div>
            </div>

            <!-- ۳. سلکت‌باکس مدرن و شیک انتخاب مدرسه از پایگاه داده -->
            <div class="relative">
              <label for="school-select-trigger" class="text-xs font-black text-gray-800 block mb-1.5 flex items-center justify-between">
                <span>مدرسه یا مجتمع آموزشی <span class="text-rose-500">*</span></span>
                <span class="text-[10px] text-gray-400 font-normal">تغذیه از این شعبه تحویل می‌شود</span>
              </label>

              <!-- دکمه تریگر دراپ‌داون مدرن مدرسه -->
              <button
                type="button"
                id="school-select-trigger"
                (click)="isSchoolDropdownOpen.set(!isSchoolDropdownOpen())"
                class="w-full px-4 py-3.5 rounded-2xl bg-[#f8f9fa] border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF6B3D] focus:bg-white flex items-center justify-between transition cursor-pointer shadow-xs">
                <div class="flex items-center gap-2.5 truncate">
                  <span class="w-7 h-7 rounded-xl bg-orange-100 text-[#FF6B3D] flex items-center justify-center text-sm shrink-0">
                    🏫
                  </span>
                  <span class="truncate font-bold text-gray-900">
                    {{ selectedSchoolName() || 'انتخاب مدرسه یا مجتمع آموزشی...' }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 text-gray-400">
                  <svg
                    [class]="'w-4 h-4 transition-transform duration-200 ' + (isSchoolDropdownOpen() ? 'transform rotate-180 text-[#FF6B3D]' : '')"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              <!-- منوی کشویی مدرن انتخاب مدرسه با سرچ سریع -->
              @if (isSchoolDropdownOpen()) {
                <div
                  id="school-dropdown-menu"
                  class="absolute z-30 top-full mt-2 w-full bg-white rounded-2xl border border-black/[0.08] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.15)] p-2.5 animate-in fade-in zoom-in-95 duration-150">
                  
                  <!-- فیلد جستجوی سریع در لیست مدارس -->
                  <div class="relative mb-2">
                    <input
                      type="text"
                      [value]="schoolSearchQuery()"
                      (input)="schoolSearchQuery.set($any($event.target).value)"
                      placeholder="جستجوی نام مدرسه یا محله..."
                      class="w-full px-3.5 py-2.5 pr-8 rounded-xl bg-[#f8f9fa] border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF6B3D] focus:bg-white transition" />
                    <svg class="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>

                  <!-- فهرست اسکرول‌خور مدارس دریافتی از دیتابیس ادمین -->
                  <div class="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
                    @for (sch of filteredSchools(); track sch.id) {
                      <button
                        type="button"
                        (click)="selectSchool(sch)"
                        [class]="
                          selectedSchoolId() === sch.id
                            ? 'w-full text-right p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs flex items-center justify-between transition cursor-pointer'
                            : 'w-full text-right p-2.5 rounded-xl hover:bg-gray-50 border border-transparent text-xs flex items-center justify-between transition cursor-pointer'
                        ">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1 ml-2">
                          <span class="text-base shrink-0">🏫</span>
                          <div class="min-w-0">
                            <span class="font-bold text-gray-900 block leading-snug truncate">{{ sch.name }}</span>
                            <span class="text-[10px] text-gray-400 block mt-0.5 truncate">{{ sch.address }}</span>
                          </div>
                        </div>
                        <div class="text-left shrink-0">
                          <span class="text-[10px] px-2.5 py-1 rounded-full bg-orange-50 text-[#FF6B3D] font-bold inline-block border border-orange-100/70">
                            ساعت سرو {{ sch.defaultLunchTime }}
                          </span>
                        </div>
                      </button>
                    }

                    @if (filteredSchools().length === 0) {
                      <div class="p-4 text-center text-xs text-gray-400">
                        مدرسه‌ای با این مشخصات پیدا نشد.
                      </div>
                    }
                  </div>

                  <!-- گزینه درج نام مدرسه در صورت نیافتن در لیست -->
                  <div class="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between px-1">
                    <span class="text-[10px] text-gray-400">مدرسه شما در لیست نیست؟</span>
                    <button
                      type="button"
                      (click)="enableCustomSchoolInput()"
                      class="text-[10px] font-bold text-[#FF6B3D] hover:underline cursor-pointer">
                      نوشتن دستی نام مدرسه
                    </button>
                  </div>
                </div>
              }

              <!-- فیلد ورودی دستی در صورتی که کاربر خواست نام دلخواه وارد کند -->
              @if (isCustomSchoolMode()) {
                <div class="mt-2 animate-in fade-in">
                  <input
                    type="text"
                    [value]="customSchoolName()"
                    (input)="setCustomSchool($any($event.target).value)"
                    placeholder="نام کامل مدرسه محل تحصیل را بنویسید..."
                    class="w-full px-4 py-3 rounded-2xl bg-[#fff7ed] border border-orange-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF6B3D] transition" />
                </div>
              }
            </div>

            <!-- حساسیت غذایی یا رژیم خاص -->
            <div>
              <label for="input-child-diet" class="text-xs font-black text-gray-800 block mb-1.5">
                حساسیت‌های غذایی یا پرهیز ویژه (اختیاری)
              </label>
              <input
                id="input-child-diet"
                type="text"
                [value]="dietaryNotes()"
                (input)="dietaryNotes.set($any($event.target).value)"
                placeholder="مثال: حساسیت به بادام‌زمینی، لاکتوز یا بدون حساسیت"
                class="w-full px-4 py-3 rounded-2xl bg-[#f8f9fa] border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF6B3D] focus:bg-white transition" />
            </div>

            <!-- نمایش خطا در صورت ناقص بودن -->
            @if (errorMessage()) {
              <div class="text-rose-500 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                <span>⚠️</span>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- دکمه ثبت نهایی و ورود به خانه -->
            <div class="pt-2">
              <button
                type="submit"
                id="btn-submit-child-profile"
                [disabled]="isLoading() || isUploadingAvatar()"
                class="w-full py-4 bg-[#FF6B3D] hover:bg-[#e05432] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none text-white font-black text-sm rounded-2xl shadow-lg shadow-[#FF6B3D]/30 flex items-center justify-center transition cursor-pointer">
                @if (isLoading()) {
                  <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                } @else {
                  <span>ثبت فرزند و ورود به برنامه</span>
                }
              </button>
            </div>

          </form>

        </main>
      </div>

      <footer class="mt-8 text-center">
        <p class="text-[11px] text-gray-400 font-medium">
          امکان افزودن فرزندان بیشتر بعداً در بخش تنظیمات وجود دارد.
        </p>
      </footer>

    </div>
  `,
})
export class ChildOnboarding {
  readonly foodStore = inject(FoodStore);

  // ۸ وکتور SVG شاد، متنوع و اختصاصی دانش‌آموزان
  readonly childAvatarOptions: ChildAvatarOption[] = [
    { id: 'ali-school', name: 'علی با روپوش مدرسه', url: '/assets/avatars/ali.svg' },
    { id: 'sara-school', name: 'سارا با مقنعه مدرسه', url: '/assets/avatars/child-girl-school.svg' },
    { id: 'amirali-sport', name: 'امیرعلی پرانرژی', url: '/assets/avatars/amirali.svg' },
    { id: 'ava-pigtails', name: 'آوا با موهای بافته', url: '/assets/avatars/ava.svg' },
    { id: 'boy-glasses', name: 'پویان عینکی و باهوش', url: '/assets/avatars/child-boy-glasses.svg' },
    { id: 'girl-ponytail', name: 'رونیکا با موهای دم‌اسبی', url: '/assets/avatars/child-girl-ponytail.svg' },
    { id: 'boy-cap', name: 'رادین با کلاه اسپرت', url: '/assets/avatars/child-boy-cap.svg' },
    { id: 'girl-curls', name: 'باران با موهای فرفری', url: '/assets/avatars/child-girl-curls.svg' },
  ];

  readonly fullName = signal<string>('');
  readonly age = signal<number>(9);
  readonly grade = signal<string>('پایه سوم ابتدایی');
  readonly dietaryNotes = signal<string>('بدون حساسیت غذایی');
  readonly selectedAvatar = signal<string>('/assets/avatars/ali.svg');

  // استیت آپلود واقعی تصویر چهره کودک
  readonly uploadedCustomAvatar = signal<string | null>(null);
  readonly isUploadingAvatar = signal<boolean>(false);

  // استیت سلکت‌باکس مدرن انتخاب مدرسه
  readonly isSchoolDropdownOpen = signal<boolean>(false);
  readonly schoolSearchQuery = signal<string>('');
  readonly selectedSchoolId = signal<string | null>(null);
  readonly selectedSchoolName = signal<string>('');
  readonly selectedSchoolBranch = signal<string>('');
  readonly isCustomSchoolMode = signal<boolean>(false);
  readonly customSchoolName = signal<string>('');

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);

  // لیست فیلترشده مدارس بر اساس جستجوی کاربر
  readonly filteredSchools = computed(() => {
    const list = this.foodStore.schools();
    const query = this.schoolSearchQuery().trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.branchCode.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query)
    );
  });

  constructor() {
    // مقداردهی اولیه مدرسه در صورت وجود در استور
    const list = this.foodStore.schools();
    if (list.length > 0) {
      this.selectSchool(list[0]);
    }
  }

  isImageUrl(val: string): boolean {
    if (!val) return false;
    return val.startsWith('/') || val.startsWith('http') || val.startsWith('data:image');
  }

  selectPreset(url: string): void {
    this.selectedAvatar.set(url);
  }

  selectSchool(sch: SchoolItem): void {
    this.selectedSchoolId.set(sch.id);
    this.selectedSchoolName.set(sch.name);
    this.selectedSchoolBranch.set(sch.branchCode);
    this.isSchoolDropdownOpen.set(false);
    this.isCustomSchoolMode.set(false);
  }

  enableCustomSchoolInput(): void {
    this.isCustomSchoolMode.set(true);
    this.isSchoolDropdownOpen.set(false);
    this.selectedSchoolId.set(null);
  }

  setCustomSchool(name: string): void {
    this.customSchoolName.set(name);
    this.selectedSchoolName.set(name);
  }

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
        this.errorMessage.set(res.message || 'خطا در آپلود عکس کودک.');
      }
    } catch {
      this.errorMessage.set('خطا در برقراری ارتباط با سرور برای آپلود عکس.');
    } finally {
      this.isUploadingAvatar.set(false);
      input.value = '';
    }
  }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const name = this.fullName().trim();
    const school = (this.isCustomSchoolMode() ? this.customSchoolName() : this.selectedSchoolName()).trim();

    if (!name) {
      this.errorMessage.set('لطفاً نام و نام خانوادگی فرزند را وارد کنید.');
      return;
    }

    if (!school) {
      this.errorMessage.set('لطفاً مدرسه محل تحصیل فرزند را از لیست انتخاب کنید.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const res = await this.foodStore.saveChildOnboarding({
        fullName: name,
        age: this.age(),
        grade: this.grade(),
        schoolName: school,
        schoolId: this.selectedSchoolId() || undefined,
        dietaryNotes: this.dietaryNotes().trim() || undefined,
        avatarUrl: this.selectedAvatar(),
      });

      if (res.success) {
        // آنبوردینگ با موفقیت کامل شد و کاربر وارد صفحه اصلی می‌شود
        this.foodStore.goToHome();
      } else {
        this.errorMessage.set(res.message || 'خطا در ثبت فرزند.');
      }
    } catch {
      this.errorMessage.set('خطا در ارتباط با سرور. لطفاً مجدداً تلاش نمایید.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
