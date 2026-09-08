import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  effect,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {FoodStore} from '../../services/food-store';
import {SchoolOrder, OrderSummaryItem} from '../../models/food.model';

@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="orders-page-view" class="px-5 pt-3 pb-8 animate-in fade-in duration-200" data-purpose="orders-page">
      
      <!-- نوار بالای صفحه با دکمه بازگشت، عنوان و تعداد کل سفارش‌ها -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <button
            id="btn-orders-back"
            type="button"
            (click)="foodStore.goToHome()"
            aria-label="بازگشت به صفحه اصلی"
            class="w-10 h-10 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-center text-gray-800 shadow-xs hover:bg-gray-50 active:scale-95 transition cursor-pointer">
            <svg class="w-5 h-5 transform rotate-0 text-gray-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div>
            <h1 class="text-lg font-black text-[#141517] tracking-tight">
              سفارش‌های فعال و اخیر
            </h1>
            <p class="text-xs text-gray-400 font-medium mt-0.5">
              پیگیری زنده و سوابق ناهار گرم مدارس
            </p>
          </div>
        </div>

        <span class="px-3 py-1 rounded-full bg-[#141517] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
          <span>{{ totalCount().toLocaleString('fa-IR') }} سفارش</span>
        </span>
      </div>

      <!-- تب‌های فیلتر بالای صفحه (سگمنت کنترل با پس‌زمینه کپسولی مشکی) -->
      <div class="bg-white rounded-[24px] p-1.5 sm:p-2 border border-black/[0.05] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] mb-5">
        <div class="w-full bg-gray-100/90 p-1 rounded-full border border-black/[0.04] grid grid-cols-3 gap-1">
          <button
            id="filter-order-all"
            type="button"
            (click)="setFilter('all')"
            [class]="
              activeFilter() === 'all'
                ? 'py-2 sm:py-2.5 rounded-full bg-[#141517] text-white font-black text-xs sm:text-[13px] shadow-sm transition-all cursor-pointer text-center'
                : 'py-2 sm:py-2.5 rounded-full text-gray-500 hover:text-gray-900 font-bold text-xs sm:text-[13px] transition-all cursor-pointer text-center'
            ">
            همه
          </button>
          <button
            id="filter-order-active"
            type="button"
            (click)="setFilter('active')"
            [class]="
              activeFilter() === 'active'
                ? 'py-2 sm:py-2.5 rounded-full bg-[#141517] text-white font-black text-xs sm:text-[13px] shadow-sm transition-all cursor-pointer text-center'
                : 'py-2 sm:py-2.5 rounded-full text-gray-500 hover:text-gray-900 font-bold text-xs sm:text-[13px] transition-all cursor-pointer text-center'
            ">
            سفارش‌های فعال ({{ activeCount().toLocaleString('fa-IR') }})
          </button>
          <button
            id="filter-order-delivered"
            type="button"
            (click)="setFilter('delivered')"
            [class]="
              activeFilter() === 'delivered'
                ? 'py-2 sm:py-2.5 rounded-full bg-[#141517] text-white font-black text-xs sm:text-[13px] shadow-sm transition-all cursor-pointer text-center'
                : 'py-2 sm:py-2.5 rounded-full text-gray-500 hover:text-gray-900 font-bold text-xs sm:text-[13px] transition-all cursor-pointer text-center'
            ">
            تحویل شده
          </button>
        </div>
      </div>

      <!-- لیست کارت‌های سفارش با لودینگ، اسکلتون و اسکرول نامحدود -->
      <div class="space-y-3">
        <!-- اسکلتون لودینگ اولیه تا موقعی که داده‌ها از دیتابیس بیان -->
        @if (foodStore.isOrdersLoading() && displayOrders().length === 0) {
          <div class="space-y-3 animate-pulse">
            <div class="bg-white rounded-[22px] p-4 border border-black/[0.06] h-36"></div>
            <div class="bg-white rounded-[22px] p-4 border border-black/[0.06] h-36"></div>
            <div class="bg-white rounded-[22px] p-4 border border-black/[0.06] h-36"></div>
          </div>
        }

        @for (order of displayOrders(); track order.id) {
          <div
            [id]="'order-card-' + order.id"
            class="bg-white rounded-[22px] p-4 border border-black/[0.06] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
            
            <!-- سربرگ کارت: تصویر آواتار فرزند، نام، مدرسه و نشان وضعیت -->
            <div class="flex items-center justify-between gap-2.5">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-11 h-11 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center justify-center shadow-xs flex-shrink-0 overflow-hidden">
                  <img
                    [src]="foodStore.getChildAvatar(order.childId, order.childAvatar)"
                    [alt]="order.childName"
                    class="w-full h-full object-cover"
                    referrerpolicy="no-referrer" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <h3 class="text-xs font-black text-gray-900 truncate">
                      {{ order.childName }}
                    </h3>
                    <span class="text-[10px] text-gray-400 font-mono font-medium">
                      ({{ getOrderCode(order) }})
                    </span>
                  </div>
                  <p class="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                    {{ getSchoolName(order) }} @if (order.grade) { • {{ order.grade }} }
                  </p>
                </div>
              </div>

              <!-- نشان زنده وضعیت سفارش -->
              <span
                [class]="
                  order.status === 'active'
                    ? 'px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-black flex items-center gap-1.5 flex-shrink-0'
                    : 'px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-black flex items-center gap-1.5 flex-shrink-0'
                ">
                <span
                  [class]="
                    order.status === 'active'
                      ? 'w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'
                      : 'w-1.5 h-1.5 rounded-full bg-emerald-500'
                  "></span>
                <span>{{ order.status === 'active' ? 'در حال آماده‌سازی' : 'تحویل شده' }}</span>
              </span>
            </div>

            <!-- بخش میانی: اطلاعات ناهار و قیمت -->
            <div class="mt-3 bg-[#fbfbfb] rounded-xl px-3 py-2.5 border border-black/[0.03] flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-2xl flex-shrink-0">{{ order.foodEmoji }}</span>
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-gray-900 truncate">
                    {{ order.foodTitle }}
                  </h4>
                  <div class="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                    <span>{{ getOrderDate(order) }}</span>
                    @if (order.deliveryTime) {
                      <span>•</span>
                      <span class="text-gray-600 font-semibold">{{ order.deliveryTime }}</span>
                    }
                  </div>
                </div>
              </div>

              <!-- قیمت به تومان و اعداد فارسی -->
              <div class="text-left flex-shrink-0">
                <span class="text-xs sm:text-sm font-black text-gray-900">
                  {{ order.price.toLocaleString('fa-IR') }}
                </span>
                <span class="text-[9px] text-gray-400 font-medium mr-0.5">تومان</span>
              </div>
            </div>

            <!-- پاورقی کارت: کد رهگیری و دکمه جزئیات بیشتر -->
            <div class="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
              <span class="text-[10px] text-gray-400 font-mono">
                کد رهگیری: {{ order.trackingCode }}
              </span>

              <button
                type="button"
                [id]="'btn-order-details-' + order.id"
                (click)="openOrderDetails(order)"
                class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-800 text-xs font-bold rounded-xl border border-black/[0.05] transition cursor-pointer flex items-center gap-1.5">
                <span>جزئیات بیشتر</span>
                <svg class="w-3.5 h-3.5 text-gray-500 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

          </div>
        }

        <!-- لودینگ چرخان اسکرول بی‌نهایت وقتی به پایین صفحه می‌رسیم -->
        @if (foodStore.isOrdersLoadingMore()) {
          <div class="flex items-center justify-center gap-2 py-4 text-xs font-bold text-gray-500">
            <span class="w-4 h-4 border-2 border-[#f97352] border-t-transparent rounded-full animate-spin"></span>
            <span>در حال دریافت سفارش‌های بعدی...</span>
          </div>
        }

        <!-- پیام رسیدن به پایان لیست سفارش‌ها -->
        @if (!foodStore.ordersHasMore() && displayOrders().length >= 10) {
          <div class="text-center py-4 text-[11px] font-medium text-gray-400">
            ✓ تمامی سفارش‌های شما بارگذاری شدند
          </div>
        }

        <!-- حالت خالی در صورتی که هیچ سفارشی یافت نشود -->
        @if (!foodStore.isOrdersLoading() && displayOrders().length === 0) {
          <div class="bg-white rounded-[26px] p-8 border border-black/[0.05] text-center shadow-xs my-6">
            <div class="w-16 h-16 rounded-full bg-gray-50 border border-gray-200/60 flex items-center justify-center text-3xl mx-auto mb-3">
              📋
            </div>
            <h3 class="text-sm font-black text-gray-800">سفارشی با این فیلتر یافت نشد</h3>
            <p class="text-xs text-gray-400 font-medium mt-1 mb-4">
              می‌توانید فیلتر وضعیت را روی «همه» قرار دهید یا ناهار جدید رزرو نمایید.
            </p>
            <button
              type="button"
              (click)="setFilter('all')"
              class="px-4 py-2 bg-[#f97352] text-white text-xs font-black rounded-xl shadow-xs active:scale-95 transition cursor-pointer">
              نمایش همه سفارش‌ها
            </button>
          </div>
        }
      </div>

      <!-- مودال اختصاصی جزئیات و پیگیری دقیق سفارش (Lazy Loading) -->
      @if (selectedTrackingOrder(); as trackingOrder) {
        <div
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 overscroll-contain"
          (touchmove)="$event.stopPropagation()">
          <!-- بک‌دراپ تاریک با قابلیت بستن با کلیک -->
          <button
            type="button"
            class="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-xs cursor-pointer border-none touch-none"
            aria-label="بستن پنجره جزئیات"
            (touchmove)="$event.preventDefault()"
            (wheel)="$event.preventDefault()"
            (click)="closeOrderDetails()">
          </button>

          <!-- برگه محتوای مودال -->
          <div
            class="relative bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border border-gray-100 z-10 max-h-[90vh] overflow-y-auto overscroll-contain no-scrollbar"
            (touchmove)="$event.stopPropagation()">
            
            <!-- نشانگر لمسی کشیدن برای موبایل -->
            <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-3 sm:hidden"></div>

            <!-- سربرگ مودال -->
            <div class="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div>
                <h3 class="text-sm sm:text-base font-black text-gray-900">جزئیات و پیگیری سفارش</h3>
                <p class="text-[11px] text-gray-400 font-mono mt-0.5">
                  کد سفارش: {{ foodStore.selectedOrderDetail()?.orderCode || trackingOrder.id }}
                </p>
              </div>

              <button
                type="button"
                (click)="closeOrderDetails()"
                aria-label="بستن"
                class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- کارت معرفی فرزند و مدرسه -->
            <div class="mt-4 p-3.5 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-white border border-orange-200/80 flex items-center justify-center shadow-xs overflow-hidden flex-shrink-0">
                  <img
                    [src]="foodStore.getChildAvatar(trackingOrder.childId, trackingOrder.childAvatar)"
                    [alt]="trackingOrder.childName"
                    class="w-full h-full object-cover"
                    referrerpolicy="no-referrer" />
                </div>
                <div>
                  <h4 class="text-xs font-black text-gray-900">{{ trackingOrder.childName }}</h4>
                  <p class="text-[11px] text-gray-600 mt-0.5">{{ trackingOrder.school }} • {{ trackingOrder.grade }}</p>
                </div>
              </div>

              <span
                [class]="
                  (foodStore.selectedOrderDetail()?.status || trackingOrder.status) === 'active'
                    ? 'px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-800 text-[10px] font-black'
                    : 'px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-black'
                ">
                {{ foodStore.selectedOrderDetail()?.statusText || (trackingOrder.status === 'active' ? 'در حال آماده‌سازی' : 'تحویل شده') }}
              </span>
            </div>

            <!-- هشدار یادداشت رژیمی فرزند در صورت وجود -->
            @if (foodStore.selectedOrderDetail()?.dietaryNotes) {
              <div class="mt-3 px-3.5 py-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2 text-[11px] text-amber-900">
                <span class="text-sm">⚠️</span>
                <div>
                  <span class="font-bold">یادداشت سلامت/رژیمی: </span>
                  <span>{{ foodStore.selectedOrderDetail()?.dietaryNotes }}</span>
                </div>
              </div>
            }

            <!-- اسکلتون لودینگ هنگام واکشی دیتای عمیق از سرور -->
            @if (foodStore.isOrderDetailLoading()) {
              <div class="mt-4 space-y-3 animate-pulse">
                <div class="h-20 bg-gray-100 rounded-2xl"></div>
                <div class="h-32 bg-gray-100 rounded-2xl"></div>
              </div>
            } @else {
              <!-- ریز اقلام سفارش دریافت شده از دیتابیس -->
              @if (foodStore.selectedOrderDetail()?.items && (foodStore.selectedOrderDetail()?.items?.length ?? 0) > 0) {
                <div class="mt-4 space-y-2">
                  <div class="text-xs font-black text-gray-800 px-1">اقلام ثبت‌شده در سفارش:</div>
                  @for (item of foodStore.selectedOrderDetail()?.items; track item.id) {
                    <div class="p-3 bg-[#fbfbfb] rounded-2xl border border-black/[0.04] flex items-center justify-between gap-3">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <span class="text-2xl flex-shrink-0">{{ item.emoji }}</span>
                        <div class="min-w-0">
                          <h4 class="text-xs font-bold text-gray-900 truncate">{{ item.foodTitle }}</h4>
                          <p class="text-[10px] text-gray-500 mt-0.5">
                            {{ item.portion }} • {{ item.quantity }} عدد
                            @if (item.calories) {
                              • 🔥 {{ item.calories }} کیلوکالری
                            }
                          </p>
                          @if (item.ingredients) {
                            <p class="text-[9px] text-gray-400 truncate mt-0.5">{{ item.ingredients }}</p>
                          }
                        </div>
                      </div>
                      <div class="text-left flex-shrink-0">
                        <span class="text-xs font-black text-gray-900">{{ item.totalPrice.toLocaleString('fa-IR') }}</span>
                        <span class="text-[9px] text-gray-400 mr-0.5">تومان</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <!-- فال‌بک غذای پیش‌فرض در صورت نبود ریز اقلام -->
                <div class="mt-4 p-3.5 bg-[#fbfbfb] rounded-2xl border border-black/[0.04]">
                  <div class="flex items-start gap-3">
                    <div class="w-12 h-12 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center text-2xl shadow-xs flex-shrink-0">
                      {{ trackingOrder.foodEmoji }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <h4 class="text-xs sm:text-sm font-black text-gray-900">{{ trackingOrder.foodTitle }}</h4>
                      @if (trackingOrder.foodSubtitle) {
                        <p class="text-[11px] text-gray-500 mt-1 leading-relaxed">{{ trackingOrder.foodSubtitle }}</p>
                      }
                      <div class="flex items-center gap-2 text-[11px] text-gray-400 mt-2">
                        <span>{{ trackingOrder.date }}</span>
                        <span>•</span>
                        <span class="text-gray-700 font-bold">{{ trackingOrder.deliveryTime }} تحویل در بوفه</span>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- استپر مراحل آماده‌سازی و توزیع بر اساس دیتای سرور -->
              <div class="mt-4 p-4 rounded-2xl bg-gray-50 border border-black/[0.04]">
                <div class="flex items-center justify-between text-xs font-black text-gray-800 mb-3">
                  <span>مراحل آماده‌سازی و توزیع</span>
                  @if ((foodStore.selectedOrderDetail()?.status || trackingOrder.status) === 'active') {
                    <span class="text-[#f97352] text-[11px] font-bold">مرحله ۳ از ۴ (در حال ارسال)</span>
                  } @else {
                    <span class="text-emerald-600 text-[11px] font-bold">تکمیل شده ✓</span>
                  }
                </div>

                <!-- لیست مراحل تایم‌لاین -->
                <div class="space-y-3 px-1">
                  @if (foodStore.selectedOrderDetail()?.timelineSteps; as steps) {
                    @for (step of steps; track step.title) {
                      <div class="flex items-start gap-3">
                        <div
                          [class]="
                            step.isCompleted
                              ? 'w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0'
                              : step.isCurrent
                              ? 'w-6 h-6 rounded-full bg-[#f97352] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 animate-pulse'
                              : 'w-6 h-6 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold flex-shrink-0'
                          ">
                          {{ step.isCompleted ? '✓' : step.icon }}
                        </div>
                        <div class="flex-1">
                          <div class="flex items-center justify-between">
                            <h5
                              [class]="
                                step.isCurrent
                                  ? 'text-xs font-black text-[#f97352]'
                                  : step.isCompleted
                                  ? 'text-xs font-bold text-gray-800'
                                  : 'text-xs font-bold text-gray-400'
                              ">
                              {{ step.title }}
                            </h5>
                            <span class="text-[10px] text-gray-400">{{ step.time }}</span>
                          </div>
                          <p class="text-[10px] text-gray-500 mt-0.5">{{ step.subtitle }}</p>
                        </div>
                      </div>
                    }
                  } @else {
                    <!-- تایم‌لاین پیش‌فرض -->
                    <div class="flex items-start gap-3">
                      <div class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <h5 class="text-xs font-bold text-gray-800">تایید سفارش و پرداخت</h5>
                          <span class="text-[10px] text-gray-400">ساعت ۰۸:۳۰</span>
                        </div>
                        <p class="text-[10px] text-gray-500 mt-0.5">پرداخت موفق از اعتبار کیف پول</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3">
                      <div class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <h5 class="text-xs font-bold text-gray-800">طبخ بهداشتی و کنترل کیفیت</h5>
                          <span class="text-[10px] text-gray-400">ساعت ۱۰:۴۵</span>
                        </div>
                        <p class="text-[10px] text-gray-500 mt-0.5">کیترینگ اختصاصی با بسته‌بندی بهداشتی گرم</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3">
                      <div [class]="trackingOrder.status === 'active' ? 'w-6 h-6 rounded-full bg-[#f97352] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 animate-pulse' : 'w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0'">
                        {{ trackingOrder.status === 'active' ? '🚚' : '✓' }}
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <h5 [class]="trackingOrder.status === 'active' ? 'text-xs font-black text-[#f97352]' : 'text-xs font-bold text-gray-800'">
                            ارسال به مدرسه
                          </h5>
                          <span class="text-[10px] text-gray-400">ساعت ۱۱:۴۰</span>
                        </div>
                        <p class="text-[10px] text-gray-500 mt-0.5">با خودروی مجهز به گرم‌خانه برای حفظ تازگی غذا</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3">
                      <div [class]="trackingOrder.status === 'delivered' ? 'w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0' : 'w-6 h-6 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold flex-shrink-0'">
                        {{ trackingOrder.status === 'delivered' ? '✓' : '📍' }}
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <h5 [class]="trackingOrder.status === 'delivered' ? 'text-xs font-bold text-gray-800' : 'text-xs font-bold text-gray-400'">
                            تحویل در بوفه مدرسه
                          </h5>
                          <span class="text-[10px] text-gray-400">{{ trackingOrder.deliveryTime }}</span>
                        </div>
                        <p class="text-[10px] text-gray-400 mt-0.5">تحویل گرم به دانش‌آموز در زنگ ناهار</p>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- خلاصه فاکتور مالی و پرداخت -->
              <div class="mt-4 p-3.5 bg-gray-50 rounded-2xl border border-black/[0.04] space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-gray-500">مبلغ کل اقلام</span>
                  <div class="text-left">
                    <span class="text-xs font-black text-gray-900">
                      {{ (foodStore.selectedOrderDetail()?.totalRawPrice || trackingOrder.price).toLocaleString('fa-IR') }}
                    </span>
                    <span class="text-[9px] text-gray-500 mr-1">تومان</span>
                  </div>
                </div>

                @if ((foodStore.selectedOrderDetail()?.discountAmount ?? 0) > 0) {
                  <div class="flex items-center justify-between text-emerald-600 text-[11px]">
                    <span>تخفیف اعمال‌شده</span>
                    <span>{{ (foodStore.selectedOrderDetail()?.discountAmount ?? 0).toLocaleString('fa-IR') }} - تومان</span>
                  </div>
                }

                <div class="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                  <div>
                    <span class="text-xs font-black text-gray-900 block">مبلغ پرداختی نهایی</span>
                    <span class="text-[10px] text-gray-400 font-mono">
                      کد رهگیری: {{ foodStore.selectedOrderDetail()?.trackingCode || trackingOrder.trackingCode }}
                    </span>
                  </div>
                  <div class="text-left">
                    <span class="text-sm font-black text-[#f97352]">
                      {{ (foodStore.selectedOrderDetail()?.finalPayablePrice || trackingOrder.price).toLocaleString('fa-IR') }}
                    </span>
                    <span class="text-[10px] text-gray-500 mr-1">تومان</span>
                  </div>
                </div>
              </div>
            }

            <!-- دکمه‌های اقدام انتهای مودال -->
            <div class="mt-5 flex items-center gap-2">
              @if ((foodStore.selectedOrderDetail()?.status || trackingOrder.status) === 'delivered') {
                <button
                  type="button"
                  (click)="handleReorder(trackingOrder); closeOrderDetails()"
                  class="flex-1 py-3 bg-[#f97352] hover:bg-[#e05432] active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer text-center">
                  سفارش مجدد این ناهار
                </button>
              }
              <button
                type="button"
                (click)="closeOrderDetails()"
                [class]="(foodStore.selectedOrderDetail()?.status || trackingOrder.status) === 'delivered' ? 'px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer' : 'w-full py-3 bg-[#141517] hover:bg-black active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer'">
                بستن پنجره
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `,
})
export class OrdersPage implements OnInit, OnDestroy {
  readonly foodStore = inject(FoodStore);
  private readonly document = inject(DOCUMENT);

  // تب فیلتر وضعیت جاری: 'all' | 'active' | 'delivered'
  readonly activeFilter = signal<'all' | 'active' | 'delivered'>('all');

  // سفارش انتخاب‌شده جاری جهت باز شدن پنجره جزئیات
  readonly selectedTrackingOrder = signal<SchoolOrder | null>(null);

  constructor() {
    // قفل کردن اسکرول پس‌زمینه صفحه هنگام باز بودن مدال جزئیات سفارش
    effect(() => {
      const isModalOpen = !!this.selectedTrackingOrder();
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

  ngOnInit(): void {
    // به محض باز شدن صفحه، ۱۰ تای اول رو طبق فیلتر جاری از دیتابیس لود می‌کنیم
    this.foodStore.loadMyOrders(1, false, this.activeFilter());
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined' && this.document?.body) {
      this.document.body.style.overflow = '';
      this.document.body.style.touchAction = '';
    }
  }

  // لود کردن اتوماتیک ۱۰ تای بعدی با اسکرول نامحدود کاربر به انتهای صفحه
  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (typeof window === 'undefined') return;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 200;
    if (scrollPosition >= threshold) {
      if (this.foodStore.ordersHasMore() && !this.foodStore.isOrdersLoadingMore() && !this.foodStore.isOrdersLoading()) {
        this.foodStore.loadMoreOrders(this.activeFilter());
      }
    }
  }

  // تغییر تب فیلتر و واکشی مجدد صفحه اول از سرور
  setFilter(filter: 'all' | 'active' | 'delivered'): void {
    this.activeFilter.set(filter);
    this.foodStore.loadMyOrders(1, false, filter);
  }

  // باز کردن پنجره جزئیات و لود تنبل اطلاعات عمیق سفارش
  openOrderDetails(order: OrderSummaryItem | SchoolOrder): void {
    const baseOrder: SchoolOrder = {
      id: order.id,
      childId: order.childId,
      childName: order.childName,
      childAvatar: order.childAvatar || '/assets/avatars/ali.svg',
      school: this.getSchoolName(order),
      grade: order.grade,
      foodTitle: order.foodTitle,
      foodSubtitle: order.foodSubtitle,
      foodEmoji: order.foodEmoji,
      date: this.getOrderDate(order),
      deliveryTime: order.deliveryTime,
      status: order.status,
      statusText: order.statusText,
      price: order.price,
      trackingCode: order.trackingCode,
    };
    this.selectedTrackingOrder.set(baseOrder);
    this.foodStore.loadOrderDetail(order.id);
  }

  // بستن مودال و پاک‌کردن اطلاعات لود شده
  closeOrderDetails(): void {
    this.selectedTrackingOrder.set(null);
    this.foodStore.clearOrderDetail();
  }

  // محاسبه تعداد کل سفارش‌ها از استور با اولویت دیتابیس
  readonly totalCount = computed(() => {
    return this.foodStore.ordersTotalCount() || this.foodStore.pagedOrders().length || this.foodStore.schoolOrders().length;
  });

  // محاسبه تعداد سفارش‌های فعال جهت نمایش در تب
  readonly activeCount = computed(() => {
    const storeCount = this.foodStore.ordersActiveCount();
    if (storeCount > 0) return storeCount;
    return this.foodStore.schoolOrders().filter((o) => o.status === 'active').length;
  });

  // سفارش‌های قابل نمایش در صفحه (اولویت با لیست واکشی‌شده ۱۰تایی دیتابیس)
  readonly displayOrders = computed(() => {
    const paged = this.foodStore.pagedOrders();
    if (paged.length > 0) {
      return paged;
    }
    // فال‌بک لوکال برای مواردی مثل تست‌های کامپوننت و نبود اینترنت
    const filter = this.activeFilter();
    return this.foodStore.schoolOrders().filter((order) => {
      if (filter === 'active' && order.status !== 'active') return false;
      if (filter === 'delivered' && order.status !== 'delivered') return false;
      return true;
    });
  });

  // جهت سازگاری با کدهای تست قبلی
  readonly filteredOrders = this.displayOrders;

  // توابع کمکی ساده برای سازگاری بین مدل سرور و مدل کلاینت
  getOrderCode(order: OrderSummaryItem | SchoolOrder): string {
    return 'orderCode' in order ? order.orderCode : order.id;
  }

  getSchoolName(order: OrderSummaryItem | SchoolOrder): string {
    return 'schoolName' in order ? order.schoolName : (order as SchoolOrder).school;
  }

  getOrderDate(order: OrderSummaryItem | SchoolOrder): string {
    return 'dateLabel' in order ? order.dateLabel : (order as SchoolOrder).date;
  }

  resetFilters(): void {
    this.setFilter('all');
  }

  handleReorder(order: SchoolOrder): void {
    if (order.childId) {
      this.foodStore.orderForChild(order.childId);
    } else {
      this.foodStore.goToMeals();
    }
  }
}
