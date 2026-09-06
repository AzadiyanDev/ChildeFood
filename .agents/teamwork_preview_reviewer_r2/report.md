# Reviewer R2 Adversarial Evaluation and Defect Fix Report

## 1. What the prior attempt got wrong

### Issue 1: Wallet Balance Wiped Out to Zero on Online Gateway Payment (Fatal Functional Bug)
- **Input:** User has an existing wallet balance (e.g., 20,000 تومان) and places an order exceeding that balance (e.g., 320,000 تومان). `currentBalance < total`, so the order is paid via the Shaparak online bank gateway (`درگاه آنلاین شاپرک`).
- **Expected:** Transaction is logged as an online purchase via Shaparak, the order succeeds, and the user's existing 20,000 تومان wallet balance remains intact in their account.
- **Actual:** `home-page.ts` unconditionally ran `this.foodStore.parentProfile.update((p) => ({ ...p, walletBalance: 0 }))`, wiping out the parent's entire wallet balance to zero even though they paid via bank card.
- **Root cause:** Careless assignment in the `else` branch of `handleConfirmAndPay()` setting `walletBalance: 0` instead of leaving the wallet balance untouched.

### Issue 2: Double-Payment Vulnerability (Fatal Functional Bug)
- **Input:** Parent selects days (e.g. days 16, 17) and clicks "تأیید و پرداخت سریع".
- **Expected:** Order is confirmed, newly booked days are marked as reserved, and the pending selection is cleared / completed so the parent cannot accidentally tap again and be charged twice.
- **Actual:** `this.selectedDays` was left intact (`[16, 17]`). The sticky footer remained active with "۲ روز ناهار - ۳۲۰,۰۰۰ تومان" and the primary checkout button remained enabled. If the user tapped again, another transaction was executed, charging the user twice for the exact same order!
- **Root cause:** `handleConfirmAndPay()` did not clear `selectedDays` upon successful booking.

### Issue 3: Navigating Away on Unattended Child Quick Order (UX & Architectural Violation)
- **Input:** Parent on `HomePage` sees the amber notice that Amirali has no lunch today (`child-no-order-notice`) and taps "سفارش ناهار" (`btn-quick-order-amirali`).
- **Expected:** Amirali is selected in-place on `HomePage`, the 3-step mobile workflow at the top of `HomePage` updates to Amirali, and smoothly focuses so the parent can confirm in 1 tap without leaving the redesigned home screen.
- **Actual:** The button called `foodStore.orderForChild(unattendedChild.id)`, which navigated to `'calendar'`, unmounting `HomePage` and redirecting to the legacy, non-minimalist 31-day calendar screen.
- **Root cause:** Re-use of the global navigation method `orderForChild` instead of in-place child selection and smooth scroll on the redesigned home page.

### Issue 4: Day Chip Tap on Already Reserved Days Added Double Charge (Edge Case Defect)
- **Input:** Parent taps on a day chip that is already reserved (e.g. Day 15 for Artin).
- **Expected:** Tapping on an already booked day previews the day's meal plan so the parent can see what their child is eating, but DOES NOT add that day to the pending cart to be paid for a second time.
- **Actual:** `handleTapDayChip(dayNumber)` unconditionally called `toggleDay(dayNumber)`, adding the already booked day into `selectedDays`, increasing `totalPrice` and re-charging the parent on checkout.
- **Root cause:** Lack of guard against toggling already reserved days in `handleTapDayChip`.

### Issue 5: Stale Confirmation Toast Across Children
- **Input:** Parent confirms an order for Artin (toast appears with tracking code), then switches to Ava.
- **Expected:** Confirmation toast from Artin's order is dismissed upon switching child or clearing selections.
- **Actual:** Confirmation toast remained visible across different children with outdated tracking code.
- **Root cause:** `handleSelectChild` and `clearSelectedDays` did not reset `isConfirmed`.

### Issue 6: Unhandled Empty State Fallback for `selectedChild`
- **Input:** Store `children()` signal is empty or cleared.
- **Expected:** Safe fallback child prevents uncaught TypeError in template bindings like `selectedChild().name`.
- **Actual:** `this.foodStore.children()[0]` is undefined, causing potential template runtime error.
- **Root cause:** Missing defensive fallback child object in `selectedChild` computed signal.

---

## 2. What I changed

1. **`src/ChildeFood.View/ClientApp/src/app/components/home-page/home-page.ts`**:
   - Fixed wallet balance retention in `handleConfirmAndPay()`: when paying via online gateway, parent wallet balance is preserved.
   - Fixed double-charge vulnerability: `selectedDays` is cleared (`this.selectedDays.set([])`) upon order confirmation, disabling the pay button and resetting pending total.
   - Fixed day chip tap interaction: `handleTapDayChip(dayNumber)` previews the meal if already reserved, but only toggles unreserved days into `selectedDays`.
   - Fixed stale toast: `handleSelectChild(childId)` and `clearSelectedDays()` reset `isConfirmed` to `false`.
   - Added robust empty-state fallback to `selectedChild` computed signal using `ChildItem` interface.
   - Enhanced day chip and meal plan UI to clearly distinguish already reserved days with high-contrast emerald indicator (`text-emerald-300` on dark active background and `text-emerald-600` on light surfaces).

2. **`src/ChildeFood.View/ClientApp/src/app/components/today-orders/today-orders.ts`**:
   - Replaced `foodStore.orderForChild(unattendedChild.id)` with `handleQuickOrderForChild(unattendedChild.id)` to keep the user on the home screen, select the child, and smoothly scroll to the quick order workflow.

3. **`src/ChildeFood.View/ClientApp/src/app/components/parent-profile/parent-profile.ts`**:
   - Added input validation guard `if (amount <= 0) return;` in `quickRecharge()`.

4. **`src/ChildeFood.View/ClientApp/src/app/components/home-page/home-page.spec.ts`**:
   - Added assertions to verify wallet balance preservation on online bank payments.
   - Added 4 new unit tests covering double-charge prevention, tap behavior on reserved chips, child-switch toast resets, and empty children fallback.

5. **`src/ChildeFood.View/ClientApp/src/app/components/today-orders/today-orders.spec.ts`**:
   - Added unit test verifying in-place child order selection without navigation to the legacy calendar page.

6. **`src/ChildeFood.View/ClientApp/src/app/components/parent-profile/parent-profile.spec.ts`**:
   - Added unit test verifying zero and negative recharge amounts are rejected.

---

## 3. Verification Record

- **Deep Verification (ran actual tests):**
  - `npm test -- --watch=false`:
    - 4 test suites passed (4 passed)
    - 33 total unit tests passed (33 passed, 0 failed, 6 new tests added)
    - Duration: 3.46s
  - `npm run lint`:
    - All files pass linting (0 errors, 0 warnings).
  - `npm run build`:
    - Application bundle generation complete with zero errors (470.40 kB browser bundle, 0 AoT errors).
- **Shallow Verification (manual only):**
  - Verified 0 instances of `bg-gradient-*` and `backdrop-blur-*` across `home-page.ts`, `today-orders.ts`, and `parent-profile.ts`.
  - Verified strict `min-h-[44px]` touch target compliance on all interactive elements.
  - Verified all in-code comments are written in friendly, informal Persian (کاملا خودمونی و ساده).
- **Unverified aspects:**
  - Physical multi-touch drag friction on real hardware touchscreens.
  - In-memory Angular Signal store persistence across full browser hard refresh.

---

## 4. Known Issues

- `Minor Robustness Risk`: The 10-day calendar strip uses fixed school day dates for the month of Shahrivar (15 through 26) as defined by the application domain schema.
- `Shallow Verification`: Touch-event drag interactions were tested via unit and viewport structural tests, but not on physical iOS/Android hardware.

---

## 5. Remaining risk & next step

All identified defects (wallet zeroing bug, double-charge vulnerability, unwanted page navigation, reserved-day chip toggling, stale toasts, empty store fallback) have been resolved and verified with 33 passing unit tests, 0 lint warnings, and 0 AoT build errors.
The pull request is ready for final merge.
