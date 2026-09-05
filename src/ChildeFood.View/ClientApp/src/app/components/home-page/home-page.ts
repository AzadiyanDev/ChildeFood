import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {ParentProfileCard} from '../parent-profile/parent-profile';
import {TodayOrders} from '../today-orders/today-orders';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParentProfileCard, TodayOrders],
  template: `
    <div id="home-page-view" class="animate-in fade-in duration-200">
      <!-- Dynamic Typographic Header matching the design language -->
      <section class="px-5 pt-3 pb-1">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-black text-[#141517] tracking-tight leading-tight">
              روز بخیر، <span class="text-[#f97352]">سارا 👋</span>
            </h1>
            <p class="text-xs text-gray-500 font-medium mt-1">
              سامانه هوشمند ناهار گرم مدارس فرزندان
            </p>
          </div>

          <!-- Quick Status Pill -->
          <div class="px-3 py-1.5 rounded-full bg-[#141517] text-white text-[11px] font-black flex items-center gap-1.5 shadow-xs">
            <span class="w-2 h-2 rounded-full bg-[#f97352] animate-pulse"></span>
            <span>سفارش باز</span>
          </div>
        </div>
      </section>

      <!-- Parent Profile Card (Matte Black / White / Orange) -->
      <app-parent-profile />

      <!-- Today's Orders (سفارشات امروز) -->
      <app-today-orders />
    </div>
  `,
})
export class HomePage {
  readonly foodStore = inject(FoodStore);
}
