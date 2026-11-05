import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { environment } from '../../../../environments/environment';
import { GuardState } from '../../../enums/guard-state';
import { GuardChangeItemDTO } from '../../../interfaces/guard-change-transaction-dto';
import { AnalyticsService } from '../../../services/analytics-service';

Chart.register(...registerables);

@Component({
  selector: 'app-guard-change-data-chart',
  imports: [ReactiveFormsModule, DatePicker, FloatLabel],
  templateUrl: './guard-change-data-chart.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './guard-change-data-chart.scss',
})
export class GuardChangeDataChart implements OnInit {
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private analyticsService = inject(AnalyticsService);

  public yearSelection = new FormControl<Date>(new Date(), [Validators.required]);
  public changeData = signal<GuardChangeItemDTO[]>([]);

  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart<'bar'>;

  private readonly series = [
    { label: 'Unknown guard states', state: GuardState.Unknown, color: '#5e7cff' },
    { label: 'Triggered guards', state: GuardState.Triggered, color: '#fff75e' },
    { label: 'Error guard states', state: GuardState.Error, color: '#ff5e5e' },
    { label: 'Clear guards', state: GuardState.Clear, color: '#5eff74' },
  ];

  constructor() {
    effect(() => {
      const items = this.changeData();
      if (items.length > 0) {
        this.renderChart(items);
      }
    });

    this.destroyRef.onDestroy(() => this.chart?.destroy());
  }

  ngOnInit(): void {
    this.getData();

    this.yearSelection.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (selection) => {
        if (selection) {
          this.getData();
          this.analyticsService.logEvent('guard_changes_chart_year_change', {
            change_year: selection.getFullYear(),
          });
        }
      },
    });
  }

  private getData(): void {
    const url = [environment.api.uri, 'Guards', 'GetMonthlyGuardChangeData'].join('/');
    const params = new HttpParams().set('yearSelection', this.yearSelection.value!.toDateString());

    this.httpClient
      .get<GuardChangeItemDTO[]>(url, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.changeData.set(result),
      });
  }

  private renderChart(items: GuardChangeItemDTO[]): void {
    const canvas = this.canvas()?.nativeElement;
    if (!canvas) return;

    const labels = [...new Set(items.map((item) => item.month))];

    const datasets = this.series.map((s) => ({
      label: s.label,
      backgroundColor: s.color,
      // One value per month label, so bars stay aligned even if a month
      // has no rows for a given guard state
      data: labels.map(
        (month) =>
          items.find((i) => i.month === month && i.guardState == s.state)?.count ?? 0,
      ),
    }));

    // Update in place if the chart already exists (e.g. year changed)
    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets = datasets;
      this.chart.update();
      return;
    }

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      },
    };

    this.chart = new Chart(canvas, config);
  }
}