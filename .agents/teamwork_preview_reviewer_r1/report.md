> [!WARNING] **Skepticism Disclaimer**
> High confidence in unit and integration test coverage across all 27 unit tests (11 new adversarial tests added) and TypeScript/AoT compilation, though real-device mobile gestures and browser refresh persistence in an in-memory signal store remain unverified outside browser memory.

## 1. What the prior attempt got wrong

### Issue 1: Unwanted Navigation / Disappearing Confirmation Toast
- **Input:** User clicks "تأیید و پرداخت سریع" (1-tap confirm/pay) on `HomePage`.
- **Expected:** Order is confirmed in-place on the home screen, remaining on `HomePage` to display `#confirmation-toast` with `lastTrackingCode` and the updated order state.
- **Actual:** `handleConfirmAndPay()` called `foodStore.confirmCalendarDays()`, which internally called `foodStore.goToMeals()`. In `app.html`, setting `activePage` to `'meals'` unmounted `HomePage` and switched to `MealsPage`, destroying the confirmation toast before the user could ever see it.
- **Root cause:** Confusion between `CalendarPage`'s transition method (`confirmCalendarDays()`) and `HomePage`'s in-place booking workflow.

### Issue 2: No Order Persistence or State Reflection for Confirmed Days
- **Input:** Parent selects Amirali (`child-3`) who has no order today (`hasOrderToday = false`), selects Day 15, and clicks "تأیید و پرداخت سریع".
- **Expected:** Amirali's lunch is reserved for today, an order is added to `foodStore.todayOrders`, a purchase transaction is logged in `foodStore.walletTransactions`, Day 15 chip displays "رزرو شده", and `#child-no-order-notice` disappears.
- **Actual:** Confirmed days were never marked as reserved in the 10-day strip, `todayOrders` was not updated, `walletTransactions` was not updated, and `#child-no-order-notice` continued to warn that Amirali had no lunch.
- **Root cause:** `handleConfirmAndPay()` only updated local signals without mutating `foodStore.children`, `todayOrders`, or `walletTransactions`, and `isChildDayOrdered()` hardcoded `dayNumber === 15 && child.hasOrderToday` without tracking newly booked days.

### Issue 3: Child Selector Desynchronization & Shared State
- **Input:** External component or notice calls `foodStore.orderForChild('child-3')` or parent switches children.
- **Expected:** `HomePage` reacts reactively to `foodStore.selectedChildId`, and child reservations are tracked per child.
- **Actual:** `HomePage.selectedChildId` was an isolated, unlinked signal (`signal('child-1')`), ignoring updates from the rest of the application.
- **Root cause:** Decoupled local signal instead of linking/computing from `foodStore.selectedChildId()`.

### Issue 4: Mobile Occlusion by Floating Bottom Navigation
- **Input:** Viewing `HomePage` on a mobile viewport (320px - 390px).
- **Expected:** Sticky summary footer sits comfortably above the floating bottom nav without overlap.
- **Actual:** `sticky-booking-footer` was placed at `bottom-0` (`z-30`), directly behind the floating `<app-bottom-nav>` (`z-40`, height 68px, bottom 16px), making the primary checkout button obstructed or difficult to tap on mobile.
- **Root cause:** Failure to account for the fixed floating bottom nav height (84px) in sticky positioning.

### Issue 5: Memory Leak in ParentProfileCard
- **Input:** User clicks a quick-recharge button and navigates away before the 2500ms feedback timer expires.
- **Expected:** Active timer is cleaned up when `ParentProfileCard` is unmounted.
- **Actual:** Timer callback executed on destroyed component.
- **Root cause:** Missing `DestroyRef` cleanup in `ParentProfileCard`.

---

## 2. What I changed

1. **`src/ChildeFood.View/ClientApp/src/app/components/home-page/home-page.ts`**:
   - Linked `selectedChildId` to `foodStore.selectedChildId()` reactively via `computed()`.
   - Added `bookedDaysByChild` signal to track booked days per child across the 10-day strip.
   - Updated `isChildDayOrdered()` to check both `bookedDaysByChild` and `hasOrderToday`.
   - Fixed `handleConfirmAndPay()`: removed `confirmCalendarDays()` / `goToMeals()` navigation call; updated `foodStore.selectedCalendarDays` directly; added order persistence to `foodStore.children` and `foodStore.todayOrders`; added purchase transaction to `foodStore.walletTransactions`; handled low wallet balance gracefully via online portal logging.
   - Updated `sticky-booking-footer` class to `sticky bottom-[84px] md:bottom-0 rounded-t-2xl` to prevent overlap with the floating bottom nav.

2. **`src/ChildeFood.View/ClientApp/src/app/components/parent-profile/parent-profile.ts`**:
   - Injected `DestroyRef` and registered cleanup in `onDestroy()` to cancel `feedbackTimer` on component destruction.

3. **`src/ChildeFood.View/ClientApp/src/app/components/home-page/home-page.spec.ts`**:
   - Added 7 new adversarial unit tests covering order reflection for unattended children, low wallet balance handling, empty order guards, `activePage` preservation, rapid toggling arithmetic precision, touch target heights (`min-h-[44px]`), and bottom nav offset verification.

4. **`src/ChildeFood.View/ClientApp/src/app/components/parent-profile/parent-profile.spec.ts`**:
   - Added 2 new tests covering rapid consecutive recharges (+100k, +200k, +500k) and touch target ergonomics (`min-h-[44px]`).

5. **`src/ChildeFood.View/ClientApp/src/app/components/today-orders/today-orders.spec.ts`**:
   - Added 2 new tests covering touch targets (`min-h-[44px]`) and reactive disappearance of `#child-no-order-notice`.

---

## 3. Verification Record

- **Deep Verification (ran actual tests):**
  - `npm test -- --watch=false`:
    - Test Files: 4 passed (4)
    - Tests: 27 passed (27)
    - Duration: 2.44s
  - `npm run lint`:
    - All files pass linting (0 errors, 0 warnings).
  - `npm run build`:
    - Application bundle generation complete with zero errors (Initial total: 468.22 kB browser bundle, 0 AoT errors).
- **Shallow Verification (manual only):**
  - Confirmed 0 instances of `bg-gradient-*` and `backdrop-blur-*` across `home-page.ts`, `today-orders.ts`, and `parent-profile.ts`.
  - Confirmed all interactive elements maintain `min-h-[44px]`.
- **Unverified aspects:**
  - Touchscreen physical drag gesture inertia on real iOS/Android devices (tested structurally via responsive CSS and Vitest).
  - Order persistence across full browser reloads (the application architecture currently uses an in-memory Angular Signal store).

---

## 4. Known Issues

- `Minor Robustness Risk`: The 10-day calendar strip uses fixed school day dates for the month of Shahrivar (15 through 26) as defined by the application domain schema.
- `Shallow Verification`: Touch-event drag interactions were tested via unit and viewport structural tests, but not on physical iOS/Android hardware.

---

## 5. Remaining risk & next step

The core mobile 3-step workflow (Child -> Days -> Meals -> Confirm/Pay) is verified, fully functional, responsive, and adheres to all R1, R2, and R3 requirements with 0 lint warnings and 27 passing tests.
The task is complete and ready for pull request merge.
