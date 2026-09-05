import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-parent-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="parent-profile-section" class="px-5 mt-3" data-purpose="parent-profile">
      <!-- Modern Minimal Parent Card -->
      <div class="bg-[#141517] text-white rounded-[28px] p-5 shadow-xl shadow-black/10 border border-white/10 relative overflow-hidden">
        
        <!-- Subtle warm ambient lighting in top-left corner -->
        <div class="absolute -top-16 -left-16 w-44 h-44 bg-[#f97352]/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Top Row: Name on Right, Avatar in Corner on Left (Clickable to go to Profile) -->
        <button
          type="button"
          (click)="foodStore.goToProfile()"
          class="w-full flex items-center justify-between relative z-10 text-right cursor-pointer group bg-transparent border-0 p-0">
          <!-- Parent Name & Details (Right side in RTL) -->
          <div class="flex flex-col justify-center">
            <div class="flex items-center gap-2">
              <h2 id="parent-name" class="text-base font-black text-white tracking-tight group-hover:text-orange-200 transition">
                {{ foodStore.parentProfile().name }}
              </h2>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-orange-200 border border-white/15">
                والد رسمی
              </span>
            </div>
            <p class="text-xs text-gray-400 font-medium mt-1">
              {{ foodStore.parentProfile().phone }} • مشاهده و تنظیمات پروفایل
            </p>
          </div>

          <!-- Parent Profile Avatar in the Corner (Left side in RTL) -->
          <div class="relative flex-shrink-0">
            <div class="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-inner backdrop-blur-xs group-hover:scale-105 transition-transform">
              {{ foodStore.parentProfile().avatar }}
            </div>
            <span class="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-[#f97352] border-2 border-[#141517]"></span>
          </div>
        </button>

        <!-- Divider line -->
        <div class="h-px bg-white/10 my-4 relative z-10"></div>

        <!-- Bottom Row: Wallet and Quick Action -->
        <div class="flex items-center justify-between relative z-10">
          <button
            type="button"
            (click)="foodStore.goToWallet()"
            class="text-right cursor-pointer group bg-transparent border-0 p-0">
            <span class="text-[11px] text-gray-400 font-medium block group-hover:text-gray-300 transition">اعتبار کیف پول مدرسه</span>
            <div class="flex items-baseline space-x-1.5 space-x-reverse mt-0.5">
              <span class="text-lg font-black text-white tracking-tight group-hover:text-orange-200 transition">
                {{ foodStore.parentProfile().walletBalance.toLocaleString('fa-IR') }}
              </span>
              <span class="text-xs font-semibold text-[#f97352]">تومان</span>
            </div>
          </button>

          <!-- Charge Wallet Tactile Pill Button -->
          <button
            type="button"
            id="btn-recharge-parent-card"
            (click)="foodStore.goToWallet()"
            class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/20 flex items-center space-x-1.5 space-x-reverse transition-all cursor-pointer">
            <span class="text-[#f97352] font-black text-sm">+</span>
            <span>افزایش اعتبار</span>
          </button>
        </div>

      </div>
    </section>
  `,
})
export class ParentProfileCard {
  readonly foodStore = inject(FoodStore);
}
