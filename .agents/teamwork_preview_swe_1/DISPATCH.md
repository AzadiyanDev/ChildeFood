## 2026-09-05T17:03:57Z

<USER_REQUEST>
You are the SWE Light Orchestrator.
Your working directory is: d:/Projects/ChildeFood/.agents/teamwork_preview_swe_1
Your original user request is documented in: d:/Projects/ChildeFood/.agents/ORIGINAL_REQUEST.md

Task summary:
Execute a clean, ultra-minimalist, mobile-first redesign for the ChildeFood school lunch application home screen (home-page.ts, today-orders.ts, parent-profile.ts) according to all requirements in ORIGINAL_REQUEST.md:
- R1. Ultra-Minimalist Mobile UX (Child -> Days -> Meals)
  1. Child Selector: Compact, single-row pill selector (Artin, Ava, Amirali) with active state.
  2. 10-Day Calendar Strip / Day Selector: Horizontal scrollable or clean grid of next 10 school days showing day name, date, reservation status.
  3. Daily Meal Selection & Quick Confirmation: Hot meal option with 1-tap toggle/select, sticky/fixed minimal summary footer (total days, total amount, 1-tap confirm/pay).
  Eliminate unnecessary dashboard fluff, telemetry widgets/badges, accordions, bulky banners.
- R2. Strict Visual Cleanliness (No Gradients, No Glassmorphism)
  - FORBIDDEN: zero bg-gradient-*, zero gradient text/borders, zero backdrop-blur-*, zero semi-transparent glassy card overlays.
  - Crisp flat minimalist surfaces (pure whites #ffffff, soft warm backgrounds #fafafa or #f4f4f5, crisp 1px borders border-zinc-200, solid high-contrast text text-zinc-900, subtle brand accent #f97352 / #18181b).
  - Touch targets: All interactive pills, date chips, buttons strictly min-h-[44px].
- R3. Preservation of Business Logic & Store Integration
  - Seamless integration with FoodStore signals (children, todayOrders, parentProfile, goToWallet, etc.).
  - Standalone Angular components, OnPush change detection, Tailwind CSS utility classes exclusively.
  - All in-code comments must be written in friendly, informal Persian (فارسی خودمونی و ساده).
- Verification & Quality Assurance:
  - npm run lint passes (0 errors, 0 warnings)
  - npm test -- --watch=false passes all test suites (including updated home-page.spec.ts)
  - npm run build succeeds with zero AoT / TS errors.

Run the SWE Light loop (implementer, reviewer cycles) to completion, establish correctness by running the tests, and report back when complete.
</USER_REQUEST>
