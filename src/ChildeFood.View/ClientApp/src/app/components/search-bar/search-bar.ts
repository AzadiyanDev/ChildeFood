import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="search-section" class="mt-5 px-6 flex items-center space-x-3 space-x-reverse" data-purpose="search-bar">
      <!-- Search Input Container -->
      <div id="search-input-wrapper" class="flex-1 bg-white border border-gray-100 rounded-full px-4 py-3.5 flex items-center space-x-2.5 space-x-reverse shadow-sm focus-within:ring-2 focus-within:ring-[#f97352]/30 transition-all">
        <svg class="w-5 h-5 text-gray-400 stroke-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <input
          id="food-search-input"
          class="w-full bg-transparent border-0 p-0 text-xs sm:text-sm text-gray-700 placeholder-gray-400 focus:ring-0 text-right font-medium outline-none"
          placeholder="جستجوی فست‌فود، پیتزا، نوشیدنی..."
          type="text"
          [value]="foodStore.searchQuery()"
          (input)="onSearchInput($event)"
        />
        @if (foodStore.searchQuery()) {
          <button
            id="btn-clear-search"
            type="button"
            (click)="clearSearch()"
            class="text-gray-400 hover:text-gray-600 text-xs p-1"
            aria-label="پاک کردن جستجو">
            ✕
          </button>
        }
      </div>

      <!-- Filter Button -->
      <button
        id="btn-filters-toggle"
        aria-label="فیلترها"
        (click)="foodStore.setCategory(foodStore.selectedCategoryId() === 'all' ? 'food' : 'all')"
        class="w-12 h-12 bg-[#17191d] rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0 hover:bg-black transition active:scale-95"
        type="button">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>
    </section>
  `,
})
export class SearchBar {
  readonly foodStore = inject(FoodStore);

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.foodStore.setSearchQuery(input.value);
  }

  clearSearch(): void {
    this.foodStore.setSearchQuery('');
  }
}
