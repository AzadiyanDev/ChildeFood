import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-category-arc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="categories-arc-section" class="mt-4 relative pt-2 pb-1" data-purpose="date-selector">
      <!-- Header row above dates with edit days button -->
      <div class="px-5 flex items-center justify-between mb-1.5">
        <div class="flex items-center gap-1.5 text-[11px] font-black text-gray-700">
          <span>📅</span>
          <span>روزهای انتخابی شما در شهریور:</span>
        </div>
        <button
          type="button"
          id="btn-edit-calendar-days"
          (click)="foodStore.goToCalendar()"
          class="px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 active:scale-95 text-[#f97352] text-[11px] font-black border border-orange-200/60 flex items-center gap-1 transition-all cursor-pointer">
          <svg class="w-3 h-3 text-[#f97352]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
          <span>تغییر روزها</span>
        </button>
      </div>

      <div
        id="categories-arc-container"
        class="relative z-10 px-4 flex items-center gap-2.5 max-w-[390px] mx-auto pt-2 pb-1 overflow-x-auto no-scrollbar"
        [class.justify-center]="foodStore.dateDays().length <= 6"
        [class.justify-start]="foodStore.dateDays().length > 6"
        role="tablist"
        aria-label="انتخاب تاریخ روزانه غذاها">
        
        @for (day of foodStore.dateDays(); track day.dayNumber) {
          @let isCurrent = day.dayNumber === foodStore.selectedDay();

          <button
            type="button"
            [id]="'date-item-' + day.dayNumber"
            [attr.aria-label]="'انتخاب روز ' + day.label + ' شهریور'"
            [attr.aria-selected]="isCurrent"
            (click)="foodStore.setSelectedDay(day.dayNumber)"
            class="flex flex-col items-center group cursor-pointer transition-all duration-200 bg-transparent border-0 p-0 focus:outline-hidden flex-shrink-0"
            [style.transform]="isCurrent ? 'translateY(-4px)' : 'translateY(0)'">
            
            <div
              [class]="
                isCurrent
                  ? 'w-12 h-12 rounded-2xl bg-[#f97352] text-white font-black text-base shadow-xl shadow-orange-500/30 ring-4 ring-orange-200/80 border-2 border-white flex flex-col items-center justify-center active:scale-95 transition-all'
                  : 'w-11 h-11 rounded-2xl bg-white hover:bg-orange-50 text-gray-800 font-bold text-sm shadow-xs border border-gray-200 flex flex-col items-center justify-center active:scale-95 transition-all'
              ">
              <span class="select-none tracking-tight leading-none">{{ day.label }}</span>
              <span
                [class]="
                  isCurrent
                    ? 'text-[8px] font-bold text-orange-100'
                    : 'text-[8px] font-medium text-gray-400'
                ">
                شهریور
              </span>
            </div>

            @if (isCurrent) {
              <div class="w-1.5 h-1.5 rounded-full bg-[#f97352] mt-1 shadow-xs"></div>
            } @else {
              <div class="w-1.5 h-1.5 rounded-full bg-transparent mt-1"></div>
            }
          </button>
        }
      </div>
    </section>
  `,
})
export class CategoryArc {
  readonly foodStore = inject(FoodStore);
}

