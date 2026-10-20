import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { TotalSummary } from '../../../interfaces/total-summary';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-totals-detail-pane',
  imports: [],
  templateUrl: './totals-detail-pane.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './totals-detail-pane.scss',
})
export class TotalsDetailPane implements OnInit {
  private httpClient = inject(HttpClient);
  public totals = signal<TotalSummary | null>(null);
  ngOnInit(): void {
    this.loadData();
  }
  private loadData(): void {
    const url = [environment.api.uri, 'Guards', 'GetTotalSummary'].join('/');
    this.httpClient.get<TotalSummary>(url).subscribe({
      next: (totals: TotalSummary) => {
        this.totals.set(totals);
      },
    });
  }
}
