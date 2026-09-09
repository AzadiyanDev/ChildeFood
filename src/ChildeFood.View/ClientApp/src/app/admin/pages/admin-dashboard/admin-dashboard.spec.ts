import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {AdminDashboard} from './admin-dashboard';
import {AdminDashboardService} from '../../services/admin-dashboard.service';

describe('AdminDashboard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboard],
      providers: [
        AdminDashboardService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should create admin dashboard and load initial ChildeFood KPIs', () => {
    const fixture = TestBed.createComponent(AdminDashboard);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.state().kpiSummary.monthlyOrdersCount).toBe(574);
    expect(component.state().donutAnalytics.deliveredOrdersPercent).toBe(74);
    expect(component.state().donutAnalytics.preparingOrdersPercent).toBe(19);
  });

  it('should filter school orders correctly', () => {
    const fixture = TestBed.createComponent(AdminDashboard);
    const component = fixture.componentInstance;

    component.setFilter('delivered');
    fixture.detectChanges();

    const filtered = component.filteredOrders();
    expect(filtered.every((o) => o.status === 'delivered')).toBe(true);
  });
});
