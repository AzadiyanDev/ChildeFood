import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-today-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- بخش سفارشات ناهار امروز - طراحی تخت، کاملا بدون گرادینت و بدون شیشه‌ای -->
    <section id="today-orders-section" class="px-4 mt-5 mb-4" data-purpose="today-orders-radar">
      
      <!-- سربرگ سفارشات با تعداد سفارش‌های فعال و دکمه آرشیو -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-[#f97352]"></div>
          <h2 class="text-sm font-black text-zinc-900 tracking-tight">
            سفارشات امروز مدارس
          </h2>
          <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black font-mono">
            {{ foodStore.todayOrders().length.toLocaleString('fa-IR') }} فعال
          </span>
        </div>

        <!-- دکمه آرشیو سفارشات با ارگونومی حداقل ۴۴ پیکسل -->
        <button
          type="button"
          (click)="foodStore.goToOrders()"
          class="min-h-[44px] px-3 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1">
          <span>آرشیو همه</span>
          <svg class="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <!-- لیست سفارش‌های امروز -->
      @if (foodStore.todayOrders().length > 0) {
        <div class="space-y-3">
          @for (order of foodStore.todayOrders(); track order.id) {
            <!-- کارت هر سفارش -->
            <div
              [id]="'today-order-card-' + order.id"
              class="bg-white rounded-2xl p-4 border border-zinc-200 shadow-xs">
              
              <!-- ردیف اطلاعات دانش‌آموز و وضعیت سفارش -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center font-black text-zinc-800 text-sm flex-shrink-0">
                    {{ order.childName.slice(0, 1) }}
                  </div>
                  <div>
                    <h3 class="text-xs font-black text-zinc-900 tracking-tight">
                      {{ order.childName }}
                    </h3>
                    <p class="text-[10px] text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                      <span>{{ order.school }}</span>
                      <span>•</span>
                      <span class="font-mono text-zinc-600">{{ order.grade }}</span>
                    </p>
                  </div>
                </div>

                <!-- نشان وضعیت -->
                <span
                  [class]="
                    order.status === 'delivering'
                      ? 'px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black'
                      : 'px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black'
                  ">
                  {{ order.statusText }}
                </span>
              </div>

              <!-- مشخصات غذای ثبت شده -->
              <div class="mt-3 bg-zinc-50 rounded-xl p-3 border border-zinc-200/80">
                <h4 class="text-xs font-black text-zinc-900">
                  {{ order.foodTitle }}
                </h4>
                @if (order.foodSubtitle) {
                  <p class="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                    {{ order.foodSubtitle }}
                  </p>
                }
              </div>

              <!-- زمان تحویل، کد رهگیری و دکمه رهگیری -->
              <div class="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-1.5 text-zinc-700 font-bold text-xs">
                    <svg class="w-3.5 h-3.5 text-[#f97352]" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ order.deliveryTime }}</span>
                  </div>
                  <span class="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                    کد رهگیری: {{ order.trackingCode }}
                  </span>
                </div>

                <div class="flex items-center gap-3">
                  <div class="text-left">
                    <span class="text-xs font-black text-zinc-900 font-mono">
                      {{ order.price.toLocaleString('fa-IR') }}
                    </span>
                    <span class="text-[10px] text-zinc-400 mr-0.5">تومان</span>
                  </div>

                  <button
                    type="button"
                    (click)="foodStore.goToOrders()"
                    class="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center">
                    رهگیری
                  </button>
                </div>
              </div>

            </div>
          }
        </div>
      } @else {
        <!-- در صورتی که سفارشی برای امروز نباشد -->
        <div class="bg-white rounded-2xl p-6 border border-zinc-200 text-center shadow-xs">
          <div class="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xs font-black text-zinc-800">امروز هیچ سفارش فعالی ثبت نشده است</h3>
          <p class="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
            می‌توانید برای روزهای آینده ناهار گرم را از منوی مدرسه انتخاب و رزرو کنید.
          </p>
          <button
            type="button"
            (click)="foodStore.goToMeals()"
            class="mt-3.5 min-h-[44px] px-5 py-2 rounded-xl bg-[#f97352] hover:bg-[#e05432] text-white text-xs font-black active:scale-98 transition-all inline-flex items-center gap-2 cursor-pointer">
            <span>مشاهده منوی غذاها</span>
          </button>
        </div>
      }

      <!-- اخطار فرزندی که امروز غذایی براش رزرو نشده (مثل امیرعلی) -->
      @if (childWithoutOrder(); as unattendedChild) {
        <div
          id="child-no-order-notice"
          class="mt-3.5 bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center font-black text-amber-900 text-sm flex-shrink-0">
              {{ unattendedChild.name.slice(0, 2) }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <h4 class="text-xs font-black text-zinc-900 truncate">
                  {{ unattendedChild.name }}
                </h4>
                <span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[9px] font-bold flex-shrink-0">
                  بدون ناهار امروز
                </span>
              </div>
              <p class="text-[10px] text-amber-800 mt-0.5 leading-tight">
                مهلت سفارش ناهار گرم {{ unattendedChild.school }} تا ۱۰:۳۰
              </p>
            </div>
          </div>

          <!-- دکمه رزرو سریع برای این فرزند -->
          <button
            type="button"
            id="btn-quick-order-amirali"
            (click)="handleQuickOrderForChild(unattendedChild.id)"
            class="min-h-[44px] px-3.5 py-2 bg-[#f97352] hover:bg-[#e05432] active:scale-[0.98] text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0">
            <span>سفارش ناهار</span>
            <svg class="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      }

      <!-- میانبر ساده به پرونده فرزندان -->
      <div class="mt-3.5 bg-zinc-50 rounded-2xl p-3.5 border border-zinc-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <div>
            <h4 class="text-xs font-black text-zinc-900">
              پرونده سلامت و رژیم غذایی فرزندان
            </h4>
            <p class="text-[10px] text-zinc-500 font-medium mt-0.5">
              مدارس و رژیم غذایی {{ foodStore.children().length }} فرزند
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-goto-children-from-home"
          (click)="foodStore.goToChildren()"
          class="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
          <span>مشاهده</span>
          <svg class="w-3 h-3 text-orange-300 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

    </section>
  `,
})
export class TodayOrders {
  readonly foodStore = inject(FoodStore);

  // پیدا کردن اولین فرزندی که امروز ناهار براش ثبت نشده
  readonly childWithoutOrder = computed(() => {
    return this.foodStore.children().find((c) => !c.hasOrderToday);
  });

  // هندلر کلیک روی سفارش سریع؛ فرزند انتخاب میشه و صفحه نرم اسکرول می‌کنه به بخش رزرو، بدون اینکه کاربر رو ببره به صفحه تقویم قدیمی
  handleQuickOrderForChild(childId: string): void {
    this.foodStore.selectedChildId.set(childId);
    if (typeof window !== 'undefined') {
      const el = document.querySelector('[data-purpose="quick-order-workflow"]');
      if (el) {
        el.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    }
  }
}
