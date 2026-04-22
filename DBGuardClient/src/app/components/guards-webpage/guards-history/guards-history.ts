import { Component } from '@angular/core';
import { GuardTransactionPreview } from '../guard-detail/guard-transaction-preview/guard-transaction-preview';

@Component({
  selector: 'app-guards-history',
  imports: [GuardTransactionPreview],
  templateUrl: './guards-history.html',
  styleUrl: './guards-history.scss',
})
export class GuardsHistory {}
