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
  AdminParentService,
  ChildDetail,
  ParentDetail,
  ParentListItem,
} from '../../services/admin-parent.service';

type ModalMode = null | 'detail' | 'confirm-toggle';
type StatusFilter = 'all' | 'active' | 'inactive';

// کامپوننت مدیریت دانش‌آموزان و والدین در پنل ادمین
// نمایش جدول والدین، وضعیت حساب، جستجو و مودال جامع جزئیات والد و فرزندان
@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-students.html',
})
export class AdminStudents implements OnInit {
  private readonly service = inject(AdminParentService);
  private readonly cdr = inject(ChangeDetectorRef);

  // وضعیت و دیتای والدین
  parents = signal<ParentListItem[]>([]);
  isLoading = signal(false);

  // جستجو و فیلترها
  searchQuery = signal('');
  statusFilter = signal<StatusFilter>('all');

  // مودال‌ها و جزئیات انتخاب‌شده
  modalMode = signal<ModalMode>(null);
  selectedParent = signal<ParentListItem | null>(null);
  parentDetail = signal<ParentDetail | null>(null);
  isLoadingDetail = signal(false);
  isToggling = signal(false);

  // فیلتر هوشمند والدین بر اساس متن جستجو و وضعیت فعال/غیرفعال
  filteredParents = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    return this.parents().filter((p) => {
      // بررسی فیلتر وضعیت
      if (status === 'active' && !p.isActive) return false;
      if (status === 'inactive' && p.isActive) return false;

      // بررسی جستجو
      if (!q) return true;

      const matchName = p.fullName.toLowerCase().includes(q);
      const matchPhone = p.phoneNumber.includes(q);
      const matchNationalId = p.nationalId ? p.nationalId.includes(q) : false;
      const matchChildren = p.childrenNames.some((c) => c.toLowerCase().includes(q));

      return matchName || matchPhone || matchNationalId || matchChildren;
    });
  });

  // کل والدین
  totalParentsCount = computed(() => this.parents().length);

  // تعداد والدین فعال
  activeParentsCount = computed(() => this.parents().filter((p) => p.isActive).length);

  // تعداد والدین غیرفعال
  inactiveParentsCount = computed(() => this.parents().filter((p) => !p.isActive).length);

  // مجموع کل دانش‌آموزان تحت پوشش
  totalChildrenCount = computed(() =>
    this.parents().reduce((acc, p) => acc + p.childrenCount, 0)
  );

  // مجموع موجودی کیف پول‌های والدین
  totalWalletBalances = computed(() =>
    this.parents().reduce((acc, p) => acc + p.walletBalance, 0)
  );

  async ngOnInit() {
    await this.loadParents();
  }

  // لود اطلاعات والدین از سرور
  async loadParents() {
    this.isLoading.set(true);
    try {
      const data = await this.service.getAll();
      this.parents.set(data);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  // باز کردن مودال جزئیات والد و فرزندان
  async openDetail(parent: ParentListItem) {
    this.selectedParent.set(parent);
    this.modalMode.set('detail');
    this.parentDetail.set(null);
    this.isLoadingDetail.set(true);
    this.cdr.markForCheck();

    try {
      const detail = await this.service.getDetail(parent.id);
      this.parentDetail.set(detail);
    } finally {
      this.isLoadingDetail.set(false);
      this.cdr.markForCheck();
    }
  }

  // باز کردن مودال تایید تغییر وضعیت والد
  openToggleConfirm(parent: ParentListItem, event: MouseEvent) {
    event.stopPropagation();
    this.selectedParent.set(parent);
    this.modalMode.set('confirm-toggle');
    this.cdr.markForCheck();
  }

  // تایید تغییر وضعیت فعال/غیرفعال والد
  async confirmToggle() {
    const parent = this.selectedParent();
    if (!parent) return;

    this.isToggling.set(true);
    try {
      const result = await this.service.toggleStatus(parent.id);
      // آپدیت آنی در لیست بدون رفرش کل صفحه
      this.parents.update((list) =>
        list.map((p) => (p.id === parent.id ? {...p, isActive: result.isActive} : p))
      );
      if (this.parentDetail()?.id === parent.id) {
        this.parentDetail.update((d) => (d ? {...d, isActive: result.isActive} : null));
      }
      this.closeModal();
    } finally {
      this.isToggling.set(false);
      this.cdr.markForCheck();
    }
  }

  // سوییچ وضعیت فعال/غیرفعال یک دانش‌آموز از داخل مودال جزئیات
  async toggleChildStatus(child: ChildDetail) {
    try {
      const result = await this.service.toggleChildStatus(child.id);
      child.isActive = result.isActive;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('خطا در تغییر وضعیت دانش‌آموز:', error);
    }
  }

  // بستن مودال
  closeModal() {
    this.modalMode.set(null);
    this.selectedParent.set(null);
    this.parentDetail.set(null);
    this.cdr.markForCheck();
  }

  // سرچ سریع
  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.cdr.markForCheck();
  }

  // تنظیم فیلتر وضعیت
  setStatusFilter(filter: StatusFilter) {
    this.statusFilter.set(filter);
    this.cdr.markForCheck();
  }

  // فرمت مبالغ به فارسی و تومان
  formatPrice(price: number): string {
    return price.toLocaleString('fa-IR') + ' تومان';
  }

  // حرف اول آواتار با اعتبارسنجی
  getAvatarLetter(name: string | null | undefined): string {
    if (!name || name.startsWith('?')) return 'و';
    return name.trim().charAt(0) || 'و';
  }

  // استایل بج وضعیت سفارش‌ها
  getOrderStatusBadgeClass(statusLabel: string): string {
    const map: Record<string, string> = {
      'تحویل داده شده': 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      'در حال پخت و بسته‌بندی': 'bg-purple-50 text-purple-700 border-purple-200/60',
      'پرداخت شده': 'bg-blue-50 text-blue-700 border-blue-200/60',
      'در صف بررسی': 'bg-amber-50 text-amber-700 border-amber-200/60',
      'لغو شده': 'bg-red-50 text-red-600 border-red-200/60',
    };
    return map[statusLabel] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200';
  }
}
