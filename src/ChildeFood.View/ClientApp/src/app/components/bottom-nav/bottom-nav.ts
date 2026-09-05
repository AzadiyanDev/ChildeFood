import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      id="floating-bottom-nav"
      class="fixed inset-x-0 z-40 flex justify-center pointer-events-none px-4"
      style="bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
      data-purpose="bottom-navigation">
      <div
        id="nav-pill-wrapper"
        class="w-full max-w-[380px] h-[68px] bg-[#141517] rounded-full px-3 flex items-center justify-around pointer-events-auto nav-pill-shadow border border-white/10 backdrop-blur-md">
        
        <!-- 1. Home (Rightmost in RTL) -->
        <button
          id="nav-tab-home"
          aria-label="خانه"
          title="خانه"
          (click)="foodStore.setActiveNavTab('home')"
          [class]="
            foodStore.activeNavTab() === 'home' && foodStore.activePage() === 'home'
              ? 'w-12 h-12 rounded-full bg-[#f97352] flex items-center justify-center text-white shadow-md shadow-orange-500/25 active:scale-95 transition'
              : 'w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition active:scale-95'
          "
          type="button">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"></path>
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"></path>
          </svg>
        </button>

        <!-- 2. Wallet (کیف پول) -->
        <button
          id="nav-tab-wallet"
          aria-label="کیف پول"
          title="کیف پول"
          (click)="foodStore.setActiveNavTab('wallet')"
          [class]="
            foodStore.activeNavTab() === 'wallet' || foodStore.activePage() === 'wallet'
              ? 'w-12 h-12 rounded-full bg-[#f97352] flex items-center justify-center text-white shadow-md shadow-orange-500/25 active:scale-95 transition'
              : 'w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition active:scale-95'
          "
          type="button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5zm0 0h-4a2 2 0 00-2 2v0a2 2 0 002 2h4M7 9h.01" />
          </svg>
        </button>

        <!-- 3. Children (فرزندان) -->
        <button
          id="nav-tab-children"
          aria-label="فرزندان"
          title="فرزندان"
          (click)="foodStore.setActiveNavTab('children')"
          [class]="
            foodStore.activeNavTab() === 'children' || foodStore.activePage() === 'children'
              ? 'w-12 h-12 rounded-full bg-[#f97352] flex items-center justify-center text-white shadow-md shadow-orange-500/25 active:scale-95 transition'
              : 'w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition active:scale-95'
          "
          type="button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.999-3.199a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </button>

        <!-- 4. Active & Recent Orders (سفارش‌های فعال و اخیر) -->
        <button
          id="nav-tab-orders"
          aria-label="سفارش‌های فعال و اخیر"
          title="سفارش‌های فعال و اخیر"
          (click)="foodStore.setActiveNavTab('orders')"
          [class]="
            foodStore.activeNavTab() === 'orders' || foodStore.activePage() === 'orders'
              ? 'w-12 h-12 rounded-full bg-[#f97352] flex items-center justify-center text-white shadow-md shadow-orange-500/25 active:scale-95 transition relative'
              : 'w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition active:scale-95 relative'
          "
          type="button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
          <!-- Active order badge dot -->
          <span
            id="orders-badge-dot"
            class="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-[#f97352] ring-2 ring-[#141517]">
          </span>
        </button>

        <!-- 5. Profile (پروفایل - Leftmost in RTL) -->
        <button
          id="nav-tab-profile"
          aria-label="پروفایل"
          title="پروفایل"
          (click)="foodStore.setActiveNavTab('profile')"
          [class]="
            foodStore.activeNavTab() === 'profile' || foodStore.activePage() === 'profile'
              ? 'w-12 h-12 rounded-full bg-[#f97352] flex items-center justify-center text-white shadow-md shadow-orange-500/25 active:scale-95 transition'
              : 'w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition active:scale-95'
          "
          type="button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </button>

      </div>
    </nav>
  `,
})
export class BottomNav {
  readonly foodStore = inject(FoodStore);
}

