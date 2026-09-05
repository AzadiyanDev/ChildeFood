import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header id="top-header-bar" class="px-6 flex items-center justify-between pt-7" data-purpose="delivery-and-actions">
      <!-- Right: Delivery Address (in RTL: right side) -->
      <div id="delivery-address-container" class="flex items-center space-x-3 space-x-reverse cursor-pointer group">
        <div id="delivery-truck-icon-wrapper" class="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-white shadow-sm text-gray-700 group-hover:bg-orange-50 transition-colors">
          <!-- Delivery Truck Icon (mirrored for RTL) -->
          <svg class="w-5 h-5 transform -scale-x-100 text-gray-700 group-hover:text-[#f97352] transition-colors" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.875A1.125 1.125 0 0013.125 3.75h-7.5A1.125 1.125 0 004.5 4.875V14.25m9.75-6.75H16.5" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>
        <div>
          <p id="delivery-label" class="text-[11px] text-gray-400 font-medium leading-tight">ارسال به</p>
          <p id="delivery-address" class="text-[13px] font-bold text-gray-800 tracking-tight">{{ foodStore.currentAddress() }}</p>
        </div>
      </div>

      <!-- Left: Notifications & Bag (in RTL: left side) -->
      <div id="header-action-buttons" class="flex items-center space-x-2.5 space-x-reverse">
        <!-- Bell Notification Button -->
        <button
          id="btn-notifications"
          aria-label="اعلان‌ها"
          class="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-white shadow-sm text-gray-700 hover:bg-gray-50 active:scale-95 transition"
          type="button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </button>

        <!-- Cart/Bag with badge -->
        <button
          id="btn-header-cart"
          aria-label="سبد خرید"
          (click)="foodStore.toggleCartDrawer()"
          class="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-white shadow-sm text-gray-700 hover:bg-gray-50 active:scale-95 transition relative"
          type="button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          @if (foodStore.totalCartCount() > 0) {
            <span id="header-cart-badge" class="w-2.5 h-2.5 rounded-full bg-[#f97352] absolute top-2 left-2 border-2 border-white ring-1 ring-[#f97352]/20 animate-pulse"></span>
          }
        </button>
      </div>
    </header>
  `,
})
export class Header {
  readonly foodStore = inject(FoodStore);
}
