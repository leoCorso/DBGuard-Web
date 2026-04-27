import { Component, input } from '@angular/core';
import { Tag } from 'primeng/tag';
import { DatePipe } from '@angular/common';

import { Badge } from 'primeng/badge';
import { Card } from 'primeng/card';

import { RouterLink } from '@angular/router';
import { FormatRunPeriodPipe } from '../../../pipes/format-run-period-pipe';
import { DatabaseEngine } from '../../../enums/database-engines';
import { GuardOperator } from '../../../enums/guard-operator';
import { GuardState } from '../../../enums/guard-state';
import { getEnumLabel, formatEnumKey } from '../../../helper-functions/enum-helper';
import { getGuardStateSeverity } from '../../../helper-functions/guard-state-helper';
import { GuardView } from '../../../interfaces/guard-dto';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-view-guard-item',
  imports: [Tag, DatePipe, Badge, Card, FormatRunPeriodPipe, RouterLink, Button],
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
  
  public getGuardStateSeverity = getGuardStateSeverity;
}
