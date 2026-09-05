import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FoodStore} from '../../services/food-store';
import {FoodCard} from '../food-card/food-card';

@Component({
  selector: 'app-product-grid',
  imports: [FoodCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="popular-food-grid" class="mt-8 px-5 grid grid-cols-2 gap-3.5" data-purpose="popular-food-list">
      @for (food of foodStore.filteredFoods(); track food.id) {
        <app-food-card [item]="food" />
      } @empty {
        <div id="no-food-found-message" class="col-span-2 py-12 text-center text-gray-500">
          <p class="text-3xl mb-2">🍽️</p>
          <p class="text-sm font-bold text-gray-700">غذایی با این مشخصات پیدا نشد</p>
          <p class="text-xs text-gray-400 mt-1">لطفاً عبارت دیگری را جستجو کنید</p>
          <button
            type="button"
            (click)="foodStore.setSearchQuery(''); foodStore.setCategory('all')"
            class="mt-4 px-4 py-2 bg-[#17191d] text-white text-xs rounded-full font-medium shadow hover:bg-black transition">
            نمایش همه غذاها
          </button>
        </div>
      }
    </section>
  `,
})
export class ProductGrid {
  readonly foodStore = inject(FoodStore);
}
