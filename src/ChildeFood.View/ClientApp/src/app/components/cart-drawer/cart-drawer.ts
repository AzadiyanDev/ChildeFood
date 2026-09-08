import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {FoodStore, toPersianDigits} from '../../services/food-store';

@Component({
  selector: 'app-cart-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (foodStore.isCartDrawerOpen()) {
      <!-- Backdrop -->
      <button
        id="cart-drawer-backdrop"
        type="button"
        aria-label="بستن سبد خرید"
        class="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs transition-opacity w-full h-full border-0 cursor-default"
        (click)="foodStore.closeCartDrawer()"
        (keyup.escape)="foodStore.closeCartDrawer()">
      </button>

      <!-- Slide-up Modal / Bottom Sheet -->
      <div
        id="cart-drawer-sheet"
        class="fixed bottom-0 inset-x-0 max-w-[420px] mx-auto bg-white rounded-t-[36px] z-50 p-6 shadow-2xl transition-transform border-t border-gray-100 flex flex-col max-h-[85vh]">
        
        <!-- Drag pill -->
        <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>

        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div class="flex items-center space-x-2 space-x-reverse">
            <span class="text-xl">🛍️</span>
            <h2 id="cart-drawer-title" class="text-base font-bold text-gray-900">سبد خرید شما</h2>
            <span class="text-xs bg-[#f97352]/10 text-[#f97352] px-2 py-0.5 rounded-full font-bold">
              {{ foodStore.totalCartCount() }} آیتم
            </span>
          </div>
          <button
            id="btn-close-cart-drawer"
            (click)="foodStore.closeCartDrawer()"
            class="min-w-[40px] min-h-[40px] w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer"
            aria-label="بستن">
            ✕
          </button>
        </div>

        <!-- Items list -->
        <div id="cart-items-list" class="overflow-y-auto flex-1 my-4 space-y-3 pr-1">
          @for (item of cartItemsList(); track item.food.id) {
            <div
              [id]="'cart-item-row-' + item.food.id"
              class="flex items-center justify-between p-3 rounded-2xl bg-[#fafafa] border border-gray-100">
              <div class="flex items-center space-x-3 space-x-reverse">
                <span class="text-2xl">{{ item.food.emoji }}</span>
                <div>
                  <h4 class="text-xs font-bold text-gray-900">{{ item.food.title }}</h4>
                  <p class="text-[10px] text-gray-400 font-medium">{{ item.food.subtitle }}</p>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="text-xs font-bold text-[#FF6B3D]">{{ formatPrice(item.food.price) }} تومان</span>
                    @if (foodStore.portions()[item.food.id]) {
                      <span [id]="'cart-item-portion-' + item.food.id" class="text-[9px] font-bold text-[#FF6B3D] bg-orange-50 border border-orange-200/60 px-1.5 py-0.5 rounded-md">
                        {{ foodStore.getPortion(item.food.id) === 'کامل' ? 'پرس کامل' : 'نیم پرس' }}
                      </span>
                    }
                  </div>
                </div>
              </div>

              <!-- کنترلرهای تعداد با جای لمس راحت و استانداردهای موبایل -->
              <div class="flex items-center space-x-2 space-x-reverse">
                <button
                  [id]="'cart-decrease-' + item.food.id"
                  (click)="foodStore.removeFromCart(item.food.id)"
                  class="min-w-[36px] min-h-[36px] w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center font-bold hover:bg-gray-50 active:scale-95 transition cursor-pointer"
                  aria-label="کاهش">
                  -
                </button>
                <span class="text-xs font-bold text-gray-900 min-w-[20px] text-center font-mono">
                  {{ item.count }}
                </span>
                <button
                  [id]="'cart-increase-' + item.food.id"
                  (click)="foodStore.addToCart(item.food.id)"
                  class="min-w-[36px] min-h-[36px] w-9 h-9 rounded-full bg-[#17191d] text-white flex items-center justify-center font-bold hover:bg-black active:scale-95 transition cursor-pointer"
                  aria-label="افزایش">
                  +
                </button>
              </div>
            </div>
          } @empty {
            <div class="py-8 text-center text-gray-400">
              <p class="text-3xl mb-1">🛒</p>
              <p class="text-xs font-semibold">سبد خرید شما خالی است</p>
            </div>
          }
        </div>

        <!-- Checkout summary -->
        @if (cartItemsList().length > 0) {
          <div class="pt-3 border-t border-gray-100 space-y-2">
            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>مبلغ کل سفارش:</span>
              <span class="font-bold text-gray-900 font-mono text-sm">{{ formatPrice(foodStore.totalCartPrice()) }} تومان</span>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>هزینه ارسال:</span>
              <span class="font-bold text-emerald-600">رایگان</span>
            </div>

            @if (orderSubmitted()) {
              <div class="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl text-center border border-emerald-200">
                ✅ سفارش شما با موفقیت ثبت شد و به زودی ارسال می‌شود!
              </div>
            } @else {
              <button
                id="btn-submit-order"
                (click)="goToCheckout()"
                type="button"
                class="min-h-[48px] w-full py-3.5 bg-[#FF6B3D] text-white font-bold text-sm rounded-full shadow-lg hover:bg-[#e05432] active:scale-98 transition flex items-center justify-center space-x-2 space-x-reverse cursor-pointer">
                <span>بررسی و تکمیل سفارش</span>
                <span class="font-mono text-xs opacity-90">({{ formatPrice(foodStore.totalCartPrice()) }} تومان)</span>
              </button>
            }
          </div>
        }
      </div>
    }
  `,
})
export class CartDrawer {
  readonly foodStore = inject(FoodStore);
  readonly orderSubmitted = signal<boolean>(false);

  readonly cartItemsList = computed(() => {
    const currentCart = this.foodStore.cart();
    const allFoods = this.foodStore.foods();
    return Object.entries(currentCart)
      .map(([id, count]) => {
        const food = allFoods.find((f) => f.id === id);
        return food ? {food, count} : null;
      })
      .filter((item): item is {food: typeof allFoods[0]; count: number} => item !== null && item.count > 0);
  });

  // تبدیل قیمت به تومان و اعداد فارسی تمیز
  formatPrice(price: number): string {
    return toPersianDigits(price);
  }

  goToCheckout(): void {
    this.foodStore.goToCheckout();
  }

  submitOrder(): void {
    this.orderSubmitted.set(true);
    setTimeout(() => {
      this.orderSubmitted.set(false);
      this.foodStore.closeCartDrawer();
    }, 2200);
  }
}
