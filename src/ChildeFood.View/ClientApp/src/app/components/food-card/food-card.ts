import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {FoodItem} from '../../models/food.model';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-food-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      [id]="'food-card-' + item().id"
      class="bg-white rounded-[28px] pt-3 pb-4 px-3.5 soft-card-shadow flex flex-col justify-between relative border border-gray-50/80 hover:shadow-lg transition-all duration-200">
      
      <!-- Food Visual / Emoji Container -->
      <div [id]="'food-image-wrapper-' + item().id" class="h-32 w-full flex items-center justify-center relative mb-1">
        <div class="relative w-full h-full flex items-center justify-center">
          <span
            [class]="'text-7xl filter drop-shadow-xl select-none transform transition-transform duration-300 ' + item().transform">
            {{ item().emoji }}
          </span>
        </div>
      </div>

      <!-- Badge -->
      <div [id]="'badge-wrapper-' + item().id" class="flex justify-center -mt-2 mb-2">
        <span
          [class]="
            item().badgeType === 'popular' || item().badgeType === 'spicy'
              ? 'bg-[#f97352] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-tight shadow-sm'
              : 'bg-[#191919] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-tight shadow-sm'
          ">
          {{ item().badge }}
        </span>
      </div>

      <!-- Title and Subtitle -->
      <div [id]="'food-info-' + item().id" class="text-center mb-3">
        <h3 class="text-[13px] font-bold text-gray-900 leading-snug">{{ item().title }}</h3>
        <p class="text-[10px] text-gray-400 font-medium mt-0.5">{{ item().subtitle }}</p>
      </div>

      <!-- Price & Action Button -->
      <div [id]="'food-action-row-' + item().id" class="flex items-center justify-between mt-auto pt-1">
        <div class="flex items-baseline space-x-1 space-x-reverse font-bold">
          <span class="text-[#f97352] text-xs font-bold">$</span>
          <span class="text-[17px] font-black text-gray-950 tracking-tight font-mono">{{ item().price.toFixed(2) }}</span>
        </div>

        @if (inCartCount() > 0) {
          <!-- Item is in cart (e.g. Pizza Sicilia initial state in design) -->
          <button
            [id]="'btn-remove-' + item().id"
            aria-label="کاهش"
            (click)="foodStore.removeFromCart(item().id)"
            class="w-8 h-8 rounded-full bg-[#17191d] flex items-center justify-center text-white shadow-md hover:bg-black active:scale-95 transition"
            type="button">
            <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19.5 12h-15" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
        } @else {
          <!-- Item is not in cart -->
          <button
            [id]="'btn-add-' + item().id"
            aria-label="افزودن"
            (click)="foodStore.addToCart(item().id)"
            class="w-8 h-8 rounded-full bg-[#f8f9fa] border border-gray-100 flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-100 active:scale-95 transition"
            type="button">
            <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5v15m7.5-7.5h-15" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
        }
      </div>
    </article>
  `,
})
export class FoodCard {
  readonly item = input.required<FoodItem>();
  readonly foodStore = inject(FoodStore);

  readonly inCartCount = computed(() => {
    return this.foodStore.getFoodItemCount(this.item().id);
  });
}
