import { Component, input } from '@angular/core';
import { GuardChangeTransactionDTO } from '../../../interfaces/guard-change-transaction-dto';
import { Button } from 'primeng/button';
import { RouterLink, RouterModule } from '@angular/router';
import { DatabaseEngine } from '../../../enums/database-engines';
import { GuardOperator } from '../../../enums/guard-operator';
import { GuardState } from '../../../enums/guard-state';
import { getEnumLabel, formatEnumKey } from '../../../helper-functions/enum-helper';
import { getGuardStateSeverity } from '../../../helper-functions/guard-state-helper';
import { Tag } from 'primeng/tag';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-guard-change-detail-pane',
  imports: [Button, RouterModule, RouterLink, Tag, DatePipe],
  templateUrl: './guard-change-detail-pane.html',
  styleUrl: './guard-change-detail-pane.scss',
})
export class GuardChangeDetailPane {
  public changeHistoryDetail = input.required<GuardChangeTransactionDTO>();
  public guardStates = GuardState;
  public guardOperators = GuardOperator;
  public databaseEngines = DatabaseEngine;
  public getEnumLabel = getEnumLabel;
  public getGuardStateSeverity = getGuardStateSeverity;
  public formatEnumKey = formatEnumKey;
}
