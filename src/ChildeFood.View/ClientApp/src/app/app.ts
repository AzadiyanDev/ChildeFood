import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {BottomNav} from './components/bottom-nav/bottom-nav';
import {CartDrawer} from './components/cart-drawer/cart-drawer';
import {OrdersDrawer} from './components/orders-drawer/orders-drawer';
import {WalletDrawer} from './components/wallet-drawer/wallet-drawer';
import {PwaInstall} from './components/pwa-install/pwa-install';
import {HomePage} from './components/home-page/home-page';
import {MealsPage} from './components/meals-page/meals-page';
import {WalletPage} from './components/wallet-page/wallet-page';
import {ChildrenPage} from './components/children-page/children-page';
import {OrdersPage} from './components/orders-page/orders-page';
import {ProfilePage} from './components/profile-page/profile-page';
import {CalendarPage} from './components/calendar-page/calendar-page';
import {CheckoutPage} from './components/checkout-page/checkout-page';
import {AuthPhone} from './components/auth-phone/auth-phone';
import {AuthOtp} from './components/auth-otp/auth-otp';
import {ParentOnboarding} from './components/parent-onboarding/parent-onboarding';
import {ChildOnboarding} from './components/child-onboarding/child-onboarding';
import {TopToast} from './components/top-toast/top-toast';
import {FoodStore} from './services/food-store';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HomePage,
    MealsPage,
    CalendarPage,
    CheckoutPage,
    WalletPage,
    ChildrenPage,
    OrdersPage,
    ProfilePage,
    AuthPhone,
    AuthOtp,
    ParentOnboarding,
    ChildOnboarding,
    TopToast,
    BottomNav,
    CartDrawer,
    OrdersDrawer,
    WalletDrawer,
    PwaInstall,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly foodStore = inject(FoodStore);

  // تشخیص صفحات احراز هویت و آنبوردینگ جهت پنهان‌سازی نوار ناوبری پایین و عناصر مزاحم
  readonly isAuthPage = computed(() => {
    const page = this.foodStore.activePage();
    return (
      page === 'login-phone' ||
      page === 'login-otp' ||
      page === 'parent-onboarding' ||
      page === 'child-onboarding'
    );
  });
}
