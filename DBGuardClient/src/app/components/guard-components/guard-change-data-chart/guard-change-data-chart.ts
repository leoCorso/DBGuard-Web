import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { GuardChangeItemDTO } from '../../../interfaces/guard-change-transaction-dto';
import { environment } from '../../../../environments/environment.development';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePicker } from 'primeng/datepicker';
import { ChartModule } from 'primeng/chart';
import { FloatLabel } from 'primeng/floatlabel';
import { GuardState } from '../../../enums/guard-state';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-guard-change-data-chart',
  imports: [ReactiveFormsModule, DatePicker, ChartModule, FloatLabel],
  templateUrl: './guard-change-data-chart.html',
  styleUrl: './guard-change-data-chart.scss',
})
export class GuardChangeDataChart implements OnInit {
  private httpClient = inject(HttpClient);
  public yearSelection = new FormControl<Date>(new Date(), [Validators.required]);
  public changeData = signal<GuardChangeItemDTO[]>([]);
  private destroyRef = inject(DestroyRef);
  public data: any;
  public options: any;
  private cd = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      const data = this.changeData();
      if (data.length > 0) {
        this.loadChart();
      }
    })
  }
  ngOnInit(): void {
    this.getData();

    this.yearSelection.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (selection) => {
        if (selection) {
          this.getData()
        }
      }
    });
  }
  private getData(): void {
    const url = [environment.api.uri, 'Guards', 'GetMonthlyGuardChangeData'].join('/');
    const params = new HttpParams()
      .set('yearSelection', this.yearSelection.value!.toDateString());

    this.httpClient.get<GuardChangeItemDTO[]>(url, { params: params }).subscribe({
      next: (result: GuardChangeItemDTO[]) => {
        this.changeData.set(result);
      }
    })
  }
  private loadChart(): void {
    if (!this.changeData()) {
      return;
    }
    this.data = {
      labels: [...new Set(this.changeData().map(item => item.month))],
      datasets: [
        {
          label: 'Unknown guard states',
          data: this.changeData().filter(item => item.guardState == GuardState.Unknown).map(item => item.count),
          backgroundColor: '#5e7cff'
        },
        {
          label: 'Triggered guards',
          data: this.changeData().filter(item => item.guardState == GuardState.Triggered).map(item => item.count),
          backgroundColor: '#fff75e'
        },
        {
          label: 'Error guard states',
          data: this.changeData().filter(item => item.guardState == GuardState.Error).map(item => item.count),
          backgroundColor: '#ff5e5e'

        },
        {
          label: 'Clear guards',
          data: this.changeData().filter(item => item.guardState == GuardState.Clear).map(item => item.count),
          backgroundColor: '#5eff74'
        }
      ]
    }
    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      scales: {
        y: {
          ticks: {
            stepSize: 1,
            beginAtZero: true,
          },
        }
      }
    }
    this.cd.markForCheck();
  }
}
