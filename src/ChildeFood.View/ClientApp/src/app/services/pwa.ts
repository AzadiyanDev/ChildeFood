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

    try {
      const persistedInstalled = localStorage.getItem('childe_pwa_installed') === 'true';
      const isStandalone =
        (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator as unknown as {standalone?: boolean}).standalone === true ||
        (typeof document !== 'undefined' && document.referrer.includes('android-app://')) ||
        persistedInstalled;
      this.isInstalled.set(isStandalone);
    } catch {
      // ignore
    }

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
      try {
        localStorage.setItem('childe_pwa_installed', 'true');
      } catch {
        // ignore
      }
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
      try {
        localStorage.setItem('childe_pwa_installed', 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  }

  closeIOSModal(): void {
    this.showIOSModal.set(false);
  }
}
