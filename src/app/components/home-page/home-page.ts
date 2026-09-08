import {ChangeDetectionStrategy, Component, computed, inject, signal, effect, OnDestroy} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {FoodStore} from '../../services/food-store';

// مدل اطلاعاتی کارت‌های سفارش امروز که روی صفحه اصلی نمایش داده می‌شن
export interface HomeOrderDisplay {
  id: string;
  foodTitle: string;
  foodSubtitle: string;
  mealPeriod: string;
  dateLabel: string;
  foodEmoji: string;
  statusBadgeText: string;
  statusBadgeType: 'preparing' | 'delivered';
  trackingCode: string;
}

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- صفحه اصلی با پالت اختصاصی مینیمال پریمیوم: سفید، مشکی، لهجه‌های نارنجی گرم و کارت تیره کیف پول -->
    <div id="home-page-view" class="px-5 pt-5 pb-28 select-none animate-in fade-in duration-200">
      
      <!-- =========================================================================
           ۱. بخش سربرگ بالایی (TOP HEADER SECTION)
           طبق فیدبک ۱: سلام محمد کوچکتر، جمله اصلی بولد، آواتار فرزند کنارش و کاهش فاصله تا والت
           ========================================================================= -->
      <header id="top-header-section" class="mb-3.5" data-purpose="top-greeting-header">
        
        <!-- ردیف بالا: آواتار پروفایل کاربر سمت راست و زنگوله اعلان‌ها سمت چپ -->
        <div class="flex items-center justify-between mb-2.5">
          
          <!-- بالا راست: آواتار کاربر برای رفتن به پروفایل -->
          <button
            type="button"
            id="header-profile-avatar"
            (click)="foodStore.goToProfile()"
            aria-label="رفتن به پروفایل"
            class="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center text-lg hover:border-[#FF6B3D]/50 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer overflow-hidden">
            @if (isAvatarImage(foodStore.parentProfile().avatar)) {
              <img [src]="foodStore.parentProfile().avatar" alt="پروفایل" class="w-full h-full object-cover" />
            } @else {
              <span>{{ foodStore.parentProfile().avatar || '👩‍💼' }}</span>
            }
          </button>

          <!-- بالا چپ: زنگوله اعلان‌ها با نقطه نشانگر نارنجی -->
          <button
            type="button"
            id="btn-header-notifications"
            (click)="toggleNotificationTip()"
            aria-label="اعلان‌ها"
            class="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#111111] hover:bg-gray-50 active:scale-95 transition-all cursor-pointer relative">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <!-- نقطه قرمز/نارنجی اعلان خوانده نشده -->
            <span class="w-2 h-2 rounded-full bg-[#FF6B3D] absolute top-2 left-2 border-2 border-white"></span>
          </button>

        </div>

        <!-- متن سلام خودمانی و تیتر صمیمانه همراه آواتار کوچک فرزند -->
        <div class="text-right">
          <span id="header-greeting-text" class="text-xs font-normal text-[#8F8F8F] block">
            سلام، {{ greetingName() }} 👋
          </span>
          <div class="flex items-center gap-2 mt-1">
            <span id="header-child-avatar" class="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-sm shadow-xs flex-shrink-0 overflow-hidden">
              @if (foodStore.isImageAvatar(activeChild().avatar)) {
                <img [src]="activeChild().avatar" [alt]="activeChild().name" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
              } @else {
                {{ activeChild().avatar }}
              }
            </span>
            <h1 id="header-headline" class="text-lg sm:text-xl font-bold text-[#111111] tracking-tight leading-snug">
              {{ activeChildShortName() }} امروز چی دوست داره؟ 🍱
            </h1>
          </div>
        </div>

        <!-- پیام پاپ‌آپ کوچک اعلان‌ها برای فیدبک لمس زنگوله -->
        @if (showNotificationMessage()) {
          <div
            id="notification-toast"
            class="mt-2.5 p-3 rounded-2xl bg-orange-50/90 border border-orange-200/80 text-xs font-normal text-[#FF6B3D] animate-in fade-in flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span>🔔</span>
              <span>همه سفارش‌های امروز در مسیر سرو و آماده‌سازی هستند.</span>
            </div>
            <button
              type="button"
              (click)="showNotificationMessage.set(false)"
              class="text-gray-400 hover:text-gray-600 font-bold cursor-pointer text-sm">
              ×
            </button>
          </div>
        }
      </header>

      <!-- =========================================================================
           ۲. بخش فرزند انتخاب شده (ACTIVE CHILD CARD)
           طبق فیدبک ۴: جایگاه قبل از کارت کیف پول، نمایش آواتار، نام، کلاس و دکمه تغییر
           ========================================================================= -->
      <section id="active-child-section" class="mb-3.5" data-purpose="active-child-selector">
        <div class="bg-white rounded-[20px] p-3.5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-orange-200/80 transition-all flex items-center justify-between gap-3">
          
          <!-- سمت راست: آواتار گرد فرزند و مشخصات کلاس و مدرسه -->
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs overflow-hidden">
              <span id="active-child-avatar" class="w-full h-full flex items-center justify-center">
                @if (foodStore.isImageAvatar(activeChild().avatar)) {
                  <img [src]="activeChild().avatar" [alt]="activeChild().name" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                } @else {
                  {{ activeChild().avatar }}
                }
              </span>
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-[9px] font-bold text-[#FF6B3D] bg-orange-50 border border-orange-200/60 px-1.5 py-0.5 rounded-md">فرزند فعال</span>
                <h3 id="active-child-name" class="text-sm font-bold text-[#111111] truncate">
                  {{ activeChild().name }}
                </h3>
              </div>
              <p id="active-child-school" class="text-[11px] text-[#8F8F8F] font-normal truncate mt-0.5">
                {{ activeChild().grade }} - {{ activeChild().school }}
              </p>
            </div>
          </div>

          <!-- سمت چپ: دکمه تغییر فرزند با ارگونومی ۴۴ پیکسلی لمسی -->
          <button
            type="button"
            id="btn-change-active-child"
            (click)="handleChangeChild()"
            class="min-h-[44px] px-3.5 py-2 rounded-xl border border-gray-200 hover:border-[#FF6B3D] hover:text-[#FF6B3D] bg-gray-50/80 hover:bg-white text-xs font-bold text-[#111111] transition-all flex items-center gap-1 cursor-pointer flex-shrink-0">
            <span>تغییر</span>
            <svg class="w-3.5 h-3.5 transform rotate-180 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

        </div>
      </section>

      <!-- =========================================================================
           ۳. کارت مشکی لوکس موجودی کیف پول (WALLET BALANCE CARD)
           طبق فیدبک ۲: موجودی، دکمه شارژ و ۲ مینی کارت کوچک برای آخرین تراکنش و سفارش‌های این ماه
           ========================================================================= -->
      <section id="wallet-balance-card" class="mb-5" data-purpose="wallet-balance-card">
        <div class="relative overflow-hidden rounded-[24px] bg-[#111111] bg-gradient-to-br from-[#1d1613] via-[#111111] to-[#120f0e] p-5 text-white shadow-[0_14px_36px_rgba(0,0,0,0.24)] border border-white/5">
          
          <!-- هایلایت نوری ظریف نارنجی در پس‌زمینه کارت -->
          <div class="absolute -top-12 -left-12 w-48 h-48 bg-[#FF6B3D]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-8 -right-8 w-32 h-32 bg-[#FF6B3D]/10 rounded-full blur-2xl pointer-events-none"></div>

          <!-- ردیف بالای کارت: کیف پول + بج رسمی -->
          <div class="flex items-center justify-between relative z-10">
            <div class="flex items-center gap-2 text-[#FF6B3D]">
              <div class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5zm0 0h-4a2 2 0 00-2 2v0a2 2 0 002 2h4M7 9h.01" />
                </svg>
              </div>
              <span class="text-xs font-bold text-gray-200">کیف پول</span>
            </div>

            <!-- نشان عضویت رسمی -->
            <span class="text-[10px] text-gray-400 border border-white/10 px-2 py-0.5 rounded-md bg-white/5">
              عضویت رسمی
            </span>
          </div>

          <!-- بخش موجودی اصلی و دکمه شارژ پیل نارنجی -->
          <div class="my-4 flex items-center justify-between gap-3 relative z-10">
            <div>
              <span class="text-[11px] text-gray-400 block mb-1 font-normal">موجودی حساب</span>
              <div class="flex items-baseline gap-2">
                <span id="wallet-main-balance" class="text-3xl font-semibold text-white tracking-tight num-fa">
                  {{ formattedWalletBalance() }}
                </span>
                <span class="text-xs font-normal text-gray-300">تومان</span>
              </div>
            </div>

            <!-- دکمه پیل شارژ کیف پول با ارتفاع لمسی استاندارد حداقل ۴۴ پیکسل -->
            <button
              type="button"
              id="btn-recharge-wallet"
              (click)="handleRecharge()"
              class="min-h-[44px] px-4 py-2 rounded-full bg-[#FF6B3D] hover:bg-[#e05432] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#FF6B3D]/30 transition-all cursor-pointer flex-shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>شارژ کیف پول</span>
            </button>
          </div>

          <!-- دو Mini Card کوچک طبق فیدبک ۲: آخرین تراکنش + سفارش‌های این ماه -->
          <div class="pt-3 border-t border-white/10 grid grid-cols-2 gap-2.5 relative z-10">
            
            <!-- مینی کارت ۱: آخرین تراکنش (+ ۵۰,۰۰۰ تومان) -->
            <div id="wallet-mini-last-tx" class="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
              <span class="text-[10px] text-gray-400 font-normal">آخرین تراکنش</span>
              <div class="flex items-center gap-1 mt-1.5">
                <span class="text-emerald-400 text-xs font-bold">+</span>
                <span id="wallet-last-recharge" class="text-xs font-semibold text-white num-fa">{{ lastRechargeAmount() }}</span>
                <span class="text-[10px] text-gray-400 font-normal">تومان</span>
              </div>
            </div>

            <!-- مینی کارت ۲: این ماه (+ ۱۲ سفارش) -->
            <div id="wallet-mini-month-orders" class="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
              <span class="text-[10px] text-gray-400 font-normal">این ماه</span>
              <div class="flex items-center gap-1 mt-1.5">
                <span class="text-orange-400 text-xs font-bold">+</span>
                <span id="wallet-month-orders-count" class="text-xs font-semibold text-white num-fa">{{ monthOrdersCount() }}</span>
                <span class="text-[10px] text-gray-300 font-normal">سفارش</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           ۴. بخش سفارش‌های امروز (TODAY ORDERS SECTION)
           طبق فیدبک ۳: کارت‌های غنی‌تر و بزرگتر، عکس غذا بزرگتر، اطلاعات کامل‌تر و نوار Progress وضعیت
           ========================================================================= -->
      <section id="today-orders-section" class="mb-5" data-purpose="today-orders-section">
        
        <!-- تیتر بخش و دکمه سفارش جدید -->
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base font-bold text-[#111111] tracking-tight">
            سفارشهای امروز
          </h2>

          <!-- دکمه سفارش جدید با هدایت به تقویم روزهای سفارش -->
          <button
            type="button"
            id="btn-new-order"
            (click)="foodStore.goToCalendar()"
            class="min-h-[44px] px-3 py-1.5 rounded-full text-xs font-bold text-[#FF6B3D] hover:bg-orange-50 active:scale-95 flex items-center gap-1 cursor-pointer transition-all">
            <span class="text-sm leading-none font-bold">+</span>
            <span>سفارش جدید</span>
          </button>
        </div>

        <!-- لیست کارت‌های سفارش امروز -->
        @if (displayedOrders().length > 0) {
          <div class="space-y-3">
            @for (order of displayedOrders(); track order.id) {
              <button
                type="button"
                [id]="'order-card-' + order.id"
                (click)="foodStore.goToOrders()"
                class="w-full text-right bg-white rounded-[20px] p-3.5 sm:p-4 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:scale-[0.99] transition-all flex items-center justify-between gap-3 cursor-pointer">
                
                <!-- سمت راست: عکس غذا بزرگتر همراه اطلاعات متنی وسط -->
                <div class="flex items-center gap-3 min-w-0">
                  <!-- عکس/آیکون برجسته غذا داخل باکس زیبا -->
                  <div class="w-14 h-14 rounded-2xl bg-orange-50/90 border border-orange-100 flex items-center justify-center text-3xl flex-shrink-0 shadow-xs">
                    <span>{{ order.foodEmoji }}</span>
                  </div>

                  <!-- مشخصات متنی وسط: نام غذا، تاریخ امروز و توضیحات پرس -->
                  <div class="min-w-0">
                    <h3 class="text-sm sm:text-base font-bold text-[#111111] truncate">
                      {{ order.foodTitle }}
                    </h3>

                    <div class="flex items-center gap-1.5 text-[11px] text-[#8F8F8F] font-normal mt-0.5">
                      <span>{{ order.mealPeriod }}</span>
                      <span>|</span>
                      <span class="font-semibold">{{ order.dateLabel }}</span>
                    </div>

                    <p class="text-[11px] text-gray-500 font-normal truncate mt-0.5">
                      {{ order.foodSubtitle }}
                    </p>
                  </div>
                </div>

                <!-- سمت چپ: وضعیت سفارش و نوار پیشرفت کوچک (Progress) -->
                <div class="flex-shrink-0 flex flex-col items-end">
                  @if (order.statusBadgeType === 'preparing') {
                    <span class="px-2.5 py-1 rounded-full bg-orange-50 text-[#FF6B3D] border border-orange-200/60 text-[10px] font-bold inline-flex items-center gap-1">
                      <span>🟠</span>
                      <span>{{ order.statusBadgeText }}</span>
                    </span>

                    <!-- نوار پیشرفت مرحله آماده‌سازی (━━━━━━○○) -->
                    <div class="mt-2 flex flex-col items-end" aria-label="پیشرفت آماده‌سازی">
                      <span class="text-[9px] text-[#8F8F8F] font-normal mb-1">آماده‌سازی</span>
                      <div class="flex items-center gap-1" dir="ltr">
                        <span class="w-3 h-1.5 rounded-full bg-[#FF6B3D]"></span>
                        <span class="w-3 h-1.5 rounded-full bg-[#FF6B3D]"></span>
                        <span class="w-3 h-1.5 rounded-full bg-[#FF6B3D]"></span>
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                      </div>
                    </div>
                  } @else {
                    <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                      <span>🟢</span>
                      <span>{{ order.statusBadgeText }}</span>
                    </span>

                    <!-- نوار پیشرفت مرحله تحویل تکمیل شده (━━━━━━●●) -->
                    <div class="mt-2 flex flex-col items-end" aria-label="تحویل به مدرسه">
                      <span class="text-[9px] text-emerald-600 font-normal mb-1">تحویل به مدرسه</span>
                      <div class="flex items-center gap-1" dir="ltr">
                        <span class="w-3 h-1.5 rounded-full bg-emerald-500"></span>
                        <span class="w-3 h-1.5 rounded-full bg-emerald-500"></span>
                        <span class="w-3 h-1.5 rounded-full bg-emerald-500"></span>
                        <span class="w-3 h-1.5 rounded-full bg-emerald-500"></span>
                        <span class="w-3 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                    </div>
                  }
                </div>

              </button>
            }
          </div>
        } @else {
          <!-- وضعیت بدون سفارش امروز -->
          <div
            id="empty-today-orders-card"
            class="bg-white rounded-[20px] p-5 border border-dashed border-gray-200 text-center shadow-xs">
            <span class="text-2xl block mb-1">🍱</span>
            <p class="text-xs font-bold text-[#111111]">امروز هیچ سفارش فعالی برای مدرسه ثبت نشده است</p>
            <p class="text-[11px] text-gray-400 font-normal mt-1">می‌توانید همین حالا غذای گرم و تازه را انتخاب و رزرو کنید.</p>
            <button
              type="button"
              id="btn-empty-order-meals"
              (click)="foodStore.goToMeals()"
              class="mt-3 min-h-[40px] px-4 py-1.5 rounded-full bg-orange-50 text-[#FF6B3D] hover:bg-[#FF6B3D] hover:text-white border border-orange-200/80 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5">
              <span>مشاهده منو و انتخاب غذا</span>
              <svg class="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        }

      </section>

      <!-- =========================================================================
           ۵. بخش پیشنهاد امروز غذا (DAILY FOOD RECOMMENDATION)
           طبق فیدبک ۷: کارت جمع‌وجور و دلنشین برای پر کردن فضای خالی و هدایت والدین به منو
           ========================================================================= -->
      <section id="daily-recommendation-section" class="mb-5" data-purpose="daily-recommendation-card">
        <div class="bg-gradient-to-r from-orange-50/90 via-white to-white rounded-[22px] p-4 border border-orange-100 shadow-[0_4px_18px_rgba(255,107,61,0.06)] hover:border-orange-200 transition-all">
          
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-bold text-[#111111]">پیشنهاد امروز</span>
              <span class="text-base">🍽</span>
            </div>
            <span class="text-[10px] font-bold text-[#FF6B3D] bg-orange-100/70 border border-orange-200/50 px-2 py-0.5 rounded-full">
              محبوب بچه‌ها
            </span>
          </div>

          <p class="text-xs text-gray-500 font-normal">
            غذای محبوب بچه‌ها:
          </p>

          <div class="flex items-center justify-between mt-2.5 pt-2.5 border-t border-orange-100/60">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-orange-100/70 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                <span>🍗</span>
              </div>
              <div>
                <h4 id="recommended-food-title" class="text-sm font-bold text-[#111111]">
                  جوجه کباب
                </h4>
                <p class="text-[11px] text-gray-400 font-normal mt-0.5">
                  طبخ تازه با گوشت گرم و برنج درجه یک
                </p>
              </div>
            </div>

            <!-- دکمه شیک مشاهده منو با ارگونومی استاندارد ۴۴ پیکسلی -->
            <button
              type="button"
              id="btn-view-recommended-menu"
              (click)="foodStore.goToMeals()"
              class="min-h-[44px] px-4 py-2 rounded-full bg-[#111111] hover:bg-[#222222] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 shadow-xs">
              <span>مشاهده منو</span>
              <svg class="w-3.5 h-3.5 transform rotate-180 text-[#FF6B3D]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           ۶. بخش دسترسی سریع (QUICK ACCESS SECTION)
           طبق فیدبک ۵: ابعاد بزرگتر، آیکون‌های درشت‌تر و سایه عمیق‌تر
           ========================================================================= -->
      <section id="quick-actions-section" class="mb-2" data-purpose="quick-actions-section">
        
        <h2 class="text-sm font-bold text-[#111111] tracking-tight mb-3">
          دسترسی سریع
        </h2>

        <div class="grid grid-cols-3 gap-3">
          
          <!-- ۱. میانبر انتخاب غذا با آیکون وکتور کلش غذا -->
          <button
            type="button"
            id="btn-quick-food"
            (click)="foodStore.goToMeals()"
            class="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.09)] active:scale-95 transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer group text-center min-h-[108px]">
            <div class="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B3D] flex items-center justify-center group-hover:bg-[#FF6B3D] group-hover:text-white transition-colors shadow-xs">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2m0 0a8 8 0 018 8v1H4v-1a8 8 0 018-8zm-8 11h16v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1z" />
              </svg>
            </div>
            <span class="text-xs sm:text-sm font-bold text-[#111111] leading-tight">انتخاب غذا</span>
          </button>

          <!-- ۲. میانبر سفارش‌ها با آیکون فاکتور و رسید سفارش -->
          <button
            type="button"
            id="btn-quick-orders"
            (click)="foodStore.goToOrders()"
            class="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.09)] active:scale-95 transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer group text-center min-h-[108px]">
            <div class="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B3D] flex items-center justify-center group-hover:bg-[#FF6B3D] group-hover:text-white transition-colors shadow-xs">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <span class="text-xs sm:text-sm font-bold text-[#111111] leading-tight">سفارش‌ها</span>
          </button>

          <!-- ۳. میانبر کیف پول با آیکون والت -->
          <button
            type="button"
            id="btn-quick-wallet"
            (click)="foodStore.goToWallet()"
            class="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.09)] active:scale-95 transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer group text-center min-h-[108px]">
            <div class="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B3D] flex items-center justify-center group-hover:bg-[#FF6B3D] group-hover:text-white transition-colors shadow-xs">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5zm0 0h-4a2 2 0 00-2 2v0a2 2 0 002 2h4M7 9h.01" />
              </svg>
            </div>
            <span class="text-xs sm:text-sm font-bold text-[#111111] leading-tight">کیف پول</span>
          </button>

        </div>

      </section>

      <!-- =========================================================================
           مدال انتخاب فرزند (CHILD SELECTION MODAL)
           با زدن دکمه تغییر باز می‌شود و فهرست کامل فرزندان همراه با عکس‌های آواتار،
           پایه، مدرسه، نکات رژیمی و انتخاب آسان را ارائه می‌دهد.
           ========================================================================= -->
      @if (foodStore.isChildModalOpen()) {
        <!-- لایه تیره پس‌زمینه (Backdrop) -->
        <button
          type="button"
          id="child-select-backdrop"
          class="fixed inset-0 w-full h-full bg-black/60 z-50 backdrop-blur-xs transition-opacity animate-in fade-in cursor-pointer border-0 p-0 touch-none"
          (touchmove)="$event.preventDefault()"
          (wheel)="$event.preventDefault()"
          (click)="foodStore.closeChildModal()"
          aria-label="بستن پنجره انتخاب فرزند">
        </button>

        <!-- برگه مدال شناور با انیمیشن ورود و گردی شکیل -->
        <div
          id="child-select-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="child-modal-title"
          (touchmove)="$event.stopPropagation()"
          class="fixed bottom-0 inset-x-0 max-w-[440px] mx-auto bg-white rounded-t-[32px] sm:rounded-[32px] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-50 p-5 sm:p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden overscroll-contain animate-in slide-in-from-bottom duration-300">
          
          <!-- دستگیره لمسی باریک بالای برگه برای گوشی -->
          <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-3 sm:hidden"></div>

          <!-- هدر مدال: عنوان و دکمه بستن -->
          <div class="flex items-center justify-between pb-3.5 border-b border-gray-100">
            <div>
              <h2 id="child-modal-title" class="text-base font-black text-[#111111] tracking-tight">
                انتخاب فرزند
              </h2>
              <p class="text-[11px] text-[#8F8F8F] font-normal mt-0.5">
                فرزند مورد نظر خود را برای سفارش ناهار یا بررسی انتخاب کنید
              </p>
            </div>

            <button
              type="button"
              id="btn-close-child-modal"
              (click)="foodStore.closeChildModal()"
              aria-label="بستن"
              class="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- لیست کارت‌های فرزندان -->
          <div id="modal-children-list" class="overflow-y-auto flex-1 my-4 space-y-2.5 pr-0.5">
            @for (child of foodStore.children(); track child.id) {
              <button
                type="button"
                [id]="'modal-child-card-' + child.id"
                (click)="onSelectChildInModal(child.id)"
                class="w-full text-right p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3"
                [class.bg-orange-50/70]="foodStore.selectedChildId() === child.id"
                [class.border-[#FF6B3D]]="foodStore.selectedChildId() === child.id"
                [class.shadow-xs]="foodStore.selectedChildId() === child.id"
                [class.bg-white]="foodStore.selectedChildId() !== child.id"
                [class.border-gray-200/80]="foodStore.selectedChildId() !== child.id"
                [class.hover:border-orange-200]="foodStore.selectedChildId() !== child.id">
                
                <!-- سمت راست: آواتار تصویری و نام و جزئیات مدرسه -->
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-13 h-13 rounded-2xl p-0.5 border flex items-center justify-center flex-shrink-0 shadow-xs relative overflow-hidden"
                    [class.border-[#FF6B3D]]="foodStore.selectedChildId() === child.id"
                    [class.bg-orange-100/60]="foodStore.selectedChildId() === child.id"
                    [class.border-gray-200]="foodStore.selectedChildId() !== child.id"
                    [class.bg-gray-50]="foodStore.selectedChildId() !== child.id">
                    @if (foodStore.isImageAvatar(child.avatar)) {
                      <img [src]="child.avatar" [alt]="child.name" class="w-full h-full object-cover rounded-xl" referrerpolicy="no-referrer" />
                    } @else {
                      <span class="text-2xl">{{ child.avatar }}</span>
                    }
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="text-sm font-bold text-[#111111] truncate">
                        {{ child.name }}
                      </h3>
                      @if (foodStore.selectedChildId() === child.id) {
                        <span class="text-[9px] font-bold text-[#FF6B3D] bg-orange-100/80 border border-orange-200 px-1.5 py-0.5 rounded-md">
                          فرزند فعال
                        </span>
                      }
                    </div>
                    <p class="text-[11px] text-[#8F8F8F] font-normal truncate mt-0.5">
                      {{ child.grade }} - {{ child.school }}
                    </p>
                    @if (child.dietaryNote) {
                      <span class="text-[10px] text-gray-500 bg-gray-100/90 px-2 py-0.5 rounded-md mt-1 inline-block">
                        🥗 {{ child.dietaryNote }}
                      </span>
                    }
                  </div>
                </div>

                <!-- نشانگر وضعیت انتخاب (رادیو / چک‌مارک) -->
                <div
                  class="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-all"
                  [class.bg-[#FF6B3D]]="foodStore.selectedChildId() === child.id"
                  [class.border-[#FF6B3D]]="foodStore.selectedChildId() === child.id"
                  [class.border-gray-300]="foodStore.selectedChildId() !== child.id">
                  @if (foodStore.selectedChildId() === child.id) {
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  }
                </div>
              </button>
            }
          </div>

          <!-- کلیدهای پایین برگه مدال -->
          <div class="pt-3 border-t border-gray-100 flex items-center gap-2">
            <button
              type="button"
              id="btn-confirm-child-selection"
              (click)="foodStore.closeChildModal()"
              class="flex-1 py-3 bg-[#FF6B3D] hover:bg-[#e85a2d] active:scale-98 text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer text-center">
              تایید و انتخاب
            </button>
            <button
              type="button"
              id="btn-manage-children"
              (click)="navigateToChildrenManagement()"
              class="py-3 px-4 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-700 text-xs font-bold rounded-2xl transition cursor-pointer flex items-center gap-1">
              <span>مدیریت</span>
            </button>
          </div>

        </div>
      }

    </div>
  `,
})
export class HomePage implements OnDestroy {
  readonly foodStore = inject(FoodStore);
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const isModalOpen = this.foodStore.isChildModalOpen();
      if (typeof document !== 'undefined' && this.document?.body) {
        if (isModalOpen) {
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
    if (typeof document !== 'undefined' && this.document?.body) {
      this.document.body.style.overflow = '';
      this.document.body.style.touchAction = '';
    }
  }

  // وضعیت باز بودن پیام اعلان؛ والد با زدن زنگوله می‌تونه اون رو باز یا بسته کنه
  readonly showNotificationMessage = signal<boolean>(false);

  isAvatarImage(val: string | undefined): boolean {
    if (!val) return false;
    return val.startsWith('data:image') || val.startsWith('http') || val.startsWith('/assets') || val.includes('.svg') || val.includes('.png') || val.includes('.jpg');
  }

  // اسم والد برای سلام اول صفحه
  readonly greetingName = computed(() => {
    return this.foodStore.parentProfile().name || 'سارا احمدی';
  });

  // مشخصات فرزند فعال در حال حاضر؛ با مقدار پیش‌فرض امن جهت جلوگیری از خطای خالی بودن
  readonly activeChild = computed(() => {
    return (
      this.foodStore.selectedChild() || {
        id: 'child-1',
        name: 'علی احمدی',
        grade: 'کلاس پنجم',
        school: 'مدرسه نمونه',
        avatar: '👦',
        age: 11,
      }
    );
  });

  // اسم کوچیک بچه برای سلام خودمونی در سربرگ (مثلاً علی)
  readonly activeChildShortName = computed(() => {
    const child = this.activeChild();
    if (!child || !child.name) return 'علی';
    return child.name.split(' ')[0];
  });

  // موجودی زنده کیف پول با فرمت ارقام فارسی و جداکننده هزارگان
  readonly formattedWalletBalance = computed(() => {
    return this.foodStore.parentProfile().walletBalance.toLocaleString('fa-IR').replace(/\u066C/g, ',');
  });

  // آخرین مبلغ شارژ شده؛ به صورت داینامیک از تاریخچه تراکنش‌های کیف پول خوانده می‌شود
  readonly lastRechargeAmount = computed(() => {
    const txs = this.foodStore.walletTransactions();
    const latestDeposit = txs.find((t) => t.type === 'deposit' && t.status === 'successful');
    if (latestDeposit) {
      return latestDeposit.amount.toLocaleString('fa-IR').replace(/\u066C/g, ',');
    }
    return '۵۰,۰۰۰';
  });

  // تعداد سفارش‌های این ماه والد؛ طبق نیازمندی دیزاین ۱۲ سفارش ثبت شده است
  readonly monthOrdersCount = computed(() => {
    return (12).toLocaleString('fa-IR');
  });

  // سفارش‌های شاخص امروز برای نمایش توی کارت‌های شیک و عریض
  readonly displayedOrders = computed<HomeOrderDisplay[]>(() => {
    const storeOrders = this.foodStore.todayOrders();
    if (!storeOrders || storeOrders.length === 0) {
      return [];
    }

    return storeOrders.map((so) => {
      const isDelivered = so.status === 'delivered' || so.statusText.includes('تحویل');
      return {
        id: so.id,
        foodTitle: so.foodTitle,
        foodSubtitle: so.foodSubtitle || 'پرس کامل',
        mealPeriod: 'امروز',
        dateLabel: '۱۰ شهریور',
        foodEmoji: so.foodEmoji || '🍱',
        statusBadgeText: isDelivered ? 'تحویل شده' : 'در حال آماده‌سازی',
        statusBadgeType: (isDelivered ? 'delivered' : 'preparing') as 'delivered' | 'preparing',
        trackingCode: so.trackingCode || '۹۸۴۷۱۲',
      };
    });
  });

  // کلیک روی زنگوله اعلان؛ پیام وضعیت رو باز یا بسته می‌کنه
  toggleNotificationTip(): void {
    this.showNotificationMessage.update((prev) => !prev);
  }

  // تغییر فرزند؛ با زدن دکمه تغییر، مدال شیک و تمیز انتخاب فرزند باز می‌شود
  handleChangeChild(): void {
    this.foodStore.openChildModal();
  }

  // انتخاب مستقیم فرزند از داخل مدال و بستن خودکار پنجره
  onSelectChildInModal(childId: string): void {
    this.foodStore.selectChild(childId);
    this.foodStore.closeChildModal();
  }

  // هدایت به صفحه مدیریت فرزندان
  navigateToChildrenManagement(): void {
    this.foodStore.closeChildModal();
    this.foodStore.goToChildren();
  }

  // رفتن به صفحه مدیریت و شارژ کیف پول
  handleRecharge(): void {
    this.foodStore.goToWallet();
  }
}
