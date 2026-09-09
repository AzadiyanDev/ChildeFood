import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal, computed
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  AdminSchoolService, CreateSchoolPayload, SchoolDetail, SchoolListItem
} from '../../services/admin-school.service';

// حالت‌های مودال — یا null، یا detail، یا confirm-toggle، یا create
type ModalMode = null | 'detail' | 'confirm-toggle' | 'create';

@Component({
  selector: 'app-admin-schools',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-schools.html',
})
export class AdminSchools implements OnInit {
  private readonly service = inject(AdminSchoolService);
  private readonly cdr = inject(ChangeDetectorRef);

  // داده اصلی
  schools = signal<SchoolListItem[]>([]);
  isLoading = signal(false);

  // سرچ
  searchQuery = signal('');

  // لیست فیلترشده بر اساس سرچ
  filteredSchools = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q
      ? this.schools().filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.branchCode.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
        )
      : this.schools();
  });

  // کل دانش‌آموزان همه مدارس
  totalStudents = computed(() =>
    this.schools().reduce((acc, s) => acc + s.studentCount, 0).toLocaleString('fa-IR')
  );

  // تعداد مدارس فعال
  activeSchoolsCount = computed(() =>
    this.schools().filter(s => s.isActive).length
  );

  // تعداد مدارس غیرفعال
  inactiveSchoolsCount = computed(() =>
    this.schools().filter(s => !s.isActive).length
  );

  // مودال‌ها
  modalMode = signal<ModalMode>(null);
  selectedSchool = signal<SchoolListItem | null>(null);
  schoolDetail = signal<SchoolDetail | null>(null);
  isLoadingDetail = signal(false);
  isToggling = signal(false);
  isCreating = signal(false);

  // فرم ایجاد مدرسه
  createForm = signal<CreateSchoolPayload>({
    name: '',
    branchCode: '',
    address: '',
    defaultLunchTime: '12:30',
    contactPerson: '',
  });

  async ngOnInit() {
    await this.loadSchools();
  }

  async loadSchools() {
    this.isLoading.set(true);
    try {
      const data = await this.service.getAll();
      this.schools.set(data);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  // باز کردن مودال دیتیل
  async openDetail(school: SchoolListItem) {
    this.selectedSchool.set(school);
    this.modalMode.set('detail');
    this.schoolDetail.set(null);
    this.isLoadingDetail.set(true);
    this.cdr.markForCheck();
    try {
      const detail = await this.service.getDetail(school.id);
      this.schoolDetail.set(detail);
    } finally {
      this.isLoadingDetail.set(false);
      this.cdr.markForCheck();
    }
  }

  // باز کردن مودال تاییدیه toggle
  openToggleConfirm(school: SchoolListItem, event: MouseEvent) {
    event.stopPropagation();
    this.selectedSchool.set(school);
    this.modalMode.set('confirm-toggle');
    this.cdr.markForCheck();
  }

  // تایید toggle وضعیت
  async confirmToggle() {
    const school = this.selectedSchool();
    if (!school) return;
    this.isToggling.set(true);
    try {
      const result = await this.service.toggleStatus(school.id);
      // آپدیت لوکال بدون reload کامل
      this.schools.update(list =>
        list.map(s => s.id === school.id ? { ...s, isActive: result.isActive } : s)
      );
      this.closeModal();
    } finally {
      this.isToggling.set(false);
      this.cdr.markForCheck();
    }
  }

  // باز کردن مودال ایجاد مدرسه
  openCreate() {
    this.createForm.set({ name: '', branchCode: '', address: '', defaultLunchTime: '12:30', contactPerson: '' });
    this.modalMode.set('create');
    this.cdr.markForCheck();
  }

  // آپدیت فیلدهای فرم
  updateForm(field: keyof CreateSchoolPayload, value: string) {
    this.createForm.update(f => ({ ...f, [field]: value }));
  }

  // ثبت مدرسه جدید
  async submitCreate() {
    const form = this.createForm();
    if (!form.name.trim() || !form.branchCode.trim() || !form.address.trim()) return;
    this.isCreating.set(true);
    try {
      const newSchool = await this.service.create(form);
      this.schools.update(list => [newSchool, ...list]);
      this.closeModal();
    } finally {
      this.isCreating.set(false);
      this.cdr.markForCheck();
    }
  }

  closeModal() {
    this.modalMode.set(null);
    this.selectedSchool.set(null);
    this.schoolDetail.set(null);
    this.cdr.markForCheck();
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.cdr.markForCheck();
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fa-IR') + ' تومان';
  }

  getStatusColor(statusLabel: string): string {
    const map: Record<string, string> = {
      'در انتظار': 'bg-amber-50 text-amber-600',
      'پرداخت شده': 'bg-blue-50 text-blue-600',
      'در حال آماده‌سازی': 'bg-purple-50 text-purple-600',
      'تحویل داده شده': 'bg-emerald-50 text-emerald-600',
      'لغو شده': 'bg-red-50 text-red-600',
    };
    return map[statusLabel] ?? 'bg-zinc-100 text-zinc-500';
  }
}
