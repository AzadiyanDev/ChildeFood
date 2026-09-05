import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-hero-headline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="hero-headline-section" class="mt-6 px-6" data-purpose="headline">
      <h1 id="main-headline-title" class="text-[30px] tracking-tight leading-tight font-black text-gray-950">
        گرسنه‌اید؟ <span id="headline-subtitle" class="font-normal text-[#9ca3af]">سفارش و نوش‌جان.</span>
      </h1>
    </section>
  `,
})
export class HeroHeadline {}
