import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-today-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="today-orders-section" class="px-5 mt-6 mb-8" data-purpose="today-orders">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <h2 class="text-base font-black text-[#141517] tracking-tight">
            سفارشات امروز
          </h2>
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-black flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>۲ سفارش فعال</span>
          </span>
        </div>

        <button
          type="button"
          (click)="foodStore.goToOrders()"
          class="text-xs font-bold text-gray-400 hover:text-[#f97352] transition cursor-pointer flex items-center gap-1">
          <span>همه سفارش‌ها</span>
          <svg class="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <!-- Today's Orders Cards -->
      <div class="space-y-3.5">
        @for (order of foodStore.todayOrders(); track order.id) {
          <div
            [id]="'today-order-card-' + order.id"
            class="bg-white rounded-[26px] p-5 border border-black/[0.06] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_-4px_rgba(0,0,0,0.08)] transition-all">
            
            <!-- Card Header: Child Avatar & School info -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-2xl bg-[#f7f7f8] border border-black/[0.05] flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                  {{ order.childAvatar }}
                </div>
                <div>
                  <h3 class="text-xs font-black text-gray-900 tracking-tight">
                    {{ order.childName }}
                  </h3>
                  <p class="text-[10px] text-gray-400 font-medium mt-0.5">
                    {{ order.school }} • {{ order.grade }}
                  </p>
                </div>
              </div>

              <!-- Live Status Pill -->
              <span
                [class]="
                  order.status === 'delivering'
                    ? 'px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-black flex items-center gap-1.5'
                    : 'px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-black flex items-center gap-1.5'
                ">
                <span
                  [class]="
                    order.status === 'delivering'
                      ? 'w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'
                      : 'w-1.5 h-1.5 rounded-full bg-emerald-500'
                  "></span>
                <span>{{ order.statusText }}</span>
              </span>
            </div>

            <!-- Meal Details Box -->
            <div class="mt-3.5 bg-[#fbfbfb] rounded-2xl p-3 border border-black/[0.03] flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center text-2xl shadow-xs">
                  {{ order.foodEmoji }}
                </div>
                <div class="min-w-0">
                  <h4 class="text-xs font-black text-gray-900 truncate">
                    {{ order.foodTitle }}
                  </h4>
                  <p class="text-[10px] text-gray-500 truncate mt-0.5">
                    {{ order.foodSubtitle }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Card Footer: Delivery Time, Price & Action Button -->
            <div class="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div class="text-[11px] text-gray-500">
                <div class="flex items-center gap-1.5 text-gray-600 font-bold">
                  <svg class="w-3.5 h-3.5 text-[#f97352]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ order.deliveryTime }}</span>
                </div>
                <span class="text-[10px] text-gray-400 mt-0.5 block">
                  پیگیری: {{ order.trackingCode }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <div class="text-left">
                  <span class="text-xs font-black text-gray-900">
                    {{ order.price.toLocaleString('fa-IR') }}
                  </span>
                  <span class="text-[10px] text-gray-400 mr-0.5">تومان</span>
                </div>

                <button
                  type="button"
                  (click)="foodStore.goToOrders()"
                  class="px-3.5 py-1.5 rounded-xl bg-[#141517] hover:bg-black active:scale-95 text-white text-[11px] font-black transition cursor-pointer">
                  پیگیری
                </button>
              </div>
            </div>

          </div>
        }

        <!-- Child without today's order notice (Amirali) -->
        <div
          id="child-no-order-notice"
          class="bg-white rounded-[26px] p-4.5 border border-dashed border-orange-300/80 bg-orange-50/20 shadow-xs flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-orange-100/60 border border-orange-200/60 flex items-center justify-center text-xl flex-shrink-0">
              🧒
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="text-xs font-black text-gray-900">
                  امیرعلی احمدی
                </h4>
                <span class="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[9px] font-bold">
                  بدون ناهار امروز
                </span>
              </div>
              <p class="text-[10px] text-gray-500 mt-0.5">
                مهلت سفارش ناهار امروز دبستان تا ساعت ۱۰:۳۰
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-quick-order-amirali"
            (click)="foodStore.orderForChild('child-3')"
            class="px-3.5 py-2 bg-[#f97352] hover:bg-[#e05432] active:scale-95 text-white text-xs font-black rounded-xl shadow-sm shadow-orange-500/20 flex items-center gap-1 transition cursor-pointer flex-shrink-0">
            <span>سفارش ناهار</span>
            <svg class="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Link / Shortcut Banner to Dedicated Children Page -->
      <div class="mt-4 bg-[#fafafa] rounded-[24px] p-4 border border-black/[0.04] flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-xl shadow-xs">
            👨‍👩‍👧‍👦
          </div>
          <div>
            <h4 class="text-xs font-black text-[#141517]">
              مدیریت و اطلاعات فرزندان
            </h4>
            <p class="text-[10px] text-gray-500 font-medium mt-0.5">
              مشاهده پرونده سلامت، رژیم غذایی و مدارس ۳ فرزند
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-goto-children-from-home"
          (click)="foodStore.goToChildren()"
          class="px-3 py-2 rounded-xl bg-[#141517] hover:bg-black active:scale-95 text-white text-[11px] font-black flex items-center gap-1 transition cursor-pointer">
          <span>صفحه فرزندان</span>
          <svg class="w-3 h-3 text-[#f97352] transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

    </section>
  `,
})
export class TodayOrders {
  readonly foodStore = inject(FoodStore);
}
