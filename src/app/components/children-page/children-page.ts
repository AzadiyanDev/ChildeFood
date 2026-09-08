import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';
import {ChildItem} from '../../models/food.model';

@Component({
  selector: 'app-children-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="children-page-view" class="px-5 pt-3 pb-8 animate-in fade-in duration-200" data-purpose="children-page">
      
      <!-- Dedicated Top Bar (No header, no bell, no greeting, no parent card) -->
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <button
            id="btn-children-back"
            type="button"
            (click)="foodStore.goToHome()"
            aria-label="بازگشت به صفحه اصلی"
            class="w-10 h-10 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-center text-gray-800 shadow-xs hover:bg-gray-50 active:scale-95 transition cursor-pointer">
            <svg class="w-5 h-5 transform rotate-0 text-gray-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div>
            <h1 class="text-lg font-black text-[#141517] tracking-tight">
              فرزندان شما
            </h1>
            <p class="text-xs text-gray-400 font-medium mt-0.5">
              مدیریت و رزرو ناهار گرم دانش‌آموزان
            </p>
          </div>
        </div>

        <span class="px-3 py-1 rounded-full bg-[#141517] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
          <span>{{ foodStore.children().length }} فرزند</span>
        </span>
      </div>

      <!-- Add Child Modal / Form Toggle Banner -->
      @if (showAddChildModal()) {
        <div class="mb-5 bg-white rounded-[26px] p-5 border border-black/[0.08] shadow-md animate-in fade-in duration-150">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-black text-gray-900">افزودن فرزند جدید</h3>
            <button
              type="button"
              (click)="showAddChildModal.set(false)"
              class="text-gray-400 hover:text-gray-700 text-sm font-bold cursor-pointer">
              ✕
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label for="child-new-name" class="text-[11px] font-bold text-gray-600 block mb-1">نام و نام خانوادگی</label>
              <input
                #nameInput
                id="child-new-name"
                type="text"
                placeholder="مثلاً: کیان احمدی"
                class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#f97352]" />
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label for="child-new-school" class="text-[11px] font-bold text-gray-600 block mb-1">مدرسه</label>
                <input
                  #schoolInput
                  id="child-new-school"
                  type="text"
                  placeholder="دبستان سرو"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#f97352]" />
              </div>
              <div>
                <label for="child-new-grade" class="text-[11px] font-bold text-gray-600 block mb-1">پایه تحصیلی</label>
                <input
                  #gradeInput
                  id="child-new-grade"
                  type="text"
                  placeholder="پایه چهارم"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#f97352]" />
              </div>
            </div>

            <button
              type="button"
              (click)="handleAddChild(nameInput.value, schoolInput.value, gradeInput.value)"
              class="w-full py-3 bg-[#f97352] hover:bg-[#e05432] active:scale-95 text-white font-black text-xs rounded-xl transition cursor-pointer mt-2">
              ثبت مشخصات فرزند
            </button>
          </div>
        </div>
      }

      <!-- Children List (Only Children) -->
      <div class="space-y-4">
        @for (child of foodStore.children(); track child.id) {
          <div
            [id]="'children-page-card-' + child.id"
            class="bg-white rounded-[26px] p-5 border border-black/[0.06] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_-4px_rgba(0,0,0,0.08)] transition-all">
            
            <!-- Top Tier: Avatar, Name, School & Age Badge -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3.5">
                <!-- Avatar Container -->
                <div class="w-14 h-14 rounded-2xl bg-[#f7f7f8] border border-black/[0.05] flex items-center justify-center text-3xl flex-shrink-0 shadow-inner overflow-hidden">
                  @if (foodStore.isImageAvatar(child.avatar)) {
                    <img [src]="child.avatar" [alt]="child.name" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                  } @else {
                    {{ child.avatar }}
                  }
                </div>

                <!-- Child Name & School -->
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-base font-black text-[#141517] tracking-tight">
                      {{ child.name }}
                    </h2>
                    @if (child.hasOrderToday) {
                      <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        ناهار امروز فعال
                      </span>
                    }
                  </div>
                  <p class="text-xs text-gray-500 font-medium mt-1">
                    {{ child.grade }} • {{ child.school }}
                  </p>
                </div>
              </div>

              <!-- Age Badge in Corner -->
              <span class="px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200/60 flex-shrink-0">
                {{ child.age }} ساله
              </span>
            </div>

            <!-- Health & Preference Tags -->
            <div class="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2 text-xs">
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 font-medium border border-gray-200/50">
                <span class="w-2 h-2 rounded-full bg-[#f97352]"></span>
                <span class="font-bold">{{ child.dietaryNote }}</span>
              </div>

              @if (child.favoriteFood) {
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50/60 text-[#f97352] font-medium border border-orange-200/40">
                  <span>❤️</span>
                  <span class="font-bold">علاقه‌مندی: {{ child.favoriteFood }}</span>
                </div>
              }
            </div>

            <!-- Bottom Tier: Order Button -->
            <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span class="text-[11px] text-gray-400 block font-medium">سفارش برای این فرزند</span>
                <span class="text-xs font-bold text-gray-800">
                  {{ child.hasOrderToday ? 'امکان افزودن یا تغییر آیتم' : 'رزرو ناهار روزهای هفته' }}
                </span>
              </div>

              <!-- Prominent Tactile Orange Order Button -->
              <button
                type="button"
                [id]="'btn-order-child-page-' + child.id"
                [attr.aria-label]="'سفارش ناهار برای ' + child.name"
                (click)="foodStore.orderForChild(child.id)"
                class="px-5 py-2.5 bg-[#f97352] hover:bg-[#e05432] active:scale-95 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer">
                <span>سفارش ناهار</span>
                <svg class="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

          </div>
        }
      </div>

      <!-- Add New Child Action Card -->
      <div class="mt-5">
        <button
          type="button"
          id="btn-open-add-child"
          (click)="showAddChildModal.set(true)"
          class="w-full py-3.5 bg-white hover:bg-gray-50 active:scale-98 text-gray-800 font-black text-xs rounded-[22px] border border-dashed border-gray-300 flex items-center justify-center gap-2 shadow-xs transition cursor-pointer">
          <span class="w-6 h-6 rounded-full bg-[#141517] text-white flex items-center justify-center text-sm font-black">+</span>
          <span>افزودن فرزند جدید به حساب کاربری</span>
        </button>
      </div>

    </div>
  `,
})
export class ChildrenPage {
  readonly foodStore = inject(FoodStore);
  readonly showAddChildModal = signal<boolean>(false);

  handleAddChild(name: string, school: string, grade: string): void {
    if (!name.trim()) return;
    const newChild: ChildItem = {
      id: 'child-' + (this.foodStore.children().length + 1),
      name: name.trim(),
      grade: grade.trim() || 'پایه ابتدایی',
      school: school.trim() || 'دبستان غیردولتی سرو',
      avatar: '🧒',
      age: 7,
      dietaryNote: 'بدون حساسیت ثبت شده',
      favoriteFood: 'غذای گرم خانگی',
      hasOrderToday: false,
    };
    this.foodStore.children.update((list) => [...list, newChild]);
    this.showAddChildModal.set(false);
  }
}
