import { Component } from '@angular/core';
import { GuardChangeHistoryTable } from '../guard-change-history-table/guard-change-history-table';

@Component({
  selector: 'app-guards-change-history-webpage',
  imports: [GuardChangeHistoryTable],
  templateUrl: './guards-change-history-webpage.html',
  styleUrl: './guards-change-history-webpage.scss',
})
export class GuardsChangeHistoryWebpage {}
