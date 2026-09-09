import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {BottomNav} from '../bottom-nav/bottom-nav';
import {CartDrawer} from '../cart-drawer/cart-drawer';
import {OrdersDrawer} from '../orders-drawer/orders-drawer';
import {WalletDrawer} from '../wallet-drawer/wallet-drawer';
import {PwaInstall} from '../pwa-install/pwa-install';
import {HomePage} from '../home-page/home-page';
import {MealsPage} from '../meals-page/meals-page';
import {WalletPage} from '../wallet-page/wallet-page';
import {ChildrenPage} from '../children-page/children-page';
import {OrdersPage} from '../orders-page/orders-page';
import {ProfilePage} from '../profile-page/profile-page';
import {CalendarPage} from '../calendar-page/calendar-page';
import {CheckoutPage} from '../checkout-page/checkout-page';
import {AuthPhone} from '../auth-phone/auth-phone';
import {AuthOtp} from '../auth-otp/auth-otp';
import {ParentOnboarding} from '../parent-onboarding/parent-onboarding';
import {ChildOnboarding} from '../child-onboarding/child-onboarding';
import {TopToast} from '../top-toast/top-toast';
import {FoodStore} from '../../services/food-store';

// اینجا نمای اپلیکیشن سمت کاربر (والدین و دانش‌آموزان) رو کاملاً مستقل و دکوپله کردیم
// تا پنل ادمین و پنل کاربر مثل دو تا پروژه جدا بدون هیچ وابستگی کار کنن
@Component({
  selector: 'app-user-panel',
  standalone: true,
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
  templateUrl: './user-panel.html',
})
export class UserPanel {
  readonly foodStore = inject(FoodStore);

  // این سیگنال محاسباتی چک می‌کنه اگه کاربر توی صفحات ورود یا آنبوردینگه، منوهای مزاحم پایینی مخفی بشن
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
