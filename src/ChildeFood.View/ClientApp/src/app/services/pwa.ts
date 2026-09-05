import {Injectable, signal} from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'; platform: string}>;
}

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  readonly isInstallable = signal<boolean>(false);
  readonly isInstalled = signal<boolean>(false);
  readonly isIOS = signal<boolean>(false);
  readonly showIOSModal = signal<boolean>(false);

  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  constructor() {
    this.initPwaListeners();
  }

  private initPwaListeners(): void {
    if (typeof window === 'undefined') return;

    // اینجا چک می‌کنیم اگه متد matchMedia در دسترس بود (مثلاً توی محیط تست یا مرورگرهای قدیمی که نیست) ارور نده
    const isStandalone =
      (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as unknown as {standalone?: boolean}).standalone === true;
    this.isInstalled.set(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    this.isIOS.set(isIOSDevice);

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.isInstallable.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.isInstallable.set(false);
      this.deferredPrompt = null;
    });
  }

  async installApp(): Promise<boolean> {
    if (this.isIOS()) {
      this.showIOSModal.set(true);
      return false;
    }

    if (!this.deferredPrompt) {
      // Fallback for browsers without beforeinstallprompt or desktop
      this.showIOSModal.set(true);
      return false;
    }

    await this.deferredPrompt.prompt();
    const {outcome} = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      this.isInstalled.set(true);
      this.isInstallable.set(false);
      this.deferredPrompt = null;
      return true;
    }
    return false;
  }

  closeIOSModal(): void {
    this.showIOSModal.set(false);
  }
}
