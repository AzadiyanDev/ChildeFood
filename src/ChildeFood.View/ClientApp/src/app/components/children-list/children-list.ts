import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-children-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="children-section" class="px-5 mt-6 mb-8" data-purpose="children-list">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2 space-x-reverse">
          <h2 class="text-base font-black text-[#141517] tracking-tight">
            فرزندان شما
          </h2>
          <span class="px-2.5 py-0.5 rounded-full bg-[#141517] text-white text-[10px] font-black tracking-wide">
            {{ foodStore.children().length }} فرزند
          </span>
        </div>

        <span class="text-xs text-gray-400 font-medium">
          انتخاب و رزرو ناهار گرم
        </span>
      </div>

      <!-- Children Cards List -->
      <div class="space-y-4">
        @for (child of foodStore.children(); track child.id) {
          <div
            [id]="'child-card-' + child.id"
            class="bg-white rounded-[26px] p-5 border border-black/[0.06] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_-4px_rgba(0,0,0,0.08)] transition-all">
            
            <!-- Top Tier: Avatar, Name, School & Age Badge -->
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3.5 space-x-reverse">
                <!-- Avatar Container -->
                <div class="w-13 h-13 rounded-2xl bg-[#f7f7f8] border border-black/[0.05] flex items-center justify-center text-2xl flex-shrink-0 shadow-inner overflow-hidden">
                  @if (foodStore.isImageAvatar(child.avatar)) {
                    <img [src]="child.avatar" [alt]="child.name" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                  } @else {
                    {{ child.avatar }}
                  }
                </div>

                <!-- Child Name & School -->
                <div>
                  <h3 class="text-base font-black text-[#141517] tracking-tight">
                    {{ child.name }}
                  </h3>
                  <p class="text-xs text-gray-500 font-medium mt-1">
                    {{ child.grade }} • {{ child.school }}
                  </p>
                </div>
              </div>

              <!-- Age Badge in Corner -->
              <span class="px-2.5 py-1 rounded-xl bg-gray-100/90 text-gray-700 text-xs font-bold border border-gray-200/50 flex-shrink-0">
                {{ child.age }} ساله
              </span>
            </div>

            <!-- Divider Line with soft tone -->
            <div class="h-px bg-gray-100 my-4"></div>

            <!-- Bottom Tier: Dietary Note on right, Prominent Orange Button on left -->
            <div class="flex items-center justify-between">
              <!-- Dietary Note / Health Tag -->
              <div class="flex items-center space-x-2 space-x-reverse text-xs text-gray-600 font-medium">
                <span class="w-2 h-2 rounded-full bg-[#f97352]"></span>
                <span class="text-xs text-gray-600 font-bold">{{ child.dietaryNote }}</span>
              </div>

              <!-- Prominent Tactile Orange Order Button -->
              <button
                type="button"
                [id]="'btn-order-' + child.id"
                [attr.aria-label]="'سفارش ناهار برای ' + child.name"
                (click)="foodStore.orderForChild(child.id)"
                class="px-5 py-2.5 bg-[#f97352] hover:bg-[#e05432] active:scale-95 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-1.5 space-x-reverse transition-all cursor-pointer">
                <span>سفارش ناهار</span>
                <svg class="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

          </div>
        }
      </div>

      <!-- Quick Action: Full Menu Exploration Card -->
      <div class="mt-5 bg-[#fafafa] rounded-[24px] p-4 border border-black/[0.04] flex items-center justify-between">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-10 h-10 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-xl shadow-xs">
            🍱
          </div>
          <div>
            <h4 class="text-xs font-black text-[#141517]">
              منوی کامل ناهار مدارس
            </h4>
            <p class="text-[10px] text-gray-500 font-medium mt-0.5">
              مشاهده تمامی غذاها، پیش‌غذاها و نوشیدنی‌ها
            </p>
          </div>
        </div>

        <button
          type="button"
          (click)="foodStore.goToCalendar()"
          class="px-3 py-2 rounded-xl bg-[#141517] hover:bg-black active:scale-95 text-white text-[11px] font-black flex items-center space-x-1 space-x-reverse transition-all cursor-pointer">
          <span>انتخاب روز و منو</span>
          <svg class="w-3 h-3 text-[#f97352] transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

    </section>
  `,
})
export class ChildrenList {
  readonly foodStore = inject(FoodStore);
}

