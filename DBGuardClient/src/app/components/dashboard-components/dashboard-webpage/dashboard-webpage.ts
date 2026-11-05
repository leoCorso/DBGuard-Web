import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TotalsDetailPane } from '../totals-detail-pane/totals-detail-pane';
import { Card } from 'primeng/card';
import { GuardChangeDataChart } from '../../guard-components/guard-change-data-chart/guard-change-data-chart';

@Component({
  selector: 'app-dashboard-webpage',
  imports: [TotalsDetailPane, Card, GuardChangeDataChart],
  templateUrl: './dashboard-webpage.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard-webpage.scss',
})
export class DashboardWebpage {}
