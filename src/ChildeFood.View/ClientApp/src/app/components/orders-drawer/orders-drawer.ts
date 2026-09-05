import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-orders-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (foodStore.isOrdersDrawerOpen()) {
      <!-- Backdrop -->
      <button
        id="orders-drawer-backdrop"
        type="button"
        aria-label="بستن پنجره سفارش‌ها"
        class="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs transition-opacity w-full h-full border-0 cursor-default"
        (click)="foodStore.closeOrdersDrawer()"
        (keyup.escape)="foodStore.closeOrdersDrawer()">
      </button>

      <!-- Slide-up Modal / Bottom Sheet -->
      <div
        id="orders-drawer-sheet"
        class="fixed bottom-0 inset-x-0 max-w-[440px] mx-auto bg-white rounded-t-[36px] z-50 p-6 shadow-2xl transition-transform border-t border-gray-100 flex flex-col max-h-[85vh]">
        
        <!-- Drag indicator pill -->
        <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>

        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div class="flex items-center space-x-2 space-x-reverse">
            <span class="text-xl">📋</span>
            <h2 id="orders-drawer-title" class="text-base font-black text-gray-900">سفارش‌های فعال و اخیر</h2>
            <span class="text-[11px] bg-[#f97352]/10 text-[#f97352] px-2.5 py-0.5 rounded-full font-black">
              {{ foodStore.schoolOrders().length }} سفارش
            </span>
          </div>
          <button
            id="btn-close-orders-drawer"
            (click)="foodStore.closeOrdersDrawer()"
            class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer"
            aria-label="بستن">
            ✕
          </button>
        </div>

        <!-- Orders list -->
        <div id="school-orders-list" class="overflow-y-auto flex-1 my-4 space-y-3.5 pr-0.5">
          @for (order of foodStore.schoolOrders(); track order.id) {
            <div
              [id]="'order-card-' + order.id"
              class="p-4 rounded-2xl bg-[#fafafa] border border-black/[0.05] hover:border-black/15 transition-all">
              
              <!-- Order Head: Child info & Date -->
              <div class="flex items-center justify-between pb-2.5 border-b border-gray-200/60">
                <div class="flex items-center space-x-2 space-x-reverse">
                  <span class="text-xl">{{ order.childAvatar }}</span>
                  <span class="text-xs font-black text-gray-900">{{ order.childName }}</span>
                  <span class="text-[10px] text-gray-400 font-medium">({{ order.id }})</span>
                </div>

                <span class="text-[10px] text-gray-400 font-bold">
                  {{ order.date }}
                </span>
              </div>

              <!-- Order Body: Food and Status -->
              <div class="mt-2.5 flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-gray-900">
                    {{ order.foodTitle }}
                  </h4>
                  <div class="flex items-center space-x-1.5 space-x-reverse mt-1">
                    @if (order.status === 'active') {
                      <span class="w-2 h-2 rounded-full bg-[#f97352] animate-ping"></span>
                      <span class="text-[11px] font-bold text-[#f97352]">
                        {{ order.statusText }}
                      </span>
                    } @else {
                      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span class="text-[11px] font-bold text-emerald-600">
                        {{ order.statusText }}
                      </span>
                    }
                  </div>
                </div>

                <div class="text-left">
                  <span class="text-xs font-black text-gray-900">
                    {{ order.price.toLocaleString('fa-IR') }}
                  </span>
                  <span class="text-[10px] text-gray-400 font-medium block">
                    تومان
                  </span>
                </div>
              </div>

            </div>
          }
        </div>

        <!-- Footer Action -->
        <div class="pt-2 border-t border-gray-100 flex items-center space-x-2 space-x-reverse">
          <button
            type="button"
            (click)="foodStore.closeOrdersDrawer(); foodStore.goToCalendar()"
            class="w-full py-3 bg-[#141517] hover:bg-black active:scale-98 text-white rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center space-x-1.5 space-x-reverse">
            <span>ثبت سفارش جدید ناهار</span>
            <svg class="w-4 h-4 transform rotate-180 text-[#f97352]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

      </div>
    }
  `,
})
export class OrdersDrawer {
  readonly foodStore = inject(FoodStore);
}
