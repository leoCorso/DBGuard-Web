import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, RouterModule } from "@angular/router";
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { GuardOperator } from '../../../enums/guard-operator';
import { GuardState } from '../../../enums/guard-state';
import { formatEnumKey, getEnumLabel } from '../../../helpers/enum-helper';
import { getGuardStateSeverity } from '../../../helpers/guard-state-helper';
import { GuardDetailDTO } from '../../../interfaces/guard-dto';
import { FormatRunPeriodPipe } from '../../../pipes/format-run-period-pipe';

@Component({
  selector: 'app-guard-detail-pane',
  imports: [Tag, FormatRunPeriodPipe, DatePipe, Button, RouterLink, RouterModule],
  templateUrl: './guard-detail-pane.html',
  styleUrl: './guard-detail-pane.scss',
})
export class GuardDetailPane {
  public guardDetail = input.required<GuardDetailDTO>();
  public formatEnum = formatEnumKey;
  public getEnumLabel = getEnumLabel;
  public getGuardStateSeverity = getGuardStateSeverity;
  public guardStates = GuardState;
  public guardOperators = GuardOperator;

}
