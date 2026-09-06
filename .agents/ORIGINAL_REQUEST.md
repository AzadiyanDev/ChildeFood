# Original User Request

## Initial Request — 2026-09-05T17:03:26Z

This is a single self-contained fix; keep it small and focused.

A clean, ultra-minimalist, mobile-first redesign for the ChildeFood school lunch application home screen (home-page.ts, 	oday-orders.ts, parent-profile.ts). The goal is an effortless, rapid mobile workflow where a parent selects their child, selects upcoming days (e.g. 10 days), picks meals, and confirms in seconds without any visual noise, clutter, or superfluous dashboard widgets.

Working directory: d:/Projects/ChildeFood
Integrity mode: development

## Requirements

### R1. Ultra-Minimalist Mobile UX (Child → Days → Meals)
- Transform the home page into a distraction-free, 1-screen mobile experience optimized for fast completion:
  1. **Child Selector**: Compact, single-row pill selector to pick the child (Artin, Ava, Amirali) with active state.
  2. **10-Day Calendar Strip / Day Selector**: Horizontal scrollable or clean grid of the next 10 school days showing day name, date, and reservation status.
  3. **Daily Meal Selection & Quick Confirmation**: For each selected day, show the hot meal option with a clear 1-tap select/toggle action, followed by a fixed or sticky minimal summary footer (total days, total amount, 1-tap confirm/pay).
- Eliminate all unnecessary dashboard fluff: remove complex telemetry widgets, telemetry badges, inspection accordions, bulky banners, and non-essential stats.

### R2. Strict Visual Cleanliness (No Gradients, No Glassmorphism)
- **Forbidden**: Absolutely zero gradients (g-gradient-*, gradient text, gradient borders) and zero glassmorphism (ackdrop-blur-*, semi-transparent glassy card overlays).
- **Allowed & Enforced**: Crisp, clean, flat minimalist surfaces (pure whites #ffffff, soft warm backgrounds #fafafa or #f4f4f5, crisp 1px borders order-zinc-200, solid high-contrast text 	ext-zinc-900, and subtle brand accent #f97352 / #18181b).
- Clean typography and ample whitespace adhering to minimalist-ui and design-taste-frontend.
- Ergonomic touch targets: All interactive pills, date chips, and buttons must strictly maintain min-h-[44px] for comfortable mobile tapping.

### R3. Preservation of Business Logic & Store Integration
- Integrate seamlessly with existing FoodStore signals (oodStore.children(), oodStore.todayOrders(), oodStore.parentProfile(), oodStore.goToWallet(), etc.).
- Maintain Angular standalone architecture with ChangeDetectionStrategy.OnPush and Tailwind CSS utility classes exclusively.
- All in-code comments must be written in friendly, informal Persian (فارسی خودمونی و ساده).

## Acceptance Criteria

### Ergonomics & Visual Integrity
- [ ] No gradient classes (g-gradient-*) and no backdrop-blur classes (ackdrop-blur-*) exist in home-page.ts, 	oday-orders.ts, or parent-profile.ts.
- [ ] The primary screen delivers the complete 3-step flow (Select Child -> Select 10 Days -> Pick Meal -> Confirm) without clutter.
- [ ] Every tap target has at least 44px touch height (min-h-[44px]).

### Verification & Quality Assurance
- [ ] 
pm run lint passes with 0 errors and 0 warnings.
- [ ] 
pm test -- --watch=false passes all test suites (including any updated tests for home-page.spec.ts).
- [ ] npm run build succeeds with zero AoT compilation or TypeScript errors.

## Follow-up — 2026-09-05T21:18:30Z

This is a single self-contained fix; keep it small and focused.

Redesign a premium mobile food selection screen for the ChildeFood school lunch ordering application. The screen is a focused checkout step following date selection, matching the existing minimal, premium food delivery experience: white background (#FFFFFF), black typography (#111111), vibrant orange accent (#FF6B3D), soft gray secondary text, rounded cards, clean spacing, Persian RTL layout, and modern Persian typography.

Working directory: d:/Projects/ChildeFood
Integrity mode: development

## Requirements

### R1. Compact Checkout Header & Child/Date Context Card
- **Header**:
  - Right: Bold title "انتخاب غذای ناهار" with subtitle "برای روز ۱۶ شهریور انتخاب کن".
  - Left: Touch-friendly Back button (min-h-[44px]) and small 5-step progress indicator "مرحله ۳ از ۵" (● ● ● ○ ○).
- **Child + Date Card**:
  - White rounded card with subtle shadow.
  - Displays child avatar, name "آوا احمدی", grade "پایه دوم ابتدایی".
  - Displays selected date "📅 ۱۶ شهریور" with a compact, dedicated "تغییر" button.

### R2. Horizontal Food Categories & Marketplace Clutter Elimination
- **Categories**:
  - Horizontal pill buttons for categories: "همه", "غذاهای اصلی", "نوشیدنی", "دسر".
  - Selected category has vibrant orange background (#FF6B3D) with white text.
- **Strict Removal of Marketplace Clutter**:
  - Hide/remove floating bottom navigation tabs on this ordering screen.
  - Remove large search inputs, excessive hero headlines, and generic marketplace banners.
  - Keep the screen strictly focused on the parent lunch ordering experience.

### R3. Modern 2-Column Food Grid with Interactive Selection Expansion
- **Food Cards (2-Column Grid)**:
  - 2-column layout with 24px rounded corners, white background, and soft shadow.
  - Large food visual at top.
  - Food name (e.g. "برگر دوبل اسمش"), description (e.g. "دو لایه گوشت با پنیر دوبل"), and price in Toman (e.g. "۷۵۰۰۰ تومان").
  - Primary unselected action: rounded orange button "انتخاب".
- **Selected State & Expansion**:
  - When selected, card border becomes orange (#FF6B3D).
  - Shows "✓ انتخاب شد".
  - Expands portion option: `نوع پرس: [ کامل ] [ نیم پرس ]` with active states.
  - Expands quantity selector: `- 1 +` with comfortable touch targets.

### R4. Sticky Bottom Checkout Summary Bar
- Sticky bottom checkout bar with soft shadow:
  - Left: Item summary count "۱ غذا انتخاب شده" and total price "۷۵۰۰۰ تومان".
  - Right: Prominent rounded orange button "ادامه".

### R5. Integration, Ergonomics & Quality Standards
- Fully integrated with existing Angular standalone architecture, OnPush change detection, and `FoodStore` signals in `src/ChildeFood.View/ClientApp`.
- Exclusively Tailwind CSS styling; zero vanilla CSS or unapproved gradients.
- All interactive elements must adhere to mobile ergonomic touch target guidelines (min-h-[44px] or min-h-[40px]).
- In-code comments written in friendly, informal Persian (فارسی خودمونی و ساده).

## Acceptance Criteria

### Visual & Functional Criteria
- [ ] Meals selection page renders compact header with title "انتخاب غذای ناهار", subtitle "برای روز ۱۶ شهریور انتخاب کن", back button, and progress indicator "مرحله ۳ از ۵".
- [ ] Child & date card renders avatar, "آوا احمدی", "پایه دوم ابتدایی", "📅 ۱۶ شهریور", and the "تغییر" button.
- [ ] Bottom navigation tab bar and generic search header are absent on the food selection screen.
- [ ] 2-column grid renders cards with 24px border radius, food visual, title, description, price in Toman, and orange "انتخاب" button.
- [ ] Tapping "انتخاب" on a food card highlights it with an orange border, shows "✓ انتخاب شد", and reveals portion [کامل / نیم پرس] and quantity [- 1 +] controls.
- [ ] Sticky bottom summary bar correctly calculates selected items, displays total price, and provides the "ادامه" CTA.
- [ ] All interactive buttons and pills have at least 44px (or 40px for compact pills) touch height.

### Verification & Automated Testing
- [ ] Comprehensive unit test suite (`meals-page.spec.ts`) tests header elements, child card details, category selection, card selection expansion, and bottom checkout summary.
- [ ] `npm test -- --watch=false` in `src/ChildeFood.View/ClientApp` passes 100% of test suites.
- [ ] `npm run lint` in `src/ChildeFood.View/ClientApp` passes with 0 errors and 0 warnings.
- [ ] `npm run build` in `src/ChildeFood.View/ClientApp` compiles cleanly with zero TypeScript or AoT errors.
