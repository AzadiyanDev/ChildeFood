import {TestBed} from '@angular/core/testing';
import {DonutChart} from './donut-chart';

describe('DonutChart', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonutChart],
    }).compileComponents();
  });

  it('should create the donut chart component', () => {
    const fixture = TestBed.createComponent(DonutChart);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should calculate correct circumference and offset for 31%', () => {
    const fixture = TestBed.createComponent(DonutChart);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('percentage', 31);
    fixture.detectChanges();

    expect(component.percentage()).toBe(31);
    expect(component.circumference()).toBeGreaterThan(0);
    expect(component.dashOffset()).toBeLessThan(component.circumference());
  });
});
