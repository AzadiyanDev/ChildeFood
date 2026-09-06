import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ParentProfileCard} from './parent-profile';
import {FoodStore} from '../../services/food-store';

describe('ParentProfileCard Component', () => {
  let component: ParentProfileCard;
  let fixture: ComponentFixture<ParentProfileCard>;
  let foodStore: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentProfileCard],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(ParentProfileCard);
    component = fixture.componentInstance;
    foodStore = TestBed.inject(FoodStore);
    fixture.detectChanges();
  });

  it('باید کامپوننت پروفایل والد با موفقیت لود شود', () => {
    expect(component).toBeTruthy();
  });

  it('شارژ سریع ۱۰۰ هزار تومانی باید به موجودی کیف پول اضافه کند', () => {
    const initialBalance = foodStore.parentProfile().walletBalance;
    component.quickRecharge(100000);
    expect(foodStore.parentProfile().walletBalance).toBe(initialBalance + 100000);
    expect(component.rechargeFeedback()).toBe(true);
  });

  it('چندین شارژ متوالی سریع باید موجودی را تجمیع و تایمر را بدون خطا مدیریت کنند', () => {
    const initialBalance = foodStore.parentProfile().walletBalance;
    component.quickRecharge(100000);
    component.quickRecharge(200000);
    component.quickRecharge(500000);

    expect(foodStore.parentProfile().walletBalance).toBe(initialBalance + 800000);
    expect(component.rechargeFeedback()).toBe(true);
  });

  it('تمامی کلیدها باید حداقل ارتفاع لمسی ۴۴ پیکسل را داشته و فاقد گرادینت باشند', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);

    buttons.forEach((btn) => {
      const classAttr = btn.getAttribute('class') || '';
      expect(classAttr).toContain('min-h-[44px]');
      expect(classAttr).not.toContain('bg-gradient-');
      expect(classAttr).not.toContain('backdrop-blur-');
    });
  });

  it('شارژ با مبالغ صفر یا منفی نباید موجودی کیف پول را تغییر دهد', () => {
    const initialBalance = foodStore.parentProfile().walletBalance;
    component.quickRecharge(0);
    component.quickRecharge(-50000);
    expect(foodStore.parentProfile().walletBalance).toBe(initialBalance);
  });
});
