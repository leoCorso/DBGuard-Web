import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GuardChangeHistoryTable } from '../guard-change-history-table/guard-change-history-table';

@Component({
  selector: 'app-guards-change-history-webpage',
  imports: [GuardChangeHistoryTable],
  templateUrl: './guards-change-history-webpage.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './guards-change-history-webpage.scss',
})
export class GuardsChangeHistoryWebpage {}
