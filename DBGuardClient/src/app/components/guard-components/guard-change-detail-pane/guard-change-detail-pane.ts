import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { DatabaseEngine } from '../../../enums/database-engines';
import { GuardOperator } from '../../../enums/guard-operator';
import { GuardState } from '../../../enums/guard-state';
import { formatEnumKey, getEnumLabel } from '../../../helpers/enum-helper';
import { getGuardStateSeverity } from '../../../helpers/guard-state-helper';
import { GuardChangeTransactionDTO } from '../../../interfaces/guard-change-transaction-dto';

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
