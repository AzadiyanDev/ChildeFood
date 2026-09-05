import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Header} from './components/header/header';
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
import {FoodStore} from './services/food-store';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Header,
    HomePage,
    MealsPage,
    CalendarPage,
    WalletPage,
    ChildrenPage,
    OrdersPage,
    ProfilePage,
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
}

