import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PwaInstall} from './pwa-install';
import {PwaService} from '../../services/pwa';
import {vi} from 'vitest';

describe('PwaInstall Component', () => {
  let component: PwaInstall;
  let fixture: ComponentFixture<PwaInstall>;
  let pwaService: PwaService;

  beforeEach(async () => {
    vi.useFakeTimers();
    sessionStorage.clear();
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [PwaInstall],
      providers: [PwaService],
    }).compileComponents();

    pwaService = TestBed.inject(PwaService);
    pwaService.isInstalled.set(false);
    pwaService.showIOSModal.set(false);

    fixture = TestBed.createComponent(PwaInstall);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('نباید زمانی که اپلیکیشن از قبل نصب شده است (isInstalled === true) توست را نمایش دهد', () => {
    pwaService.isInstalled.set(true);
    fixture.detectChanges();

    const toastWrapper = fixture.nativeElement.querySelector('#pwa-toast-wrapper');
    expect(toastWrapper).toBeNull();
  });

  it('باید به صورت توست شناور (fixed) با پوزیشن z-50 رندر شود و صفحه را به پایین هول ندهد', () => {
    fixture.detectChanges();
    vi.advanceTimersByTime(150);
    fixture.detectChanges();

    const toastWrapper = fixture.nativeElement.querySelector('#pwa-toast-wrapper') as HTMLElement;
    expect(toastWrapper).toBeTruthy();
    expect(toastWrapper.classList.contains('fixed')).toBe(true);
    expect(toastWrapper.classList.contains('top-3')).toBe(true);
    expect(toastWrapper.classList.contains('z-50')).toBe(true);

    // بررسی عنوان و نوشته‌های داخل توست
    const banner = fixture.nativeElement.querySelector('#pwa-install-banner');
    expect(banner.textContent).toContain('نصب اپلیکیشن روی گوشی');
    expect(banner.textContent).toContain('دسترسی سریع‌تر، بدون نیاز به مرورگر');

    // لغو تایمرها برای جلوگیری از نشت تست
    component.dismissToast();
    vi.advanceTimersByTime(400);
  });

  it('باید پس از کلیک روی دکمه بستن (✕)، توست بسته شده و در sessionStorage ثبت شود', () => {
    fixture.detectChanges();
    vi.advanceTimersByTime(150);
    fixture.detectChanges();

    const dismissBtn = fixture.nativeElement.querySelector('#btn-dismiss-pwa-banner') as HTMLButtonElement;
    expect(dismissBtn).toBeTruthy();

    dismissBtn.click();
    vi.advanceTimersByTime(400);
    fixture.detectChanges();

    expect(component.showToast()).toBe(false);
    expect(sessionStorage.getItem('childe_pwa_dismissed')).toBe('true');
  });

  it('باید پس از گذشت زمان خودکار (۸ ثانیه)، توست به صورت اتوماتیک پنهان شود', () => {
    fixture.detectChanges();
    vi.advanceTimersByTime(150);
    fixture.detectChanges();

    expect(component.showToast()).toBe(true);

    // شبیه‌سازی گذشت ۸ ثانیه
    vi.advanceTimersByTime(8100);
    vi.advanceTimersByTime(400);
    fixture.detectChanges();

    expect(component.showToast()).toBe(false);
  });

  it('با کلیک روی دکمه نصب، installApp فراخوانی شود', () => {
    let installCalled = false;
    pwaService.installApp = () => {
      installCalled = true;
      return Promise.resolve(true);
    };

    fixture.detectChanges();
    vi.advanceTimersByTime(150);
    fixture.detectChanges();

    const installBtn = fixture.nativeElement.querySelector('#btn-install-pwa') as HTMLButtonElement;
    expect(installBtn).toBeTruthy();

    installBtn.click();
    vi.advanceTimersByTime(400);

    expect(installCalled).toBe(true);
  });
});
