import { Component, input } from '@angular/core';
import { GuardView } from '../../../../interfaces/guard-dto';
import { Tag } from 'primeng/tag';
import { DatePipe } from '@angular/common';
import { formatEnumKey, getEnumLabel } from '../../../../helper-functions/enum-helper';
import { GuardState } from '../../../../enums/guard-state';
import { Badge } from 'primeng/badge';
import { GuardOperator } from '../../../../enums/guard-operator';
import { Card } from 'primeng/card';
import { DatabaseEngine } from '../../../../enums/database-engines';
import { FormatRunPeriodPipe } from '../../../../pipes/format-run-period-pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-view-guard-item',
  imports: [Tag, DatePipe, Badge, Card, FormatRunPeriodPipe, RouterLink],
  templateUrl: './view-guard-item.html',
  styleUrl: './view-guard-item.scss',
})
export class ViewGuardItem {
  public guardData = input.required<GuardView>();
  public getEnumLabel = getEnumLabel;
  public formatEnumKey = formatEnumKey;
  public guardState = GuardState;
  public guardOperator = GuardOperator;
  public databaseEngine = DatabaseEngine;
  
  public getTriggerSeverity(): 'success' | 'info' | 'danger' | 'warn' {
    switch(this.guardData().guardState){
      case GuardState.Triggered:
        return 'warn'
      case GuardState.Clear:
        return 'success'
      case GuardState.Error:
        return 'danger'
      case GuardState.Unknown:
        return 'info';
    }
  }
}
