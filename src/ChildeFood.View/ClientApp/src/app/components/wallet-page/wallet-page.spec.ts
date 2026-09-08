import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WalletPage} from './wallet-page';
import {FoodStore} from '../../services/food-store';
import {describe, it, expect, beforeEach} from 'vitest';

describe('WalletPage Component — تست صفحه کیف پول و اعتبارات', () => {
  let component: WalletPage;
  let fixture: ComponentFixture<WalletPage>;
  let store: FoodStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletPage],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(WalletPage);
    component = fixture.componentInstance;
    store = TestBed.inject(FoodStore);
    fixture.detectChanges();
  });

  it('باید کامپوننت با موفقیت ساخته شود', () => {
    expect(component).toBeTruthy();
  });

  it('کارت مشکی بالایی باید فقط موجودی و دکمه شارژ را نشان دهد و هدر کارت و فیلد والد حذف شده باشند', () => {
    const el: HTMLElement = fixture.nativeElement;
    const card = el.querySelector('#main-wallet-card');
    expect(card).toBeTruthy();

    // چک می‌کنیم که عبارت کارت اعتباری تغذیه مدارس و شناسه والد وجود نداشته باشد
    expect(card?.textContent).not.toContain('کارت اعتباری تغذیه مدارس');
    expect(card?.textContent).not.toContain('متصل به ۳ دانش‌آموز');
    expect(card?.textContent).not.toContain('IR-5820');
    expect(card?.textContent).not.toContain('والد:');

    // موجودی و دکمه شارژ آنی باید موجود باشند
    expect(card?.querySelector('#wallet-balance-display')).toBeTruthy();
    expect(card?.querySelector('#btn-open-recharge-modal')).toBeTruthy();
  });

  it('آمار سه‌گانه باید به درستی از استور لود و نمایش داده شوند', () => {
    store.walletSummary.set({
      walletId: 'w-1',
      balance: 50000,
      virtualCardNumber: '6037',
      monthOrdersCount: 2,
      totalDeposits: 700000,
      totalOrdersAmount: 410000,
      totalDiscountAmount: 45000,
    });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain((700000).toLocaleString('fa-IR'));
    expect(el.textContent).toContain((410000).toLocaleString('fa-IR'));
    expect(el.textContent).toContain((45000).toLocaleString('fa-IR'));
  });

  it('باید دکمه همه تراکنش‌ها باتم‌شیت را باز کند', () => {
    expect(component.isAllTransactionsModalOpen()).toBe(false);

    component.openAllTransactionsModal();
    expect(component.isAllTransactionsModalOpen()).toBe(true);

    fixture.detectChanges();
    const sheet = fixture.nativeElement.querySelector('#all-transactions-bottom-sheet');
    expect(sheet).toBeTruthy();

    // در هدر نباید آیکون کارت یا ساب‌تایتل سوابق کامل شارژ وجود داشته باشد
    expect(sheet.textContent).not.toContain('سوابق کامل شارژ کیف پول');
    expect(sheet.textContent).not.toContain('💳');

    // فوتر دکمه‌های شارژ جدید کیف پول و بستن از پایین باید حذف شده باشند
    expect(sheet.querySelector('#btn-modal-recharge')).toBeNull();
    expect(sheet.querySelector('#btn-modal-close')).toBeNull();
  });

  it('باید متد بستن باتم‌شیت به درستی کار کند', () => {
    component.openAllTransactionsModal();
    expect(component.isAllTransactionsModalOpen()).toBe(true);

    component.closeAllTransactionsModal();
    expect(component.isAllTransactionsModalOpen()).toBe(false);
  });
});
