import { DatePipe, NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { Tag } from 'primeng/tag';
import { Badge } from 'primeng/badge';
import { Card } from 'primeng/card';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { DatabaseEngine } from '../../../enums/database-engines';
import { GuardOperator } from '../../../enums/guard-operator';
import { GuardState } from '../../../enums/guard-state';
import { formatEnumKey, getEnumLabel } from '../../../helpers/enum-helper';
import { getGuardStateSeverity } from '../../../helpers/guard-state-helper';
import { GuardView } from '../../../interfaces/guard-dto';
import { FormatRunPeriodPipe } from '../../../pipes/format-run-period-pipe';

@Component({
  selector: 'app-view-guard-item',
  imports: [Tag, DatePipe, Badge, Card, FormatRunPeriodPipe, RouterLink, Button, NgClass],
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
