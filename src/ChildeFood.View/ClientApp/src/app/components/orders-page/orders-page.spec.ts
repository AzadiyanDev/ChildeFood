import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OrdersPage} from './orders-page';
import {FoodStore} from '../../services/food-store';
import {SchoolOrder, OrderDetailResponse, OrderSummaryItem} from '../../models/food.model';
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('OrdersPage Component — تست لیست سفارش‌های ثبت‌شده با پیجینگ و لود تنبل', () => {
  let component: OrdersPage;
  let fixture: ComponentFixture<OrdersPage>;
  let store: FoodStore;

  const mockOrders: OrderSummaryItem[] = [
    {
      id: 'ord-1',
      orderCode: 'ORD-1042',
      childId: 'child-1',
      childName: 'علی احمدی',
      childAvatar: '/assets/avatars/ali.svg',
      schoolName: 'مدرسه نمونه',
      grade: 'کلاس پنجم',
      foodTitle: 'چلو جوجه کباب زعفرانی',
      foodSubtitle: 'همراه با برنج درجه یک ایرانی',
      foodEmoji: '🍗',
      deliveryTime: 'ساعت ۱۲:۳۰',
      dateLabel: 'امروز - شنبه ۱۵ شهریور',
      servingDate: '2026-09-08',
      status: 'active',
      statusText: 'در حال آماده‌سازی',
      price: 185000,
      trackingCode: '984712',
    },
    {
      id: 'ord-2',
      orderCode: 'ORD-1039',
      childId: 'child-2',
      childName: 'آوا احمدی',
      childAvatar: '/assets/avatars/ava.svg',
      schoolName: 'دبستان دخترانه سرو',
      grade: 'کلاس ۲۰۴',
      foodTitle: 'پاستا آلفردو با فیله مرغ',
      foodSubtitle: 'پاستا پنه با سس قارچ تازه',
      foodEmoji: '🍝',
      deliveryTime: 'ساعت ۱۲:۴۵',
      dateLabel: 'امروز - شنبه ۱۵ شهریور',
      servingDate: '2026-09-08',
      status: 'delivered',
      statusText: 'تحویل شده',
      price: 160000,
      trackingCode: '984530',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersPage],
      providers: [FoodStore],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersPage);
    component = fixture.componentInstance;
    store = TestBed.inject(FoodStore);
    fixture.detectChanges();
  });

  it('باید کامپوننت با موفقیت ایجاد شود و متد لود اولیه را صدا بزند', () => {
    expect(component).toBeTruthy();
    expect(component.activeFilter()).toBe('all');
  });

  it('باید تعداد کل سفارش‌ها و تعداد سفارش‌های فعال را به درستی محاسبه کند', () => {
    store.pagedOrders.set(mockOrders);
    store.ordersTotalCount.set(2);
    store.ordersActiveCount.set(1);
    store.ordersDeliveredCount.set(1);

    expect(component.totalCount()).toBe(2);
    expect(component.activeCount()).toBe(1);
    expect(component.displayOrders().length).toBe(2);
  });

  it('با تغییر فیلتر وضعیت، تب مربوطه تغییر کرده و متد لود استور صدا زده می‌شود', () => {
    const spy = vi.spyOn(store, 'loadMyOrders');

    component.setFilter('active');
    expect(component.activeFilter()).toBe('active');
    expect(spy).toHaveBeenCalledWith(1, false, 'active');

    component.setFilter('delivered');
    expect(component.activeFilter()).toBe('delivered');
    expect(spy).toHaveBeenCalledWith(1, false, 'delivered');
  });

  it('با زدن دکمه جزئیات بیشتر، مودال باز شده و متد لود تنبل لود دیتیل صدا زده می‌شود', () => {
    const spy = vi.spyOn(store, 'loadOrderDetail');
    component.openOrderDetails(mockOrders[0]);

    expect(component.selectedTrackingOrder()).toBeTruthy();
    expect(component.selectedTrackingOrder()?.id).toBe('ord-1');
    expect(spy).toHaveBeenCalledWith('ord-1');
  });

  it('با بستن پنجره جزئیات، استیت مودال و دیتیل استور پاک می‌شوند', () => {
    component.openOrderDetails(mockOrders[0]);
    expect(component.selectedTrackingOrder()).toBeTruthy();

    component.closeOrderDetails();
    expect(component.selectedTrackingOrder()).toBeNull();
    expect(store.selectedOrderDetail()).toBeNull();
  });
});
