import { Component, input } from '@angular/core';
import { HttpNotificationDetailDTO } from '../../../../interfaces/notification-dto';
import { mapToArray } from '../../../../helper-functions/http-notification-record-helper';
import { getEnumLabel } from '../../../../helper-functions/enum-helper';
import { HttpBodyType } from '../../../../enums/http-body-type';
import { Tag } from 'primeng/tag';
import { HTTPAction } from '../../../../enums/http-action';
import { getHttpSeverity } from '../../../../helper-functions/http-severity-mapper';

@Component({
  selector: 'app-http-notification-detail-pane',
  imports: [Tag],
  templateUrl: './http-notification-detail-pane.html',
  styleUrl: './http-notification-detail-pane.scss',
})
export class HttpNotificationDetailPane {
  public httpNotificationDetail = input.required<HttpNotificationDetailDTO>();
  public mapToArray = mapToArray;
  public getEnumLabel = getEnumLabel;
  public getHttpSeverity = getHttpSeverity;
  public httpBodyTypes = HttpBodyType;
  public httpMethods = HTTPAction;
}
