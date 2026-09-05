import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {HeroHeadline} from '../hero-headline/hero-headline';
import {SearchBar} from '../search-bar/search-bar';
import {CategoryArc} from '../category-arc/category-arc';
import {ProductGrid} from '../product-grid/product-grid';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-meals-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroHeadline, SearchBar, CategoryArc, ProductGrid],
  template: `
    <div id="meals-page-view" class="animate-in fade-in duration-200">
      
      <!-- Child Context Bar & Back to Home Button -->
      <div class="px-5 pt-2 pb-1 flex items-center justify-between">
        <div class="flex items-center space-x-2.5 space-x-reverse">
          <span class="w-9 h-9 rounded-2xl bg-[#141517] text-white text-lg flex items-center justify-center shadow-xs border border-white/10">
            {{ foodStore.selectedChild().avatar }}
          </span>
          <div>
            <div class="flex items-center space-x-1.5 space-x-reverse">
              <span class="text-[11px] text-gray-400 font-medium">سفارش ناهار برای:</span>
              <strong class="text-xs font-black text-[#141517]">{{ foodStore.selectedChild().name }}</strong>
            </div>
            <p class="text-[10px] text-gray-500 font-medium">{{ foodStore.selectedChild().grade }} • {{ foodStore.selectedChild().school }}</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-back-to-calendar"
            (click)="foodStore.goToCalendar()"
            class="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 active:scale-95 text-[#f97352] text-xs font-black flex items-center space-x-1 space-x-reverse transition-all cursor-pointer border border-orange-200/60">
            <span>📅</span>
            <span>تقویم</span>
          </button>

          <button
            type="button"
            id="btn-back-to-home"
            (click)="foodStore.goToHome()"
            class="px-3 py-1.5 rounded-xl bg-[#141517] hover:bg-black active:scale-95 text-white text-xs font-black flex items-center space-x-1 space-x-reverse transition-all cursor-pointer shadow-xs">
            <svg class="w-3.5 h-3.5 text-[#f97352]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            <span>خانه</span>
          </button>
        </div>
      </div>

      <!-- Hero Headline: "گرسنه‌اید؟ سفارش و نوش‌جان." -->
      <app-hero-headline />

      <!-- Search Section & Filter Button -->
      <app-search-bar />

      <!-- Date Days Row (12, 13, 14, 15, 16, 17, 18) -->
      <app-category-arc />

      <!-- Product Grid: 8 Food Cards in 2 columns -->
      <app-product-grid />
    </div>
  `,
})
export class MealsPage {
  readonly foodStore = inject(FoodStore);
}
