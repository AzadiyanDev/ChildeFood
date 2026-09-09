import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  AdminWalletDetail,
  AdminWalletListItem,
  AdminWalletService,
  AdminWalletStats,
} from '../../services/admin-wallet.service';

// کامپوننت مدیریت کیف پول و امور مالی در پنل ادمین
// نمایش لیست والت‌ها، موجودی‌ها، آمار کلان مالی، تغییر وضعیت فعال/مسدود و مودال ۵ تراکنش آخر
@Component({
  selector: 'app-admin-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-wallet.html',
})
export class AdminWallet implements OnInit {
  readonly service = inject(AdminWalletService);
  private readonly cdr = inject(ChangeDetectorRef);

  // داده‌ها و وضعیت
  wallets = signal<AdminWalletListItem[]>([]);
  stats = signal<AdminWalletStats | null>(null);
  isLoading = signal(false);

  // فیلترها
  searchQuery = signal('');
  activeFilter = signal<'all' | 'active' | 'inactive'>('all');

  // مودال جزئیات و ۵ تراکنش آخر
  selectedWalletDetail = signal<AdminWalletDetail | null>(null);
  isLoadingDetail = signal(false);
  isToggling = signal(false);

  // پیام اعلان موقت
  toastMessage = signal<string | null>(null);

  // لیست والت‌های فیلتر شده
  filteredWallets = computed(() => {
    let list = this.wallets();

    // فیلتر وضعیت فعال/غیرفعال
    const filter = this.activeFilter();
    if (filter === 'active') {
      list = list.filter((w) => w.isActive);
    } else if (filter === 'inactive') {
      list = list.filter((w) => !w.isActive);
    }

    // فیلتر جستجو
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (w) =>
          w.parentName.toLowerCase().includes(q) ||
          w.phoneNumber.includes(q) ||
          w.virtualCardNumber.includes(q) ||
          w.childrenNames.some((c) => c.toLowerCase().includes(q)) ||
          w.schoolNames.some((s) => s.toLowerCase().includes(q))
      );
    }

    return list;
  });

  async ngOnInit() {
    await this.loadData();
  }

  // بارگذاری داده‌ها از بک‌اند
  async loadData() {
    this.isLoading.set(true);
    try {
      const [walletsData, statsData] = await Promise.all([
        this.service.getWallets(),
        this.service.getWalletStats(),
      ]);
      this.wallets.set(walletsData);
      this.stats.set(statsData);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  // باز کردن مودال جزئیات و واکشی ۵ تراکنش آخر
  async openDetails(wallet: AdminWalletListItem) {
    this.isLoadingDetail.set(true);
    this.cdr.markForCheck();

    try {
      const detail = await this.service.getWalletDetail(wallet.walletId);
      this.selectedWalletDetail.set(detail);
    } finally {
      this.isLoadingDetail.set(false);
      this.cdr.markForCheck();
    }
  }

  // بستن مودال
  closeDetails() {
    this.selectedWalletDetail.set(null);
    this.cdr.markForCheck();
  }

  // تغییر وضعیت فعال/مسدود کردن از داخل مودال جزئیات
  async toggleStatusFromModal() {
    const detail = this.selectedWalletDetail();
    if (!detail) return;

    const newStatus = !detail.isActive;
    this.isToggling.set(true);
    this.cdr.markForCheck();

    try {
      const res = await this.service.toggleWalletStatus(detail.walletId, newStatus);
      if (res.success) {
        // به‌روزرسانی استیت مودال
        this.selectedWalletDetail.update((d) => d ? { ...d, isActive: newStatus } : null);

        // به‌روزرسانی استیت لیست
        this.wallets.update((list) =>
          list.map((w) => (w.walletId === detail.walletId ? { ...w, isActive: newStatus } : w))
        );

        // به‌روزرسانی آمار
        this.stats.update((s) => {
          if (!s) return s;
          return {
            ...s,
            activeWalletsCount: newStatus ? s.activeWalletsCount + 1 : s.activeWalletsCount - 1,
            inactiveWalletsCount: newStatus ? s.inactiveWalletsCount - 1 : s.inactiveWalletsCount + 1,
          };
        });

        this.showToast(res.message);
      }
    } finally {
      this.isToggling.set(false);
      this.cdr.markForCheck();
    }
  }

  // تغییر سریع وضعیت فعال/مسدود از سطر جدول
  async toggleStatusFromRow(wallet: AdminWalletListItem, event: MouseEvent) {
    event.stopPropagation();
    const newStatus = !wallet.isActive;

    try {
      const res = await this.service.toggleWalletStatus(wallet.walletId, newStatus);
      if (res.success) {
        this.wallets.update((list) =>
          list.map((w) => (w.walletId === wallet.walletId ? { ...w, isActive: newStatus } : w))
        );

        this.stats.update((s) => {
          if (!s) return s;
          return {
            ...s,
            activeWalletsCount: newStatus ? s.activeWalletsCount + 1 : s.activeWalletsCount - 1,
            inactiveWalletsCount: newStatus ? s.inactiveWalletsCount - 1 : s.inactiveWalletsCount + 1,
          };
        });

        this.showToast(res.message);
      }
    } catch {
      this.showToast('خطا در تغییر وضعیت کیف پول');
    }
    this.cdr.markForCheck();
  }

  // فیلتر سریع
  setFilter(filter: 'all' | 'active' | 'inactive') {
    this.activeFilter.set(filter);
    this.cdr.markForCheck();
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.cdr.markForCheck();
  }

  // نمایش پیام توست
  private showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
      this.cdr.markForCheck();
    }, 3000);
  }

  // فرمت تومان فارسی
  formatPrice(price: number): string {
    return price.toLocaleString('fa-IR') + ' تومان';
  }

  // فرمت تاریخ ساده
  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fa-IR');
    } catch {
      return dateStr;
    }
  }

  // فرمت تاریخ و ساعت
  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleDateString('fa-IR') +
        ' ساعت ' +
        d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      return dateStr;
    }
  }
}
