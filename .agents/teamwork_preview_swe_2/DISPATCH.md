## 2026-09-05T21:19:29Z

You are the SWE Light Orchestrator (teamwork_preview_swe).
Your working directory is d:/Projects/ChildeFood/.agents/teamwork_preview_swe_2
The project workspace is d:/Projects/ChildeFood

The authoritative user request is located at d:/Projects/ChildeFood/.agents/ORIGINAL_REQUEST.md (specifically the follow-up section timestamped 2026-09-05T21:18:30Z).

Task Summary:
Redesign a premium mobile food selection screen for the ChildeFood school lunch ordering application (meals-page). The screen is a focused checkout step following date selection, matching the existing minimal, premium food delivery experience: white background (#FFFFFF), black typography (#111111), vibrant orange accent (#FF6B3D), soft gray secondary text, rounded cards, clean spacing, Persian RTL layout, and modern Persian typography.

Requirements:
- R1: Compact Checkout Header (Back button touch target >=44px, progress indicator 'مرحله ۳ از ۵' [● ● ● ○ ○], title 'انتخاب غذای ناهار', subtitle 'برای روز ۱۶ شهریور انتخاب کن') & Child/Date Context Card (white rounded card, soft shadow, child avatar, 'آوا احمدی', 'پایه دوم ابتدایی', '📅 ۱۶ شهریور', 'تغییر' button).
- R2: Horizontal Food Categories ('همه', 'غذاهای اصلی', 'نوشیدنی', 'دسر' with vibrant orange #FF6B3D active state) & Marketplace Clutter Elimination (hide/remove bottom navigation tab bar and generic search header on this ordering screen).
- R3: Modern 2-Column Food Grid (cards with 24px border radius, food visual, title, description, price in Toman, orange 'انتخاب' button) with Interactive Selection Expansion (orange border #FF6B3D, '✓ انتخاب شد', portion selector [کامل / نیم پرس], quantity selector [- 1 +] with comfortable touch targets).
- R4: Sticky Bottom Checkout Summary Bar (soft shadow, item count '۱ غذا انتخاب شده', total price '۷۵۰۰۰ تومان', prominent orange 'ادامه' button).
- R5: Integration, Ergonomics & Quality Standards:
  - Angular standalone architecture, OnPush change detection, FoodStore signals integration.
  - Exclusively Tailwind CSS styling; zero vanilla CSS or unapproved gradients.
  - All interactive elements must adhere to mobile ergonomic touch target guidelines (min-h-[44px] or min-h-[40px] for pills).
  - In-code comments written in friendly, informal Persian (فارسی خودمونی و ساده).
  - Comprehensive unit test suite in meals-page.spec.ts.
  - 
pm test -- --watch=false, 
pm run lint, and 
pm run build must all pass cleanly in src/ChildeFood.View/ClientApp.

Please coordinate the implementation and review loop, maintain your progress in your working directory, and notify me when complete.
