import { Component, input } from '@angular/core';
import { GuardDetailDTO } from '../../../interfaces/guard-dto';
import { Tag } from 'primeng/tag';
import { formatEnumKey, getEnumLabel } from '../../../helpers/enum-helper';
import { getGuardStateSeverity } from '../../../helpers/guard-state-helper';
import { GuardState } from '../../../enums/guard-state';
import { FormatRunPeriodPipe } from '../../../pipes/format-run-period-pipe';
import { DatePipe } from '@angular/common';
import { GuardOperator } from '../../../enums/guard-operator';
import { Button } from 'primeng/button';
import { RouterLink, RouterModule } from "@angular/router";

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
