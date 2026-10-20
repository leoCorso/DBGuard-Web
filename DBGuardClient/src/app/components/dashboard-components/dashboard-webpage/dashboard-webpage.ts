import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GuardChangeDataChart } from '../../guard-components/guard-change-data-chart/guard-change-data-chart';
import { TotalsDetailPane } from '../totals-detail-pane/totals-detail-pane';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-dashboard-webpage',
  imports: [TotalsDetailPane, GuardChangeDataChart, Card],
  templateUrl: './dashboard-webpage.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard-webpage.scss',
})
export class DashboardWebpage {}
