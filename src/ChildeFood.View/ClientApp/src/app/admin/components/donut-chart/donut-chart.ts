import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';

// کامپوننت رسم دونات SVG اختصاصی و فوق‌العاده سبک
// بدون هیچ پکیج اضافی یا کندی رندر، نمودار رو خیلی نرم و مدرن می‌کشه
@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center relative">
      <!-- نمودار دایره‌ای وکتوری SVG -->
      <div class="relative flex items-center justify-center" [style.width.px]="size()" [style.height.px]="size()">
        <svg
          [attr.width]="size()"
          [attr.height]="size()"
          class="transform -rotate-90">
          <!-- دایره پس‌زمینه مسیر -->
          <circle
            [attr.cx]="center()"
            [attr.cy]="center()"
            [attr.r]="radius()"
            fill="transparent"
            [attr.stroke]="trackColor()"
            [attr.stroke-width]="strokeWidth()"
            class="transition-all duration-500"
          />
          <!-- حلقه اصلی پیشرفت دونات با رنگ تم -->
          <circle
            [attr.cx]="center()"
            [attr.cy]="center()"
            [attr.r]="radius()"
            fill="transparent"
            [attr.stroke]="strokeColor()"
            [attr.stroke-width]="strokeWidth()"
            stroke-linecap="round"
            [attr.stroke-dasharray]="circumference()"
            [attr.stroke-dashoffset]="dashOffset()"
            class="transition-all duration-1000 ease-out"
          />
        </svg>

        <!-- متن وسط دونات؛ درصد بولد و تمیز -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span class="text-xl font-black text-zinc-900 num-fa tracking-tight">
            {{ percentage() }}%
          </span>
          @if (centerLabel()) {
            <span class="text-[11px] font-medium text-zinc-500 mt-0.5">
              {{ centerLabel() }}
            </span>
          }
        </div>
      </div>

      <!-- لیبل و زیرنویس پایینی اختیاری -->
      @if (title()) {
        <div class="mt-2 text-center">
          <div class="text-xs font-bold text-zinc-800">{{ title() }}</div>
          @if (subtitle()) {
            <div class="text-[11px] text-zinc-400 mt-0.5">{{ subtitle() }}</div>
          }
        </div>
      }
    </div>
  `,
})
export class DonutChart {
  // درصد پیشرفت از ۰ تا ۱۰۰
  readonly percentage = input<number>(0);
  
  // سایز برحسب پیکسل (پیش‌فرض ۱۰۵ پیکسل)
  readonly size = input<number>(105);
  
  // ضخامت خط دونات
  readonly strokeWidth = input<number>(11);
  
  // رنگ استروک پیشرفت (به‌صورت پیش‌فرض نارنجی امضای چایلد فود #FF6B3D)
  readonly strokeColor = input<string>('#FF6B3D');
  
  // رنگ پس‌زمینه حلقه (طوسی خیلی ملایم یا نارنجی کم‌رنگ)
  readonly trackColor = input<string>('#F4F4F5');
  
  // متنی که دقیقا زیر درصد در مرکز دونات می‌نشیند
  readonly centerLabel = input<string>('');
  
  // عنوان زیر نمودار
  readonly title = input<string>('');
  readonly subtitle = input<string>('');

  // محاسبات ریاضی برای رسم دقیق محیط و آفست SVG
  readonly center = computed(() => this.size() / 2);
  readonly radius = computed(() => (this.size() - this.strokeWidth()) / 2);
  readonly circumference = computed(() => 2 * Math.PI * this.radius());
  
  readonly dashOffset = computed(() => {
    const p = Math.max(0, Math.min(100, this.percentage()));
    return this.circumference() - (p / 100) * this.circumference();
  });
}
